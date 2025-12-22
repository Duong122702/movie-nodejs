import { MoviesStatus } from "~/constants/enums"

export interface GenresRequestBody {
    genres: string
}

export interface IFilterMoviesQuery {
  page?: string
  limit?: string
  type?: 'movie' | 'series'
  title?: string // Lọc theo tiêu đề (regex, case-insensitive)
  genres?: string // Lọc theo genre _id, ví dụ: "sci-fi,action"
  cast?: string // Lọc theo tên diễn viên (regex, case-insensitive)
  status?: string // Lọc theo enum MoviesStatus (0, 1, 2)
  countries?: string // Lọc theo quốc gia, ví dụ: "USA,UK"
  release_year?: string
  sort_by?: 'release_year' | 'rating_avg' | 'created_at' // Cho phép sort theo các trường này
  sort_dir?: 'asc' | 'desc'
}

export interface CountriesRequestBody {
  countries: string
}
export interface CreateMovieReqBody {
  type: 'movie' | 'series'
  title: string
  description?: string
  url?: string // Chỉ bắt buộc nếu type là 'movie'
  poster_url?: string // Để đơn giản, ta nhận URL ảnh thay vì upload file
  backdrop_url?: string
  genres?: string[] // Mảng các ID thể loại
  countries?: string[] 
  release_year?: number
}

export interface UpdateMovieReqBody {
  title?: string
  description?: string
  url?: string // Dùng để sửa link phim lẻ
  status?: MoviesStatus
  // Các trường khác tương tự Create...
}

export interface CreateEpisodeReqBody {
  series_id: string
  episode_number: number
  title: string
  url: string // Link video của tập này
}