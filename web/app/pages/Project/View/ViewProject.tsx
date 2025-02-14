/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components, react/display-name */
import React, {
  useState,
  useEffect,
  useMemo,
  memo,
  useRef,
  useCallback,
  createContext,
  useContext,
  SetStateAction,
  Dispatch,
} from 'react'
import { ClientOnly } from 'remix-utils/client-only'
import useSize from 'hooks/useSize'
import { useNavigate, Link, useSearchParams } from '@remix-run/react'
import bb from 'billboard.js'
import {
  ArrowDownTrayIcon,
  Cog8ToothIcon,
  ArrowPathIcon,
  ChartBarIcon,
  BoltIcon,
  BellIcon,
  NoSymbolIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  GlobeAltIcon,
  UsersIcon,
  BugAntIcon,
  BookmarkIcon,
  TrashIcon,
  PencilIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import cx from 'clsx'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _split from 'lodash/split'
import _includes from 'lodash/includes'
import _last from 'lodash/last'
import _isEmpty from 'lodash/isEmpty'
import _replace from 'lodash/replace'
import _toUpper from 'lodash/toUpper'
import _find from 'lodash/find'
import _filter from 'lodash/filter'
import _uniqBy from 'lodash/uniqBy'
import _findIndex from 'lodash/findIndex'
import _debounce from 'lodash/debounce'
import _some from 'lodash/some'
import _pickBy from 'lodash/pickBy'
import _every from 'lodash/every'
import _size from 'lodash/size'
import _truncate from 'lodash/truncate'
import _isString from 'lodash/isString'
import { toast } from 'sonner'

import { withProjectProtected } from 'hoc/projectProtected'

import { periodToCompareDate } from 'utils/compareConvertDate'

import { getTimeFromSeconds, getStringFromTime, getLocaleDisplayName, nLocaleFormatter } from 'utils/generic'
import { getItem, setItem, removeItem } from 'utils/localstorage'
import EventsRunningOutBanner from 'components/EventsRunningOutBanner'
import {
  tbPeriodPairs,
  getProjectCacheKey,
  LIVE_VISITORS_UPDATE_INTERVAL,
  DEFAULT_TIMEZONE,
  CDN_URL,
  isDevelopment,
  timeBucketToDays,
  getProjectCacheCustomKey,
  MAX_MONTHS_IN_PAST,
  PROJECT_TABS,
  TimeFormat,
  getProjectForcastCacheKey,
  chartTypes,
  roleAdmin,
  TRAFFIC_PANELS_ORDER,
  PERFORMANCE_PANELS_ORDER,
  isSelfhosted,
  tbPeriodPairsCompare,
  PERIOD_PAIRS_COMPARE,
  FILTERS_PERIOD_PAIRS,
  IS_ACTIVE_COMPARE,
  PROJECTS_PROTECTED,
  getProjectCacheCustomKeyPerf,
  isBrowser,
  TITLE_SUFFIX,
  KEY_FOR_ALL_TIME,
  MARKETPLACE_URL,
  getFunnelsCacheKey,
  getFunnelsCacheCustomKey,
  BROWSER_LOGO_MAP,
  OS_LOGO_MAP,
  OS_LOGO_MAP_DARK,
  ITBPeriodPairs,
  ERROR_PANELS_ORDER,
  ERROR_PERIOD_PAIRS,
  FUNNELS_PERIOD_PAIRS,
} from 'redux/constants'
import { IUser } from 'redux/models/IUser'
import {
  IProject,
  ILiveStats,
  IFunnel,
  IAnalyticsFunnel,
  IOverallObject,
  IOverallPerformanceObject,
} from 'redux/models/IProject'
import { IProjectForShared, ISharedProject } from 'redux/models/ISharedProject'
import { ICountryEntry } from 'redux/models/IEntry'
import Loader from 'ui/Loader'
import Dropdown from 'ui/Dropdown'
import Checkbox from 'ui/Checkbox'
import Select from 'ui/Select'
import FlatPicker from 'ui/Flatpicker'
import Robot from 'ui/icons/Robot'
import LineChart from 'ui/icons/LineChart'
import BarChart from 'ui/icons/BarChart'
import Forecast from 'modals/Forecast'
import NewFunnel from 'modals/NewFunnel'
import ViewProjectHotkeys from 'modals/ViewProjectHotkeys'
import routes from 'utils/routes'
import Header from 'components/Header'
import Footer from 'components/Footer'
import {
  getProjectData,
  getProject,
  getOverallStats,
  getLiveVisitors,
  getPerfData,
  getProjectDataCustomEvents,
  getTrafficCompareData,
  getPerformanceCompareData,
  checkPassword,
  getCustomEventsMetadata,
  addFunnel,
  updateFunnel,
  deleteFunnel,
  getFunnelData,
  getFunnels,
  getPerformanceOverallStats,
  getSessions,
  getSession,
  getErrors,
  getError,
  updateErrorStatus,
  getPropertyMetadata,
  getProjectViews,
  deleteProjectView,
  getDetailsPrediction,
} from 'api'
import { getChartPrediction } from 'api/ai'
import { Panel, Metadata } from './Panels'
import {
  onCSVExportClick,
  getFormatDate,
  panelIconMapping,
  typeNameMapping,
  noRegionPeriods,
  getSettings,
  getColumns,
  CHART_METRICS_MAPPING,
  CHART_METRICS_MAPPING_PERF,
  getSettingsPerf,
  transformAIChartData,
  getSettingsFunnels,
  SHORTCUTS_TABS_LISTENERS,
  SHORTCUTS_TABS_MAP,
  SHORTCUTS_GENERAL_LISTENERS,
  SHORTCUTS_TIMEBUCKETS_LISTENERS,
  CHART_MEASURES_MAPPING_PERF,
} from './ViewProject.helpers'
import CCRow from './components/CCRow'
import FunnelsList from './components/FunnelsList'
import RefRow from './components/RefRow'
import NoEvents from './components/NoEvents'
import SearchFilters from './components/SearchFilters'
import Filters from './components/Filters'
import LiveVisitorsDropdown from './components/LiveVisitorsDropdown'
import CountryDropdown from './components/CountryDropdown'
import { MetricCard, MetricCards, PerformanceMetricCards } from './components/MetricCards'
import ProjectAlertsView from '../Alerts/View'
import Uptime from '../uptime/View'
import UTMDropdown from './components/UTMDropdown'
import TBPeriodSelector from './components/TBPeriodSelector'
import { ISession } from './interfaces/session'
import { Sessions } from './components/Sessions'
import { Pageflow } from './components/Pageflow'
import { SessionDetails } from './components/SessionDetails'
import { SessionChart } from './components/SessionChart'
import { Errors } from './components/Errors'
import LockedDashboard from './components/LockedDashboard'
import WaitingForAnEvent from './components/WaitingForAnEvent'
import { ErrorChart } from './components/ErrorChart'
import { ErrorDetails } from './components/ErrorDetails'
import { IError } from './interfaces/error'
import NoErrorDetails from './components/NoErrorDetails'
import WaitingForAnError from './components/WaitingForAnError'
import NoSessionDetails from './components/NoSessionDetails'
import {
  ICustoms,
  IFilter,
  ITrafficMeta,
  IParams,
  IProjectView,
  IProjectViewCustomEvent,
  IProperties,
  ITrafficLogResponse,
} from './interfaces/traffic'
import { trackCustom } from 'utils/analytics'
import {
  handleNavigationParams,
  updateFilterState,
  validTimeBacket,
  validPeriods,
  parseFiltersFromUrl,
  isFilterValid,
  FILTER_CHART_METRICS_MAPPING_FOR_COMPARE,
  ERROR_FILTERS_MAPPING,
} from './utils/filters'
import AddAViewModal from './components/AddAViewModal'
import CustomMetrics from './components/CustomMetrics'
import { AIProcessedResponse, AIResponse } from './interfaces/ai'
import { useRequiredParams } from 'hooks/useRequiredParams'
import BrowserDropdown from './components/BrowserDropdown'
import OSDropdown from './components/OSDropdown'
const SwetrixSDK = require('@swetrix/sdk')

const CUSTOM_EV_DROPDOWN_MAX_VISIBLE_LENGTH = 32
const SESSIONS_TAKE = 30
const ERRORS_TAKE = 30

interface ViewProjectContextType {
  // States
  projectId: string
  projectPassword: string
  timezone: string
  dateRange: Date[] | null
  isLoading: boolean
  timeBucket: string
  period: string
  activePeriod: ITBPeriodPairs | undefined
  periodPairs: ITBPeriodPairs[]
  timeFormat: '12-hour' | '24-hour'
  size: ReturnType<typeof useSize>[1]
  allowedToManage: boolean

  // Functions
  setDateRange: Dispatch<SetStateAction<Date[] | null>>
  updatePeriod: (newPeriod: { period: string; label?: string }) => void
  updateTimebucket: (newTimebucket: string) => void
  setPeriodPairs: Dispatch<SetStateAction<ITBPeriodPairs[]>>

  // Refs
  refCalendar: React.MutableRefObject<any>
}

const ViewProjectContext = createContext<ViewProjectContextType | undefined>(undefined)

export const useViewProjectContext = () => {
  const context = useContext(ViewProjectContext)

  if (context === undefined) {
    throw new Error('useViewProjectContext must be used within a ViewProjectContextProvider')
  }

  return context
}

interface IViewProject {
  projects: IProject[]
  extensions: any
  isLoading: boolean
  cache: any
  cachePerf: any
  setProjectCache: (pid: string, data: any, key: string) => void
  projectViewPrefs: {
    [key: string]: {
      period: string
      timeBucket: string
      rangeDate?: Date[]
    }
  } | null
  setProjectViewPrefs: (pid: string, period: string, timeBucket: string, rangeDate?: Date[]) => void
  setPublicProject: (project: Partial<IProject | ISharedProject>) => void
  setLiveStatsForProject: (id: string, count: number) => void
  setProjectCachePerf: (pid: string, data: any, key: string) => void
  setProjectForcastCache: (pid: string, data: any, key: string) => void
  authenticated: boolean
  user: IUser
  timezone: string
  sharedProjects: ISharedProject[]
  projectTab: string
  setProjectTab: (tab: string) => void
  // eslint-disable-next-line no-unused-vars, no-shadow
  setProjects: (projects: Partial<IProject | ISharedProject>[]) => void
  customEventsPrefs: any
  setCustomEventsPrefs: (pid: string, data: any) => void
  liveStats: ILiveStats
  password: {
    [key: string]: string
  }
  theme: 'dark' | 'light'
  ssrTheme: 'dark' | 'light'
  embedded: boolean
  ssrAuthenticated: boolean
  queryPassword: string | null
  authLoading: boolean
  cacheFunnels: any
  setFunnelsCache: (pid: string, data: any, key: string) => void
  updateProject: (pid: string, project: Partial<IProject | ISharedProject>) => void
  projectQueryTabs: string[]
}

const ViewProject = ({
  projects,
  isLoading: _isLoading,
  cache,
  cachePerf,
  setProjectCache,
  projectViewPrefs,
  setProjectViewPrefs,
  setPublicProject,
  setLiveStatsForProject,
  authenticated: csrAuthenticated,
  timezone = DEFAULT_TIMEZONE,
  user,
  sharedProjects,
  extensions,
  setProjectCachePerf,
  projectTab,
  setProjectTab,
  setProjects,
  setProjectForcastCache,
  customEventsPrefs,
  setCustomEventsPrefs,
  liveStats,
  password,
  theme,
  ssrTheme,
  embedded,
  ssrAuthenticated,
  queryPassword,
  authLoading,
  cacheFunnels,
  setFunnelsCache,
  updateProject,
  projectQueryTabs,
}: IViewProject) => {
  const authenticated = isBrowser ? (authLoading ? ssrAuthenticated : csrAuthenticated) : ssrAuthenticated

  const {
    t,
    i18n: { language },
  } = useTranslation('common')

  const _theme = isBrowser ? theme : ssrTheme

  // periodPairs is used for dropdown and updated when t changes
  const [periodPairs, setPeriodPairs] = useState<ITBPeriodPairs[]>(tbPeriodPairs(t, undefined, undefined, language))

  // customExportTypes used for marketplace extensions if you have extensions with export
  const [customExportTypes, setCustomExportTypes] = useState<any[]>([])
  // customPanelTabs used for marketplace extensions if you have extensions with custom panel
  const [customPanelTabs, setCustomPanelTabs] = useState<any[]>([])
  // sdkInstance is a sdk used for dowland and working with marketplace extensions. DO NOT TOUCH IT
  const [sdkInstance, setSdkInstance] = useState<any>(null)

  // activeChartMetricsCustomEvents is a list of custom events for logic with api, chart and dropdown
  const [activeChartMetricsCustomEvents, setActiveChartMetricsCustomEvents] = useState<any[]>([])

  // dashboardRef is a ref for dashboard div
  const dashboardRef = useRef<HTMLDivElement>(null)

  const { id } = useRequiredParams<{ id: string }>()
  // history is a history from react-router-dom
  const navigate = useNavigate()

  // searchParams is a search params from react-router-dom
  const [searchParams, setSearchParams] = useSearchParams()

  // find project by id from url from state in redux projects and sharedProjects. projects and sharedProjects loading from api in Saga on page load
  const project: IProjectForShared = useMemo(
    () =>
      _find(
        [...projects, ..._map(sharedProjects, (item) => ({ ...item.project, role: item.role }))],
        (p) => p.id === id,
      ) || ({} as IProjectForShared),
    [projects, id, sharedProjects],
  )

  const projectPassword = useMemo(
    () => password[id] || (getItem(PROJECTS_PROTECTED)?.[id] as string) || queryPassword || '',
    [id, password, queryPassword],
  )

  /* isSharedProject is a boolean check if project is shared. If isSharedProject is true,
  we used role and other colummn from sharedProjects.
  And it is used for remove settings button when user have role viewer or logic with Alert tabs */
  const isSharedProject = useMemo(() => {
    const foundProject = _find([..._map(sharedProjects, (item) => item.project)], (p) => p.id === id)
    return !_isEmpty(foundProject)
  }, [id, sharedProjects])

  // areFiltersParsed used for check filters is parsed from url. If we have query params in url, we parse it and set to state
  // when areFiltersParsed and areFiltersPerfParsed changed we call loadAnalytics or loadAnalyticsPerf and other func for load data
  // all state with Parsed in name is used for parse query params from url
  const [areFiltersParsed, setAreFiltersParsed] = useState(false)
  // similar areFiltersParsed but using for activeTab === 'performance'
  const [areFiltersPerfParsed, setAreFiltersPerfParsed] = useState(false)
  // similar areFiltersParsed and areFiltersPerfParsed but using for period
  const [arePeriodParsed, setArePeriodParsed] = useState(false)
  // similar areFiltersParsed and areFiltersPerfParsed but using for timeBucket
  const [areTimeBucketParsed, setAreTimeBucketParsed] = useState(false)

  // panelsData is a data used for components <Panels /> and <Metadata />,
  // also using for logic with custom events on chart and export data like csv
  const [panelsData, setPanelsData] = useState<{
    types: (keyof IParams)[]
    data: IParams
    customs: ICustoms
    properties: IProperties
    meta?: ITrafficMeta[]
    // @ts-expect-error
  }>({})
  const [overall, setOverall] = useState<Partial<IOverallObject>>({})
  const [overallPerformance, setOverallPerformance] = useState<Partial<IOverallPerformanceObject>>({})
  // isPanelsDataEmpty is a true we are display components <NoEvents /> and do not show dropdowns with activeChartMetrics
  const [isPanelsDataEmpty, setIsPanelsDataEmpty] = useState(false)
  const [isForecastOpened, setIsForecastOpened] = useState(false)
  const [isNewFunnelOpened, setIsNewFunnelOpened] = useState(false)
  const [isAddAViewOpened, setIsAddAViewOpened] = useState(false)
  // analyticsLoading is a boolean for show loader on chart
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  // period using for logic with update data on chart. Set when user change period in dropdown and when we parse query params from url
  const [period, setPeriod] = useState<string>(
    projectViewPrefs ? projectViewPrefs[id]?.period || periodPairs[4].period : periodPairs[4].period,
  )
  // timeBucket using for logic with update data on chart. Set when user change timeBucket in dropdown and when we parse query params from url
  const [timeBucket, setTimebucket] = useState<string>(
    projectViewPrefs ? projectViewPrefs[id]?.timeBucket || periodPairs[4].tbs[1] : periodPairs[4].tbs[1],
  )
  // activeTab using for change tabs and display other data on chart. Like performance, traffic, custom events
  const activePeriod = useMemo(() => _find(periodPairs, (p) => p.period === period), [period, periodPairs])
  // chartData is a data for chart. It is a main data for chart
  const [chartData, setChartData] = useState<any>({})
  // mainChart is a ref for chart
  const [mainChart, setMainChart] = useState<any>(null)
  // dataLoading is a boolean for show loader on chart and do not load data when we have dataLoading === true
  const [dataLoading, setDataLoading] = useState<boolean>(false)
  // activeChartMetrics is a list of metrics for logic with api, chart and dropdown
  // when user change metrics in dropdown, we change activeChartMetrics and show other data on chart
  const [activeChartMetrics, setActiveChartMetrics] = useState<{
    [key: string]: boolean
  }>({
    [CHART_METRICS_MAPPING.unique]: true,
    [CHART_METRICS_MAPPING.views]: false,
    [CHART_METRICS_MAPPING.sessionDuration]: false,
    [CHART_METRICS_MAPPING.bounce]: false,
    [CHART_METRICS_MAPPING.viewsPerUnique]: false,
    [CHART_METRICS_MAPPING.trendlines]: false,
    [CHART_METRICS_MAPPING.cumulativeMode]: false,
  })
  const [errorOptions, setErrorOptions] = useState<{
    [key: string]: boolean
  }>({
    [ERROR_FILTERS_MAPPING.showResolved]: false,
  })
  // similar activeChartMetrics but using for performance tab
  const [activeChartMetricsPerf, setActiveChartMetricsPerf] = useState<string>(CHART_METRICS_MAPPING_PERF.timing)
  const [activePerfMeasure, setActivePerfMeasure] = useState(CHART_MEASURES_MAPPING_PERF.median)
  // checkIfAllMetricsAreDisabled when all metrics are disabled, we are hidden chart
  const checkIfAllMetricsAreDisabled = useMemo(
    () => !_some({ ...activeChartMetrics, ...activeChartMetricsCustomEvents }, (value) => value),
    [activeChartMetrics, activeChartMetricsCustomEvents],
  )
  const [customMetrics, setCustomMetrics] = useState<IProjectViewCustomEvent[]>([])
  const [filters, setFilters] = useState<IFilter[]>([])
  const [filtersPerf, setFiltersPerf] = useState<IFilter[]>([])
  const [filtersSessions, setFiltersSessions] = useState<IFilter[]>([])
  const [areFiltersSessionsParsed, setAreFiltersSessionsParsed] = useState<boolean>(false)
  // filters for list of errors
  const [filtersErrors, setFiltersErrors] = useState<IFilter[]>([])
  const [areFiltersErrorsParsed, setAreFiltersErrorsParsed] = useState<boolean>(false)
  // filters for details error page
  const [filtersSubError, setFiltersSubError] = useState<IFilter[]>([])
  const [areFiltersSubErrorParsed, setAreFiltersSubErrorParsed] = useState<boolean>(false)

  // isLoading is a true when we loading data from api
  const isLoading = authenticated ? _isLoading : false
  // tnMapping is a mapping for panels type
  const tnMapping = typeNameMapping(t)
  // refCalendar is a ref for calendar
  const refCalendar = useRef(null)
  // refCalendarCompare is a ref for calendar when compare is enabled
  const refCalendarCompare = useRef(null)
  // localStorageDateRange is a date range from local storage
  const localStorageDateRange = projectViewPrefs ? projectViewPrefs[id]?.rangeDate : null
  // dateRange is a date range for calendar
  const [dateRange, setDateRange] = useState<null | Date[]>(
    localStorageDateRange ? [new Date(localStorageDateRange[0]), new Date(localStorageDateRange[1])] : null,
  )
  // activeTab traffic, performance, alerts
  const [activeTab, setActiveTab] = useState<string>(() => {
    // first we check if we have activeTab in url
    // if we have activeTab in url, we return it
    // if we do not have activeTab in url, we return activeTab from localStorage or default tab trafic
    const tab = searchParams.get('tab') as keyof typeof PROJECT_TABS

    if (tab in PROJECT_TABS) {
      return tab
    }

    return projectTab || PROJECT_TABS.traffic
  })

  const [isHotkeysHelpOpened, setIsHotkeysHelpOpened] = useState(false)

  // sessions
  const [sessionsSkip, setSessionsSkip] = useState<number>(0)
  const [canLoadMoreSessions, setCanLoadMoreSessions] = useState<boolean>(false)
  const [sessions, setSessions] = useState<any[]>([])
  const [sessionsLoading, setSessionsLoading] = useState<boolean | null>(null) // null - not loaded, true - loading, false - loaded
  const [activeSession, setActiveSession] = useState<any>(null)
  const [sessionLoading, setSessionLoading] = useState<boolean>(false)
  const [activePSID, setActivePSID] = useState<string | null>(null)

  // errors
  const [errorsSkip, setErrorsSkip] = useState<number>(0)
  const [canLoadMoreErrors, setCanLoadMoreErrors] = useState<boolean>(false)
  const [errors, setErrors] = useState<any[]>([])
  const [errorsLoading, setErrorsLoading] = useState<boolean | null>(null) // null - not loaded, true - loading, false - loaded
  const [activeError, setActiveError] = useState<any>(null)
  const [errorLoading, setErrorLoading] = useState<boolean>(false)
  const [errorStatusUpdating, setErrorStatusUpdating] = useState(false)
  const [activeEID, setActiveEID] = useState<string | null>(null)

  const [activeFunnel, setActiveFunnel] = useState<IFunnel | null>(null)
  const [funnelToEdit, setFunnelToEdit] = useState<IFunnel | undefined>(undefined)
  const [funnelActionLoading, setFunnelActionLoading] = useState<boolean>(false)

  // null -> not loaded yet
  const [projectViews, setProjectViews] = useState<IProjectView[]>([])
  const [projectViewsLoading, setProjectViewsLoading] = useState<boolean | null>(null) //  // null - not loaded, true - loading, false - loaded
  const [projectViewDeleting, setProjectViewDeleting] = useState(false)
  const [projectViewToUpdate, setProjectViewToUpdate] = useState<IProjectView | undefined>()

  // AI stuff
  const [forecasedChartData, setForecasedChartData] = useState({})
  const [isInAIDetailsMode, setIsInAIDetailsMode] = useState(false)
  const [aiDetails, setAiDetails] = useState<AIProcessedResponse | null>(null)
  const [activeAiDetail, setActiveAIDetail] = useState<keyof AIResponse | null>(null)

  const sortedAIKeys = useMemo(() => {
    if (!aiDetails) {
      return []
    }

    const hours = _map(aiDetails, (_, key) => parseInt(_split(key, '_')[1], 10)).sort((a, b) => a - b)

    return _map(hours, (hour) => {
      const key = `next_${hour}_hour` as keyof AIResponse

      if (hour === 1) {
        return {
          key,
          label: t('project.nextOneHour'),
        }
      }

      return {
        key,
        label: t('project.nextXHours', {
          x: hour,
        }),
      }
    })
  }, [aiDetails, t])

  const mode = activeChartMetrics[CHART_METRICS_MAPPING.cumulativeMode] ? 'cumulative' : 'periodical'

  const loadProjectViews = async (forced?: boolean) => {
    if (!forced && projectViewsLoading !== null) {
      return
    }

    setProjectViewsLoading(true)

    try {
      const views = await getProjectViews(id, projectPassword)
      setProjectViews(views)
    } catch (reason: any) {
      console.error('[ERROR] (loadProjectViews)', reason)
      toast.error(reason)
    }

    setProjectViewsLoading(false)
  }

  const onProjectViewDelete = async (viewId: string) => {
    if (projectViewDeleting) {
      return
    }

    setProjectViewDeleting(true)

    try {
      await deleteProjectView(id, viewId)
    } catch (reason: any) {
      console.error('[ERROR] (deleteProjectView)', reason)
      toast.error(reason)
      setProjectViewDeleting(false)
      return
    }

    toast.success(t('apiNotifications.viewDeleted'))
    await loadProjectViews(true)
    setProjectViewDeleting(false)
  }

  const onFunnelCreate = async (name: string, steps: string[]) => {
    if (funnelActionLoading) {
      return
    }

    setFunnelActionLoading(true)

    try {
      await addFunnel(id, name, steps)
    } catch (reason: any) {
      console.error('[ERROR] (onFunnelCreate)(addFunnel)', reason)
      toast.error(reason)
    }

    try {
      const funnels = await getFunnels(id, projectPassword)

      updateProject(id, {
        funnels,
      })
    } catch (reason: any) {
      console.error('[ERROR] (onFunnelCreate)(getFunnels)', reason)
    }

    toast.success(t('apiNotifications.funnelCreated'))
    setFunnelActionLoading(false)
  }

  const onFunnelEdit = async (funnelId: string, name: string, steps: string[]) => {
    if (funnelActionLoading) {
      return
    }

    setFunnelActionLoading(true)

    try {
      await updateFunnel(funnelId, id, name, steps)
    } catch (reason: any) {
      console.error('[ERROR] (onFunnelEdit)(updateFunnel)', reason)
      toast.error(reason)
    }

    try {
      const funnels = await getFunnels(id, projectPassword)

      updateProject(id, {
        funnels,
      })
    } catch (reason: any) {
      console.error('[ERROR] (onFunnelCreate)(getFunnels)', reason)
    }

    toast.success(t('apiNotifications.funnelUpdated'))
    setFunnelActionLoading(false)
  }

  const onFunnelDelete = async (funnelId: string) => {
    if (funnelActionLoading) {
      return
    }

    setFunnelActionLoading(true)

    try {
      await deleteFunnel(funnelId, id)
    } catch (reason: any) {
      console.error('[ERROR] (onFunnelDelete)(deleteFunnel)', reason)
      toast.error(reason)
    }

    try {
      const funnels = await getFunnels(id, projectPassword)

      updateProject(id, {
        funnels,
      })
    } catch (reason: any) {
      console.error('[ERROR] (onFunnelCreate)(getFunnels)', reason)
    }

    toast.success(t('apiNotifications.funnelDeleted'))
    setFunnelActionLoading(false)
  }
  // pgActiveFragment is a active fragment for pagination
  const [pgActiveFragment, setPgActiveFragment] = useState<number>(0)

  // Used to switch between Country, Region and City tabs
  const [countryActiveTab, setCountryActiveTab] = useState<'cc' | 'rg' | 'ct'>('cc')

  // Used to switch between Browser and Browser Version tabs
  const [browserActiveTab, setBrowserActiveTab] = useState<'br' | 'brv'>('br')

  // Used to switch between OS and OS Version tabs
  const [osActiveTab, setOsActiveTab] = useState<'os' | 'osv'>('os')

  // Used to switch between different UTM tabs
  const [utmActiveTab, setUtmActiveTab] = useState<'so' | 'me' | 'ca'>('so')

  // chartDataPerf is a data for performance chart
  const [chartDataPerf, setChartDataPerf] = useState<any>({})
  // similar to isPanelsDataEmpty but using for performance tab
  const [isPanelsDataEmptyPerf, setIsPanelsDataEmptyPerf] = useState<boolean>(false)
  // similar to panelsData but using for performance tab
  const [panelsDataPerf, setPanelsDataPerf] = useState<any>({})
  // timeFormat is a time format for chart
  // @ts-expect-error
  const timeFormat = useMemo<'12-hour' | '24-hour'>(() => user.timeFormat || TimeFormat['12-hour'], [user])
  // ref, size using for logic with responsive chart
  const [ref, size] = useSize()
  // rotateXAxias using for logic with responsive chart
  const rotateXAxis = useMemo(() => size.width > 0 && size.width < 500, [size])
  // customEventsChartData is a data for custom events on a chart
  const customEventsChartData = useMemo(
    () =>
      _pickBy(customEventsPrefs[id], (value, keyCustomEvents) =>
        _includes(activeChartMetricsCustomEvents, keyCustomEvents),
      ),
    [customEventsPrefs, id, activeChartMetricsCustomEvents],
  )
  // chartType is a type of chart, bar or line
  const [chartType, setChartType] = useState<string>((getItem('chartType') as string) || chartTypes.line)

  // similar to periodPairs but using for compare
  const [periodPairsCompare, setPeriodPairsCompare] = useState<
    {
      label: string
      period: string
    }[]
  >(tbPeriodPairsCompare(t, undefined, language))
  // similar to isActive but using for compare
  const [isActiveCompare, setIsActiveCompare] = useState<boolean>(() => {
    const activeCompare = getItem(IS_ACTIVE_COMPARE)

    if (typeof activeCompare === 'string') {
      return activeCompare === 'true'
    }

    if (typeof activeCompare === 'boolean') {
      return activeCompare
    }

    return false
  })
  // similar to activePeriod but using for compare
  const [activePeriodCompare, setActivePeriodCompare] = useState<string>(periodPairsCompare[0].period)
  // activeDropdownLabelCompare is a label using for overview panels and dropdown
  const activeDropdownLabelCompare = useMemo(
    () => _find(periodPairsCompare, (p) => p.period === activePeriodCompare)?.label,
    [periodPairsCompare, activePeriodCompare],
  )
  // dateRangeCompare is a date range for calendar when compare is enabled
  const [dateRangeCompare, setDateRangeCompare] = useState<null | Date[]>(null)
  // dataChartCompare is a data for chart when compare is enabled
  const [dataChartCompare, setDataChartCompare] = useState<any>({})
  const [overallCompare, setOverallCompare] = useState<Partial<IOverallObject>>({})
  const [overallPerformanceCompare, setOverallPerformanceCompare] = useState<Partial<IOverallPerformanceObject>>({})
  // dataChartPerfCompare is a data for performance chart when compare is enabled
  const [dataChartPerfCompare, setDataChartPerfCompare] = useState<any>({})
  // maxRangeCompare is a max range for calendar when compare is enabled
  const maxRangeCompare = useMemo(() => {
    if (!isActiveCompare) {
      return 0
    }

    const findActivePeriod = _find(periodPairs, (p) => p.period === period)

    if (findActivePeriod?.period === 'custom' && dateRange) {
      return dayjs.utc(dateRange[1]).diff(dayjs.utc(dateRange[0]), 'day')
    }

    return findActivePeriod?.countDays || 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActiveCompare, period])

  // pgPanelNameMapping is a mapping for panel names. Using for change name of panels pg if userFlow active
  const pgPanelNameMapping = [
    tnMapping.pg, // when fragment 0 is selected
    tnMapping.userFlow, // when fragment 1 is selected
  ]

  // { name } is a project name from project
  const { name } = project

  useEffect(() => {
    let pageTitle = user?.showLiveVisitorsInTitle ? `👀 ${liveStats[id]} - ${name}` : name

    if (!pageTitle) {
      pageTitle = t('titles.main')
    }

    pageTitle += ` ${TITLE_SUFFIX}`

    document.title = pageTitle
  }, [name, user, liveStats, id, t])

  // sharedRoles is a role for shared project
  const sharedRoles = useMemo(() => _find(user.sharedProjects, (p) => p.project.id === id)?.role || {}, [user, id])

  const timeBucketSelectorItems = useMemo(() => {
    if (activeTab === PROJECT_TABS.errors) {
      return _filter(periodPairs, (el) => {
        return _includes(ERROR_PERIOD_PAIRS, el.period)
      })
    }

    if (activeTab === PROJECT_TABS.funnels) {
      return _filter(periodPairs, (el) => {
        return _includes(FUNNELS_PERIOD_PAIRS, el.period)
      })
    }

    if (isActiveCompare) {
      return _filter(periodPairs, (el) => {
        return _includes(FILTERS_PERIOD_PAIRS, el.period)
      })
    }

    if (_includes(FILTERS_PERIOD_PAIRS, period)) {
      return periodPairs
    }

    return _filter(periodPairs, (el) => {
      return el.period !== PERIOD_PAIRS_COMPARE.COMPARE
    })
  }, [activeTab, isActiveCompare, period, periodPairs])

  // for search filters
  const [showFiltersSearch, setShowFiltersSearch] = useState(false)

  // chartMetrics is a list of metrics for dropdown
  const chartMetrics = useMemo(() => {
    return [
      {
        id: CHART_METRICS_MAPPING.unique,
        label: t('dashboard.unique'),
        active: activeChartMetrics[CHART_METRICS_MAPPING.unique],
      },
      {
        id: CHART_METRICS_MAPPING.views,
        label: t('project.showAll'),
        active: activeChartMetrics[CHART_METRICS_MAPPING.views],
      },
      {
        id: CHART_METRICS_MAPPING.sessionDuration,
        label: t('dashboard.sessionDuration'),
        active: activeChartMetrics[CHART_METRICS_MAPPING.sessionDuration],
        conflicts: [CHART_METRICS_MAPPING.bounce],
      },
      {
        id: CHART_METRICS_MAPPING.bounce,
        label: t('dashboard.bounceRate'),
        active: activeChartMetrics[CHART_METRICS_MAPPING.bounce],
        conflicts: [CHART_METRICS_MAPPING.sessionDuration],
      },
      {
        id: CHART_METRICS_MAPPING.viewsPerUnique,
        label: t('dashboard.viewsPerUnique'),
        active: activeChartMetrics[CHART_METRICS_MAPPING.viewsPerUnique],
      },
      {
        id: CHART_METRICS_MAPPING.trendlines,
        label: t('dashboard.trendlines'),
        active: activeChartMetrics[CHART_METRICS_MAPPING.trendlines],
      },
      {
        id: CHART_METRICS_MAPPING.cumulativeMode,
        label: t('dashboard.cumulativeMode'),
        active: activeChartMetrics[CHART_METRICS_MAPPING.cumulativeMode],
      },
      {
        id: CHART_METRICS_MAPPING.customEvents,
        label: t('project.customEv'),
        active: activeChartMetrics[CHART_METRICS_MAPPING.customEvents],
      },
    ]
  }, [t, activeChartMetrics])

  const errorFilters = useMemo(() => {
    return [
      {
        id: ERROR_FILTERS_MAPPING.showResolved,
        label: t('project.showResolved'),
        active: errorOptions[ERROR_FILTERS_MAPPING.showResolved],
      },
    ]
  }, [t, errorOptions])

  // chartMetricsPerf is a list of metrics for dropdown in performance tab
  const chartMetricsPerf = useMemo(() => {
    return [
      {
        id: CHART_METRICS_MAPPING_PERF.quantiles,
        label: t('dashboard.allocation'),
        active: activeChartMetricsPerf === CHART_METRICS_MAPPING_PERF.quantiles,
      },
      {
        id: CHART_METRICS_MAPPING_PERF.full,
        label: t('dashboard.timingFull'),
        active: activeChartMetricsPerf === CHART_METRICS_MAPPING_PERF.full,
      },
      {
        id: CHART_METRICS_MAPPING_PERF.timing,
        label: t('dashboard.timing'),
        active: activeChartMetricsPerf === CHART_METRICS_MAPPING_PERF.timing,
      },
      {
        id: CHART_METRICS_MAPPING_PERF.network,
        label: t('dashboard.network'),
        active: activeChartMetricsPerf === CHART_METRICS_MAPPING_PERF.network,
      },
      {
        id: CHART_METRICS_MAPPING_PERF.frontend,
        label: t('dashboard.frontend'),
        active: activeChartMetricsPerf === CHART_METRICS_MAPPING_PERF.frontend,
      },
      {
        id: CHART_METRICS_MAPPING_PERF.backend,
        label: t('dashboard.backend'),
        active: activeChartMetricsPerf === CHART_METRICS_MAPPING_PERF.backend,
      },
    ]
  }, [t, activeChartMetricsPerf])

  const chartMeasuresPerf = useMemo(() => {
    return [
      {
        id: CHART_MEASURES_MAPPING_PERF.average,
        label: t('dashboard.average'),
        active: activePerfMeasure === CHART_MEASURES_MAPPING_PERF.average,
      },
      {
        id: CHART_MEASURES_MAPPING_PERF.median,
        label: t('dashboard.median'),
        active: activePerfMeasure === CHART_MEASURES_MAPPING_PERF.median,
      },
      {
        id: CHART_MEASURES_MAPPING_PERF.p95,
        label: t('dashboard.xPercentile', { x: 95 }),
        active: activePerfMeasure === CHART_MEASURES_MAPPING_PERF.p95,
      },
    ]
  }, [t, activePerfMeasure])

  // chartMetricsCustomEvents is a list of custom events for dropdown
  const chartMetricsCustomEvents = useMemo(() => {
    if (!_isEmpty(panelsData.customs)) {
      return _map(_keys(panelsData.customs), (key) => ({
        id: key,
        label: key,
        active: _includes(activeChartMetricsCustomEvents, key),
      }))
    }
    return []
  }, [panelsData, activeChartMetricsCustomEvents])

  // dataNamesCustomEvents is a list of custom events for chart
  const dataNamesCustomEvents = useMemo(() => {
    if (!_isEmpty(panelsData.customs)) {
      return { ..._keys(panelsData.customs) }
    }
    return {}
  }, [panelsData])

  // dataNames is a list of metrics for chart
  const dataNames = useMemo(
    () => ({
      unique: t('project.unique'),
      total: t('project.total'),
      bounce: `${t('dashboard.bounceRate')} (%)`,
      viewsPerUnique: t('dashboard.viewsPerUnique'),
      trendlineTotal: t('project.trendlineTotal'),
      trendlineUnique: t('project.trendlineUnique'),
      occurrences: t('project.occurrences'),
      sessionDuration: t('dashboard.sessionDuration'),
      ...dataNamesCustomEvents,
    }),
    [t, dataNamesCustomEvents],
  )

  // dataNamesPerf is a list of metrics for chart in performance tab
  const dataNamesPerf = useMemo(
    () => ({
      full: t('dashboard.timing'),
      network: t('dashboard.network'),
      frontend: t('dashboard.frontend'),
      backend: t('dashboard.backend'),
      dns: t('dashboard.dns'),
      tls: t('dashboard.tls'),
      conn: t('dashboard.conn'),
      response: t('dashboard.response'),
      render: t('dashboard.render'),
      dom_load: t('dashboard.domLoad'),
      ttfb: t('dashboard.ttfb'),
      p50: t('dashboard.xPercentile', { x: 50 }),
      p75: t('dashboard.xPercentile', { x: 75 }),
      p95: t('dashboard.xPercentile', { x: 95 }),
    }),
    [t],
  )

  const allowedToManage = useMemo(() => project?.isOwner || sharedRoles === roleAdmin.role, [project, sharedRoles])

  const dataNamesFunnel = useMemo(
    () => ({
      dropoff: t('project.dropoff'),
      events: t('project.visitors'),
    }),
    [t],
  )

  const tabs: {
    id: string
    label: string
    icon: any
  }[] = useMemo(() => {
    const selfhostedOnly = [
      {
        id: PROJECT_TABS.traffic,
        label: t('dashboard.traffic'),
        icon: ChartBarIcon,
      },
      {
        id: PROJECT_TABS.performance,
        label: t('dashboard.performance'),
        icon: BoltIcon,
      },
      {
        id: PROJECT_TABS.sessions,
        label: t('dashboard.sessions'),
        icon: UsersIcon,
      },
      {
        id: PROJECT_TABS.errors,
        label: t('dashboard.errors'),
        icon: BugAntIcon,
      },
      {
        id: PROJECT_TABS.funnels,
        label: t('dashboard.funnels'),
        icon: FunnelIcon,
      },
    ]

    const adminTabs = allowedToManage
      ? [
          {
            id: 'settings',
            label: t('common.settings'),
            icon: Cog8ToothIcon,
          },
        ]
      : []

    if (isSelfhosted) {
      return [...selfhostedOnly, ...adminTabs]
    }

    const newTabs = [
      ...selfhostedOnly,
      {
        id: PROJECT_TABS.alerts,
        label: t('dashboard.alerts'),
        icon: BellIcon,
      },
      ['79eF2Z9rNNvv', 'STEzHcB1rALV'].includes(id) && {
        id: PROJECT_TABS.uptime,
        label: t('dashboard.uptime'),
        icon: ClockIcon,
      },
      ...adminTabs,
    ].filter((x) => !!x)

    if (projectQueryTabs && projectQueryTabs.length) {
      return _filter(newTabs, (tab) => _includes(projectQueryTabs, tab.id))
    }

    return newTabs
  }, [t, id, projectQueryTabs, allowedToManage])

  // activeTabLabel is a label for active tab. Using for title in dropdown
  const activeTabLabel = useMemo(() => _find(tabs, (tab) => tab.id === activeTab)?.label, [tabs, activeTab])

  const switchTrafficChartMetric = (pairID: string, conflicts?: string[]) => {
    if (isConflicted(conflicts)) {
      toast.error(t('project.conflictMetric'))
      return
    }

    if (pairID === CHART_METRICS_MAPPING.customEvents) {
      return
    }

    setActiveChartMetrics((prev) => ({ ...prev, [pairID]: !prev[pairID] }))
  }

  const switchCustomEventChart = (id: string) => {
    setActiveChartMetricsCustomEvents((prev) => {
      const newActiveChartMetricsCustomEvents = [...prev]
      const index = _findIndex(prev, (item) => item === id)
      if (index === -1) {
        newActiveChartMetricsCustomEvents.push(id)
      } else {
        newActiveChartMetricsCustomEvents.splice(index, 1)
      }
      return newActiveChartMetricsCustomEvents
    })
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const switchActiveErrorFilter = useCallback(
    _debounce((pairID: string) => {
      setErrorOptions((prev) => ({ ...prev, [pairID]: !prev[pairID] }))
      resetErrors()
    }, 0),
    [],
  )

  const updateStatusInErrors = (status: 'active' | 'resolved') => {
    if (!activeError?.details?.eid) {
      return
    }

    const index = _findIndex(errors, (error) => error.eid === activeEID)

    if (index === -1) {
      return
    }

    errors[index] = {
      ...errors[index],
      status,
    }
  }

  const markErrorAsResolved = async () => {
    if (errorStatusUpdating || !activeEID || !activeError?.details?.eid) {
      return
    }

    setErrorStatusUpdating(true)

    try {
      await updateErrorStatus(project.id, 'resolved', activeEID)
      await loadError(activeEID)
      updateStatusInErrors('resolved')
    } catch (reason) {
      console.error('[markErrorAsResolved]', reason)
      toast.error(t('apiNotifications.updateErrorStatusFailed'))
      setErrorStatusUpdating(false)
      return
    }

    toast.success(t('apiNotifications.errorStatusUpdated'))
    setErrorStatusUpdating(false)
  }

  const markErrorAsActive = async () => {
    if (errorStatusUpdating || !activeEID || !activeError?.details?.eid) {
      return
    }

    setErrorStatusUpdating(true)

    try {
      await updateErrorStatus(project.id, 'active', activeEID)
      await loadError(activeEID)
      updateStatusInErrors('active')
    } catch (reason) {
      console.error('[markErrorAsResolved]', reason)
      toast.error(t('apiNotifications.updateErrorStatusFailed'))
      setErrorStatusUpdating(false)
      return
    }

    toast.success(t('apiNotifications.errorStatusUpdated'))
    setErrorStatusUpdating(false)
  }

  // onErrorLoading is a function for redirect to dashboard when project do not exist
  const onErrorLoading = () => {
    if (projectPassword) {
      checkPassword(id, projectPassword).then((res) => {
        if (res) {
          navigate({
            pathname: _replace(routes.project, ':id', id),
            search: `?theme=${ssrTheme}&embedded=${embedded}`,
          })
          return
        }

        toast.error(t('apiNotifications.incorrectPassword'))
        navigate({
          pathname: _replace(routes.project_protected_password, ':id', id),
          search: `?theme=${ssrTheme}&embedded=${embedded}`,
        })
        removeItem(PROJECTS_PROTECTED)
      })
      return
    }

    toast.error(t('project.noExist'))
    navigate(routes.dashboard)
  }

  // loadCustomEvents is a function for load custom events data for chart from api
  const loadCustomEvents = async () => {
    if (_isEmpty(panelsData.customs)) {
      return
    }

    let data = null
    let from
    let to

    try {
      setDataLoading(true)

      if (dateRange) {
        // if custom date range is selected
        from = getFormatDate(dateRange[0])
        to = getFormatDate(dateRange[1])
      }

      // customEventsChartData includes all activeChartMetricsCustomEvents return true if not false
      const isAllActiveChartMetricsCustomEvents = _every(activeChartMetricsCustomEvents, (metric) => {
        return _includes(_keys(customEventsChartData), metric)
      })

      // check if we need to load new date or we have data in redux/localstorage
      if (!isAllActiveChartMetricsCustomEvents) {
        // check if activePeriod is custom
        if (period === 'custom' && dateRange) {
          // activePeriod is custom
          data = await getProjectDataCustomEvents(
            id,
            timeBucket,
            '',
            filters,
            from,
            to,
            timezone,
            activeChartMetricsCustomEvents,
            projectPassword,
          )
        } else {
          // activePeriod is not custom
          data = await getProjectDataCustomEvents(
            id,
            timeBucket,
            period,
            filters,
            '',
            '',
            timezone,
            activeChartMetricsCustomEvents,
            projectPassword,
          )
        }
      }

      const events = data?.chart ? data.chart.events : customEventsChartData

      setCustomEventsPrefs(id, events)

      const applyRegions = !_includes(noRegionPeriods, activePeriod?.period)
      // render new settings for chart
      const bbSettings = getSettings(
        chartData,
        timeBucket,
        activeChartMetrics,
        applyRegions,
        timeFormat,
        forecasedChartData,
        rotateXAxis,
        chartType,
        events,
      )
      // set chart data
      setMainChart(() => {
        const generate = bb.generate(bbSettings)
        generate.data.names(dataNames)
        return generate
      })
    } catch (e) {
      console.error('[ERROR] FAILED TO LOAD CUSTOM EVENTS', e)
    } finally {
      setDataLoading(false)
    }
  }

  // loadCustomEvents when activeChartMetricsCustomEvents changed
  useEffect(() => {
    if (activeTab === PROJECT_TABS.traffic) {
      loadCustomEvents()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChartMetricsCustomEvents])

  // compareDisable is a function you need to use if you want to disable compare
  const compareDisable = () => {
    setIsActiveCompare(false)
    setDateRangeCompare(null)
    setDataChartCompare({})
    setOverallCompare({})
    setOverallPerformanceCompare({})
    setDataChartPerfCompare({})
    setActivePeriodCompare(periodPairsCompare[0].period)
  }

  // loadAnalytics is a function for load data for chart from api
  const loadAnalytics = async (
    forced = false,
    newFilters: IFilter[] | null = null,
    newMetrics: IProjectViewCustomEvent[] | null = null,
  ) => {
    if (!forced && (isLoading || _isEmpty(project) || dataLoading)) {
      return
    }

    setDataLoading(true)
    try {
      let data: ITrafficLogResponse & {
        overall?: IOverallObject
      }
      let dataCompare: ITrafficLogResponse & {
        overall?: IOverallObject
      }
      let key = ''
      let keyCompare = ''
      let from
      let fromCompare: string | undefined
      let to
      let toCompare: string | undefined
      let customEventsChart = customEventsChartData
      let rawOverall: any

      // first we check isActiveCompare if comapre active we load compare date or check if we have data in redux/localstorage
      // and set state dependent compare
      if (isActiveCompare) {
        if (dateRangeCompare && activePeriodCompare === PERIOD_PAIRS_COMPARE.CUSTOM) {
          let start
          let end
          let diff
          const startCompare = dayjs.utc(dateRangeCompare[0])
          const endCompare = dayjs.utc(dateRangeCompare[1])
          const diffCompare = endCompare.diff(startCompare, 'day')

          if (activePeriod?.period === 'custom' && dateRange) {
            start = dayjs.utc(dateRange[0])
            end = dayjs.utc(dateRange[1])
            diff = end.diff(start, 'day')
          }

          // @ts-expect-error
          if (activePeriod?.period === 'custom' ? diffCompare <= diff : diffCompare <= activePeriod?.countDays) {
            fromCompare = getFormatDate(dateRangeCompare[0])
            toCompare = getFormatDate(dateRangeCompare[1])
            keyCompare = getProjectCacheCustomKey(fromCompare, toCompare, timeBucket, mode, newFilters || filters)
          } else {
            toast.error(t('project.compareDateRangeError'))
            compareDisable()
          }
        } else {
          let date
          if (dateRange) {
            date = _find(periodToCompareDate, (item) => item.period === period)?.formula(dateRange)
          } else {
            date = _find(periodToCompareDate, (item) => item.period === period)?.formula()
          }

          if (date) {
            fromCompare = date.from
            toCompare = date.to
            keyCompare = getProjectCacheCustomKey(fromCompare, toCompare, timeBucket, mode, newFilters || filters)
          }
        }

        if (!_isEmpty(fromCompare) && !_isEmpty(toCompare)) {
          if (!_isEmpty(cache[id]) && !_isEmpty(cache[id][keyCompare])) {
            dataCompare = cache[id][keyCompare]
          } else {
            dataCompare =
              (await getTrafficCompareData(
                id,
                timeBucket,
                '',
                newFilters || filters,
                fromCompare,
                toCompare,
                timezone,
                projectPassword,
                mode,
              )) || {}
            const compareOverall = await getOverallStats(
              [id],
              'custom',
              fromCompare,
              toCompare,
              timezone,
              newFilters || filters,
              projectPassword,
            )
            dataCompare.overall = compareOverall[id]
          }
        }

        // @ts-expect-error
        setProjectCache(id, dataCompare, keyCompare)
      }

      // if activePeriod is custom we check dateRange and set key for cache
      if (dateRange) {
        from = getFormatDate(dateRange[0])
        to = getFormatDate(dateRange[1])
        key = getProjectCacheCustomKey(from, to, timeBucket, mode, newFilters || filters)
      } else {
        key = getProjectCacheKey(period, timeBucket, mode, newFilters || filters)
      }

      // check if we need to load new data or we have data in redux/localstorage
      if (!forced && !_isEmpty(cache[id]) && !_isEmpty(cache[id][key])) {
        data = cache[id][key]
        // @ts-expect-error
        setOverall(data.overall)
      } else {
        if (period === 'custom' && dateRange) {
          data = await getProjectData(
            id,
            timeBucket,
            '',
            newFilters || filters,
            newMetrics || customMetrics,
            from,
            to,
            timezone,
            projectPassword,
            mode,
          )
          customEventsChart = await getProjectDataCustomEvents(
            id,
            timeBucket,
            '',
            filters,
            from,
            to,
            timezone,
            activeChartMetricsCustomEvents,
            projectPassword,
          )
          rawOverall = await getOverallStats([id], period, from, to, timezone, newFilters || filters, projectPassword)
        } else {
          data = await getProjectData(
            id,
            timeBucket,
            period,
            newFilters || filters,
            newMetrics || customMetrics,
            '',
            '',
            timezone,
            projectPassword,
            mode,
          )
          customEventsChart = await getProjectDataCustomEvents(
            id,
            timeBucket,
            period,
            filters,
            '',
            '',
            timezone,
            activeChartMetricsCustomEvents,
            projectPassword,
          )
          rawOverall = await getOverallStats([id], period, '', '', timezone, newFilters || filters, projectPassword)
        }

        customEventsChart = customEventsChart?.chart ? customEventsChart.chart.events : customEventsChartData

        setCustomEventsPrefs(id, customEventsChart)

        data.overall = rawOverall[id]

        setProjectCache(id, data, key)
        setOverall(rawOverall[id])
      }

      // using for extensions
      const sdkData = {
        ...(data || {}),
        filters: newFilters || filters,
        timezone,
        timeBucket,
        period,
        from,
        to,
      }

      // empty or has overall only
      if (_keys(data).length < 2) {
        setAnalyticsLoading(false)
        setDataLoading(false)
        setIsPanelsDataEmpty(true)
        sdkInstance?._emitEvent('load', sdkData)
        return
      }

      const { chart, params, customs, properties, appliedFilters, meta } = data
      let newTimebucket = timeBucket
      sdkInstance?._emitEvent('load', sdkData)

      if (period === KEY_FOR_ALL_TIME && !_isEmpty(data.timeBucket)) {
        // @ts-expect-error
        newTimebucket = _includes(data.timeBucket, timeBucket) ? timeBucket : data.timeBucket[0]
        // @ts-expect-error
        setPeriodPairs((prev) => {
          // find in prev state period === KEY_FOR_ALL_TIME and change tbs
          const newPeriodPairs = _map(prev, (item) => {
            if (item.period === KEY_FOR_ALL_TIME) {
              return {
                ...item,
                // @ts-expect-error
                tbs: data.timeBucket.length > 2 ? [data.timeBucket[0], data.timeBucket[1]] : data.timeBucket,
              }
            }
            return item
          })
          return newPeriodPairs
        })
        setTimebucket(newTimebucket)
      }

      if (!_isEmpty(appliedFilters)) {
        // @ts-expect-error
        setFilters(appliedFilters)
      }

      // @ts-expect-error
      if (!_isEmpty(dataCompare)) {
        // @ts-expect-error
        if (!_isEmpty(dataCompare?.chart)) {
          setDataChartCompare(dataCompare.chart)
        }

        // @ts-expect-error
        if (!_isEmpty(dataCompare?.overall)) {
          setOverallCompare(dataCompare.overall)
        }
      }

      if (_isEmpty(params)) {
        setIsPanelsDataEmpty(true)
      } else {
        const applyRegions = !_includes(noRegionPeriods, activePeriod?.period)
        const bbSettings = getSettings(
          chart,
          newTimebucket,
          activeChartMetrics,
          applyRegions,
          timeFormat,
          forecasedChartData,
          rotateXAxis,
          chartType,
          customEventsChart,
          // @ts-expect-error
          dataCompare?.chart,
        )
        setChartData(chart)

        setPanelsData({
          types: _keys(params),
          data: params,
          customs,
          properties,
          meta,
        })

        if (activeTab === PROJECT_TABS.traffic) {
          setMainChart(() => {
            const generate = bb.generate(bbSettings)
            generate.data.names(dataNames)
            return generate
          })
        }

        setIsPanelsDataEmpty(false)
      }

      setAnalyticsLoading(false)
      setDataLoading(false)
    } catch (e) {
      setAnalyticsLoading(false)
      setDataLoading(false)
      setIsPanelsDataEmpty(true)
      console.error('[ERROR](loadAnalytics) Loading analytics data failed')
      console.error(e)
    }
  }

  const getCustomEventMetadata = async (event: string) => {
    if (period === 'custom' && dateRange) {
      return getCustomEventsMetadata(
        id,
        event,
        timeBucket,
        '',
        getFormatDate(dateRange[0]),
        getFormatDate(dateRange[1]),
        timezone,
        projectPassword,
      )
    }

    return getCustomEventsMetadata(id, event, timeBucket, period, '', '', timezone, projectPassword)
  }

  const _getPropertyMetadata = async (event: string) => {
    if (period === 'custom' && dateRange) {
      return getPropertyMetadata(
        id,
        event,
        timeBucket,
        '',
        getFormatDate(dateRange[0]),
        getFormatDate(dateRange[1]),
        filters,
        timezone,
        projectPassword,
      )
    }

    return getPropertyMetadata(id, event, timeBucket, period, '', '', filters, timezone, projectPassword)
  }

  const loadError = useCallback(
    async (eid: string) => {
      setErrorLoading(true)

      try {
        let error
        let from
        let to

        if (dateRange) {
          from = getFormatDate(dateRange[0])
          to = getFormatDate(dateRange[1])
        }

        if (period === 'custom' && dateRange) {
          error = await getError(id, eid, '', filtersSubError, from, to, timezone, projectPassword)
        } else {
          error = await getError(id, eid, period, filtersSubError, '', '', timezone, projectPassword)
        }

        setActiveError(error)
      } catch (reason: any) {
        if (reason?.status === 400) {
          // this error did not occur within specified time frame
          setErrorLoading(false)
          setActiveError(null)
          return
        }

        const message = _isEmpty(reason.data?.message) ? reason.data : reason.data.message

        console.error('[ERROR] (loadError)(getError)', message)
        toast.error(message)
      }
      setErrorLoading(false)
    },
    [dateRange, id, period, projectPassword, timezone],
  )

  const loadSession = async (psid: string) => {
    if (sessionLoading) {
      return
    }

    setSessionLoading(true)

    try {
      const session = await getSession(id, psid, timezone, projectPassword)

      setActiveSession(session)
    } catch (reason: any) {
      console.error('[ERROR] (loadSession)(getSession)', reason)
      toast.error(reason)
    }

    setSessionLoading(false)
  }

  useEffect(() => {
    if (authLoading) {
      return
    }

    const psid = searchParams.get('psid') as string
    const tab = searchParams.get('tab') as string

    if (psid && tab === PROJECT_TABS.sessions) {
      setActivePSID(psid)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading])

  useEffect(() => {
    if (authLoading) {
      return
    }

    const eid = searchParams.get('eid') as string
    const tab = searchParams.get('tab') as string

    if (eid && tab === PROJECT_TABS.errors) {
      setActiveEID(eid)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading])

  useEffect(() => {
    if (!activePSID) {
      return
    }

    loadSession(activePSID)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, dateRange, timeBucket, activePSID])

  useEffect(() => {
    if (!activeEID) {
      return
    }

    if (!areFiltersSubErrorParsed) {
      return
    }

    loadError(activeEID)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, dateRange, timeBucket, activeEID, filtersSubError, areFiltersSubErrorParsed])

  const loadSessions = async (forcedSkip?: number) => {
    if (sessionsLoading) {
      return
    }

    setSessionsLoading(true)

    try {
      const skip = typeof forcedSkip === 'number' ? forcedSkip : sessionsSkip
      let dataSessions: { sessions: ISession[]; appliedFilters: any[] }
      let from
      let to

      if (dateRange) {
        from = getFormatDate(dateRange[0])
        to = getFormatDate(dateRange[1])
      }

      if (period === 'custom' && dateRange) {
        dataSessions = await getSessions(
          id,
          '',
          filtersSessions,
          from,
          to,
          SESSIONS_TAKE,
          skip,
          timezone,
          projectPassword,
        )
      } else {
        dataSessions = await getSessions(
          id,
          period,
          filtersSessions,
          '',
          '',
          SESSIONS_TAKE,
          skip,
          timezone,
          projectPassword,
        )
      }

      setSessions((prev) => [...prev, ...(dataSessions?.sessions || [])])
      setSessionsSkip((prev) => {
        if (typeof forcedSkip === 'number') {
          return SESSIONS_TAKE + forcedSkip
        }

        return SESSIONS_TAKE + prev
      })

      if (dataSessions?.sessions?.length < SESSIONS_TAKE) {
        setCanLoadMoreSessions(false)
      } else {
        setCanLoadMoreSessions(true)
      }
    } catch (e) {
      console.error('[ERROR](loadSessions) Loading sessions data failed')
      console.error(e)
    } finally {
      setSessionsLoading(false)
    }
  }

  const loadErrors = async (forcedSkip?: number, override?: boolean) => {
    if (errorsLoading) {
      return
    }

    setErrorsLoading(true)

    try {
      const skip = typeof forcedSkip === 'number' ? forcedSkip : errorsSkip
      let dataErrors: { errors: IError[]; appliedFilters: any[] }
      let from
      let to

      if (dateRange) {
        from = getFormatDate(dateRange[0])
        to = getFormatDate(dateRange[1])
      }

      if (period === 'custom' && dateRange) {
        dataErrors = await getErrors(
          id,
          '',
          filtersErrors,
          errorOptions,
          from,
          to,
          ERRORS_TAKE,
          skip,
          timezone,
          projectPassword,
        )
      } else {
        dataErrors = await getErrors(
          id,
          period,
          filtersErrors,
          errorOptions,
          '',
          '',
          ERRORS_TAKE,
          skip,
          timezone,
          projectPassword,
        )
      }

      if (override) {
        setErrors(dataErrors?.errors || [])
      } else {
        setErrors((prev) => [...prev, ...(dataErrors?.errors || [])])
      }

      setErrorsSkip((prev) => {
        if (typeof forcedSkip === 'number') {
          return ERRORS_TAKE + forcedSkip
        }

        return ERRORS_TAKE + prev
      })

      if (dataErrors?.errors?.length < ERRORS_TAKE) {
        setCanLoadMoreErrors(false)
      } else {
        setCanLoadMoreErrors(true)
      }
    } catch (e) {
      console.error('[ERROR](loadErrors) Loading errors data failed')
      console.error(e)
    } finally {
      setErrorsLoading(false)
    }
  }

  // similar to loadAnalytics but using for performance tab
  const loadAnalyticsPerf = async (forced = false, newFilters: any[] | null = null) => {
    if (!forced && (isLoading || _isEmpty(project) || dataLoading)) {
      return
    }

    setDataLoading(true)
    try {
      let dataPerf: { timeBucket?: any; params?: any; appliedFilters?: any; chart?: any }
      let key
      let from
      let to
      let dataCompare
      let keyCompare = ''
      let fromCompare: string | undefined
      let toCompare: string | undefined
      let rawOverall: any

      const measure =
        activeChartMetricsPerf === CHART_METRICS_MAPPING_PERF.quantiles
          ? CHART_METRICS_MAPPING_PERF.quantiles
          : activePerfMeasure

      if (isActiveCompare) {
        if (dateRangeCompare && activePeriodCompare === PERIOD_PAIRS_COMPARE.CUSTOM) {
          let start
          let end
          let diff
          const startCompare = dayjs.utc(dateRangeCompare[0])
          const endCompare = dayjs.utc(dateRangeCompare[1])
          const diffCompare = endCompare.diff(startCompare, 'day')

          if (activePeriod?.period === 'custom' && dateRange) {
            start = dayjs.utc(dateRange[0])
            end = dayjs.utc(dateRange[1])
            diff = end.diff(start, 'day')
          }

          // @ts-expect-error
          if (activePeriod?.period === 'custom' ? diffCompare <= diff : diffCompare <= activePeriod?.countDays) {
            fromCompare = getFormatDate(dateRangeCompare[0])
            toCompare = getFormatDate(dateRangeCompare[1])
            keyCompare = getProjectCacheCustomKeyPerf(
              fromCompare,
              toCompare,
              timeBucket,
              newFilters || filtersPerf,
              measure,
            )
          } else {
            toast.error(t('project.compareDateRangeError'))
            compareDisable()
          }
        } else {
          let date
          if (dateRange) {
            date = _find(periodToCompareDate, (item) => item.period === period)?.formula(dateRange)
          } else {
            date = _find(periodToCompareDate, (item) => item.period === period)?.formula()
          }

          if (date) {
            fromCompare = date.from
            toCompare = date.to
            keyCompare = getProjectCacheCustomKeyPerf(
              fromCompare,
              toCompare,
              timeBucket,
              newFilters || filtersPerf,
              measure,
            )
          }
        }

        if (!_isEmpty(fromCompare) && !_isEmpty(toCompare)) {
          if (!_isEmpty(cache[id]) && !_isEmpty(cache[id][keyCompare])) {
            dataCompare = cache[id][keyCompare]
          } else {
            dataCompare = await getPerformanceCompareData(
              id,
              timeBucket,
              '',
              newFilters || filtersPerf,
              fromCompare,
              toCompare,
              timezone,
              measure,
              projectPassword,
            )
            const compareOverall = await getPerformanceOverallStats(
              [id],
              'custom',
              fromCompare,
              toCompare,
              timezone,
              newFilters || filters,
              measure,
              projectPassword,
            )
            dataCompare.overall = compareOverall[id]
          }
        }

        setProjectCachePerf(id, dataCompare || {}, keyCompare)
      }

      if (dateRange) {
        from = getFormatDate(dateRange[0])
        to = getFormatDate(dateRange[1])
        key = getProjectCacheCustomKey(from, to, timeBucket, mode, newFilters || filtersPerf, measure)
      } else {
        key = getProjectCacheKey(period, timeBucket, mode, newFilters || filtersPerf, measure)
      }

      if (!forced && !_isEmpty(cachePerf[id]) && !_isEmpty(cachePerf[id][key])) {
        dataPerf = cachePerf[id][key]
        // @ts-expect-error
        setOverallPerformance(dataPerf.overall)
      } else {
        if (period === 'custom' && dateRange) {
          dataPerf = await getPerfData(
            id,
            timeBucket,
            '',
            newFilters || filtersPerf,
            from,
            to,
            timezone,
            measure,
            projectPassword,
          )
          rawOverall = await getOverallStats([id], period, from, to, timezone, newFilters || filters, projectPassword)
        } else {
          dataPerf = await getPerfData(
            id,
            timeBucket,
            period,
            newFilters || filtersPerf,
            '',
            '',
            timezone,
            measure,
            projectPassword,
          )
          rawOverall = await getPerformanceOverallStats(
            [id],
            period,
            '',
            '',
            timezone,
            newFilters || filters,
            measure,
            projectPassword,
          )
        }

        // @ts-expect-error
        dataPerf.overall = rawOverall[id]

        setProjectCachePerf(id, dataPerf || {}, key)
        setOverallPerformance(rawOverall[id])
      }

      const { appliedFilters } = dataPerf

      if (!_isEmpty(appliedFilters)) {
        setFiltersPerf(appliedFilters)
      }

      // empty or has overall only
      if (_keys(dataPerf).length < 2) {
        setIsPanelsDataEmptyPerf(true)
        setDataLoading(false)
        setAnalyticsLoading(false)
        return
      }

      let newTimebucket = timeBucket

      if (period === KEY_FOR_ALL_TIME && !_isEmpty(dataPerf.timeBucket)) {
        // eslint-disable-next-line prefer-destructuring
        newTimebucket = _includes(dataPerf.timeBucket, timeBucket) ? timeBucket : dataPerf.timeBucket[0]
        setPeriodPairs((prev) => {
          // find in prev state period === KEY_FOR_ALL_TIME and change tbs
          const newPeriodPairs = _map(prev, (item) => {
            if (item.period === KEY_FOR_ALL_TIME) {
              return {
                ...item,
                tbs:
                  dataPerf.timeBucket.length > 2
                    ? [dataPerf.timeBucket[0], dataPerf.timeBucket[1]]
                    : dataPerf.timeBucket,
              }
            }
            return item
          })
          return newPeriodPairs
        })
        setTimebucket(newTimebucket)
      }

      if (!_isEmpty(dataCompare)) {
        if (!_isEmpty(dataCompare?.chart)) {
          setDataChartPerfCompare(dataCompare.chart)
        }

        if (!_isEmpty(dataCompare?.overall)) {
          setOverallPerformanceCompare(dataCompare.overall)
        }
      }

      if (_isEmpty(dataPerf.params)) {
        setIsPanelsDataEmptyPerf(true)
      } else {
        const { chart: chartPerf } = dataPerf
        const bbSettings = getSettingsPerf(
          chartPerf,
          timeBucket,
          activeChartMetricsPerf,
          rotateXAxis,
          chartType,
          timeFormat,
          dataCompare?.chart,
        )
        setChartDataPerf(chartPerf)

        setPanelsDataPerf({
          types: _keys(dataPerf.params),
          data: dataPerf.params,
        })

        if (activeTab === PROJECT_TABS.performance) {
          setMainChart(() => {
            const generate = bb.generate(bbSettings)
            generate.data.names(dataNamesPerf)
            return generate
          })
        }

        setIsPanelsDataEmptyPerf(false)
      }

      setAnalyticsLoading(false)
      setDataLoading(false)
    } catch (e) {
      setAnalyticsLoading(false)
      setDataLoading(false)
      setIsPanelsDataEmptyPerf(true)
      console.error('[ERROR](loadAnalytics) Loading analytics data failed')
      console.error(e)
    }
  }

  const loadFunnelsData = useCallback(
    async (forced = false) => {
      if (!activeFunnel || !activeFunnel.id) {
        return
      }

      if (!forced && (isLoading || _isEmpty(project) || dataLoading)) {
        return
      }

      setDataLoading(true)

      let key

      try {
        let dataFunnel: { funnel: IAnalyticsFunnel[]; totalPageviews: number }
        let from
        let to

        if (dateRange) {
          from = getFormatDate(dateRange[0])
          to = getFormatDate(dateRange[1])
          key = getFunnelsCacheCustomKey(id, activeFunnel.id, from, to)
        } else {
          key = getFunnelsCacheKey(id, activeFunnel.id, period)
        }

        if (!forced && !_isEmpty(cacheFunnels[id]) && !_isEmpty(cacheFunnels[id][key])) {
          dataFunnel = cacheFunnels[id][key]
        } else {
          if (period === 'custom' && dateRange) {
            dataFunnel = await getFunnelData(id, '', from, to, timezone, activeFunnel.id, projectPassword)
          } else {
            dataFunnel = await getFunnelData(id, period, '', '', timezone, activeFunnel.id, projectPassword)
          }

          setFunnelsCache(id, dataFunnel || {}, key)
        }

        const { funnel, totalPageviews } = dataFunnel

        const bbSettings = getSettingsFunnels(funnel, totalPageviews, t)

        if (activeTab === PROJECT_TABS.funnels) {
          setMainChart(() => {
            const generate = bb.generate(bbSettings)
            generate.data.names(dataNamesFunnel)
            return generate
          })
        }

        setAnalyticsLoading(false)
        setDataLoading(false)
      } catch (e) {
        setAnalyticsLoading(false)
        setDataLoading(false)

        if (key) {
          setFunnelsCache(id, {}, key)
        }

        console.error('[ERROR](loadFunnelsData) Loading funnels data failed')
        console.error(e)
      }
    },
    [
      activeFunnel,
      activeTab,
      cacheFunnels,
      dataLoading,
      dateRange,
      id,
      isLoading,
      period,
      project,
      projectPassword,
      timezone,
      setFunnelsCache,
      t,
      dataNamesFunnel,
    ],
  )

  const filterHandler = async (column: string, filter: any, isExclusive = false) => {
    const columnPerf = `${column}_perf`
    const columnSessions = `${column}_sess`
    const columnErrors = `${column}_err`
    const columnSubErrors = `${column}_subErr`
    let filtersToUpdate: IFilter[] = []

    switch (activeTab) {
      case PROJECT_TABS.performance:
        filtersToUpdate = updateFilterState(
          searchParams,
          setSearchParams,
          filtersPerf,
          setFiltersPerf,
          columnPerf,
          column,
          filter,
          isExclusive,
        )
        break
      case PROJECT_TABS.sessions:
        filtersToUpdate = updateFilterState(
          searchParams,
          setSearchParams,
          filtersSessions,
          setFiltersSessions,
          columnSessions,
          column,
          filter,
          isExclusive,
        )
        break
      case PROJECT_TABS.errors:
        if (!activeEID) {
          filtersToUpdate = updateFilterState(
            searchParams,
            setSearchParams,
            filtersErrors,
            setFiltersErrors,
            columnErrors,
            column,
            filter,
            isExclusive,
          )
        } else {
          filtersToUpdate = updateFilterState(
            searchParams,
            setSearchParams,
            filtersSubError,
            setFiltersSubError,
            columnSubErrors,
            column,
            filter,
            isExclusive,
          )
        }
        break
      case PROJECT_TABS.traffic:
        filtersToUpdate = updateFilterState(
          searchParams,
          setSearchParams,
          filters,
          setFilters,
          column,
          column,
          filter,
          isExclusive,
        )
        break
    }

    resetSessions()
    resetErrors()

    sdkInstance?._emitEvent('filtersupdate', filtersToUpdate)

    if (activeTab === PROJECT_TABS.performance) {
      await loadAnalyticsPerf(true, filtersToUpdate)
    } else if (activeTab === PROJECT_TABS.traffic) {
      await loadAnalytics(true, filtersToUpdate)
    }
  }

  const onFilterSearch = (items: IFilter[], override: boolean): void => {
    switch (activeTab) {
      case PROJECT_TABS.performance:
        handleNavigationParams(
          items,
          '_perf',
          searchParams,
          setSearchParams,
          override,
          setFiltersPerf,
          loadAnalyticsPerf,
        )
        break
      case PROJECT_TABS.sessions:
        handleNavigationParams(
          items,
          '_sess',
          searchParams,
          setSearchParams,
          override,
          setFiltersSessions,
          resetSessions,
        )
        break
      case PROJECT_TABS.errors:
        if (!activeEID) {
          handleNavigationParams(items, '_err', searchParams, setSearchParams, override, setFiltersErrors, resetErrors)
        } else {
          handleNavigationParams(
            items,
            '_subErr',
            searchParams,
            setSearchParams,
            override,
            setFiltersSubError,
            resetErrors,
          )
        }
        break
      default:
        handleNavigationParams(items, '', searchParams, setSearchParams, override, setFilters, loadAnalytics)
    }

    resetSessions()
    resetErrors()
  }

  const onCustomMetric = (metrics: IProjectViewCustomEvent[]) => {
    if (activeTab !== PROJECT_TABS.traffic) {
      return
    }

    setCustomMetrics(metrics)
    loadAnalytics(true, null, metrics)
  }

  const onRemoveCustomMetric = (metricId: IProjectViewCustomEvent['id']) => {
    if (activeTab !== PROJECT_TABS.traffic) {
      return
    }

    const newMetrics = _filter(customMetrics, (metric) => metric.id !== metricId)

    setCustomMetrics(newMetrics)
    loadAnalytics(true, null, newMetrics)
  }

  const resetCustomMetrics = () => {
    if (activeTab !== PROJECT_TABS.traffic) {
      return
    }

    setCustomMetrics([])
    loadAnalytics(true, null, [])
  }

  // this function is used for requesting the data from the API when the exclusive filter is changed
  const onChangeExclusive = (column: string, filter: string, isExclusive: boolean) => {
    const updateFilters = (
      filters: IFilter[],
      setFilters: React.Dispatch<React.SetStateAction<IFilter[]>>,
    ): IFilter[] => {
      const newFilters = filters.map((f) => (f.column === column && f.filter === filter ? { ...f, isExclusive } : f))
      if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
        setFilters(newFilters)
      }
      return newFilters
    }

    let newFilters: IFilter[]

    switch (activeTab) {
      case PROJECT_TABS.performance:
        newFilters = updateFilters(filtersPerf, setFiltersPerf)
        loadAnalyticsPerf(true, newFilters)
        break
      case PROJECT_TABS.sessions:
        newFilters = updateFilters(filtersSessions, setFiltersSessions)
        break
      case PROJECT_TABS.errors:
        if (!activeEID) {
          newFilters = updateFilters(filtersErrors, setFiltersErrors)
          resetErrors()
        } else {
          newFilters = updateFilters(filtersSubError, setFiltersSubError)
        }
        break
      default:
        newFilters = updateFilters(filters, setFilters)
        loadAnalytics(true, newFilters)
        break
    }

    const paramName = activeTab === PROJECT_TABS.performance ? `${column}_perf` : column

    if (searchParams.get(paramName) !== filter) {
      searchParams.set(paramName, filter)
      setSearchParams(searchParams)
    }

    sdkInstance?._emitEvent('filtersupdate', newFilters)
  }

  // Main useEffect for filters parsing
  useEffect(() => {
    switch (activeTab) {
      case PROJECT_TABS.performance:
        parseFiltersFromUrl('_perf', searchParams, setFiltersPerf, setAreFiltersPerfParsed)
        break
      case PROJECT_TABS.sessions:
        parseFiltersFromUrl('_sess', searchParams, setFiltersSessions, setAreFiltersSessionsParsed)
        break
      case PROJECT_TABS.errors:
        parseFiltersFromUrl('_err', searchParams, setFiltersErrors, setAreFiltersErrorsParsed)
        parseFiltersFromUrl('_subErr', searchParams, setFiltersSubError, setAreFiltersSubErrorParsed)
        break
      default:
        parseFiltersFromUrl('', searchParams, setFilters, setAreFiltersParsed)
        break
    }
  }, [activeTab])

  // Parsing timeBucket from URL
  useEffect(() => {
    if (!arePeriodParsed) return

    try {
      const initialTimeBucket = searchParams.get('timeBucket')

      if (_includes(validTimeBacket, initialTimeBucket)) {
        const newPeriodFull = _find(periodPairs, (el) => el.period === period)
        if (_includes(newPeriodFull?.tbs, initialTimeBucket)) {
          setTimebucket(initialTimeBucket || periodPairs[3].tbs[1])
        }
      }
    } finally {
      setAreTimeBucketParsed(true)
    }
  }, [arePeriodParsed])

  // this function is used for requesting the data from the API when you press the reset button
  const refreshStats = async () => {
    if (!isLoading && !dataLoading) {
      if (activeTab === PROJECT_TABS.performance) {
        loadAnalyticsPerf(true)
        return
      }

      if (activeTab === PROJECT_TABS.funnels) {
        loadFunnelsData(true)
        return
      }

      if (activeTab === PROJECT_TABS.sessions) {
        if (activePSID) {
          await loadSession(activePSID)
          return
        }

        resetSessions()
        loadSessions(0)
        return
      }

      if (activeTab === PROJECT_TABS.errors) {
        if (activeEID) {
          await loadError(activeEID)
          return
        }

        resetErrors()
        loadErrors(0)
        return
      }

      loadAnalytics(true)
    }
  }

  // onForecastOpen is a function for open forecast modal
  const onForecastOpen = () => {
    if (isLoading || dataLoading || isSelfhosted) {
      return
    }

    if (!_isEmpty(forecasedChartData)) {
      setForecasedChartData({})
      return
    }

    setIsForecastOpened(true)
  }

  const forecastChart = async (periodToForecast: string) => {
    const key = getProjectForcastCacheKey(period, timeBucket, periodToForecast, filters)
    const data = cache[id][key]

    if (!_isEmpty(data)) {
      setForecasedChartData(data)
      setDataLoading(false)
      return
    }

    try {
      const result = await getChartPrediction(chartData, periodToForecast, timeBucket)
      const transformed = transformAIChartData(result)
      setProjectForcastCache(id, transformed, key)
      setForecasedChartData(transformed)
    } catch (reason) {
      console.error(`[forecastChart] Error: ${reason}`)
    }
  }

  const forecastDetails = async () => {
    try {
      const data = await getDetailsPrediction(project.id, projectPassword)

      if (_isEmpty(data)) {
        throw new Error('getDetailsPrediction returned an empty object')
      }

      const result: AIProcessedResponse = {}

      const dataKeys = _keys(data) as (keyof AIResponse)[]

      for (let i = 0; i < dataKeys.length; ++i) {
        const dataKey = dataKeys[i]

        const processed = _reduce(
          data[dataKey],
          (prev, curr, key) => {
            return {
              ...prev,
              [key]: _map(_keys(curr), (key) => ({
                name: key,
                count: curr?.[key] || 0,
              })),
            }
          },
          {},
        )

        result[dataKey] = processed
      }

      setAiDetails(result)
      setActiveAIDetail(_keys(data)[0] as keyof AIResponse)
      setIsInAIDetailsMode(true)
    } catch (reason) {
      console.error(`[forecastDetails] Error: ${reason}`)
      toast.error(t('apiNotifications.noAIForecastAvailable'))
    }
  }

  const onForecastSubmit = async (type: 'chart' | 'details', options: any = {}) => {
    if (isSelfhosted) {
      return
    }

    setIsForecastOpened(false)
    setDataLoading(true)

    if (type === 'chart') {
      const { period: periodToForecast } = options
      await forecastChart(periodToForecast)
    }

    if (type === 'details') {
      await forecastDetails()
    }

    setDataLoading(false)

    trackCustom('TRAFFIC_FORECAST', {
      type,
    })
  }

  useEffect(() => {
    loadAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forecasedChartData, mode])

  // this useEffect is used for parsing tab from url and set activeTab
  useEffect(() => {
    searchParams.set('tab', activeTab)
    setSearchParams(searchParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  // this useEffect is used for update chart settings when activeChartMetrics changed also using for perfomance tab
  useEffect(() => {
    if (activeTab === PROJECT_TABS.traffic) {
      if (
        (!isLoading && !_isEmpty(chartData) && !_isEmpty(mainChart)) ||
        (isActiveCompare && !_isEmpty(dataChartCompare) && !_isEmpty(mainChart))
      ) {
        if (
          activeChartMetrics.views ||
          activeChartMetrics.unique ||
          activeChartMetrics.viewsPerUnique ||
          activeChartMetrics.trendlines
        ) {
          mainChart.load({
            columns: getColumns(chartData, activeChartMetrics),
          })
        }

        if (
          activeChartMetrics.bounce ||
          activeChartMetrics.sessionDuration ||
          activeChartMetrics.views ||
          activeChartMetrics.unique ||
          !activeChartMetrics.bounce ||
          !activeChartMetrics.sessionDuration
        ) {
          const applyRegions = !_includes(noRegionPeriods, activePeriod?.period)
          const bbSettings = getSettings(
            chartData,
            timeBucket,
            activeChartMetrics,
            applyRegions,
            timeFormat,
            forecasedChartData,
            rotateXAxis,
            chartType,
            customEventsChartData,
            dataChartCompare,
          )

          setMainChart(() => {
            const generate = bb.generate(bbSettings)
            generate.data.names(dataNames)
            return generate
          })
        }

        if (!activeChartMetrics.views) {
          mainChart.unload({
            ids: 'total',
          })
        }

        if (!activeChartMetrics.unique) {
          mainChart.unload({
            ids: 'unique',
          })
        }

        if (!activeChartMetrics.viewsPerUnique) {
          mainChart.unload({
            ids: 'viewsPerUnique',
          })
        }
      }
    } else if (!isLoading && !_isEmpty(chartDataPerf) && !_isEmpty(mainChart)) {
      const bbSettings = getSettingsPerf(
        chartDataPerf,
        timeBucket,
        activeChartMetricsPerf,
        rotateXAxis,
        chartType,
        timeFormat,
        dataChartPerfCompare,
      )

      setMainChart(() => {
        const generate = bb.generate(bbSettings)
        generate.data.names(dataNamesPerf)
        return generate
      })
    }
  }, [isLoading, activeChartMetrics, chartData, chartDataPerf, activeChartMetricsPerf, dataChartCompare]) // eslint-disable-line

  // Initialising Swetrix SDK instance. Using for marketplace and extensions
  useEffect(() => {
    let sdk: any | null = null

    const filteredExtensions = _filter(extensions, (ext) => _isString(ext.fileURL))

    if (!_isEmpty(filteredExtensions)) {
      const processedExtensions = _map(filteredExtensions, (ext) => {
        const { id: extId, fileURL } = ext
        return {
          id: extId,
          cdnURL: `${CDN_URL}file/${fileURL}`,
        }
      })

      sdk = new SwetrixSDK(
        processedExtensions,
        {
          debug: isDevelopment,
        },
        {
          onAddExportDataRow: (label: any, onClick: (e: any) => void) => {
            setCustomExportTypes((prev) => {
              // TODO: Fix this
              // A temporary measure to prevent duplicate items stored here (for some reason, SDK is initialised two times)
              return _uniqBy(
                [
                  {
                    label,
                    onClick,
                  },
                  ...prev,
                ],
                'label',
              )
            })
          },
          onRemoveExportDataRow: (label: any) => {
            setCustomExportTypes((prev) => _filter(prev, (row) => row.label !== label))
          },
          onAddPanelTab: (extensionID: string, panelID: string, tabContent: any, onOpen: (a: any) => void) => {
            setCustomPanelTabs((prev) => [
              ...prev,
              {
                extensionID,
                panelID,
                tabContent,
                onOpen,
              },
            ])
          },
          onUpdatePanelTab: (extensionID: string, panelID: string, tabContent: any) => {
            setCustomPanelTabs((prev) =>
              _map(prev, (row) => {
                if (row.extensionID === extensionID && row.panelID === panelID) {
                  return {
                    ...row,
                    tabContent,
                  }
                }

                return row
              }),
            )
          },
          onRemovePanelTab: (extensionID: string, panelID: string) => {
            setCustomPanelTabs((prev) =>
              _filter(prev, (row) => row.extensionID !== extensionID && row.panelID !== panelID),
            )
          },
        },
      )
      setSdkInstance(sdk)
    }

    return () => {
      if (sdk) {
        sdk._destroy()
      }
    }
  }, [extensions])

  // Supplying 'timeupdate' event to the SDK after loading. Using for marketplace and extensions
  useEffect(() => {
    sdkInstance?._emitEvent('timeupdate', {
      period,
      timeBucket,
      dateRange: period === 'custom' ? dateRange : null,
    })
  }, [sdkInstance]) // eslint-disable-line

  // Supplying the 'clientinfo' event to the SDK that contains info about current language, theme, etc.
  useEffect(() => {
    sdkInstance?._emitEvent('clientinfo', {
      language,
      theme,
    })
  }, [sdkInstance, language, theme])

  // Supplying 'projectinfo' event to the SDK after loading. Using for marketplace and extensions
  useEffect(() => {
    if (_isEmpty(project)) {
      return
    }

    const { active: isActive, created, public: isPublic } = project

    sdkInstance?._emitEvent('projectinfo', {
      id,
      name,
      isActive,
      created,
      isPublic,
    })
  }, [sdkInstance, name]) // eslint-disable-line

  // when t update we update dropdowns translations
  useEffect(() => {
    setPeriodPairs(tbPeriodPairs(t, undefined, undefined, language))
    setPeriodPairsCompare(tbPeriodPairsCompare(t, undefined, language))
  }, [t, language])

  const resetSessions = () => {
    setSessionsSkip(0)
    setSessions([])
    setSessionsLoading(null)
  }

  const resetErrors = () => {
    setErrorsSkip(0)
    setErrors([])
    setErrorsLoading(null)
  }

  // onRangeDateChange if is activeChartMetrics custom and we select custom date range
  // we update url and state
  const onRangeDateChange = (dates: Date[], onRender?: boolean) => {
    const days = Math.ceil(Math.abs(dates[1].getTime() - dates[0].getTime()) / (1000 * 3600 * 24))

    // setting allowed time buckets for the specified date range (period)
    // eslint-disable-next-line no-restricted-syntax
    for (const index in timeBucketToDays) {
      if (timeBucketToDays[index].lt >= days) {
        let eventEmitTimeBucket = timeBucket

        if (!onRender && !_includes(timeBucketToDays[index].tb, timeBucket)) {
          // eslint-disable-next-line prefer-destructuring
          eventEmitTimeBucket = timeBucketToDays[index].tb[0]
          searchParams.set('timeBucket', eventEmitTimeBucket)
          setTimebucket(eventEmitTimeBucket)
        }

        searchParams.set('period', 'custom')
        searchParams.set('from', dates[0].toISOString())
        searchParams.set('to', dates[1].toISOString())
        setSearchParams(searchParams)

        setPeriodPairs(tbPeriodPairs(t, timeBucketToDays[index].tb, dates, language))
        setPeriod('custom')
        setProjectViewPrefs(id, 'custom', timeBucketToDays[index].tb[0], dates)

        setCanLoadMoreSessions(false)
        resetSessions()
        resetErrors()

        sdkInstance?._emitEvent('timeupdate', {
          period: 'custom',
          timeBucket: eventEmitTimeBucket,
          dateRange: dates,
        })

        break
      }
    }
  }

  useEffect(() => {
    if (period === KEY_FOR_ALL_TIME) {
      return
    }

    if (areFiltersParsed && areTimeBucketParsed && arePeriodParsed && activeTab === PROJECT_TABS.traffic) {
      loadAnalytics()
    }
    if (areFiltersPerfParsed && areTimeBucketParsed && arePeriodParsed && activeTab === PROJECT_TABS.performance) {
      loadAnalyticsPerf()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    project,
    period,
    chartType,
    filters,
    forecasedChartData,
    timeBucket,
    periodPairs,
    areFiltersParsed,
    areTimeBucketParsed,
    arePeriodParsed,
    t,
    activeTab,
    areFiltersPerfParsed,
  ])

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (activeTab === PROJECT_TABS.sessions && areFiltersSessionsParsed) {
      loadSessions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    dateRange,
    filtersSessions,
    id,
    period,
    projectPassword,
    timezone,
    areFiltersSessionsParsed,
    authLoading,
  ])

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (activeTab === PROJECT_TABS.errors && areFiltersErrorsParsed) {
      loadErrors()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    errorOptions,
    dateRange,
    filtersErrors,
    id,
    period,
    projectPassword,
    timezone,
    areFiltersErrorsParsed,
    authLoading,
  ])

  useEffect(() => {
    if (period !== KEY_FOR_ALL_TIME) {
      return
    }

    if (areFiltersParsed && areTimeBucketParsed && arePeriodParsed && activeTab === PROJECT_TABS.traffic) {
      loadAnalytics()
    }
    if (areFiltersPerfParsed && areTimeBucketParsed && arePeriodParsed && activeTab === PROJECT_TABS.performance) {
      loadAnalyticsPerf()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    project,
    period,
    chartType,
    filters,
    forecasedChartData,
    areFiltersParsed,
    areTimeBucketParsed,
    arePeriodParsed,
    activeTab,
    areFiltersPerfParsed,
  ])

  useEffect(() => {
    if (!project || !activeFunnel) {
      return
    }

    loadFunnelsData()
  }, [project, activeFunnel, loadFunnelsData, period, t])

  // using this for fix some bugs with update custom events data for chart
  useEffect(() => {
    if (!_isEmpty(activeChartMetricsCustomEvents)) {
      setActiveChartMetricsCustomEvents([])
    }
  }, [period, filters]) // eslint-disable-line

  useEffect(() => {
    if (dateRange && arePeriodParsed) {
      onRangeDateChange(dateRange)
    }
  }, [dateRange, t, arePeriodParsed]) // eslint-disable-line

  useEffect(() => {
    const updateLiveVisitors = async () => {
      const { id: pid } = project
      const result = await getLiveVisitors([pid], projectPassword)

      setLiveStatsForProject(pid, result[pid])
    }

    let interval: any = null
    if (project.uiHidden) {
      updateLiveVisitors()
      interval = setInterval(async () => {
        await updateLiveVisitors()
      }, LIVE_VISITORS_UPDATE_INTERVAL)
    }

    return () => clearInterval(interval)
  }, [project.id, setLiveStatsForProject]) // eslint-disable-line react-hooks/exhaustive-deps

  // loadProject if project is empty so more often it is need for public projects
  useEffect(() => {
    if (isLoading || !_isEmpty(project)) {
      return
    }

    getProject(id, false, projectPassword)
      .then((projectRes) => {
        if (_isEmpty(projectRes)) {
          onErrorLoading()
        }

        if (projectRes.isPasswordProtected && !projectRes.isOwner && _isEmpty(projectPassword)) {
          navigate({
            pathname: _replace(routes.project_protected_password, ':id', id),
            search: `?theme=${ssrTheme}&embedded=${embedded}`,
          })
          return
        }

        if ((projectRes.isPublic || projectRes?.isPasswordProtected) && !projectRes.isOwner) {
          setPublicProject(projectRes)
        } else {
          setProjects([...(projects as any[]), projectRes])

          if (projectRes.isLocked) {
            return
          }

          getLiveVisitors([id], projectPassword)
            .then((res) => {
              setLiveStatsForProject(id, res[id])
            })
            .catch((e) => {
              console.error('[ERROR] (getProject -> getLiveVisitors)', e)
              onErrorLoading()
            })
        }
      })
      .catch((e) => {
        console.error('[ERROR] (getProject)', e)
        onErrorLoading()
      })
  }, [isLoading, project, id, setPublicProject]) // eslint-disable-line

  // updatePeriod using for update period and timeBucket also update url
  const updatePeriod = (newPeriod: { period: string; label?: string }) => {
    if (period === newPeriod.period) {
      return
    }

    const newPeriodFull = _find(periodPairs, (el) => el.period === newPeriod.period)
    let tb = timeBucket
    if (_isEmpty(newPeriodFull)) return

    if (!_includes(newPeriodFull.tbs, timeBucket)) {
      tb = _last(newPeriodFull.tbs) || 'day'
      searchParams.set('timeBucket', tb)
      setTimebucket(tb)
    }

    if (newPeriod.period !== 'custom') {
      searchParams.delete('from')
      searchParams.delete('to')
      searchParams.set('period', newPeriod.period)
      setProjectViewPrefs(id, newPeriod.period, tb)
      setPeriod(newPeriod.period)

      setCanLoadMoreSessions(false)
      resetSessions()
      resetErrors()

      setDateRange(null)
    }

    setSearchParams(searchParams)
    sdkInstance?._emitEvent('timeupdate', {
      period: newPeriod.period,
      timeBucket: tb,
      dateRange: newPeriod.period === 'custom' ? dateRange : null,
    })
    setForecasedChartData({})
  }

  // updateTimebucket using for update timeBucket also update url
  const updateTimebucket = (newTimebucket: string) => {
    searchParams.set('timeBucket', newTimebucket)
    setSearchParams(searchParams)
    setTimebucket(newTimebucket)
    setProjectViewPrefs(id, period, newTimebucket, dateRange as Date[])
    sdkInstance?._emitEvent('timeupdate', {
      period,
      timeBucket: newTimebucket,
      dateRange,
    })
    setForecasedChartData({})
  }

  const onMeasureChange = (measure: string) => {
    setActivePerfMeasure(measure)
  }

  useEffect(() => {
    loadAnalyticsPerf()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePerfMeasure, activeChartMetricsPerf])

  const openSettingsHandler = () => {
    navigate(_replace(routes.project_settings, ':id', id))
  }

  // parse period from url when page is loaded
  useEffect(() => {
    try {
      const intialPeriod = projectViewPrefs
        ? searchParams.get('period') || projectViewPrefs[id]?.period
        : searchParams.get('period') || '7d'
      const tab = searchParams.get('tab')

      if (tab === PROJECT_TABS.performance) {
        setProjectTab(PROJECT_TABS.performance)
      }

      if (!_includes(validPeriods, intialPeriod)) {
        return
      }

      if (intialPeriod === 'custom') {
        // @ts-expect-error
        const from = new Date(searchParams.get('from'))
        // @ts-expect-error
        const to = new Date(searchParams.get('to'))
        if (from.getDate() && to.getDate()) {
          onRangeDateChange([from, to], true)
          setDateRange([from, to])
        }
        return
      }

      setPeriodPairs(tbPeriodPairs(t, undefined, undefined, language))
      setDateRange(null)
      updatePeriod({
        period: intialPeriod,
      })
    } finally {
      setArePeriodParsed(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // check for conflicts in chart metrics in dropdown if conflicted disable some column of dropdown
  const isConflicted = (conflicts?: string[]) => {
    if (!conflicts) {
      return false
    }

    return _some(conflicts, (conflict) => {
      const conflictPair = _find(chartMetrics, (metric) => metric.id === conflict)
      return conflictPair && conflictPair.active
    })
  }

  const cleanURLFilters = () => {
    for (const [key] of Array.from(searchParams.entries())) {
      if (!isFilterValid(key, true)) {
        continue
      }
      searchParams.delete(key)
    }

    setSearchParams(searchParams)
  }

  const resetActiveTabFilters = () => {
    cleanURLFilters()

    if (activeTab === PROJECT_TABS.traffic) {
      setFilters([])
      loadAnalytics(true, [])
    } else if (activeTab === PROJECT_TABS.performance) {
      setFiltersPerf([])
      loadAnalyticsPerf(true, [])
    } else if (activeTab === PROJECT_TABS.sessions) {
      setFiltersSessions([])
    } else if (activeTab === PROJECT_TABS.errors && !activeEID) {
      setFiltersErrors([])
    } else if (activeTab === PROJECT_TABS.errors && activeEID) {
      setFiltersSubError([])
    }
  }

  const resetFilters = () => {
    cleanURLFilters()

    setFilters([])
    setFiltersPerf([])
    setFiltersSessions([])
    setFiltersErrors([])
    setFiltersSubError([])
    if (activeTab === PROJECT_TABS.performance) {
      loadAnalyticsPerf(true, [])
    } else if (activeTab === PROJECT_TABS.traffic) {
      loadAnalytics(true, [])
    }
  }

  const exportTypes = [
    {
      label: t('project.asCSV'),
      onClick: () => {
        if (activeTab === PROJECT_TABS.performance) {
          return onCSVExportClick(panelsDataPerf, id, tnMapping, language)
        }
        return onCSVExportClick(panelsData, id, tnMapping, language)
      },
    },
  ]

  // function set chart type and save to local storage
  const setChartTypeOnClick = (type: string) => {
    setItem('chartType', type)
    setChartType(type)
  }

  // loadAnalytics when compare period change or compare selected
  useEffect(() => {
    setItem(IS_ACTIVE_COMPARE, JSON.stringify(isActiveCompare))
    if (activePeriodCompare === PERIOD_PAIRS_COMPARE.CUSTOM && !dateRangeCompare) {
      return
    }

    if (isActiveCompare) {
      if (activeTab === PROJECT_TABS.performance) {
        loadAnalyticsPerf()
      }

      if (activeTab === PROJECT_TABS.traffic) {
        loadAnalytics()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActiveCompare, activePeriodCompare, dateRangeCompare])

  /* KEYBOARD SHORTCUTS */
  const generalShortcutsActions = {
    B: () => setChartTypeOnClick(chartTypes.bar),
    '∫': () => setChartTypeOnClick(chartTypes.bar),
    L: () => setChartTypeOnClick(chartTypes.line),
    '¬': () => setChartTypeOnClick(chartTypes.line),
    S: () => setShowFiltersSearch(true),
    ß: () => setShowFiltersSearch(true),
    F: onForecastOpen,
    ƒ: onForecastOpen,
    r: refreshStats,
  }

  const timebucketShortcutsMap = {
    h: '1h',
    t: 'today',
    y: 'yesterday',
    d: '1d',
    w: '7d',
    m: '4w',
    q: '3M',
    l: '12M',
    z: '24M',
    a: KEY_FOR_ALL_TIME,
    u: 'custom',
    c: 'compare',
  }

  // 'Keyboard shortcuts' help modal
  useHotkeys('shift+?', () => {
    setIsHotkeysHelpOpened((val) => !val)
  })

  // 'Tabs switching' shortcuts
  useHotkeys(SHORTCUTS_TABS_LISTENERS, ({ key }) => {
    if (key === 'E') {
      openSettingsHandler()
      return
    }

    // @ts-expect-error
    const tab = SHORTCUTS_TABS_MAP[key]

    if (!tab) {
      return
    }

    setProjectTab(tab)
    setActiveTab(tab)
  })

  // 'General' shortcuts
  useHotkeys(SHORTCUTS_GENERAL_LISTENERS, ({ key }) => {
    // @ts-expect-error
    generalShortcutsActions[key]?.()
  })

  // 'Timebuckets selection' shortcuts
  useHotkeys(SHORTCUTS_TIMEBUCKETS_LISTENERS, ({ key }) => {
    const pairs = tbPeriodPairs(t, undefined, undefined, language)
    // @ts-expect-error
    const pair = _find(pairs, ({ period }) => period === timebucketShortcutsMap[key])

    if (!pair) {
      return
    }

    if (pair.isCustomDate) {
      // @ts-expect-error
      refCalendar.current?.openCalendar?.()
      return
    }

    if (pair.period === 'compare') {
      if (activeTab === PROJECT_TABS.alerts) {
        return
      }

      if (isActiveCompare) {
        compareDisable()
      } else {
        setIsActiveCompare(true)
      }

      return
    }

    setDateRange(null)
    updatePeriod(pair)
  })

  const TabsSelector = () => (
    <div>
      <div className='sm:hidden'>
        <Select
          items={tabs}
          keyExtractor={(item) => item.id}
          labelExtractor={(item) => item.label}
          onSelect={(label) => {
            const selected = _find(tabs, (tab) => tab.label === label)
            if (selected) {
              if (selected.id === 'settings') {
                openSettingsHandler()
                return
              }

              setProjectTab(selected?.id)
              setActiveTab(selected?.id)
            }
          }}
          title={activeTabLabel}
          capitalise
        />
      </div>
      <div className='hidden sm:block'>
        <nav className='-mb-px flex space-x-4 overflow-x-auto' aria-label='Tabs'>
          {_map(tabs, (tab) => {
            const isCurrent = tab.id === activeTab
            const isSettings = tab.id === 'settings'

            const handleClick = (e: React.MouseEvent) => {
              if (isSettings) {
                return
              }

              e.preventDefault()
              setProjectTab(tab.id)
              setActiveTab(tab.id)
            }

            const currentUrl = new URL(window.location.href)
            currentUrl.searchParams.set('tab', tab.id)
            const tabUrl = isSettings ? _replace(routes.project_settings, ':id', id) : currentUrl.toString()

            return (
              <Link
                key={tab.id}
                to={tabUrl}
                onClick={handleClick}
                className={cx(
                  'text-md group inline-flex cursor-pointer items-center whitespace-nowrap border-b-2 px-1 py-2 font-bold',
                  {
                    'border-slate-900 text-slate-900 dark:border-gray-50 dark:text-gray-50': isCurrent,
                    'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-300 dark:hover:text-gray-300':
                      !isCurrent,
                  },
                )}
                aria-current={isCurrent ? 'page' : undefined}
              >
                <tab.icon
                  className={cx(
                    isCurrent
                      ? 'text-slate-900 dark:text-gray-50'
                      : 'text-gray-500 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300',
                    '-ml-0.5 mr-2 h-5 w-5',
                  )}
                  aria-hidden='true'
                />
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )

  const AITabsSelector = () => (
    <div className='-mb-px flex space-x-4 overflow-x-auto' aria-label='Tabs'>
      {_map(sortedAIKeys, ({ key, label }) => {
        const isCurrent = activeAiDetail === key

        return (
          <div
            key={key}
            onClick={() => {
              setActiveAIDetail(key)
            }}
            className={cx(
              'text-md group inline-flex cursor-pointer items-center whitespace-nowrap border-b-2 px-1 py-2 font-bold',
              {
                'border-slate-900 text-slate-900 dark:border-gray-50 dark:text-gray-50': isCurrent,
                'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-300 dark:hover:text-gray-300':
                  !isCurrent,
              },
            )}
            aria-current={isCurrent}
          >
            <span>{label}</span>
          </div>
        )
      })}
    </div>
  )

  if (isLoading) {
    return (
      <>
        {!embedded && <Header ssrTheme={ssrTheme} authenticated={authenticated} />}
        <div
          className={cx('min-h-min-footer bg-gray-50 dark:bg-slate-900', {
            'min-h-min-footer': !embedded,
            'min-h-[100vh]': embedded,
          })}
        >
          <Loader />
        </div>
        {!embedded && <Footer authenticated={authenticated} minimal />}
      </>
    )
  }

  if (project.isLocked) {
    return (
      <>
        {!embedded && <Header ssrTheme={ssrTheme} authenticated={authenticated} />}
        <div
          className={cx('mx-auto w-full max-w-[1584px] bg-gray-50 px-2 py-6 dark:bg-slate-900 sm:px-4 lg:px-8', {
            'min-h-min-footer': !embedded,
            'min-h-[100vh]': embedded,
          })}
        >
          <TabsSelector />
          <h2 className='mt-2 break-words break-all text-center text-xl font-bold text-gray-900 dark:text-gray-50 sm:text-left'>
            {name}
          </h2>
          <LockedDashboard user={user} project={project} isSharedProject={isSharedProject} />
        </div>
        {!embedded && <Footer authenticated={authenticated} minimal />}
      </>
    )
  }

  if (!project.isDataExists && !_includes([PROJECT_TABS.errors, PROJECT_TABS.uptime], activeTab) && !analyticsLoading) {
    return (
      <>
        {!embedded && <Header ssrTheme={ssrTheme} authenticated={authenticated} />}
        <div
          className={cx('mx-auto w-full max-w-[1584px] bg-gray-50 px-2 py-6 dark:bg-slate-900 sm:px-4 lg:px-8', {
            'min-h-min-footer': !embedded,
            'min-h-[100vh]': embedded,
          })}
        >
          <TabsSelector />
          <h2 className='mt-2 break-words break-all text-center text-xl font-bold text-gray-900 dark:text-gray-50 sm:text-left'>
            {name}
          </h2>
          <WaitingForAnEvent project={project} />
        </div>
        {!embedded && <Footer authenticated={authenticated} minimal />}
      </>
    )
  }

  if (
    typeof project.isErrorDataExists === 'boolean' && // to prevent flickering
    !project.isErrorDataExists &&
    activeTab === PROJECT_TABS.errors
  ) {
    return (
      <>
        {!embedded && <Header ssrTheme={ssrTheme} authenticated={authenticated} />}
        <div
          className={cx('mx-auto w-full max-w-[1584px] bg-gray-50 px-2 py-6 dark:bg-slate-900 sm:px-4 lg:px-8', {
            'min-h-min-footer': !embedded,
            'min-h-[100vh]': embedded,
          })}
        >
          <TabsSelector />
          <h2 className='mt-2 break-words break-all text-center text-xl font-bold text-gray-900 dark:text-gray-50 sm:text-left'>
            {name}
          </h2>
          <WaitingForAnError />
        </div>
        {!embedded && <Footer authenticated={authenticated} minimal />}
      </>
    )
  }

  return (
    <ClientOnly>
      {() => (
        <ViewProjectContext.Provider
          value={{
            // States
            projectId: project?.id,
            projectPassword,
            timezone,
            dateRange,
            isLoading,
            timeBucket,
            period,
            activePeriod,
            periodPairs,
            timeFormat,
            size,
            allowedToManage,

            // Functions
            setDateRange,
            updatePeriod,
            updateTimebucket,
            setPeriodPairs,

            // Refs
            refCalendar,
          }}
        >
          <>
            {!embedded && <Header ssrTheme={ssrTheme} authenticated={authenticated} />}
            <EventsRunningOutBanner />
            <div
              ref={ref}
              className={cx('bg-gray-50 dark:bg-slate-900', {
                'min-h-[100vh]': analyticsLoading && embedded,
              })}
            >
              <div
                className={cx('mx-auto w-full max-w-[1584px] px-2 py-6 sm:px-4 lg:px-8', {
                  'min-h-min-footer': !embedded,
                  'min-h-[100vh]': embedded,
                })}
                ref={dashboardRef}
              >
                {isInAIDetailsMode ? (
                  <>
                    <button
                      onClick={() => {
                        setIsInAIDetailsMode(false)
                        setAiDetails(null)
                        setActiveAIDetail(null)
                      }}
                      className='mx-auto mb-4 mt-2 flex items-center text-base font-normal text-gray-900 underline decoration-dashed hover:decoration-solid dark:text-gray-100 lg:mx-0 lg:mt-0'
                    >
                      <ChevronLeftIcon className='h-4 w-4' />
                      {t('project.exitForecastingMode')}
                    </button>
                    <AITabsSelector />
                    <span className='mt-6 text-sm'>{t('project.aiDetailsDesc')}</span>
                  </>
                ) : (
                  <TabsSelector />
                )}
                {!isInAIDetailsMode &&
                  activeTab !== PROJECT_TABS.alerts &&
                  activeTab !== PROJECT_TABS.uptime &&
                  (activeTab !== PROJECT_TABS.sessions || !activePSID) &&
                  (activeFunnel || activeTab !== PROJECT_TABS.funnels) && (
                    <>
                      <div className='mt-2 flex flex-col items-center justify-between lg:flex-row lg:items-start'>
                        <div className='flex flex-wrap items-center space-x-5'>
                          <h2 className='break-words break-all text-xl font-bold text-gray-900 dark:text-gray-50'>
                            {/* If tab is funnels - then display a funnel name, otherwise a project name */}
                            {activeTab === PROJECT_TABS.funnels ? activeFunnel?.name : name}
                          </h2>
                          {activeTab !== PROJECT_TABS.funnels && (
                            <LiveVisitorsDropdown
                              onSessionSelect={(psid) => {
                                setActiveTab(PROJECT_TABS.sessions)
                                setActivePSID(psid)
                              }}
                              live={liveStats[id]}
                            />
                          )}
                        </div>
                        <div className='mx-auto mt-3 flex w-full max-w-[420px] flex-wrap items-center justify-center gap-y-1 space-x-2 sm:mx-0 sm:w-auto sm:max-w-none sm:flex-nowrap sm:justify-between lg:mt-0'>
                          {activeTab !== PROJECT_TABS.funnels && (
                            <>
                              <div>
                                <button
                                  type='button'
                                  title={t('project.refreshStats')}
                                  onClick={refreshStats}
                                  className={cx(
                                    'relative rounded-md bg-gray-50 p-2 text-sm font-medium hover:bg-white hover:shadow-sm focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-slate-900 dark:hover:bg-slate-800 focus:dark:border-gray-200 focus:dark:ring-gray-200',
                                    {
                                      'cursor-not-allowed opacity-50': isLoading || dataLoading,
                                    },
                                  )}
                                >
                                  <ArrowPathIcon className='h-5 w-5 stroke-2 text-gray-700 dark:text-gray-50' />
                                </button>
                              </div>
                              {!isSelfhosted && !isActiveCompare && (
                                <div
                                  className={cx({
                                    hidden: activeTab !== PROJECT_TABS.traffic || _isEmpty(chartData),
                                  })}
                                >
                                  <button
                                    type='button'
                                    title={t('modals.forecast.title')}
                                    onClick={onForecastOpen}
                                    disabled={!_isEmpty(filters)}
                                    className={cx(
                                      'relative rounded-md bg-gray-50 p-2 text-sm font-medium hover:bg-white hover:shadow-sm focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-slate-900 dark:hover:bg-slate-800 focus:dark:border-gray-200 focus:dark:ring-gray-200',
                                      {
                                        'cursor-not-allowed opacity-50': isLoading || dataLoading || !_isEmpty(filters),
                                        '!border !border-gray-300 !bg-gray-200 dark:!border-gray-500 dark:!bg-gray-600':
                                          !_isEmpty(forecasedChartData),
                                      },
                                    )}
                                  >
                                    <Robot
                                      theme={_theme}
                                      containerClassName='w-5 h-5'
                                      className='stroke-2 text-gray-700 dark:text-gray-50'
                                    />
                                  </button>
                                </div>
                              )}
                              <div
                                className={cx('border-gray-200 dark:border-gray-600', {
                                  'lg:border-r': activeTab === PROJECT_TABS.funnels,
                                  hidden: activeTab === PROJECT_TABS.errors && activeError,
                                })}
                              >
                                <button
                                  type='button'
                                  title={t('project.search')}
                                  onClick={() => setShowFiltersSearch(true)}
                                  className={cx(
                                    'relative rounded-md bg-gray-50 p-2 text-sm font-medium hover:bg-white hover:shadow-sm focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-slate-900 dark:hover:bg-slate-800 focus:dark:border-gray-200 focus:dark:ring-gray-200',
                                    {
                                      'cursor-not-allowed opacity-50': isLoading || dataLoading,
                                    },
                                  )}
                                >
                                  <MagnifyingGlassIcon className='h-5 w-5 stroke-2 text-gray-700 dark:text-gray-50' />
                                </button>
                              </div>
                              {activeTab === PROJECT_TABS.traffic && (
                                <Dropdown
                                  header={t('project.views')}
                                  onClick={() => loadProjectViews()}
                                  loading={projectViewsLoading || projectViewsLoading === null}
                                  selectItemClassName={
                                    !allowedToManage &&
                                    !(projectViewsLoading || projectViewsLoading === null) &&
                                    _isEmpty(projectViews)
                                      ? 'block px-4 py-2 text-sm text-gray-700 dark:border-gray-800 dark:bg-slate-800 dark:text-gray-50'
                                      : undefined
                                  }
                                  items={_filter(
                                    [
                                      ...projectViews,
                                      allowedToManage && {
                                        id: 'add-a-view',
                                        name: t('project.addAView'),
                                        createView: true,
                                      },
                                      !allowedToManage &&
                                        _isEmpty(projectViews) && {
                                          id: 'no-views',
                                          name: t('project.noViewsYet'),
                                          notClickable: true,
                                        },
                                    ],
                                    (x) => !!x,
                                  )}
                                  title={[<BookmarkIcon key='bookmark-icon' className='h-5 w-5 stroke-2' />]}
                                  labelExtractor={(item, close) => {
                                    // @ts-expect-error
                                    if (item.createView) {
                                      return item.name
                                    }

                                    if (item.id === 'no-views') {
                                      return <span className='text-gray-600 dark:text-gray-200'>{item.name}</span>
                                    }

                                    return (
                                      <span className='flex items-center justify-between space-x-4'>
                                        <span>{item.name}</span>
                                        {allowedToManage && (
                                          <span className='flex space-x-2'>
                                            <PencilIcon
                                              className='size-4 hover:text-gray-900 dark:hover:text-gray-50'
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                setProjectViewToUpdate(item)
                                                close()
                                                setIsAddAViewOpened(true)
                                              }}
                                            />
                                            <TrashIcon
                                              className={cx('size-4 hover:text-gray-900 dark:hover:text-gray-50', {
                                                'cursor-not-allowed': projectViewDeleting,
                                              })}
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                close()
                                                onProjectViewDelete(item.id)
                                              }}
                                            />
                                          </span>
                                        )}
                                      </span>
                                    )
                                  }}
                                  keyExtractor={(item) => item.id}
                                  onSelect={(item: IProjectView, e) => {
                                    // @ts-expect-error
                                    if (item.createView) {
                                      e?.stopPropagation()
                                      setIsAddAViewOpened(true)

                                      return
                                    }

                                    if (item.filters && !_isEmpty(item.filters)) {
                                      onFilterSearch(item.filters, true)
                                    }

                                    if (item.customEvents && !_isEmpty(item.customEvents)) {
                                      onCustomMetric(item.customEvents)
                                    }
                                  }}
                                  chevron='mini'
                                  buttonClassName='!p-2 rounded-md hover:bg-white hover:shadow-sm dark:hover:bg-slate-800 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:dark:ring-gray-200 focus:dark:border-gray-200'
                                  headless
                                />
                              )}
                              {_includes([PROJECT_TABS.traffic, PROJECT_TABS.performance], activeTab) && (
                                <Dropdown
                                  header={t('project.exportData')}
                                  items={_filter(
                                    [
                                      ...exportTypes,
                                      ...customExportTypes,
                                      !isSelfhosted && {
                                        label: t('project.lookingForMore'),
                                        lookingForMore: true,
                                        onClick: () => {},
                                      },
                                    ],
                                    (el) => !!el,
                                  )}
                                  title={[<ArrowDownTrayIcon key='download-icon' className='h-5 w-5 stroke-2' />]}
                                  labelExtractor={(item) => item.label}
                                  keyExtractor={(item) => item.label}
                                  onSelect={(item, e) => {
                                    if (item.lookingForMore) {
                                      e?.stopPropagation()
                                      window.open(MARKETPLACE_URL, '_blank')

                                      return
                                    }

                                    trackCustom('DASHBOARD_EXPORT', {
                                      type: item.label === t('project.asCSV') ? 'csv' : 'extension',
                                    })

                                    item.onClick(panelsData, t)
                                  }}
                                  chevron='mini'
                                  buttonClassName='!p-2 rounded-md hover:bg-white hover:shadow-sm dark:hover:bg-slate-800 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:dark:ring-gray-200 focus:dark:border-gray-200'
                                  headless
                                />
                              )}
                              <div
                                className={cx(
                                  'space-x-2 border-gray-200 dark:border-gray-600 sm:mr-3 lg:border-x lg:px-3',
                                  {
                                    hidden:
                                      isPanelsDataEmpty ||
                                      analyticsLoading ||
                                      checkIfAllMetricsAreDisabled ||
                                      activeTab === PROJECT_TABS.sessions ||
                                      activeTab === PROJECT_TABS.errors,
                                  },
                                )}
                              >
                                <button
                                  type='button'
                                  title={t('project.barChart')}
                                  onClick={() => setChartTypeOnClick(chartTypes.bar)}
                                  className={cx(
                                    'relative rounded-md fill-gray-700 p-2 text-sm font-medium focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:fill-gray-50 focus:dark:border-gray-200 focus:dark:ring-gray-200',
                                    {
                                      'bg-white stroke-white shadow-sm dark:bg-slate-800 dark:stroke-slate-800':
                                        chartType === chartTypes.bar,
                                      'bg-gray-50 stroke-gray-50 dark:bg-slate-900 dark:stroke-slate-900 [&_svg]:hover:fill-gray-500 [&_svg]:hover:dark:fill-gray-200':
                                        chartType !== chartTypes.bar,
                                    },
                                  )}
                                >
                                  <BarChart className='h-5 w-5 [&_path]:stroke-[3.5%]' />
                                </button>
                                <button
                                  type='button'
                                  title={t('project.lineChart')}
                                  onClick={() => setChartTypeOnClick(chartTypes.line)}
                                  className={cx(
                                    'relative rounded-md fill-gray-700 p-2 text-sm font-medium focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:fill-gray-50 focus:dark:border-gray-200 focus:dark:ring-gray-200',
                                    {
                                      'bg-white stroke-white shadow-sm dark:bg-slate-800 dark:stroke-slate-800':
                                        chartType === chartTypes.line,
                                      'bg-gray-50 stroke-gray-50 dark:bg-slate-900 dark:stroke-slate-900 [&_svg]:hover:fill-gray-500 [&_svg]:hover:dark:fill-gray-200':
                                        chartType !== chartTypes.line,
                                    },
                                  )}
                                >
                                  <LineChart className='h-5 w-5 [&_path]:stroke-[3.5%]' />
                                </button>
                              </div>
                            </>
                          )}
                          {activeTab === PROJECT_TABS.traffic && !isPanelsDataEmpty && (
                            <Dropdown
                              items={
                                isActiveCompare
                                  ? _filter(chartMetrics, (el) => {
                                      return !_includes(FILTER_CHART_METRICS_MAPPING_FOR_COMPARE, el.id)
                                    })
                                  : chartMetrics
                              }
                              title={t('project.metricVis')}
                              labelExtractor={(pair) => {
                                const { label, id: pairID, active, conflicts } = pair

                                const conflicted = isConflicted(conflicts)

                                if (pairID === CHART_METRICS_MAPPING.customEvents) {
                                  if (_isEmpty(panelsData.customs)) {
                                    return (
                                      <span className='flex cursor-not-allowed items-center px-4 py-2'>
                                        <NoSymbolIcon className='mr-1 h-5 w-5' />
                                        {label}
                                      </span>
                                    )
                                  }

                                  return (
                                    <Dropdown
                                      menuItemsClassName='max-w-[300px] max-h-[300px] overflow-auto'
                                      items={chartMetricsCustomEvents}
                                      title={label}
                                      labelExtractor={(event) => (
                                        <Checkbox
                                          className={cx({ hidden: isPanelsDataEmpty || analyticsLoading })}
                                          label={
                                            _size(event.label) > CUSTOM_EV_DROPDOWN_MAX_VISIBLE_LENGTH ? (
                                              <span title={event.label}>
                                                {_truncate(event.label, {
                                                  length: CUSTOM_EV_DROPDOWN_MAX_VISIBLE_LENGTH,
                                                })}
                                              </span>
                                            ) : (
                                              event.label
                                            )
                                          }
                                          onChange={() => {
                                            switchCustomEventChart(event.id)
                                          }}
                                          checked={event.active}
                                        />
                                      )}
                                      buttonClassName='group-hover:bg-gray-200 dark:group-hover:bg-slate-700 px-4 py-2 inline-flex w-full bg-white text-sm font-medium text-gray-700 dark:text-gray-50 dark:border-gray-800 dark:bg-slate-800'
                                      keyExtractor={(event) => event.id}
                                      onSelect={(event, e) => {
                                        e?.stopPropagation()
                                        e?.preventDefault()

                                        switchCustomEventChart(event.id)
                                      }}
                                      chevron='mini'
                                      headless
                                    />
                                  )
                                }

                                return (
                                  <Checkbox
                                    className={cx('px-4 py-2', { hidden: isPanelsDataEmpty || analyticsLoading })}
                                    label={label}
                                    disabled={conflicted}
                                    checked={active}
                                    onChange={() => {
                                      switchTrafficChartMetric(pairID, conflicts)
                                    }}
                                  />
                                )
                              }}
                              buttonClassName='!px-2.5'
                              selectItemClassName='group text-gray-700 dark:text-gray-50 dark:border-gray-800 dark:bg-slate-800 block text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700'
                              keyExtractor={(pair) => pair.id}
                              onSelect={({ id: pairID, conflicts }) => {
                                switchTrafficChartMetric(pairID, conflicts)
                              }}
                              chevron='mini'
                              headless
                            />
                          )}
                          {activeTab === PROJECT_TABS.errors &&
                            allowedToManage &&
                            activeError &&
                            activeError?.details?.status !== 'resolved' && (
                              <button
                                type='button'
                                disabled={errorStatusUpdating}
                                onClick={markErrorAsResolved}
                                className={cx('p-2 text-sm font-medium text-gray-700 dark:text-gray-50', {
                                  'cursor-not-allowed': isLoading || errorLoading,
                                  'opacity-50': errorLoading && !errorStatusUpdating,
                                  'animate-pulse cursor-not-allowed': errorStatusUpdating,
                                })}
                              >
                                {t('project.resolve')}
                              </button>
                            )}
                          {activeTab === PROJECT_TABS.errors &&
                            allowedToManage &&
                            activeError &&
                            activeError?.details?.status === 'resolved' && (
                              <button
                                type='button'
                                disabled={errorStatusUpdating}
                                onClick={markErrorAsActive}
                                className={cx('p-2 text-sm font-medium text-gray-700 dark:text-gray-50', {
                                  'cursor-not-allowed': isLoading || errorLoading,
                                  'opacity-50': errorLoading && !errorStatusUpdating,
                                  'animate-pulse cursor-not-allowed': errorStatusUpdating,
                                })}
                              >
                                {t('project.markAsActive')}
                              </button>
                            )}
                          {activeTab === PROJECT_TABS.errors && !activeError && (
                            <Dropdown
                              items={errorFilters}
                              title={t('project.filters')}
                              labelExtractor={(pair) => {
                                const { label, active, id: pairID } = pair

                                return (
                                  <Checkbox
                                    className='px-4 py-2'
                                    label={label}
                                    checked={active}
                                    onChange={() => switchActiveErrorFilter(pairID)}
                                  />
                                )
                              }}
                              buttonClassName='!px-2.5'
                              selectItemClassName='group text-gray-700 dark:text-gray-50 dark:border-gray-800 dark:bg-slate-800 block text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700'
                              keyExtractor={(pair) => pair.id}
                              onSelect={({ id: pairID }) => {
                                switchActiveErrorFilter(pairID)
                              }}
                              chevron='mini'
                              headless
                            />
                          )}
                          {activeTab === PROJECT_TABS.funnels && (
                            <button
                              type='button'
                              title={t('project.refreshStats')}
                              onClick={refreshStats}
                              className={cx(
                                'relative rounded-md bg-gray-50 p-2 text-sm font-medium hover:bg-white hover:shadow-sm focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-slate-900 dark:hover:bg-slate-800 focus:dark:border-gray-200 focus:dark:ring-gray-200',
                                {
                                  'cursor-not-allowed opacity-50': isLoading || dataLoading,
                                },
                              )}
                            >
                              <ArrowPathIcon className='h-5 w-5 text-gray-700 dark:text-gray-50' />
                            </button>
                          )}
                          {activeTab === PROJECT_TABS.performance && !isPanelsDataEmptyPerf && (
                            <Dropdown
                              items={chartMetricsPerf}
                              className='min-w-[170px] xs:min-w-0'
                              title={
                                <p>
                                  {
                                    _find(chartMetricsPerf, ({ id: chartId }) => chartId === activeChartMetricsPerf)
                                      ?.label
                                  }
                                </p>
                              }
                              labelExtractor={(pair) => pair.label}
                              keyExtractor={(pair) => pair.id}
                              onSelect={({ id: pairID }) => {
                                setActiveChartMetricsPerf(pairID)
                              }}
                              buttonClassName='!px-2.5'
                              chevron='mini'
                              headless
                            />
                          )}
                          {activeTab === PROJECT_TABS.performance && !isPanelsDataEmptyPerf && (
                            <Dropdown
                              disabled={activeChartMetricsPerf === CHART_METRICS_MAPPING_PERF.quantiles}
                              items={chartMeasuresPerf}
                              className='min-w-[170px] xs:min-w-0'
                              title={
                                <p>
                                  {_find(chartMeasuresPerf, ({ id: chartId }) => chartId === activePerfMeasure)?.label}
                                </p>
                              }
                              labelExtractor={(pair) => pair.label}
                              keyExtractor={(pair) => pair.id}
                              onSelect={({ id: pairID }) => {
                                onMeasureChange(pairID)
                              }}
                              buttonClassName='!px-2.5'
                              chevron='mini'
                              headless
                            />
                          )}
                          <TBPeriodSelector
                            classes={{
                              timeBucket: activeTab === PROJECT_TABS.errors && !activeEID ? 'hidden' : '',
                            }}
                            activePeriod={activePeriod}
                            updateTimebucket={updateTimebucket}
                            timeBucket={timeBucket}
                            items={timeBucketSelectorItems}
                            title={activePeriod?.label}
                            onSelect={(pair) => {
                              if (pair.period === PERIOD_PAIRS_COMPARE.COMPARE) {
                                if (activeTab === PROJECT_TABS.alerts) {
                                  return
                                }

                                if (isActiveCompare) {
                                  compareDisable()
                                } else {
                                  setIsActiveCompare(true)
                                }

                                return
                              }

                              if (pair.isCustomDate) {
                                setTimeout(() => {
                                  // @ts-expect-error
                                  refCalendar.current.openCalendar()
                                }, 100)
                              } else {
                                setPeriodPairs(tbPeriodPairs(t, undefined, undefined, language))
                                setDateRange(null)
                                updatePeriod(pair)
                              }
                            }}
                          />
                          {isActiveCompare && activeTab !== PROJECT_TABS.errors && (
                            <>
                              <div className='text-md mx-2 whitespace-pre-line font-medium text-gray-600 dark:text-gray-200'>
                                vs
                              </div>
                              <Dropdown
                                items={periodPairsCompare}
                                title={activeDropdownLabelCompare}
                                labelExtractor={(pair) => pair.label}
                                keyExtractor={(pair) => pair.label}
                                onSelect={(pair) => {
                                  if (pair.period === PERIOD_PAIRS_COMPARE.DISABLE) {
                                    compareDisable()
                                    return
                                  }

                                  if (pair.period === PERIOD_PAIRS_COMPARE.CUSTOM) {
                                    setTimeout(() => {
                                      // @ts-expect-error
                                      refCalendarCompare.current.openCalendar()
                                    }, 100)
                                  } else {
                                    setPeriodPairsCompare(tbPeriodPairsCompare(t, undefined, language))
                                    setDateRangeCompare(null)
                                    setActivePeriodCompare(pair.period)
                                  }
                                }}
                                chevron='mini'
                                headless
                              />
                            </>
                          )}
                          <FlatPicker
                            className='!mx-0'
                            ref={refCalendar}
                            onChange={setDateRange}
                            value={dateRange || []}
                            maxDateMonths={MAX_MONTHS_IN_PAST}
                            maxRange={0}
                          />
                          <FlatPicker
                            className='!mx-0'
                            ref={refCalendarCompare}
                            onChange={(date) => {
                              setDateRangeCompare(date)
                              setActivePeriodCompare(PERIOD_PAIRS_COMPARE.CUSTOM)
                              setPeriodPairsCompare(tbPeriodPairsCompare(t, date, language))
                            }}
                            value={dateRangeCompare || []}
                            maxDateMonths={MAX_MONTHS_IN_PAST}
                            maxRange={maxRangeCompare}
                          />
                        </div>
                      </div>
                      {activeTab === PROJECT_TABS.funnels && (
                        <button
                          onClick={() => setActiveFunnel(null)}
                          className='mx-auto mb-4 mt-2 flex items-center text-base font-normal text-gray-900 underline decoration-dashed hover:decoration-solid dark:text-gray-100 lg:mx-0 lg:mt-0'
                        >
                          <ChevronLeftIcon className='h-4 w-4' />
                          {t('project.backToFunnels')}
                        </button>
                      )}
                    </>
                  )}
                {activeTab === PROJECT_TABS.alerts && (isSharedProject || !project?.isOwner || !authenticated) && (
                  <div className='mt-5 rounded-xl bg-gray-700 p-5'>
                    <div className='flex items-center text-gray-50'>
                      <BellIcon className='mr-2 h-8 w-8' />
                      <p className='text-3xl font-bold'>{t('dashboard.alerts')}</p>
                    </div>
                    <p className='mt-2 whitespace-pre-wrap text-lg text-gray-100'>{t('dashboard.alertsDesc')}</p>
                    <Link
                      to={routes.signup}
                      className='mt-6 inline-block select-none rounded-md border border-transparent bg-white px-3 py-2 text-base font-medium text-gray-700 hover:bg-indigo-50'
                      aria-label={t('titles.signup')}
                    >
                      {t('common.getStarted')}
                    </Link>
                  </div>
                )}
                {activeTab === PROJECT_TABS.funnels && !activeFunnel && !_isEmpty(project.funnels) && (
                  <FunnelsList
                    openFunnelSettings={(funnel?: IFunnel) => {
                      if (funnel) {
                        setFunnelToEdit(funnel)
                        setIsNewFunnelOpened(true)
                        return
                      }

                      setIsNewFunnelOpened(true)
                    }}
                    openFunnel={setActiveFunnel}
                    funnels={project.funnels}
                    deleteFunnel={onFunnelDelete}
                    loading={funnelActionLoading}
                    authenticated={authenticated}
                    allowedToManage={allowedToManage}
                  />
                )}
                {activeTab === PROJECT_TABS.funnels && !activeFunnel && _isEmpty(project.funnels) && (
                  <div className='mt-5 rounded-xl bg-gray-700 p-5'>
                    <div className='flex items-center text-gray-50'>
                      <FunnelIcon className='mr-2 h-8 w-8' />
                      <p className='text-3xl font-bold'>{t('dashboard.funnels')}</p>
                    </div>
                    <p className='mt-2 whitespace-pre-wrap text-lg text-gray-100'>{t('dashboard.funnelsDesc')}</p>
                    {authenticated ? (
                      <button
                        type='button'
                        onClick={() => setIsNewFunnelOpened(true)}
                        className='mt-6 inline-block select-none rounded-md border border-transparent bg-white px-3 py-2 text-base font-medium text-gray-700 hover:bg-indigo-50'
                      >
                        {t('dashboard.newFunnel')}
                      </button>
                    ) : (
                      <Link
                        to={routes.signup}
                        className='mt-6 inline-block select-none rounded-md border border-transparent bg-white px-3 py-2 text-base font-medium text-gray-700 hover:bg-indigo-50'
                        aria-label={t('titles.signup')}
                      >
                        {t('common.getStarted')}
                      </Link>
                    )}
                  </div>
                )}
                {activeTab === PROJECT_TABS.sessions && !activePSID && (
                  <>
                    <Filters
                      filters={filtersSessions}
                      onRemoveFilter={filterHandler}
                      onChangeExclusive={onChangeExclusive}
                      tnMapping={tnMapping}
                      resetFilters={resetActiveTabFilters}
                    />
                    {(sessionsLoading === null || sessionsLoading) && _isEmpty(sessions) && <Loader />}
                    {typeof sessionsLoading === 'boolean' && !sessionsLoading && _isEmpty(sessions) && (
                      <NoEvents filters={filters} resetFilters={resetFilters} />
                    )}
                    <Sessions
                      sessions={sessions}
                      onClick={(psid) => {
                        setActivePSID(psid)
                      }}
                      timeFormat={timeFormat}
                    />
                    {canLoadMoreSessions && (
                      <button
                        type='button'
                        title={t('project.refreshStats')}
                        onClick={() => loadSessions()}
                        className={cx(
                          'relative mx-auto mt-2 flex items-center rounded-md bg-gray-50 p-2 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-slate-900 dark:text-gray-50 dark:hover:bg-slate-800 focus:dark:border-gray-200 focus:dark:ring-gray-200',
                          {
                            'cursor-not-allowed opacity-50': sessionsLoading || sessionsLoading === null,
                            hidden: sessionsLoading && _isEmpty(sessions),
                          },
                        )}
                      >
                        <ArrowDownTrayIcon className='mr-2 h-5 w-5' />
                        {t('project.loadMore')}
                      </button>
                    )}
                  </>
                )}
                {activeTab === PROJECT_TABS.sessions && activePSID && (
                  <>
                    <button
                      onClick={() => {
                        setActiveSession(null)
                        setActivePSID(null)
                        searchParams.delete('psid')
                        setSearchParams(searchParams)
                      }}
                      className='mx-auto mb-4 mt-2 flex items-center text-base font-normal text-gray-900 underline decoration-dashed hover:decoration-solid dark:text-gray-100 lg:mx-0'
                    >
                      <ChevronLeftIcon className='h-4 w-4' />
                      {t('project.backToSessions')}
                    </button>
                    {activeSession?.details && <SessionDetails details={activeSession?.details} />}
                    {!_isEmpty(activeSession?.chart) && (
                      <SessionChart
                        chart={activeSession?.chart}
                        timeBucket={activeSession?.timeBucket}
                        timeFormat={timeFormat}
                        rotateXAxis={rotateXAxis}
                        chartType={chartType}
                        dataNames={dataNames}
                      />
                    )}
                    <Pageflow pages={activeSession?.pages} timeFormat={timeFormat} />
                    {_isEmpty(activeSession) && sessionLoading && <Loader />}
                    {activeSession !== null &&
                      _isEmpty(activeSession?.chart) &&
                      _isEmpty(activeSession?.pages) &&
                      !sessionLoading && <NoSessionDetails />}
                  </>
                )}
                {activeTab === PROJECT_TABS.errors && !activeEID && (
                  <>
                    <Filters
                      filters={filtersErrors}
                      onRemoveFilter={filterHandler}
                      onChangeExclusive={onChangeExclusive}
                      tnMapping={tnMapping}
                      resetFilters={resetActiveTabFilters}
                    />
                    {(errorsLoading === null || errorsLoading) && _isEmpty(errors) && <Loader />}
                    {typeof errorsLoading === 'boolean' && !errorsLoading && _isEmpty(errors) && (
                      <NoEvents filters={filtersErrors} resetFilters={resetFilters} />
                    )}
                    <Errors
                      errors={errors}
                      onClick={(eidToLoad) => {
                        setActiveEID(eidToLoad)
                        setErrorLoading(true)
                      }}
                    />
                    {canLoadMoreErrors && (
                      <button
                        type='button'
                        title={t('project.refreshStats')}
                        onClick={() => loadErrors()}
                        className={cx(
                          'relative mx-auto mt-2 flex items-center rounded-md bg-gray-50 p-2 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-slate-900 dark:text-gray-50 dark:hover:bg-slate-800 focus:dark:border-gray-200 focus:dark:ring-gray-200',
                          {
                            'cursor-not-allowed opacity-50': errorsLoading,
                            hidden: errorsLoading && _isEmpty(errors),
                          },
                        )}
                      >
                        <ArrowDownTrayIcon className='mr-2 h-5 w-5' />
                        {t('project.loadMore')}
                      </button>
                    )}
                  </>
                )}
                {activeTab === PROJECT_TABS.errors && activeEID && (
                  <>
                    <button
                      onClick={() => {
                        setActiveError(null)
                        setActiveEID(null)
                        searchParams.delete('eid')
                        setSearchParams(searchParams)
                      }}
                      className='mx-auto mb-4 mt-2 flex items-center text-base font-normal text-gray-900 underline decoration-dashed hover:decoration-solid dark:text-gray-100 lg:mx-0 lg:mt-0'
                    >
                      <ChevronLeftIcon className='h-4 w-4' />
                      {t('project.backToErrors')}
                    </button>
                    {activeError?.details && <ErrorDetails details={activeError.details} />}
                    {activeError?.chart && (
                      <ErrorChart
                        chart={activeError?.chart}
                        timeBucket={activeError?.timeBucket}
                        timeFormat={timeFormat}
                        rotateXAxis={rotateXAxis}
                        chartType={chartType}
                        dataNames={dataNames}
                      />
                    )}
                    <Filters
                      filters={filtersSubError}
                      onRemoveFilter={filterHandler}
                      onChangeExclusive={onChangeExclusive}
                      tnMapping={tnMapping}
                      resetFilters={resetActiveTabFilters}
                    />
                    <div className='mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                      {!_isEmpty(activeError?.params) &&
                        _map(ERROR_PANELS_ORDER, (type: keyof typeof tnMapping) => {
                          const panelName = tnMapping[type]
                          // @ts-expect-error
                          const panelIcon = panelIconMapping[type]

                          if (type === 'cc') {
                            const ccPanelName = tnMapping[countryActiveTab]

                            const rowMapper = (entry: ICountryEntry) => {
                              const { name: entryName, cc } = entry

                              if (cc) {
                                return <CCRow cc={cc} name={entryName} language={language} />
                              }

                              return <CCRow cc={entryName} language={language} />
                            }

                            return (
                              <Panel
                                projectPassword={projectPassword}
                                key={countryActiveTab}
                                icon={panelIcon}
                                id={countryActiveTab}
                                onFilter={filterHandler}
                                activeTab={activeTab}
                                name={<CountryDropdown onSelect={setCountryActiveTab} title={ccPanelName} />}
                                data={activeError.params[countryActiveTab]}
                                rowMapper={rowMapper}
                              />
                            )
                          }

                          if (type === 'br') {
                            const brPanelName = tnMapping[browserActiveTab]

                            const rowMapper = (entry: any) => {
                              const { name: entryName, br } = entry

                              const logoKey = browserActiveTab === 'br' ? entryName : br

                              // @ts-expect-error
                              const logoUrl = BROWSER_LOGO_MAP[logoKey]

                              if (!logoUrl) {
                                return (
                                  <>
                                    <GlobeAltIcon className='h-5 w-5' />
                                    &nbsp;
                                    {entryName}
                                  </>
                                )
                              }

                              return (
                                <>
                                  <img src={logoUrl} className='h-5 w-5' alt='' />
                                  &nbsp;
                                  {entryName}
                                </>
                              )
                            }

                            return (
                              <Panel
                                projectPassword={projectPassword}
                                key={browserActiveTab}
                                icon={panelIcon}
                                id={browserActiveTab}
                                activeTab={activeTab}
                                onFilter={filterHandler}
                                name={<BrowserDropdown onSelect={setBrowserActiveTab} title={brPanelName} />}
                                data={activeError.params[browserActiveTab]}
                                rowMapper={rowMapper}
                              />
                            )
                          }

                          if (type === 'os') {
                            const osPanelName = tnMapping[osActiveTab]

                            const rowMapper = (entry: any) => {
                              const { name: entryName, os } = entry

                              const logoKey = osActiveTab === 'os' ? entryName : os

                              // @ts-expect-error
                              const logoPathLight = OS_LOGO_MAP[logoKey]
                              // @ts-expect-error
                              const logoPathDark = OS_LOGO_MAP_DARK[logoKey]

                              let logoPath = _theme === 'dark' ? logoPathDark : logoPathLight
                              logoPath ||= logoPathLight

                              if (!logoPath) {
                                return (
                                  <>
                                    <GlobeAltIcon className='h-5 w-5' />
                                    &nbsp;
                                    {entryName}
                                  </>
                                )
                              }

                              const logoUrl = `/${logoPath}`

                              return (
                                <>
                                  <img src={logoUrl} className='h-5 w-5 dark:fill-gray-50' alt='' />
                                  &nbsp;
                                  {entryName}
                                </>
                              )
                            }

                            return (
                              <Panel
                                projectPassword={projectPassword}
                                key={osActiveTab}
                                icon={panelIcon}
                                id={osActiveTab}
                                activeTab={activeTab}
                                onFilter={filterHandler}
                                name={<OSDropdown onSelect={setOsActiveTab} title={osPanelName} />}
                                data={activeError.params[osActiveTab]}
                                rowMapper={rowMapper}
                              />
                            )
                          }

                          if (type === 'dv') {
                            return (
                              <Panel
                                projectPassword={projectPassword}
                                key={type}
                                activeTab={activeTab}
                                icon={panelIcon}
                                id={type}
                                onFilter={filterHandler}
                                name={panelName}
                                data={activeError.params[type]}
                                capitalize
                              />
                            )
                          }

                          if (type === 'pg') {
                            return (
                              <Panel
                                projectPassword={projectPassword}
                                key={type}
                                icon={panelIcon}
                                id={type}
                                onFilter={filterHandler}
                                onFragmentChange={setPgActiveFragment}
                                rowMapper={({ name: entryName }) => {
                                  if (!entryName) {
                                    return _toUpper(t('project.redactedPage'))
                                  }

                                  let decodedUri = entryName as string

                                  try {
                                    decodedUri = decodeURIComponent(entryName)
                                  } catch (_) {
                                    // do nothing
                                  }

                                  return decodedUri
                                }}
                                name={pgPanelNameMapping[pgActiveFragment]}
                                data={activeError.params[type]}
                                period={period}
                                activeTab={activeTab}
                                pid={id}
                                timeBucket={timeBucket}
                                filters={filters}
                                from={dateRange ? getFormatDate(dateRange[0]) : null}
                                to={dateRange ? getFormatDate(dateRange[1]) : null}
                                timezone={timezone}
                              />
                            )
                          }

                          if (type === 'lc') {
                            return (
                              <Panel
                                projectPassword={projectPassword}
                                key={type}
                                icon={panelIcon}
                                id={type}
                                activeTab={activeTab}
                                onFilter={filterHandler}
                                name={panelName}
                                data={activeError.params[type]}
                                rowMapper={({ name: entryName }: { name: string }) =>
                                  getLocaleDisplayName(entryName, language)
                                }
                              />
                            )
                          }

                          return (
                            <Panel
                              projectPassword={projectPassword}
                              key={type}
                              icon={panelIcon}
                              id={type}
                              activeTab={activeTab}
                              onFilter={filterHandler}
                              name={panelName}
                              data={activeError.params[type]}
                            />
                          )
                        })}
                    </div>
                    {_isEmpty(activeError) && errorLoading && <Loader />}
                    {!errorLoading && _isEmpty(activeError) && <NoErrorDetails />}
                  </>
                )}
                {activeTab === PROJECT_TABS.alerts && !isSharedProject && project?.isOwner && authenticated && (
                  <ProjectAlertsView projectId={id} />
                )}
                {activeTab === PROJECT_TABS.uptime && <Uptime />}
                {analyticsLoading && (activeTab === PROJECT_TABS.traffic || activeTab === PROJECT_TABS.performance) && (
                  <Loader />
                )}
                {isPanelsDataEmpty && activeTab === PROJECT_TABS.traffic && (
                  <NoEvents filters={filters} resetFilters={resetFilters} />
                )}
                {isPanelsDataEmptyPerf && activeTab === PROJECT_TABS.performance && (
                  <NoEvents filters={filtersPerf} resetFilters={resetFilters} />
                )}
                {activeTab === PROJECT_TABS.traffic && (
                  <div className={cx('pt-2', { hidden: isPanelsDataEmpty || analyticsLoading })}>
                    {!isInAIDetailsMode && !_isEmpty(overall) && (
                      <div className='mb-5 flex flex-wrap justify-center gap-5 lg:justify-start'>
                        <MetricCards
                          overall={overall}
                          overallCompare={overallCompare}
                          activePeriodCompare={activePeriodCompare}
                        />
                        {!_isEmpty(panelsData.meta) &&
                          _map(panelsData.meta, ({ key, current, previous }) => (
                            <React.Fragment key={key}>
                              <MetricCard
                                label={t('project.metrics.xAvg', { x: key })}
                                value={current.avg}
                                change={current.avg - previous.avg}
                                goodChangeDirection='down'
                                valueMapper={(value, type) =>
                                  `${type === 'badge' && value > 0 ? '+' : ''}${nLocaleFormatter(value)}`
                                }
                              />
                              <MetricCard
                                label={t('project.metrics.xTotal', { x: key })}
                                value={current.sum}
                                change={current.sum - previous.sum}
                                goodChangeDirection='down'
                                valueMapper={(value, type) =>
                                  `${type === 'badge' && value > 0 ? '+' : ''}${nLocaleFormatter(value)}`
                                }
                              />
                            </React.Fragment>
                          ))}
                      </div>
                    )}
                    <div
                      className={cx('h-80', {
                        hidden: checkIfAllMetricsAreDisabled || isInAIDetailsMode,
                      })}
                    >
                      <div className='mt-5 h-80 md:mt-0 [&_svg]:!overflow-visible' id='dataChart' />
                    </div>
                    {!isInAIDetailsMode && (
                      <>
                        <Filters
                          filters={filters}
                          onRemoveFilter={filterHandler}
                          onChangeExclusive={onChangeExclusive}
                          tnMapping={tnMapping}
                          resetFilters={resetActiveTabFilters}
                        />
                        <CustomMetrics
                          metrics={customMetrics}
                          onRemoveMetric={(id) => onRemoveCustomMetric(id)}
                          resetMetrics={resetCustomMetrics}
                        />
                      </>
                    )}
                    {dataLoading && (
                      <div className='static mt-4 !bg-transparent' id='loader'>
                        <div className='loader-head dark:!bg-slate-800'>
                          <div className='first dark:!bg-slate-600' />
                          <div className='second dark:!bg-slate-600' />
                        </div>
                      </div>
                    )}
                    <div className='mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                      {!_isEmpty(panelsData.types) &&
                        _map(TRAFFIC_PANELS_ORDER, (type: keyof typeof tnMapping) => {
                          const panelName = tnMapping[type]
                          // @ts-expect-error
                          const panelIcon = panelIconMapping[type]
                          const customTabs = _filter(customPanelTabs, (tab) => tab.panelID === type)

                          const dataSource = isInAIDetailsMode ? aiDetails?.[activeAiDetail!] || {} : panelsData.data

                          if (type === 'cc') {
                            const ccPanelName = tnMapping[countryActiveTab]

                            const rowMapper = (entry: ICountryEntry) => {
                              const { name: entryName, cc } = entry

                              if (cc) {
                                return <CCRow cc={cc} name={entryName} language={language} />
                              }

                              return <CCRow cc={entryName} language={language} />
                            }

                            return (
                              <Panel
                                projectPassword={projectPassword}
                                key={countryActiveTab}
                                icon={panelIcon}
                                id={countryActiveTab}
                                onFilter={filterHandler}
                                activeTab={activeTab}
                                name={<CountryDropdown onSelect={setCountryActiveTab} title={ccPanelName} />}
                                data={dataSource[countryActiveTab]}
                                customTabs={customTabs}
                                rowMapper={rowMapper}
                              />
                            )
                          }

                          if (type === 'br') {
                            const brPanelName = tnMapping[browserActiveTab]

                            const rowMapper = (entry: any) => {
                              const { name: entryName, br } = entry

                              const logoKey = browserActiveTab === 'br' ? entryName : br

                              // @ts-expect-error
                              const logoUrl = BROWSER_LOGO_MAP[logoKey]

                              if (!logoUrl) {
                                return (
                                  <>
                                    <GlobeAltIcon className='h-5 w-5' />
                                    &nbsp;
                                    {entryName}
                                  </>
                                )
                              }

                              return (
                                <>
                                  <img src={logoUrl} className='h-5 w-5' alt='' />
                                  &nbsp;
                                  {entryName}
                                </>
                              )
                            }

                            return (
                              <Panel
                                projectPassword={projectPassword}
                                key={browserActiveTab}
                                icon={panelIcon}
                                id={browserActiveTab}
                                activeTab={activeTab}
                                onFilter={filterHandler}
                                name={<BrowserDropdown onSelect={setBrowserActiveTab} title={brPanelName} />}
                                data={dataSource[browserActiveTab]}
                                rowMapper={rowMapper}
                              />
                            )
                          }

                          if (type === 'os') {
                            const osPanelName = tnMapping[osActiveTab]

                            const rowMapper = (entry: any) => {
                              const { name: entryName, os } = entry

                              const logoKey = osActiveTab === 'os' ? entryName : os

                              // @ts-expect-error
                              const logoPathLight = OS_LOGO_MAP[logoKey]
                              // @ts-expect-error
                              const logoPathDark = OS_LOGO_MAP_DARK[logoKey]

                              let logoPath = _theme === 'dark' ? logoPathDark : logoPathLight
                              logoPath ||= logoPathLight

                              if (!logoPath) {
                                return (
                                  <>
                                    <GlobeAltIcon className='h-5 w-5' />
                                    &nbsp;
                                    {entryName}
                                  </>
                                )
                              }

                              const logoUrl = `/${logoPath}`

                              return (
                                <>
                                  <img src={logoUrl} className='h-5 w-5 dark:fill-gray-50' alt='' />
                                  &nbsp;
                                  {entryName}
                                </>
                              )
                            }

                            return (
                              <Panel
                                projectPassword={projectPassword}
                                key={osActiveTab}
                                icon={panelIcon}
                                id={osActiveTab}
                                activeTab={activeTab}
                                onFilter={filterHandler}
                                name={<OSDropdown onSelect={setOsActiveTab} title={osPanelName} />}
                                data={dataSource[osActiveTab]}
                                rowMapper={rowMapper}
                              />
                            )
                          }

                          if (type === 'dv') {
                            return (
                              <Panel
                                projectPassword={projectPassword}
                                key={type}
                                activeTab={activeTab}
                                icon={panelIcon}
                                id={type}
                                onFilter={filterHandler}
                                name={panelName}
                                data={dataSource[type]}
                                customTabs={customTabs}
                                capitalize
                              />
                            )
                          }

                          if (type === 'ref') {
                            return (
                              <Panel
                                projectPassword={projectPassword}
                                key={type}
                                icon={panelIcon}
                                id={type}
                                onFilter={filterHandler}
                                name={panelName}
                                activeTab={activeTab}
                                data={dataSource[type]}
                                customTabs={customTabs}
                                rowMapper={({ name: entryName }) => <RefRow rowName={entryName} />}
                              />
                            )
                          }

                          if (type === 'so') {
                            const ccPanelName = tnMapping[utmActiveTab]

                            return (
                              <Panel
                                projectPassword={projectPassword}
                                key={utmActiveTab}
                                icon={panelIcon}
                                id={utmActiveTab}
                                activeTab={activeTab}
                                onFilter={filterHandler}
                                name={<UTMDropdown onSelect={setUtmActiveTab} title={ccPanelName} />}
                                data={dataSource[utmActiveTab]}
                                customTabs={customTabs}
                                rowMapper={({ name: entryName }) => decodeURIComponent(entryName)}
                              />
                            )
                          }

                          if (type === 'pg') {
                            return (
                              <Panel
                                projectPassword={projectPassword}
                                key={type}
                                icon={panelIcon}
                                id={type}
                                onFilter={filterHandler}
                                onFragmentChange={setPgActiveFragment}
                                rowMapper={({ name: entryName }) => {
                                  if (!entryName) {
                                    return _toUpper(t('project.redactedPage'))
                                  }

                                  let decodedUri = entryName as string

                                  try {
                                    decodedUri = decodeURIComponent(entryName)
                                  } catch (_) {
                                    // do nothing
                                  }

                                  return decodedUri
                                }}
                                name={pgPanelNameMapping[pgActiveFragment]}
                                data={dataSource[type]}
                                customTabs={customTabs}
                                period={period}
                                activeTab={activeTab}
                                pid={id}
                                timeBucket={timeBucket}
                                filters={filters}
                                from={dateRange ? getFormatDate(dateRange[0]) : null}
                                to={dateRange ? getFormatDate(dateRange[1]) : null}
                                timezone={timezone}
                              />
                            )
                          }

                          if (type === 'lc') {
                            return (
                              <Panel
                                projectPassword={projectPassword}
                                key={type}
                                icon={panelIcon}
                                id={type}
                                activeTab={activeTab}
                                onFilter={filterHandler}
                                name={panelName}
                                data={dataSource[type]}
                                rowMapper={({ name: entryName }: { name: string }) =>
                                  getLocaleDisplayName(entryName, language)
                                }
                                customTabs={customTabs}
                              />
                            )
                          }

                          return (
                            <Panel
                              projectPassword={projectPassword}
                              key={type}
                              icon={panelIcon}
                              id={type}
                              activeTab={activeTab}
                              onFilter={filterHandler}
                              name={panelName}
                              data={dataSource[type]}
                              customTabs={customTabs}
                            />
                          )
                        })}
                      {!isInAIDetailsMode && !_isEmpty(panelsData.data) && (
                        <Metadata
                          customs={panelsData.customs}
                          properties={panelsData.properties}
                          filters={filters}
                          onFilter={filterHandler}
                          chartData={chartData}
                          customTabs={_filter(customPanelTabs, (tab) => tab.panelID === 'ce')}
                          getCustomEventMetadata={getCustomEventMetadata}
                          getPropertyMetadata={_getPropertyMetadata}
                        />
                      )}
                    </div>
                  </div>
                )}
                {activeTab === PROJECT_TABS.performance && (
                  <div className={cx('pt-8 md:pt-4', { hidden: isPanelsDataEmptyPerf || analyticsLoading })}>
                    {!_isEmpty(overallPerformance) && (
                      <PerformanceMetricCards
                        overall={overallPerformance}
                        overallCompare={overallPerformanceCompare}
                        activePeriodCompare={activePeriodCompare}
                      />
                    )}
                    <div
                      className={cx('h-80', {
                        hidden: checkIfAllMetricsAreDisabled,
                      })}
                    >
                      <div className='h-80 [&_svg]:!overflow-visible' id='dataChart' />
                    </div>
                    <Filters
                      filters={filtersPerf}
                      onRemoveFilter={filterHandler}
                      onChangeExclusive={onChangeExclusive}
                      tnMapping={tnMapping}
                      resetFilters={resetActiveTabFilters}
                    />
                    {dataLoading && (
                      <div className='static mt-4 !bg-transparent' id='loader'>
                        <div className='loader-head dark:!bg-slate-800'>
                          <div className='first dark:!bg-slate-600' />
                          <div className='second dark:!bg-slate-600' />
                        </div>
                      </div>
                    )}
                    <div className='mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                      {!_isEmpty(panelsDataPerf.types) &&
                        _map(PERFORMANCE_PANELS_ORDER, (type: keyof typeof tnMapping) => {
                          const panelName = tnMapping[type]
                          // @ts-expect-error
                          const panelIcon = panelIconMapping[type]
                          const customTabs = _filter(customPanelTabs, (tab) => tab.panelID === type)

                          if (type === 'cc') {
                            const ccPanelName = tnMapping[countryActiveTab]

                            const rowMapper = (entry: ICountryEntry) => {
                              const { name: entryName, cc } = entry

                              if (cc) {
                                return <CCRow cc={cc} name={entryName} language={language} />
                              }

                              return <CCRow cc={entryName} language={language} />
                            }

                            return (
                              <Panel
                                projectPassword={projectPassword}
                                key={countryActiveTab}
                                icon={panelIcon}
                                id={countryActiveTab}
                                onFilter={filterHandler}
                                name={<CountryDropdown onSelect={setCountryActiveTab} title={ccPanelName} />}
                                activeTab={activeTab}
                                data={panelsDataPerf.data[countryActiveTab]}
                                customTabs={customTabs}
                                rowMapper={rowMapper}
                                // @ts-expect-error
                                valueMapper={(value) => getStringFromTime(getTimeFromSeconds(value), true)}
                              />
                            )
                          }

                          if (type === 'dv') {
                            return (
                              <Panel
                                projectPassword={projectPassword}
                                key={type}
                                icon={panelIcon}
                                id={type}
                                onFilter={filterHandler}
                                name={panelName}
                                activeTab={activeTab}
                                data={panelsDataPerf.data[type]}
                                customTabs={customTabs}
                                // @ts-expect-error
                                valueMapper={(value) => getStringFromTime(getTimeFromSeconds(value), true)}
                                capitalize
                              />
                            )
                          }

                          if (type === 'pg') {
                            return (
                              <Panel
                                projectPassword={projectPassword}
                                key={type}
                                icon={panelIcon}
                                id={type}
                                activeTab={activeTab}
                                onFilter={filterHandler}
                                name={panelName}
                                data={panelsDataPerf.data[type]}
                                customTabs={customTabs}
                                // @ts-expect-error
                                valueMapper={(value) => getStringFromTime(getTimeFromSeconds(value), true)}
                                rowMapper={({ name: entryName }) => {
                                  // todo: add uppercase
                                  return entryName || t('project.redactedPage')
                                }}
                              />
                            )
                          }

                          if (type === 'br') {
                            const brPanelName = tnMapping[browserActiveTab]

                            const rowMapper = (entry: any) => {
                              const { name: entryName, br } = entry

                              const logoKey = browserActiveTab === 'br' ? entryName : br

                              // @ts-expect-error
                              const logoUrl = BROWSER_LOGO_MAP[logoKey]

                              if (!logoUrl) {
                                return (
                                  <>
                                    <GlobeAltIcon className='h-5 w-5' />
                                    &nbsp;
                                    {entryName}
                                  </>
                                )
                              }

                              return (
                                <>
                                  <img src={logoUrl} className='h-5 w-5' alt='' />
                                  &nbsp;
                                  {entryName}
                                </>
                              )
                            }

                            return (
                              <Panel
                                projectPassword={projectPassword}
                                key={browserActiveTab}
                                icon={panelIcon}
                                id={browserActiveTab}
                                activeTab={activeTab}
                                onFilter={filterHandler}
                                name={<BrowserDropdown onSelect={setBrowserActiveTab} title={brPanelName} />}
                                data={panelsDataPerf.data[browserActiveTab]}
                                rowMapper={rowMapper}
                              />
                            )
                          }

                          return (
                            <Panel
                              projectPassword={projectPassword}
                              key={type}
                              icon={panelIcon}
                              id={type}
                              activeTab={activeTab}
                              onFilter={filterHandler}
                              name={panelName}
                              data={panelsDataPerf.data[type]}
                              customTabs={customTabs}
                              // @ts-expect-error
                              valueMapper={(value) => getStringFromTime(getTimeFromSeconds(value), true)}
                            />
                          )
                        })}
                    </div>
                  </div>
                )}
                {activeTab === PROJECT_TABS.funnels && (
                  <div className={cx('pt-4 md:pt-0', { hidden: !activeFunnel || analyticsLoading })}>
                    <div className='h-80'>
                      <div className='mt-5 h-80 md:mt-0' id='dataChart' />
                    </div>
                    {dataLoading && (
                      <div className='static mt-4 !bg-transparent' id='loader'>
                        <div className='loader-head dark:!bg-slate-800'>
                          <div className='first dark:!bg-slate-600' />
                          <div className='second dark:!bg-slate-600' />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <Forecast
              isOpened={isForecastOpened}
              onClose={() => setIsForecastOpened(false)}
              onSubmit={onForecastSubmit}
              activeTB={t(`project.${timeBucket}`)}
              tb={timeBucket}
            />
            <ViewProjectHotkeys isOpened={isHotkeysHelpOpened} onClose={() => setIsHotkeysHelpOpened(false)} />
            <NewFunnel
              project={project}
              projectPassword={projectPassword}
              pid={id}
              funnel={funnelToEdit}
              isOpened={isNewFunnelOpened}
              allowedToManage={allowedToManage}
              onClose={() => {
                setIsNewFunnelOpened(false)
                setFunnelToEdit(undefined)
              }}
              onSubmit={async (name: string, steps: string[]) => {
                if (funnelToEdit) {
                  await onFunnelEdit(funnelToEdit.id, name, steps)
                  return
                }

                await onFunnelCreate(name, steps)
              }}
              loading={funnelActionLoading}
            />
            <SearchFilters
              type={activeTab === PROJECT_TABS.errors ? 'errors' : 'traffic'}
              projectPassword={projectPassword}
              showModal={showFiltersSearch}
              setShowModal={setShowFiltersSearch}
              setProjectFilter={onFilterSearch}
              pid={id}
              tnMapping={tnMapping}
              filters={
                activeTab === PROJECT_TABS.performance
                  ? filtersPerf
                  : activeTab === PROJECT_TABS.sessions
                    ? filtersSessions
                    : activeTab === PROJECT_TABS.errors
                      ? filtersErrors
                      : filters
              }
            />
            <AddAViewModal
              projectPassword={projectPassword}
              showModal={isAddAViewOpened}
              setShowModal={(show) => {
                setIsAddAViewOpened(show)
                setProjectViewToUpdate(undefined)
              }}
              onSubmit={() => {
                setProjectViews([])
                setProjectViewsLoading(null)
                setProjectViewToUpdate(undefined)
              }}
              defaultView={projectViewToUpdate}
              pid={id}
              tnMapping={tnMapping}
            />
            {!embedded && <Footer authenticated={authenticated} minimal showDBIPMessage />}
          </>
        </ViewProjectContext.Provider>
      )}
    </ClientOnly>
  )
}

export default memo(withProjectProtected(ViewProject))
