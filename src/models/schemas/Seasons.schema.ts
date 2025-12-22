import { ObjectId } from "mongodb"

export interface ISeasonType {
  _id?: ObjectId
  series_id: ObjectId // Khóa ngoại tham chiếu đến _id của Series
  season_number: number
  title: string
  description?: string
  release_date?: Date
  // Bạn có thể thêm các trường khác như poster_url, release_date cho mùa
  created_at?: Date
  updated_at?: Date
}

export default class Season {
  _id: ObjectId
  series_id: ObjectId
  season_number: number
  title: string
  description: string
  created_at: Date
  updated_at: Date
  release_date: Date
  constructor(data: ISeasonType) {
 this._id = data._id || new ObjectId()
    this.series_id = data.series_id
    this.season_number = data.season_number
    this.title = data.title
    this.description = data.description || ''
    this.release_date = data.release_date || new Date()
    this.created_at = data.created_at || new Date()
    this.updated_at = data.updated_at || new Date()
  }
}