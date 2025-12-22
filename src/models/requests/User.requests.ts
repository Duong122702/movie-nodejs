import { JwtPayload } from 'jsonwebtoken'
import { FavoritesItemType, TokenType } from '~/constants/enums'

export interface UserAccountRequestBody {
  username?: string
  avatar?: string
}

export interface favoritesReqBody {
  itemId: string
  itemType: FavoritesItemType
}

export interface RegisterRequestBody {
  email: string
  password: string
  confirm_password: string
}
export interface LoginRequestBody {
  email: string
  password: string
}
export interface LogoutRequestBody {
  refresh_token: string
}
export interface VerifyEmailRequestBody {
  email_verify_token: string
}
export interface ForgotPasswordRequestBody {
  email: string
}
export interface ResetPasswordRequestBody {
  password: string
  confirm_password: string
  forgot_password_verify_token: string
}

export interface ChangePasswordRequestBody {
  old_password: string
  new_password: string
  confirm_new_password: string
}

export interface TokenPayload extends JwtPayload {
  userId: string
  type: TokenType
}
export interface RefreshTokenRequestBody {
  refresh_token: string
}
