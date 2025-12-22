import { ObjectId } from 'mongodb'

/**
 * Interface cho dữ liệu thô của Rating
 */
export interface IRatingType {
  _id?: ObjectId
  user_id: ObjectId // Ai vote
  content_id: ObjectId // Vote cho phim/series nào
  score: number // Điểm số (ví dụ: 1-10)
  created_at?: Date
  updated_at?: Date // Dùng khi user thay đổi vote
}

/**
 * Class (Model) cho Rating
 */
export default class Rating {
  _id: ObjectId
  user_id: ObjectId
  content_id: ObjectId
  score: number
  created_at: Date
  updated_at: Date

  constructor(data: IRatingType) {
    this._id = data._id || new ObjectId()
    this.user_id = data.user_id
    this.content_id = data.content_id
    this.score = data.score
    this.created_at = data.created_at || new Date()
    this.updated_at = data.updated_at || new Date()
  }
}