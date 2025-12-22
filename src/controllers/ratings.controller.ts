import { Request, Response } from 'express'
import ratingsService from '~/services/ratings.services'
import { TokenPayload } from '~/models/requests/User.requests'

export const ratingContentController = async (req: Request, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const { content_id, score } = req.body

  const result = await ratingsService.ratingContent(userId, content_id, score)
  return res.json(result)
}

export const getUserRatingController = async (req: Request, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const { content_id } = req.params

  const result = await ratingsService.getUserRating(userId, content_id)
  return res.json({ result })
}

export const deleteRatingController = async (req: Request, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const { content_id } = req.params

  const result = await ratingsService.deleteRating(userId, content_id)
  return res.json(result)
}
export const getRatingsByContentIdController = async (req: Request, res: Response) => {
  const { content_id } = req.params
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10

  const result = await ratingsService.getRatingsByContentId({ content_id, page, limit })
  return res.json({ message: 'Lấy danh sách đánh giá thành công', result })
}
