import { Router } from 'express'
import { 
  exportReportController, 
  getNewUsersStatsController, 
  getOverviewController, 
  getTopContentController 
} from '../controllers/analytics.controller'
import { accessTokenValidator, isAdminValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const analyticsRouter = Router()

// Tất cả các route dưới đây đều yêu cầu Login + Quyền Admin
analyticsRouter.use(accessTokenValidator, isAdminValidator)

analyticsRouter.get('/overview', wrapRequestHandler(getOverviewController))
analyticsRouter.get('/users', wrapRequestHandler(getNewUsersStatsController))
analyticsRouter.get('/top-content', wrapRequestHandler(getTopContentController))
analyticsRouter.get('/export', wrapRequestHandler(exportReportController))

export default analyticsRouter