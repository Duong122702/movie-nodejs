import { ObjectId } from 'mongodb'
import { MoviesStatus } from '~/constants/enums'

// --- CÁC INTERFACE NHỎ ĐỂ NHÚNG ---

export interface IGenre {
  _id: string // "sci-fi"
  name: string // "Science Fiction"
}

export interface ICast {
  actorName: string
  characterName: string
  actorImage: string
}

export interface IMovieImage {
  type: 'poster' | 'backdrop' | 'thumbnail' | string
  url: string
}

// --- CÁC INTERFACE CHO DỮ LIỆU THÔ (DATA TYPE) ---
// (Giống như UserType, đây là dữ liệu thô trước khi vào class)

/**
 * Interface cơ sở cho dữ liệu thô
 */
export interface IContentBaseType {
  _id?: ObjectId
  type: 'movie' | 'series' // Trường phân biệt
  title: string
  original_title: string,
  slug: string
  description?: string
  release_year?: Date
  genres: IGenre[]
  casts: ICast[]
  images: IMovieImage[]
  status: MoviesStatus
  countries: string[] // Đã sửa lỗi 'contries' thành 'countries'
  rating_avg?: number
  rating_count?: number
  comments_count?: number
  created_at?: Date
  updated_at?: Date
}


export interface IMovieType extends IContentBaseType {
  type: 'movie'
  release_date: string
  runtime_minutes: number
  url: string
}


export interface ISeriesType extends IContentBaseType {
  type: 'series'
  latest: {
    season_number: number
    episode_number: number
  }
}
export type IContentType = IMovieType | ISeriesType
abstract class ContentBase {
  _id: ObjectId
  type: 'movie' | 'series'
  title: string
  original_title: string
  slug: string
  description: string
  release_year: Date
  genres: IGenre[]
  casts: ICast[]
  images: IMovieImage[]
  status: MoviesStatus
  countries: string[]
  rating_avg: number
  rating_count: number
  comments_count: number
  created_at: Date
  updated_at: Date
  constructor(data: IContentBaseType) {
    this._id = data._id || new ObjectId()
    this.type = data.type
    this.title = data.title
    this.original_title = data.original_title
    this.slug = data.slug
    this.description = data.description || ''
    this.release_year = data.release_year || new Date()
    this.genres = data.genres || []
    this.casts = data.casts || []
    this.images = data.images || []
    this.status = data.status
    this.countries = data.countries || []
    this.rating_avg = data.rating_avg || 0
    this.rating_count = data.rating_count || 0
    this.comments_count = data.comments_count || 0
    this.created_at = data.created_at || new Date()
    this.updated_at = data.updated_at || new Date()
  }
}

/**
 * Lớp Movie, kế thừa từ ContentBase
 */
export class Movie extends ContentBase {
  release_date: string
  runtime_minutes: number
  url: string

  constructor(data: IMovieType) { 
    super(data) // 1. Gọi hàm tạo của cha (ContentBase) để gán các trường chung
    
    // 2. Gán các trường riêng của Movie
    this.type = 'movie' // Đảm bảo type là 'movie'
    this.release_date = data.release_date
    this.runtime_minutes = data.runtime_minutes
    this.url = data.url
  }
}

/**
 * Lớp Series, kế thừa từ ContentBase
 */
export class Series extends ContentBase {
  latest: {
    season_number: number
    episode_number: number
  }

  constructor(data: ISeriesType) {
    super(data) // 1. Gọi hàm tạo của cha (ContentBase)
    
    // 2. Gán các trường riêng của Series
    this.type = 'series' // Đảm bảo type là 'series'
    this.latest = data.latest
  }
}

/**
 * Export một Union Type của các Class
 * Đây là type bạn sẽ dùng trong DatabaseService
 */
export type Content = Movie | Series