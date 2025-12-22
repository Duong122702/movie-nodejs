import { Request, Response } from 'express'
import favoritesService from '~/services/favorites.services'
import { TokenPayload } from '~/models/requests/User.requests'
import { FavoritesItemType } from '~/constants/enums'

export const addFavoriteController = async (req: Request, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const { item_id, item_type } = req.body
  const result = await favoritesService.addFavorite(userId, item_id, item_type)
  return res.json(result)
}

export const removeFavoriteController = async (req: Request, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const { item_id } = req.params
  const result = await favoritesService.removeFavorite(userId, item_id)
  return res.json(result)
}

export const getFavoritesController = async (req: Request, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const itemType = req.query.type !== undefined ? Number(req.query.type) : FavoritesItemType.Movie
  const result = await favoritesService.getFavorites(userId, page, limit, itemType)
  return res.json({ message: 'Lấy danh sách yêu thích thành công', result })
}

export const checkFavoriteController = async (req: Request, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const { item_id } = req.params
  const result = await favoritesService.checkFavorite(userId, item_id)
  return res.json({ result })
}
