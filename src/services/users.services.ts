import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterRequestBody, UserAccountRequestBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto.utils'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { USER_MESSAGES } from '~/constants/messages'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId, ReturnDocument } from 'mongodb'
import { config } from 'dotenv'
import { ErrorWithStatus } from '~/utils/Errors'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { sendForgotPasswordEmail, sendVerifyEmail } from '~/utils/email'
import axios from 'axios'
// config dotenv to use process.env
config()

//Class UsersService
class UsersService {
  private signAccessToken({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        userId,
        type: TokenType.AccessToken,
        verify: verify
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN || 'default_access_secret',
      options: {
        expiresIn: Number(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN) || 900 // 15 minutes
      }
    })
  }
  private signRefreshToken({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        userId,
        type: TokenType.RefreshToken,
        verify: verify
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN || 'default_refresh_secret',
      options: {
        expiresIn: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN) || 604800 // 7 days
      }
    })
  }
  private signAccessAndRefreshToken({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ userId, verify }), this.signRefreshToken({ userId, verify })])
  }
  private signEmailVerifyToken({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        userId,
        type: TokenType.EmailVerifyToken,
        verify: verify
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN || 'default_email_verify_secret',
      options: {
        expiresIn: Number(process.env.JWT_EMAIL_VERIFY_TOKEN_EXPIRES_IN) || 3600 // 1 hour
      }
    })
  }
  private signForgotVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        type: TokenType.ForgotPasswordToken,
        verify: verify
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN || 'default_forgot_password_secret',
      options: {
        expiresIn: Number(process.env.JWT_FORGOT_PASSWORD_TOKEN_EXPIRES_IN) || 3600 // 1 hour
      }
    })
  }
  private async getOAuthGoogleToken(code: string) {
    const body = new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: 'authorization_code'
    })
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data as {
      access_token: string
      id_token: string
    }
  }
  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${id_token}`
      },
      params: {
        access_token,
        alt: 'json'
      }
    })
    return data as {
      id: string
      email: string
      email_verified: boolean
      name: string
      give_name: string
      family_name: string
      picture: string
      locale: string
    }
  }

  async register(payload: RegisterRequestBody) {
    const userId = new ObjectId()
    const emailVerifyToken = await this.signEmailVerifyToken({
      userId: userId.toString(),
      verify: UserVerifyStatus.Unverified
    })
    const { password } = payload
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: userId,
        username: `user${userId.toString()}`,
        email_verify_token: emailVerifyToken,
        password: hashPassword(password)
      })
    )
    // get userId
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      userId: userId.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(userId),
        token: refreshToken
      })
    )
    //simulate send email to user
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailVerifyToken}`

    const subject = 'Xác thực tài khoản của bạn'
    const body = `
      <h1>Chào mừng bạn đến với Movie App!</h1>
      <p>Cảm ơn bạn đã đăng ký tài khoản. Để bắt đầu sử dụng đầy đủ tính năng, vui lòng xác thực email của bạn.</p>
      <p>Click vào nút bên dưới để xác thực:</p>
      <a href="${verifyUrl}" target="_blank" style="padding: 10px 20px; background-color: #dfb026; color: black; text-decoration: none; border-radius: 5px;">Xác thực Email</a>
      <p>Link này sẽ hết hạn sau 24 giờ.</p>
    `
    // Gọi hàm gửi email (không dùng await nếu muốn phản hồi nhanh cho user,
    // nhưng dùng await để đảm bảo mail gửi đi không lỗi trong giai đoạn test)
    sendVerifyEmail(payload.email, subject, body).catch(console.error)
    return {
      accessToken,
      refreshToken
    }
  }
  async login({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      userId: userId.toString(),
      verify: verify
    })
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(userId),
        token: refreshToken
      })
    )
    return {
      accessToken,
      refreshToken
    }
  }
  async oauth(code: string) {
    const { access_token, id_token } = await this.getOAuthGoogleToken(code)
    //console.log('TOKEN', tokenData)
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)
    if (!userInfo.email_verified) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.GMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    const user = await databaseService.users.findOne({ email: userInfo.email })
    if (user) {
      const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
        userId: user._id.toString(),
        verify: user.verify
      })
      await databaseService.refreshTokens.insertOne(
        new RefreshToken({
          user_id: new ObjectId(user._id),
          token: refresh_token
        })
      )
      return {
        access_token,
        refresh_token,
        newUser: false
      }
    } else {
      const password = Math.random().toString(36).substring(2, 7)
      const data = await this.register({
        email: userInfo.email,
        password: password,
        confirm_password: password
      })
      return { ...data, newUser: true }
    }
  }
  async logout(refreshToken: string) {
    await databaseService.refreshTokens.deleteOne({ token: refreshToken })
    return {
      message: USER_MESSAGES.LOGOUT_SUCCESS
    }
  }
  async verifyEmail(userId: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({ userId: userId, verify: UserVerifyStatus.Verified }),
      databaseService.users.updateOne({ _id: new ObjectId(userId) }, [
        { $set: { email_verify_token: '', verify: UserVerifyStatus.Verified, updated_at: '$$NOW' } }
      ])
    ])
    const [accessToken, refreshToken] = token
    return {
      accessToken,
      refreshToken
    }
  }
  async resendVerifyEmail(userId: string, email: string) {
    //simulate send email to user
    const emailVerifyToken = await this.signEmailVerifyToken({ userId: userId, verify: UserVerifyStatus.Unverified })
    console.log('Send email to user', emailVerifyToken)

    //update email_verify_token to database
    await databaseService.users.updateOne({ _id: new ObjectId(userId) }, [
      { $set: { email_verify_token: emailVerifyToken, updated_at: '$$NOW' } }
    ])
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailVerifyToken}`
    const subject = 'Gửi lại: Xác thực tài khoản'
    const body = `
      <h1>Xác thực tài khoản</h1>
      <p>Bạn đã yêu cầu gửi lại email xác thực.</p>
      <p>Click vào nút bên dưới để xác thực:</p>
      <a href="${verifyUrl}" target="_blank" style="padding: 10px 20px; background-color: #dfb026; color: black; text-decoration: none; border-radius: 5px;">Xác thực ngay</a>
    `

    sendVerifyEmail(email, subject, body).catch(console.error)
    return {
      message: USER_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }
  async forgotPassword({ user_id, verify, email }: { user_id: string; verify: UserVerifyStatus; email: string }) {
    const forgot_password_token = await this.signForgotVerifyToken({ user_id: user_id, verify: verify })
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      { $set: { forgot_verify_token: forgot_password_token, updated_at: '$$NOW' } }
    ])
    // //simulate send link  to email's user
    // console.log('Send email to user', forgot_password_token)
    await sendForgotPasswordEmail(email, forgot_password_token)
    return {
      message: USER_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }
  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          forgot_verify_token: '',
          password: hashPassword(password),
          updated_at: '$$NOW'
        }
      }
    ])
    return {
      message: USER_MESSAGES.RESET_PASSSWORD_SUCCESS
    }
  }
  async getAccount(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_verify_token: 0
        }
      }
    )
    return user
  }
  async updateAccount(userId: string, payload: UserAccountRequestBody) {
    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(userId)
      },
      {
        $set: {
          ...payload
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: ReturnDocument.AFTER,
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_verify_token: 0
        }
      }
    )
    return user
  }
  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      { username: username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_verify_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
    if (user === null) {
      throw new ErrorWithStatus({ message: USER_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
    }
    return user
  }
  async addFavorites(userId: string, itemId: string, itemType: number) {
    return true
  }
  async changePassword(userId: string, new_password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          password: hashPassword(new_password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USER_MESSAGES.CHANGE_PASSWORD_SUCCESS
    }
  }
  // 1. Lấy danh sách toàn bộ users (Có phân trang)
  async getAllUsers({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit

    // Query db, ẩn các trường nhạy cảm
    const users = await databaseService.users
      .find(
        {},
        {
          projection: {
            password: 0,
            forgot_verify_token: 0,
            email_verify_token: 0
          }
        }
      )
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await databaseService.users.countDocuments()

    return {
      users,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit)
    }
  }

  // 2. Chặn / Mở chặn User
  async toggleBanUser(userId: string, ban: boolean) {
    // Nếu ban = true -> Set thành Banned (2)
    // Nếu ban = false -> Trả về Verified (1) (Hoặc Unverified tùy logic, nhưng thường là Verified)
    const status = ban ? UserVerifyStatus.Banned : UserVerifyStatus.Verified

    const result = await databaseService.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          verify: status,
          updated_at: new Date()
        }
      }
    )

    return result
  }
  // Thêm vào trong class UsersService

  async refreshToken({
    refresh_token,
    user_id,
    verify
  }: {
    refresh_token: string
    user_id: string
    verify: UserVerifyStatus
  }) {
    // Tạo lại cặp access_token và refresh_token mới
    const [new_access_token, new_refresh_token] = await this.signAccessAndRefreshToken({
      userId: user_id,
      verify: verify
    })

    // Xóa token cũ và thêm token mới vào DB (Cơ chế Token Rotation)
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: new_refresh_token
      })
    )

    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token
    }
  }
}

const usersService = new UsersService()
export default usersService
