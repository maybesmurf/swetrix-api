import {
  Injectable, InternalServerErrorException, UnauthorizedException, BadRequestException, ConflictException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import axios from 'axios'
import { genSalt, hash, compare } from 'bcrypt'
import { getCountry } from 'countries-and-timezones'
import { Auth } from 'googleapis'
import { createHash } from 'crypto'
import * as dayjs from 'dayjs'
import { InjectBot } from 'nestjs-telegraf'
import { Telegraf } from 'telegraf'
import { UAParser } from 'ua-parser-js'
import _pick from 'lodash/pick'
import { v4 as uuidv4 } from 'uuid'

import {
  ActionToken,
  ActionTokenType,
} from 'src/action-tokens/action-token.entity'
import { ActionTokensService } from 'src/action-tokens/action-tokens.service'
import { LetterTemplate } from 'src/mailer/letter'
import { MailerService } from 'src/mailer/mailer.service'
import {
  MAX_EMAIL_REQUESTS, User, TRIAL_DURATION,
} from 'src/user/entities/user.entity'
import { TelegrafContext } from 'src/user/user.controller'
import { UserService } from 'src/user/user.service'
import { ProjectService } from 'src/project/project.service'
import { REDIS_SSO_UUID, redis, PRODUCTION_ORIGIN, isDevelopment } from 'src/common/constants'
import { UserGoogleDTO } from '../user/dto/user-google.dto'

const REDIS_SSO_SESSION_TIMEOUT = 60 * 5 // 5 minutes
const getSSORedisKey = (uuid: string) => `${REDIS_SSO_UUID}:${uuid}`

const GOOGLE_OAUTH_REDIRECT_URL = isDevelopment ? 'http://localhost:3000/socialised' : `${PRODUCTION_ORIGIN}/socialised`

@Injectable()
export class AuthService {
  oauth2Client: Auth.OAuth2Client

  constructor(
    @InjectBot() private readonly telegramBot: Telegraf<TelegrafContext>,
    private readonly userService: UserService,
    private readonly actionTokensService: ActionTokensService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly projectService: ProjectService,
  ) {
    this.oauth2Client = new Auth.OAuth2Client(
      this.configService.get('GOOGLE_OAUTH2_CLIENT_ID'),
      this.configService.get('GOOGLE_OAUTH2_CLIENT_SECRET'),
    )
  }

  private async createSha1Hash(password: string): Promise<string> {
    return new Promise(resolve => {
      const sha1sum = createHash('sha1')
        .update(password)
        .digest('hex')
        .toUpperCase()
      resolve(sha1sum)
    })
  }

  private getFirstFiveChars(passwordHash: string): string {
    return passwordHash.slice(0, 5)
  }

  private async sendRequestToApi(passwordHash: string) {
    const url = `https://api.pwnedpasswords.com/range/${passwordHash}`
    const response = await axios.get(url)

    if (response.status !== 200) {
      throw new InternalServerErrorException()
    }

    return response.data
  }

  public async checkIfLeaked(password: string): Promise<boolean> {
    const sha1Hash = await this.createSha1Hash(password)
    const firstFiveChars = this.getFirstFiveChars(sha1Hash)
    const response = await this.sendRequestToApi(firstFiveChars)

    return response.includes(firstFiveChars)
  }

  public async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(10)
    return hash(password, salt)
  }

  public async sendVerificationEmail(userId: string, email: string) {
    const actionToken = await this.actionTokensService.createActionToken(
      userId,
      ActionTokenType.EMAIL_VERIFICATION,
    )

    const user = await this.userService.findUserById(userId)

    if (user && user.emailRequests < MAX_EMAIL_REQUESTS) {
      await this.userService.updateUser(userId, {
        emailRequests: user.emailRequests + 1,
      })
    }

    const verificationLink = `${this.configService.get('CLIENT_URL')}/verify/${
      actionToken.id
    }`

    await this.mailerService.sendEmail(email, LetterTemplate.SignUp, {
      url: verificationLink,
    })
  }

  public async createUnverifiedUser(
    email: string,
    password: string,
  ): Promise<User> {
    const hashedPassword = await this.hashPassword(password)

    const user = await this.userService.createUser({
      email,
      password: hashedPassword, // Using the password field is incorrect.
    })

    await this.sendVerificationEmail(user.id, user.email)

    return user
  }

  public async generateJwtAccessToken(
    userId: string,
    isSecondFactorAuthenticated = false,
  ) {
    return this.jwtService.signAsync(
      {
        sub: userId,
        isSecondFactorAuthenticated,
      },
      {
        algorithm: 'HS256',
        expiresIn: 60 * 30,
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      },
    )
  }

  public async validateUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.userService.findUser(email)

    if (user && (await this.comparePassword(password, user.password))) {
      return user
    }

    return null
  }

  public async getSharedProjectsForUser(user: User): Promise<User> {
    const sharedProjects = await this.projectService.findShare({
      where: {
        user: user.id,
      },
      relations: ['project'],
    })

    user.sharedProjects = sharedProjects

    return user
  }

  private async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return compare(password, hashedPassword)
  }

  public async sendTelegramNotification(
    userId: string,
    headers: unknown,
    ip: string,
  ) {
    const user = await this.userService.findUserById(userId)

    if (!user.telegramChatId) {
      return
    }

    const chat = await this.checkTelegramChatId(user.telegramChatId)

    if (!chat) {
      return
    }

    const headersInfo = await this.getHeadersInfo(headers)
    const loginDate = dayjs().utc().format('YYYY-MM-DD HH:mm:ss')
    const message =
      '🚨 *Someone has logged into your account!*\n\n' +
      `*Browser:* ${headersInfo.browser}\n` +
      `*Device:* ${headersInfo.device}\n` +
      `*OS:* ${headersInfo.os}\n` +
      `*Country:* ${headersInfo.country}\n` +
      `*IP:* ${ip}\n` +
      `*Date:* ${loginDate} (UTC)\n\n` +
      'If it was not you, please change your password immediately.'
    await this.telegramBot.telegram.sendMessage(user.telegramChatId, message, {
      parse_mode: 'Markdown',
    })
  }

  private async getHeadersInfo(headers: unknown) {
    const ua = UAParser(headers['user-agent'])
    const browser = ua.browser.name || 'Unknown'
    const device = ua.device.type || 'Desktop'
    const os = ua.os.name || 'Unknown'
    let country = 'Unknown'
    const cfCountry = headers['cf-ipcountry']

    if (cfCountry === 'T1') {
      country = 'Unknown (Tor)'
    }

    if (cfCountry) {
      country = getCountry(cfCountry)?.name
    }

    return {
      browser,
      device,
      os,
      country,
    }
  }

  public async checkTelegramChatId(chatId: string): Promise<boolean> {
    const chat = (await this.telegramBot.telegram.getChat(chatId)).id
    return Boolean(chat)
  }

  public async checkVerificationToken(
    token: string,
  ): Promise<ActionToken | null> {
    const actionToken = await this.actionTokensService.findActionToken(token)

    if (
      actionToken &&
      actionToken.action === ActionTokenType.EMAIL_VERIFICATION
    ) {
      return actionToken
    }

    return null
  }

  public async verifyEmail(actionToken: ActionToken): Promise<void> {
    await this.userService.updateUser(actionToken.user.id, {
      isActive: true,
    })
    await this.actionTokensService.deleteActionToken(actionToken.id)
  }

  public async sendResetPasswordEmail(userId: string, email: string) {
    const actionToken = await this.actionTokensService.createActionToken(
      userId,
      ActionTokenType.PASSWORD_RESET,
    )

    const verificationLink = `${this.configService.get(
      'CLIENT_URL',
    )}/password-reset/${actionToken.id}`

    await this.mailerService.sendEmail(
      email,
      LetterTemplate.ConfirmPasswordChange,
      {
        url: verificationLink,
      },
    )
  }

  public async checkResetPasswordToken(
    token: string,
  ): Promise<ActionToken | null> {
    const actionToken = await this.actionTokensService.findActionToken(token)

    if (actionToken && actionToken.action === ActionTokenType.PASSWORD_RESET) {
      return actionToken
    }

    return null
  }

  public async resetPassword(
    actionToken: ActionToken,
    password: string,
  ): Promise<void> {
    const hashedPassword = await this.hashPassword(password)

    await this.userService.updateUser(actionToken.user.id, {
      password: hashedPassword,
    })
    await this.actionTokensService.deleteActionToken(actionToken.id)
  }

  public async changePassword(userId: string, password: string): Promise<void> {
    const hashedPassword = await this.hashPassword(password)
    await this.userService.updateUser(userId, {
      password: hashedPassword,
    })
  }

  public async checkIfMaxEmailRequestsReached(
    userId: string,
  ): Promise<boolean> {
    const user = await this.userService.findUserById(userId)

    if (user && user.emailRequests >= MAX_EMAIL_REQUESTS) {
      return true
    }

    return false
  }

  public async checkIfEmailTaken(email: string): Promise<boolean> {
    const user = await this.userService.findUser(email)
    return Boolean(user)
  }

  public async changeEmail(
    userId: string,
    email: string,
    newEmail: string,
  ): Promise<void> {
    const actionToken = await this.actionTokensService.createActionToken(
      userId,
      ActionTokenType.EMAIL_CHANGE,
      newEmail,
    )

    const verificationLink = `${this.configService.get(
      'CLIENT_URL',
    )}/change-email/${actionToken.id}`

    await this.mailerService.sendEmail(
      email,
      LetterTemplate.MailAddressChangeConfirmation,
      {
        url: verificationLink,
      },
    )
  }

  public async checkChangeEmailToken(
    token: string,
  ): Promise<ActionToken | null> {
    const actionToken = await this.actionTokensService.findActionToken(token)

    if (actionToken && actionToken.action === ActionTokenType.EMAIL_CHANGE) {
      return actionToken
    }

    return null
  }

  public async confirmChangeEmail(actionToken: ActionToken): Promise<void> {
    await this.userService.updateUser(actionToken.user.id, {
      email: actionToken.newValue,
    })
    await this.actionTokensService.deleteActionToken(actionToken.id)
    await this.mailerService.sendEmail(
      actionToken.newValue,
      LetterTemplate.MailAddressHadChanged,
    )
  }

  private async generateJwtRefreshToken(
    userId: string,
    isSecondFactorAuthenticated = false,
  ) {
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: userId,
        isSecondFactorAuthenticated,
      },
      {
        algorithm: 'HS256',
        expiresIn: 60 * 60 * 24 * 30,
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      },
    )

    await this.userService.saveRefreshToken(userId, refreshToken)

    return refreshToken
  }

  public async checkRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<boolean> {
    const token = await this.userService.findRefreshToken(userId, refreshToken)
    return Boolean(token)
  }

  public async generateJwtTokens(
    userId: string,
    isSecondFactorAuthenticated = false,
  ) {
    const accessToken = await this.generateJwtAccessToken(
      userId,
      isSecondFactorAuthenticated,
    )
    const refreshToken = await this.generateJwtRefreshToken(
      userId,
      isSecondFactorAuthenticated,
    )

    return { accessToken, refreshToken }
  }

  async logout(userId: string, refreshToken: string) {
    await this.userService.deleteRefreshToken(userId, refreshToken)
  }

  async validateApiKey(apiKey: string): Promise<User | null> {
    return this.userService.findUserByApiKey(apiKey)
  }

  /*
    --------------------------------
    Google SSO section
    --------------------------------
  */
  async handleExistingUserGoogle(
    user: User,
    headers: unknown,
    ip: string,
  ) {
    if (!user.googleId) {
      throw new UnauthorizedException()
    }

    await this.sendTelegramNotification(user.id, headers, ip)

    const jwtTokens = await this.generateJwtTokens(
      user.id,
      !user.isTwoFactorAuthenticationEnabled,
    )

    if (user.isTwoFactorAuthenticationEnabled) {
      user = _pick(user, ['isTwoFactorAuthenticationEnabled', 'email'])
    } else {
      user = await this.getSharedProjectsForUser(user)
    }

    return {
      accessToken: jwtTokens.accessToken,
      refreshToken: jwtTokens.refreshToken,
      user: this.userService.omitSensitiveData(user),
    }
  }

  async registerUserGoogle(sub: string, email: string) {
    const query: UserGoogleDTO = {
      googleId: sub,
      trialEndDate: dayjs
        .utc()
        .add(TRIAL_DURATION, 'day')
        .format('YYYY-MM-DD HH:mm:ss'),
      registeredWithGoogle: true,
    }

    const userWithSameEmail = await this.userService.findOneWhere({
      email,
    })

    if (!userWithSameEmail) {
      query.email = email
    }

    const user = await this.userService.create(query)

    const { accessToken, refreshToken } = await this.generateJwtTokens(user.id, true)
    
    return {
      accessToken,
      refreshToken,
      user: this.userService.omitSensitiveData(user),
    }
  }

  async processHash(hash: string) {
    if (!hash) {
      throw new BadRequestException('Missing hash parameter')
    }

    const ssoRedisKey = getSSORedisKey(hash)
    const exists = await redis.exists(ssoRedisKey)

    if (!exists) {
      throw new BadRequestException('No authentication session opened for this hash')
    }

    const data = await redis.get(ssoRedisKey)

    if (!data) {
      throw new ConflictException('Authentication session is opened but no data found')
    }

    let sub: string
    let email: string

    try {
      const payload = JSON.parse(data)
      sub = payload.sub
      email = payload.email
    } catch (reason) {
      console.error(`[ERROR][AuthService -> authenticateGoogle -> JSON.parse]: ${reason} - ${data}`)
      throw new InternalServerErrorException('Session related data is corrupted')
    }

    await redis.del(ssoRedisKey)

    return { sub, email }
  }

  async authenticateGoogle(
    hash: string,
    headers: unknown,
    ip: string,
  ) {
    const { sub, email } = await this.processHash(hash)

    try {
      const user = await this.userService.findOneWhere({
        googleId: sub,
      })

      if (!user) {
        return this.registerUserGoogle(sub, email)
      }

      return this.handleExistingUserGoogle(user, headers, ip)
    } catch (error) {
      console.error(`[ERROR][AuthService -> authenticateGoogle]: ${error}`)
      throw new InternalServerErrorException('Something went wrong while authenticating user with Google')
    }
  }

  async generateGoogleURL() {
    // Generating SSO session identifier and authorisation URL
    const uuid = uuidv4()
    const auth_url = await this.oauth2Client.generateAuthUrl({
      state: uuid,
      redirect_uri: GOOGLE_OAUTH_REDIRECT_URL,
      scope: 'email',
      response_type: 'token',
    })

    // Storing the session identifier in redis
    await redis.set(getSSORedisKey(uuid), '', 'EX', REDIS_SSO_SESSION_TIMEOUT)

    return {
      uuid, auth_url,
    }
  }

  async processGoogleToken(
    token: string,
    hash: string,
  ) {
    let tokenInfo

    try {
      tokenInfo = await this.oauth2Client.getTokenInfo(token)
    } catch (reason) {
      console.error(`[ERROR][AuthService -> processGoogleCode -> oauth2Client.getTokenInfo]: ${reason}`)
      throw new BadRequestException('Invalid Google code supplied')
    }

    const { sub, email } = tokenInfo

    // TODO: Only store the email if email_verified is true
    const dataToStore = JSON.stringify({ sub, email })

    // Storing the session identifier in redis
    await redis.set(getSSORedisKey(hash), dataToStore, 'EX', REDIS_SSO_SESSION_TIMEOUT)
  }

  async linkGoogleAccount(userId: string, hash: string) {
    const { sub } = await this.processHash(hash)

    if (!sub) {
      throw new BadRequestException('Google ID is missing in the authentication session')
    }

    const user = await this.userService.findUserById(userId)

    if (!user) {
      throw new BadRequestException('User not found')
    }

    await this.userService.updateUser(userId, {
      googleId: sub,
    })
  }

  async unlinkGoogleAccount(userId: string) {
    await this.userService.updateUser(userId, {
      googleId: null,
    })
  }
}
