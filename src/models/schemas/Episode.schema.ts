import { ObjectId } from "mongodb"

export interface IEpisodeType {
  _id?: ObjectId
  season_id: ObjectId // Khóa ngoại tham chiếu đến Season
  series_id: ObjectId // Khóa ngoại (phi chuẩn hóa) tham chiếu đến Series
  episode_number: number
  title: string
  description?: string
  url: string // URL video của tập này
  runtime_minutes: number
  // Bạn có thể thêm thumbnail_url, release_date cho tập
  created_at?: Date
  updated_at?: Date
}

export default class Episode {
  _id: ObjectId
  season_id: ObjectId
  series_id: ObjectId
  episode_number: number
  title: string
  description: string
  url: string
  runtime_minutes: number
  created_at: Date
  updated_at: Date

  constructor(data: IEpisodeType) {
    this._id = data._id || new ObjectId()
    this.season_id = data.season_id
    this.series_id = data.series_id // Rất quan trọng để truy vấn nhanh
    this.episode_number = data.episode_number
    this.title = data.title
    this.description = data.description || ''
    this.url = data.url
    this.runtime_minutes = data.runtime_minutes
    this.created_at = data.created_at || new Date()
    this.updated_at = data.updated_at || new Date()
  }
}

