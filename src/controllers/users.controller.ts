/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import { ParamsDictionary } from 'express-serve-static-core'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import {
  ChangePasswordRequestBody,
  favoritesReqBody,
  ForgotPasswordRequestBody,
  LoginRequestBody,
  LogoutRequestBody,
  RefreshTokenRequestBody,
  RegisterRequestBody,
  ResetPasswordRequestBody,
  TokenPayload,
  UserAccountRequestBody,
  VerifyEmailRequestBody
} from '~/models/requests/User.requests'
import { USER_MESSAGES } from '~/constants/messages'
import { ObjectId } from 'mongodb'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { UserVerifyStatus } from '~/constants/enums'
import { config } from 'dotenv'
config()

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody>,
  res: Response,
  next: NextFunction
) => {
  // const {email, password} = req.body
  const result = await usersService.register(req.body)
  return res.json({
    message: USER_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || []

export const loginController = async (req: Request<ParamsDictionary, any, LoginRequestBody>, res: Response) => {
  // get user from request (set by middleware)
  const user = req.user as User
  console.log('req.user:', req.user)
  const user_id = user._id as ObjectId
  const result = await usersService.login({ userId: user_id.toString(), verify: user.verify })
  const isAdmin = ADMIN_EMAILS.includes(user.email)
  return res.json({
    message: USER_MESSAGES.LOGIN_SUCCESS,
    result: {
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
      isAdmin,
      user: {
        // Đưa user vào trong result để Frontend lưu Profile
        _id: user._id,
        email: user.email,
        username: user.username,
        role: isAdmin ? 'admin' : 'user',
        avatar: user.avatar
      }
    }
  })
}

export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query
  const result = await usersService.oauth(code as string)
  const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.newUser}`
  return res.redirect(urlRedirect)
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutRequestBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await usersService.logout(refresh_token)
  return res.json({
    message: USER_MESSAGES.LOGOUT_SUCCESS,
    result
  })
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailRequestBody>,
  res: Response
) => {
  const { email_verify_token } = req.body
  const user = await databaseService.users.findOne({ _id: new ObjectId(req.params.user_id) })
  // User not found
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: USER_MESSAGES.USER_NOT_FOUND })
  }
  // Email verified
  if (email_verify_token !== '') {
    return res.json({ message: USER_MESSAGES.EMAIL_VERIFIED })
  }
  const result = await usersService.verifyEmail(user._id.toString())
  return res.json({ result })
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: USER_MESSAGES.USER_NOT_FOUND })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({ message: USER_MESSAGES.EMAIL_VERIFIED })
  }
  const result = await usersService.resendVerifyEmail(user_id, user.email)
  return res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordRequestBody>,
  res: Response
) => {
  const { _id, verify, email } = req.user as User
  const result = await usersService.forgotPassword({
    user_id: (_id as ObjectId).toString(),
    verify: verify,
    email: email
  })
  return res.json(result)
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordRequestBody>,
  res: Response
) => {
  return res.json({
    message: USER_MESSAGES.FORGOT_VERIFY_PASSWORD_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_forgot_verify_token as TokenPayload
  const { password } = req.body
  const result = await usersService.resetPassword(user_id, password)
  return res.json(result)
}

export const getAccountController = async (req: Request, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload
  //console.log(req.decoded_authorization)
  const user = await usersService.getAccount(userId)
  return res.json({
    message: USER_MESSAGES.GET_ACCOUNT_SUCCESS,
    result: user
  })
}

export const updateAccountController = async (
  req: Request<ParamsDictionary, any, UserAccountRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.decoded_authorization as TokenPayload
  //const body = pick(req.body, ['username', 'avatar'])
  const { body } = req
  const user = await usersService.updateAccount(userId, body)
  return res.json({
    message: USER_MESSAGES.UPDATE_ACCOUNT_SUCCESS,
    result: user
  })
}

export const getProfileController = async (req: Request<{ username: string }>, res: Response, next: NextFunction) => {
  const { username } = req.params
  const user = await usersService.getProfile(username)
  return res.json({
    message: USER_MESSAGES.GET_PROFILE_SUCCESS,
    result: user
  })
}
// Add item to favarite maybe belong to favarite service
export const addFavoritesController = async (
  req: Request<ParamsDictionary, any, favoritesReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const { itemId, itemType } = req.body
  const result = await usersService.addFavorites(userId, itemId, itemType)
  return res.json({
    message: USER_MESSAGES.ADD_FAVORITES_SUCCESS,
    result
  })
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const { new_password } = req.body
  const result = await usersService.changePassword(userId, new_password)
  return res.json(result)
}

export const getUsersController = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10

  const result = await usersService.getAllUsers({ page, limit })

  return res.json({
    message: 'Lấy danh sách người dùng thành công',
    result
  })
}

export const banUserController = async (req: Request, res: Response) => {
  const { user_id } = req.params // ID người bị chặn
  const { ban } = req.body // Gửi lên { "ban": true } để chặn, { "ban": false } để mở

  const result = await usersService.toggleBanUser(user_id, ban)

  return res.json({
    message: ban ? 'Đã khóa tài khoản thành công' : 'Đã mở khóa tài khoản',
    result
  })
}

// Thêm vào cuối file controller
export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenRequestBody>,
  res: Response
) => {
  const { user_id, verify } = req.decoded_refresh_token as TokenPayload
  const { refresh_token } = req.body

  const result = await usersService.refreshToken({ refresh_token, user_id, verify })

  return res.json({
    message: USER_MESSAGES.REFRESH_TOKEN_SUCCESS, // Nhớ thêm message này vào constants/messages.ts
    result
  })
}
