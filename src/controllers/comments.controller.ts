import { Request, Response } from 'express'
import commentsService from '~/services/comments.services'
import { CreateCommentReqBody } from '../models/requests/comments.request'
import { TokenPayload } from '~/models/requests/User.requests'

export const createCommentController = async (req: Request, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const result = await commentsService.createComment(userId, req.body)
  return res.json({ message: 'Bình luận thành công', result })
}

export const getCommentsController = async (req: Request, res: Response) => {
  const { content_id } = req.params
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  
  const result = await commentsService.getCommentsByContentId({ content_id, page, limit })
  return res.json({ message: 'Lấy danh sách bình luận thành công', result })
}

export const reactionCommentController = async (req: Request, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const { comment_id } = req.params
  
  const result = await commentsService.reactionComment(userId, comment_id)
  return res.json({ result })
}