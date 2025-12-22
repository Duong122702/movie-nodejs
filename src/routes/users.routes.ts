import { Router } from 'express'
import {
  addFavoritesController,
  banUserController,
  changePasswordController,
  forgotPasswordController,
  getAccountController,
  getProfileController,
  getUsersController,
  loginController,
  logoutController,
  oauthController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  updateAccountController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/users.controller'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  isAdminValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  verifiedUserValidator,
  verifyForgotPasswordValidator
} from '~/middlewares/users.middlewares'
import { UserAccountRequestBody } from '~/models/requests/User.requests'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
usersRouter.get('/oauth/google', wrapRequestHandler(oauthController))
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)
usersRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))
usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))
usersRouter.get('/account', accessTokenValidator, wrapRequestHandler(getAccountController))
usersRouter.patch(
  '/account',
  accessTokenValidator,
  verifiedUserValidator,
  filterMiddleware<UserAccountRequestBody>(['username', 'avatar']),
  wrapRequestHandler(updateAccountController)
)
usersRouter.get('/:username', wrapRequestHandler(getProfileController))
usersRouter.post('/addFavorites', accessTokenValidator, wrapRequestHandler(addFavoritesController))
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)
usersRouter.get('/', accessTokenValidator, isAdminValidator, wrapRequestHandler(getUsersController))

// API Chặn/Mở chặn User (Chỉ Admin)
// PATCH /users/:user_id/ban
usersRouter.patch('/:user_id/ban', accessTokenValidator, isAdminValidator, wrapRequestHandler(banUserController))
export default usersRouter
