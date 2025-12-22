import { ReactionType } from "~/models/schemas/Comment.schema"

export interface CreateCommentReqBody {
  content_id: string // ID phim/series
  content: string    // Nội dung bình luận
  parent_id?: string // Nếu là reply thì truyền ID bình luận cha, nếu không thì null
}

export interface UpdateCommentReqBody {
  content: string
}

export interface ReactionReqBody {
  type: ReactionType // 'like'
}