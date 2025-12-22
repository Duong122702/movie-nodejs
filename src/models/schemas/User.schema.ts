import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'

interface UserType {
  _id?: ObjectId
  username?: string
  email: string
  password: string
  created_at?: Date
  updated_at?: Date
  email_verify_token?: string
  forgot_verify_token?: string
  verify?: UserVerifyStatus
  avatar?: string
}

export default class User {
  _id?: ObjectId
  username: string
  email: string
  password: string
  created_at: Date
  updated_at: Date
  email_verify_token: string
  forgot_verify_token: string
  verify: UserVerifyStatus
  avatar: string

  constructor(user: UserType) {
    this._id = user._id
    this.username = user.username || ''
    this.email = user.email
    this.password = user.password
    this.created_at = user.created_at || new Date()
    this.updated_at = user.updated_at || new Date()
    this.email_verify_token = user.email_verify_token || ''
    this.forgot_verify_token = user.forgot_verify_token || ''
    this.verify = user.verify || UserVerifyStatus.Unverified
    this.avatar = user.avatar || ''
  }
}
