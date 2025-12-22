import { Router } from 'express'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
import { 
  createCommentController, 
  getCommentsController, 
  reactionCommentController 
} from '~/controllers/comments.controller'
import { commentIdValidator, contentIdValidator, createCommentValidator } from '~/middlewares/comments.middleware'

const commentsRouter = Router()

// Lấy comment thì không cần đăng nhập cũng xem được (tùy logic)
commentsRouter.get('/:content_id',contentIdValidator, wrapRequestHandler(getCommentsController))

// Các action bên dưới cần đăng nhập
commentsRouter.post('/', accessTokenValidator, createCommentValidator,wrapRequestHandler(createCommentController))
commentsRouter.post('/:comment_id/reaction', accessTokenValidator, commentIdValidator,wrapRequestHandler(reactionCommentController))

export default commentsRouter