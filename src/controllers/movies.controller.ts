import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { MOVIE_MESSAGES } from '~/constants/messages'
import { CountriesRequestBody, GenresRequestBody, IFilterMoviesQuery } from '~/models/requests/Movies.request'
import MoviesServices from '~/services/movies.services'
import { ErrorWithStatus } from '~/utils/Errors'
import { CreateMovieReqBody, UpdateMovieReqBody, CreateEpisodeReqBody } from '~/models/requests/Movies.request'

export const getGenresController = async (
  req: Request<ParamsDictionary, any, GenresRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await MoviesServices.getAllGenres()
  return res.json({
    message: MOVIE_MESSAGES.GET_GENRES_SUCCESS,
    result
  })
}

export const getCountriesController = async (
  req: Request<ParamsDictionary, any, CountriesRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await MoviesServices.getAllCountries()
  return res.json({
    message: MOVIE_MESSAGES.GET_COUNTRIES_SUCCESS,
    result
  })
}

export const getMovieDetailController = async (
  //viet request type riêng
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params
  const result = await MoviesServices.getMovieDetail(id)
  if (!result) {
    return next(
      new ErrorWithStatus({
        message: MOVIE_MESSAGES.MOVIE_NOT_FOUND, // Nhớ thêm message này vào constants
        status: HTTP_STATUS.NOT_FOUND
      })
    )
  }
  return res.json({
    message: MOVIE_MESSAGES.GET_MOVIE_DETAIL_SUCCESS,
    result
  })
}

export const createMovieController = async (req: Request<ParamsDictionary, any, CreateMovieReqBody>, res: Response) => {
  const result = await MoviesServices.createMovie(req.body)
  return res.json({ message: 'Tạo phim thành công', result })
}

export const updateMovieController = async (req: Request<ParamsDictionary, any, UpdateMovieReqBody>, res: Response) => {
  const { id } = req.params
  const result = await MoviesServices.updateMovie(id, req.body)
  return res.json({ message: 'Cập nhật phim thành công', result })
}

export const deleteMovieController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await MoviesServices.deleteMovie(id)
  return res.json(result)
}

export const createEpisodeController = async (
  req: Request<ParamsDictionary, any, CreateEpisodeReqBody>,
  res: Response
) => {
  const result = await MoviesServices.createEpisode(req.body)
  return res.json({ message: 'Thêm tập phim thành công', result })
}

export const getAllCastsController = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 20 // Mặc định lấy 20 diễn viên mỗi trang
  const name = req.query.name as string

  const result = await MoviesServices.getAllCasts({ page, limit, name })

  return res.json({
    message: 'Lấy danh sách diễn viên thành công',
    result
  })
}

export const getListMoviesController = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const title = req.query.title as string
  const cast = req.query.cast as string // Lấy tham số cast từ URL

  // Xử lý mảng (như cũ)
  let genres = req.query.genres as string | string[]
  if (typeof genres === 'string' && genres.includes(',')) genres = genres.split(',')
  else if (typeof genres === 'string') genres = [genres]

  let country = req.query.country as string | string[]
  if (typeof country === 'string' && country.includes(',')) country = country.split(',')
  else if (typeof country === 'string') country = [country]

  // --- MỚI: LẤY THAM SỐ SORT VÀ YEAR ---
  const year = Number(req.query.year) // Lấy năm (VD: 2024)
  const sort_by = req.query.sort_by as string // VD: 'view', 'year', 'rating'
  const order = req.query.order as string // 'asc' (tăng) hoặc 'desc' (giảm)

  const type = req.query.type as string

  const result = await MoviesServices.getListMovies({
    page,
    limit,
    title,
    cast,
    genres: genres as string[],
    country: country as string[],
    year, // Truyền năm
    sort_by, // Truyền tiêu chí sort
    order, // Truyền thứ tự sort
    type
  })

  //console.log(result)
  return res.json({
    message: 'Lấy danh sách phim thành công',
    result
  })
}
