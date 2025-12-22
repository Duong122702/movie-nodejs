import { Router } from 'express'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { addFavoriteValidator } from '~/middlewares/favorites.middleware'
import { wrapRequestHandler } from '~/utils/handlers'
import { 
  addFavoriteController, 
  removeFavoriteController, 
  getFavoritesController,
  checkFavoriteController
} from '~/controllers/favorites.controller'

const favoritesRouter = Router()

favoritesRouter.use(accessTokenValidator) // Tất cả phải đăng nhập

// Lấy danh sách yêu thích
favoritesRouter.get('/', wrapRequestHandler(getFavoritesController))

// Thêm vào yêu thích
favoritesRouter.post('/', addFavoriteValidator, wrapRequestHandler(addFavoriteController))

// Xóa khỏi yêu thích
favoritesRouter.delete('/:item_id', wrapRequestHandler(removeFavoriteController))

// Kiểm tra trạng thái (User đã like phim này chưa?)
favoritesRouter.get('/check/:item_id', wrapRequestHandler(checkFavoriteController))

export default favoritesRouter