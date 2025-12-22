import { ObjectId } from 'mongodb'
import { FavoritesItemType } from '~/constants/enums'

interface FavoritesType {
  _id?: ObjectId
  userId?: ObjectId // Tham chiếu tới user
  itemId?: ObjectId | string // ID của phim/diễn viên/đạo diễn
  itemType?: FavoritesItemType // "movie" | "actor" | "director"
  created_at?: Date
}

export default class Favorites {
  _id?: ObjectId
  userId?: ObjectId
  itemId?: ObjectId | string
  itemType?: FavoritesItemType
  created_at?: Date

  constructor(favorites: FavoritesType) {
    this._id = favorites._id || new ObjectId()
    this.userId = favorites.userId
    this.itemId = favorites.itemId
    this.itemType = favorites.itemType
    this.created_at = favorites.created_at || new Date()
  }
}
