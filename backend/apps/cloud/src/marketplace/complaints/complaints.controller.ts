import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { UserType } from '../../user/entities/user.entity'
import { RolesGuard } from '../../auth/guards/roles.guard'
import { Roles } from '../../auth/decorators/roles.decorator'
import { JwtAccessTokenGuard } from '../../auth/guards'
import { UserService } from '../../user/user.service'
import { ExtensionsService } from '../extensions/extensions.service'
import { ComplaintsService } from './complaints.service'
import { CreateComplaintBodyDto } from './dtos/bodies/create-complaint.dto'
import { ResolveComplaintBodyDto } from './dtos/bodies/resolve-complaint.dto'
import { GetComplaintParamDto } from './dtos/params/get-complaint.dto'
import { ResolveComplaintParamDto } from './dtos/params/resolve-complaint.dto'
import { CreateComplaintQueryDto } from './dtos/queries/create-complaint.dto'
import { GetComplaintsQueryDto } from './dtos/queries/get-complaints.dto'
import { Complaint } from './entities/complaint.entity'

@ApiTags('complaints')
@Controller('complaints')
export class ComplaintsController {
  constructor(
    private readonly complaintsService: ComplaintsService,
    private readonly userService: UserService,
    private readonly extensionsService: ExtensionsService,
  ) {}

  @ApiBearerAuth()
  @Get()
  @ApiQuery({ name: 'offset', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'extensionId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @UseGuards(JwtAccessTokenGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  async getComplaints(@Query() queries: GetComplaintsQueryDto): Promise<{
    complaints: Complaint[]
    count: number
  }> {
    const [complaints, count] = await this.complaintsService.findAndCount({
      where: {
        ...(queries.extensionId && { extensionId: queries.extensionId }),
        ...(queries.userId && { userId: queries.userId }),
      },
      skip: queries.offset || 0,
      take: queries.limit || 25,
    })

    return { complaints, count }
  }

  @ApiBearerAuth()
  @Get(':complaintId')
  @ApiParam({ name: 'complaintId', required: true, type: String })
  @UseGuards(JwtAccessTokenGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  async getComplaint(
    @Param() params: GetComplaintParamDto,
  ): Promise<Complaint> {
    const complaint = await this.complaintsService.findOne({
      where: { id: parseInt(params.complaintId, 10) },
    })

    if (!complaint) {
      throw new NotFoundException('Complaint not found.')
    }

    return complaint
  }

  @Post()
  @ApiQuery({ name: 'userId', required: true, type: String })
  async createComplaint(
    @Query() queries: CreateComplaintQueryDto,
    @Body() body: CreateComplaintBodyDto,
  ): Promise<Complaint> {
    const user = await this.userService.findOne({
      where: { id: queries.userId },
    })

    if (!user) {
      throw new NotFoundException('User not found.')
    }

    const extension = await this.extensionsService.findOne({
      where: { id: body.extensionId.toString() },
    })

    if (!extension) {
      throw new NotFoundException('Extension not found.')
    }

    return this.complaintsService.save({
      ...body,
      userId: Number(queries.userId),
      extensionId: Number(body.extensionId),
    })
  }

  @ApiBearerAuth()
  @Post(':complaintId/resolve')
  @ApiParam({ name: 'complaintId', required: true, type: String })
  @UseGuards(JwtAccessTokenGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  async resolveComplaint(
    @Param() params: ResolveComplaintParamDto,
    @Body() body: ResolveComplaintBodyDto,
  ) {
    const complaint = await this.complaintsService.findOne({
      where: { id: parseInt(params.complaintId, 10) },
    })

    if (!complaint) {
      throw new NotFoundException('Complaint not found.')
    }

    if (complaint.isResolved) {
      throw new NotFoundException('Complaint is already resolved.')
    }

    await this.complaintsService.update(Number(params.complaintId), {
      extensionId: Number(params.complaintId),
      ...body,
      isResolved: true,
    })
  }
}
