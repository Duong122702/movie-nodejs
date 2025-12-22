import { ObjectId } from "mongodb";

export enum ReactionType {
  Like =  'like',
  Love = 'love'
}

export interface ICommentType {
 _id?: ObjectId
 user_id: ObjectId
 content_id: ObjectId
 parent_id: ObjectId | null
 content: string
 reaction_counts?: Record<string, number>
 created_at?: Date
 updated_at?: Date
}

export default class Comment {
  _id: ObjectId
  user_id: ObjectId
  content_id: ObjectId
  parent_id: ObjectId | null
  content: string
  reaction_counts: Record<string, number>
  created_at: Date
  updated_at: Date

  constructor(data: ICommentType) {
    this._id = data._id || new ObjectId()
    this.user_id = data.user_id
    this.content_id = data.content_id
    this.parent_id = data.parent_id || null // Mặc định là null (bình luận gốc)
    this.content = data.content
    this.reaction_counts = data.reaction_counts || {} // Mặc định là object rỗng
    this.created_at = data.created_at || new Date()
    this.updated_at = data.updated_at || new Date()
  }
}