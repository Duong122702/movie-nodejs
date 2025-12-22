import {
  CreateEpisodeReqBody,
  CreateMovieReqBody,
  GenresRequestBody,
  IFilterMoviesQuery,
  UpdateMovieReqBody
} from '~/models/requests/Movies.request'
import databaseService from './database.services'
import { Filter, ObjectId, Sort } from 'mongodb'
import { Content, Movie } from '~/models/schemas/Movies.schema'
import { MoviesStatus } from '~/constants/enums'
import Episode from '~/models/schemas/Episode.schema'

class MoviesService {
  async getAllGenres() {
    const result = await databaseService.content
      .aggregate([
        {
          $unwind: '$genres'
        },
        {
          $group: {
            _id: '$genres._id',
            name: { $first: '$genres.name' }
          }
        },
        {
          $sort: { name: 1 }
        }
      ])
      .toArray()
    return result
  }
  async getListMovies({
    page,
    limit,
    title,
    cast,
    genres,
    country,
    year,
    sort_by,
    order,
    type
  }: {
    page: number
    limit: number
    title?: string
    cast?: string
    genres?: string[]
    country?: string[]
    year?: number
    sort_by?: string
    order?: string
    type?: string
  }) {
    const skip = (page - 1) * limit

    // ==========================================
    // 1. XÂY DỰNG ĐIỀU KIỆN LỌC ($match)
    // ==========================================
    const matchStage: any = {}

    // 1.1 Tìm theo tên
    if (title) {
      matchStage.$or = [
        { title: { $regex: title, $options: 'i' } }, // Tìm trong tên phim (gần đúng, không phân biệt hoa thường)
        { 'casts.actorName': { $regex: title, $options: 'i' } } // Tìm trong danh sách diễn viên của phim đó
      ]
    }

    if (cast) {
      // Tìm chính xác phim có chứa diễn viên tên này (không phân biệt hoa thường)
      matchStage['casts.actorName'] = { $regex: cast, $options: 'i' }
    }

    // 1.2 Lọc theo Type (movie/series)
    // Chỉ lọc nếu type hợp lệ và không phải 'all'
    if (type && (type === 'movie' || type === 'series')) {
      matchStage.type = type
    }
    // 1.3 Lọc theo Genres & Country (Mảng)
    if (genres && genres.length > 0) matchStage['genres._id'] = { $in: genres }
    if (country && country.length > 0) matchStage['countries'] = { $in: country }

    // 1.3 LỌC THEO NĂM (Đơn lẻ)
    if (year) {
      matchStage.$expr = {
        $eq: [{ $year: '$release_year' }, year]
      }
    }

    // ==========================================
    // 2. XÂY DỰNG ĐIỀU KIỆN SẮP XẾP ($sort)
    // ==========================================
    let sortStage: any = { release_year: -1, _id: -1 } // Mặc định: Mới nhất trước

    const sortOrder = order === 'asc' ? 1 : -1 // 1 là tăng dần, -1 là giảm dần

    if (sort_by === 'rating_avg') {
      // Sắp xếp theo điểm đánh giá
      sortStage = { rating_avg: sortOrder, _id: -1 }
    } else if (sort_by === 'release_year') {
      // Sắp xếp theo năm phát hành
      sortStage = { release_year: sortOrder, _id: -1 }
    } else if (sort_by === 'created_at') {
      sortStage = { created_at: sortOrder, _id: -1 }
    }
    // Nếu không truyền sort_by, giữ mặc định (Mới nhất)

    // ==========================================
    // 3. THỰC HIỆN QUERY
    // ==========================================
    const result = await databaseService.content
      .aggregate([
        { $match: matchStage }, // Bước 1: Lọc
        { $sort: sortStage }, // Bước 2: Sắp xếp (Quan trọng: Sort trước khi Skip/Limit)
        {
          $facet: {
            movies: [
              { $skip: skip },
              { $limit: limit },
              {
                $project: {
                  title: 1,
                  original_title: 1,
                  images: 1,
                  release_year: 1,
                  genres: 1,
                  countries: 1,
                  slug: 1,
                  rating_avg: 1, // Nhớ lấy thêm trường này để hiển thị
                  type: 1,
                  latest: 1,
                  casts: 1,
                  runtime_minutes: 1
                }
              }
            ],
            totalCount: [{ $count: 'count' }]
          }
        }
      ])
      .toArray()

    const movies = result[0].movies
    const total = result[0].totalCount[0]?.count || 0

    return {
      movies,
      pagination: {
        page,
        limit,
        total_pages: Math.ceil(total / limit),
        total_items: total
      }
    }
  }
  async getAllCountries() {
    const result = await databaseService.content
      .aggregate([
        {
          $unwind: '$countries'
        },
        {
          $group: {
            _id: '$countries'
          }
        },
        {
          $project: {
            // Định dạng lại output
            _id: 0,
            name: '$_id'
          }
        },
        {
          $sort: { name: 1 }
        }
      ])
      .toArray()
    return result
  }
  async getMovieDetail(id: string) {
    const movie = await databaseService.content.findOne({
      _id: new ObjectId(id)
    })

    return movie
  }

  async getAllCasts({ page = 1, limit = 20, name }: { page: number; limit: number; name?: string }) {
    const skip = (page - 1) * limit

    const pipeline: any[] = [
      // 1. Chỉ lấy những phim có info diễn viên
      { $match: { casts: { $exists: true, $ne: [] } } },
      // 2. Tách mảng casts ra
      { $unwind: '$casts' }
    ]

    // --- MỚI: NẾU CÓ TÊN THÌ LỌC NGAY TẠI ĐÂY ---
    if (name) {
      pipeline.push({
        $match: {
          'casts.actorName': { $regex: name, $options: 'i' }
        }
      })
    }
    // ---------------------------------------------

    pipeline.push(
      // 3. Gom nhóm theo tên diễn viên
      {
        $group: {
          _id: '$casts.actorName',
          name: { $first: '$casts.actorName' },
          image: { $first: '$casts.actorImage' },
          movie_count: { $sum: 1 }
        }
      },
      // 4. Sắp xếp
      { $sort: { name: 1 } },
      // 5. Phân trang
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }]
        }
      }
    )

    const result = await databaseService.content.aggregate(pipeline).toArray()
    const casts = result[0].data
    const total = result[0].totalCount[0]?.count || 0

    return {
      casts,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    }
  }
  // 1. Thêm phim mới (Movie hoặc Series)
  async createMovie(payload: CreateMovieReqBody) {
    // Tách các trường cần thiết
    const { type, title, url, poster_url, backdrop_url, genres, countries } = payload

    // Tạo object hình ảnh
    const images = []
    if (poster_url) images.push({ type: 'poster', url: poster_url })
    if (backdrop_url) images.push({ type: 'backdrop', url: backdrop_url })

    // Xử lý Genres (Convert string ID sang Object ID nếu cần, ở đây giả sử lưu mảng object như schema cũ)
    // Lưu ý: Để code chạy ngay, tôi sẽ fake cấu trúc IGenre. Bạn nên query DB để lấy name chính xác.
    const genresMapped = (genres || []).map((g) => ({ _id: g, name: 'Unknown' }))

    const result = await databaseService.content.insertOne(
      new Movie({
        // Dùng class Movie cho cả 2, nhưng Series sẽ ignore trường url
        type: type,
        title: title,
        original_title: title, // Tạm lấy giống title
        slug: title.split(' ').join('-').toLowerCase(), // Slug đơn giản
        description: payload.description || '',
        url: type === 'movie' ? url || '' : '', // Nếu là Movie thì lưu URL, Series thì bỏ trống
        images: images as any,
        genres: genresMapped as any,
        countries: countries || [],
        status: MoviesStatus.Ongoing,
        runtime_minutes: 0,
        release_date: new Date().toISOString(),
        // Các trường khác của Series
        latest: { season_number: 1, episode_number: 0 }
      } as any)
    )
    return result
  }

  // 2. Sửa phim (Thông tin chung & URL phim lẻ)
  async updateMovie(id: string, payload: UpdateMovieReqBody) {
    const updateData: any = { ...payload, updated_at: new Date() }

    // Nếu có sửa URL, updateData.url sẽ tự cập nhật

    const result = await databaseService.content.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  }

  // 3. Xóa phim
  async deleteMovie(id: string) {
    // Xóa phim trong collection Content
    await databaseService.content.deleteOne({ _id: new ObjectId(id) })
    // Tiện tay xóa luôn các tập phim liên quan (nếu là series)
    await databaseService.episode.deleteMany({ series_id: new ObjectId(id) })
    return { message: 'Xóa phim thành công' }
  }

  // 4. Thêm tập phim (Dành riêng cho Series)
  async createEpisode(payload: CreateEpisodeReqBody) {
    const { series_id, episode_number, title, url } = payload

    // Insert vào collection Episode
    const result = await databaseService.episode.insertOne(
      new Episode({
        series_id: new ObjectId(series_id),
        season_id: new ObjectId(), // Fake season ID nếu không quản lý season
        episode_number: Number(episode_number),
        title: title,
        url: url, // Đây là URL quan trọng của tập phim
        runtime_minutes: 0
      })
    )

    // Cập nhật lại thông tin "Tập mới nhất" cho Series cha
    await databaseService.content.updateOne(
      { _id: new ObjectId(series_id) },
      {
        $set: {
          'latest.episode_number': Number(episode_number),
          updated_at: new Date()
        }
      }
    )

    return result
  }
}

const MoviesServices = new MoviesService()
export default MoviesServices
