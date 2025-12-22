import { Router } from 'express'
import {
  getAllCastsController,
  getCountriesController,
  getGenresController,
  getListMoviesController,
  getMovieDetailController
} from '~/controllers/movies.controller'
import { movieIdValidator } from '~/middlewares/movies.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
import {
  createMovieController,
  updateMovieController,
  deleteMovieController,
  createEpisodeController
} from '~/controllers/movies.controller'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { isAdminValidator } from '~/middlewares/users.middlewares'
import { getSeasonByMovieIdController } from '~/controllers/seasons.controller'
import { getEpisodeBySeasonId } from '~/controllers/episodes.controller'

const moviesRouter = Router()

moviesRouter.get('/genres', wrapRequestHandler(getGenresController))
moviesRouter.get('/', wrapRequestHandler(getListMoviesController))
moviesRouter.get('/countries', wrapRequestHandler(getCountriesController))
moviesRouter.get('/casts', wrapRequestHandler(getAllCastsController))
moviesRouter.get('/:id', movieIdValidator, wrapRequestHandler(getMovieDetailController))

moviesRouter.post('/', accessTokenValidator, isAdminValidator, wrapRequestHandler(createMovieController))
moviesRouter.patch('/:id', accessTokenValidator, isAdminValidator, wrapRequestHandler(updateMovieController))
moviesRouter.delete('/:id', accessTokenValidator, isAdminValidator, wrapRequestHandler(deleteMovieController))
moviesRouter.get('/seasons/:movieId', wrapRequestHandler(getSeasonByMovieIdController))
moviesRouter.get('/seasons/:seasonId/episodes', wrapRequestHandler(getEpisodeBySeasonId))

// API Thêm tập phim (cho Series)
moviesRouter.post('/episodes', accessTokenValidator, isAdminValidator, wrapRequestHandler(createEpisodeController))
export default moviesRouter
