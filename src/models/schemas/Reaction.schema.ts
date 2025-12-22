import { ObjectId } from 'mongodb'
import { ReactionType } from './Comment.schema'


/**
 * Interface cho dữ liệu thô của Reaction
 */
export interface IReactionType {
  _id?: ObjectId
  user_id: ObjectId // Ai đã react
  comment_id: ObjectId // React vào comment nào
  reaction_type: ReactionType | string // React cái gì (like, love, ...)
  created_at?: Date
}

/**
 * Class (Model) cho Reaction
 */
export default class Reaction {
  _id: ObjectId
  user_id: ObjectId
  comment_id: ObjectId
  reaction_type: ReactionType | string
  created_at: Date

  constructor(data: IReactionType) {
    this._id = data._id || new ObjectId()
    this.user_id = data.user_id
    this.comment_id = data.comment_id
    this.reaction_type = data.reaction_type
    this.created_at = data.created_at || new Date()
  }
}