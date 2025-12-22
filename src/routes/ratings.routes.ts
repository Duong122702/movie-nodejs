import { Router } from 'express'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { ratingValidator } from '../middlewares/ratings.middleware' // Middleware tạo ở bước 2
import { wrapRequestHandler } from '~/utils/handlers'
import {
  ratingContentController,
  getUserRatingController,
  deleteRatingController,
  getRatingsByContentIdController
} from '~/controllers/ratings.controller'

const ratingsRouter = Router()

// Tất cả thao tác rating đều cần đăng nhập
ratingsRouter.use(accessTokenValidator)

// POST /ratings (Body: content_id, score)
ratingsRouter.post('/', ratingValidator, wrapRequestHandler(ratingContentController))

// GET /ratings/user/:content_id (Lấy điểm mình đã chấm)
ratingsRouter.get('/user/:content_id', wrapRequestHandler(getUserRatingController))

// DELETE /ratings/:content_id (Xóa điểm)
ratingsRouter.delete('/:content_id', wrapRequestHandler(deleteRatingController))

ratingsRouter.get('/:content_id', wrapRequestHandler(getRatingsByContentIdController))

export default ratingsRouter
