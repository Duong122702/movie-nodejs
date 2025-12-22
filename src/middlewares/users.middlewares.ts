import { Request, Response, NextFunction } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/messages'
import { REGEX_USERNAME } from '~/constants/regex'
import { TokenPayload } from '~/models/requests/User.requests'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto.utils'
import { ErrorWithStatus } from '~/utils/Errors'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validate'

//Password schema
const passwordSchema: ParamSchema = {
  in: 'body',
  notEmpty: {
    errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
  },
  isLength: {
    options: [{ min: 6, max: 50 }],
    errorMessage: USER_MESSAGES.PASSWORD_LENGTH_MUST_BE_AT_LEAST_6_CHARACTERS
  },
  trim: true,
  isStrongPassword: {
    options: [{ minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }],
    errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG
  }
}
//Confirm password schema
const confirmPasswordSchema: ParamSchema = {
  in: 'body',
  notEmpty: {
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
  },
  isLength: {
    options: [{ min: 6, max: 50 }],
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_AT_LEAST_6_CHARACTERS
  },
  trim: true,
  isStrongPassword: {
    options: [{ minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }],
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USER_MESSAGES.PASSWORD_CONFIRMATION_DOES_NOT_MATCH_PASSWORD)
      }
      return true
    }
  }
}
const verifyForgotPasswordSchema: ParamSchema = {
  in: 'body',
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: USER_MESSAGES.FORGOT_VERIFY_TOKEN_IS_REQUIRED,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      try {
        const decoded_forgot_verify_token = await verifyToken({
          token: value,
          privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN || 'default_forgot_password_secret'
        })
        const { user_id } = decoded_forgot_verify_token
        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
        if (!user) {
          throw new ErrorWithStatus({ message: USER_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.UNAUTHORIZED })
        }
        if (user.forgot_verify_token !== value) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.FORGOT_VERIFY_TOKEN_IS_INVALID,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        req.decoded_forgot_verify_token = decoded_forgot_verify_token
      } catch (error) {
        throw new ErrorWithStatus({ message: (error as JsonWebTokenError).message, status: HTTP_STATUS.UNAUTHORIZED })
      }
      return true
    }
  }
}

// Register validator
export const registerValidator = validate(
  checkSchema({
    email: {
      in: 'body',
      notEmpty: {
        errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
      },
      isEmail: {
        errorMessage: USER_MESSAGES.EMAIL_FORMAT_IS_INVALID
      },
      trim: true,
      custom: {
        options: (value) => {
          return databaseService.users.findOne({ email: value }).then((user) => {
            if (user) {
              return Promise.reject(new Error(USER_MESSAGES.EMAIL_ALREADY_EXISTS))
            }
          })
        }
      }
    },
    password: passwordSchema,
    confirm_password: confirmPasswordSchema
  })
)

// Login validator
export const loginValidator = validate(
  checkSchema({
    email: {
      in: 'body',
      notEmpty: {
        errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
      },
      isEmail: {
        errorMessage: USER_MESSAGES.EMAIL_FORMAT_IS_INVALID
      },
      trim: true
    },
    password: {
      in: 'body',
      notEmpty: {
        errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
      },
      trim: true,
      custom: {
        options: (value, { req }) => {
          //console.log(hashPassword(value))
          return databaseService.users.findOne({ email: req.body.email }).then((user) => {
            if (!user) {
              // return Promise.reject(new ErrorWithStatus({
              //   message: USER_MESSAGES.EMAIL_NOT_FOUND,
              //   status: HTTP_STATUS.UNAUTHORIZED
              // }))
              return Promise.reject(new Error(USER_MESSAGES.EMAIL_NOT_FOUND))
            }
            if (user.verify === UserVerifyStatus.Banned) {
              throw new Error('Tài khoản của bạn đã bị khóa bởi Admin.')
            }
            if (user.password !== hashPassword(value)) {
              // return Promise.reject(new ErrorWithStatus({
              //   message: USER_MESSAGES.PASSWORD_INCORRECT,
              //   status: HTTP_STATUS.UNAUTHORIZED
              // }))
              return Promise.reject(new Error(USER_MESSAGES.PASSWORD_INCORRECT))
            }
            // Lưu user vào request để controller có thể sử dụng
            req.user = user
            return true
          })
        }
      }
    }
  })
)

//Access token validator
export const accessTokenValidator = validate(
  checkSchema({
    Authorization: {
      trim: true,
      in: 'headers',
      custom: {
        options: async (value: string, { req }) => {
          // if(!value) {
          //   throw new ErrorWithStatus({message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED, status: HTTP_STATUS.UNAUTHORIZED})
          // }
          const access_token = (value || '').split(' ')[1]
          if (!access_token) {
            throw new ErrorWithStatus({
              message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          const decoded_authorization = await verifyToken({
            token: access_token,
            privateKey: process.env.JWT_SECRET_ACCESS_TOKEN || 'default_access_secret'
          })
          req.decoded_authorization = decoded_authorization
          return true
        }
      }
    }
  })
)

//Refresh token validator
export const refreshTokenValidator = validate(
  checkSchema({
    // note: In postman, we must write refreshToken in the body
    refreshToken: {
      in: 'body',
      notEmpty: {
        errorMessage: USER_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
      },
      custom: {
        options: async (value: string, { req }) => {
          try {
            const [decoded_refresh_token, refresh_token] = await Promise.all([
              verifyToken({
                token: value,
                privateKey: process.env.JWT_SECRET_REFRESH_TOKEN || 'default_refresh_secret'
              }),
              databaseService.refreshTokens.findOne({ token: value })
            ])
            if (!refresh_token) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.REFRESH_TOKEN_USED_OR_NOT_EXIST,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            req.decoded_refresh_token = decoded_refresh_token
            return true
          } catch (error) {
            if (error instanceof JsonWebTokenError) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.REFRESH_TOKEN_IS_INVALID,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            throw error
          }
        }
      }
    }
  })
)

//Email verify token validator
export const emailVerifyTokenValidator = validate(
  checkSchema({
    email_verify_token: {
      in: 'body',
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: USER_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          try {
            const decoded_email_verify_token = await verifyToken({
              token: value,
              privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN || 'default_email_verify_secret'
            })
            req.decoded_email_verify_token = decoded_email_verify_token
          } catch (error) {
            throw new ErrorWithStatus({
              message: (error as JsonWebTokenError).message,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          return true
        }
      }
    }
  })
)

//Forgot password validator
export const forgotPasswordValidator = validate(
  checkSchema({
    email: {
      in: 'body',
      notEmpty: {
        errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
      },
      isEmail: {
        errorMessage: USER_MESSAGES.EMAIL_FORMAT_IS_INVALID
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const user = await databaseService.users.findOne({ email: value })
          if (!user) {
            // properly reject so express-validator treats this as a validation failure
            return Promise.reject(
              new ErrorWithStatus({ message: USER_MESSAGES.EMAIL_NOT_FOUND, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
            )
          }
          req.user = user
          return true
        }
      }
    }
  })
)

//Verify forgot password validator
export const verifyForgotPasswordValidator = validate(
  checkSchema({
    forgot_verify_token: verifyForgotPasswordSchema
  })
)

//Reset password validator
export const resetPasswordValidator = validate(
  checkSchema({
    password: passwordSchema,
    confirm_password: confirmPasswordSchema,
    forgot_verify_token: verifyForgotPasswordSchema
  })
)

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  //Fix lỗi khi người dung verify email từ điện thoại nhưng khi đăng nhập trên máy tính thì access token không có trường verify. Fix bằng webSocket hoặc lấy verify từ database
  const { verify } = req.decoded_authorization as TokenPayload
  if (verify !== UserVerifyStatus.Verified) {
    next(new ErrorWithStatus({ message: USER_MESSAGES.USER_NOT_VERIFIED, status: HTTP_STATUS.UNAUTHORIZED }))
  }
  next()
}

export const updateAccountValidator = validate(
  checkSchema({
    username: {
      in: 'body',
      optional: true,
      isString: {
        errorMessage: USER_MESSAGES.NAME_MUST_BE_A_STRING
      },
      custom: {
        options: async (value: string, { req }) => {
          if (!REGEX_USERNAME.test(value)) {
            throw Error(USER_MESSAGES.USERNAME_INVALID)
          }
          const user = await databaseService.users.findOne({ username: value })
          if (user) {
            throw Error(USER_MESSAGES.USERNAME_EXISTED)
          }
        }
      },
      trim: true
    },
    avatar: {
      in: 'body',
      optional: true,
      isString: {
        errorMessage: USER_MESSAGES.AVATAR_MUST_BE_A_STRING
      },
      isLength: {
        options: {
          min: 1,
          max: 255
        },
        errorMessage: USER_MESSAGES.AVATAR_LENGTH_MUST_BE_FROM_2_TO_50_CHARACTERS
      },
      trim: true
    }
  })
)

export const changePasswordValidator = validate(
  checkSchema({
    old_password: {
      ...passwordSchema,
      custom: {
        options: async (value: string, { req }) => {
          // Xác thức người dùng có tồn tại hay không
          const { userId } = (req as Request).decoded_authorization as TokenPayload
          const user = await databaseService.users.findOne({ _id: new ObjectId(userId) })
          if (!user) {
            throw new ErrorWithStatus({
              message: USER_MESSAGES.USER_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          const { password } = user
          //So sánh mật khẩu
          const isMatch = hashPassword(value) === password
          if (!isMatch) {
            throw new ErrorWithStatus({
              message: USER_MESSAGES.OLD_PASSWORD_NOT_MATCH,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
        }
      }
    },
    new_password: {
      ...passwordSchema
    },
    confirm_new_password: confirmPasswordSchema
  })
)

import { config } from 'dotenv'
config()

// Lấy danh sách email admin từ .env, ví dụ: ADMIN_EMAILS=admin@gmail.com,boss@movie.com
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || []

export const isAdminValidator = async (req: Request, res: Response, next: NextFunction) => {
  // Lấy userId từ token đã decode (được middleware accessTokenValidator xử lý trước đó)
  const { userId } = req.decoded_authorization as TokenPayload

  // Tìm user trong DB để lấy email
  const user = await databaseService.users.findOne({ _id: new ObjectId(userId) })

  // Nếu không tìm thấy hoặc email không nằm trong list Admin -> Chặn
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    return next(
      new ErrorWithStatus({
        message: 'Bạn không có quyền truy cập Admin (Access Denied)',
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}
