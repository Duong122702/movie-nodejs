import express from 'express'
import databaseService from '~/services/database.services'
import usersRouter from './routes/users.routes'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import cors, { CorsOptions } from 'cors'
import moviesRouter from './routes/movies.routes'
import analyticsRouter from './routes/analytics.routes'
import ratingsRouter from './routes/ratings.routes'
import commentsRouter from './routes/comments.routes'
import favoritesRouter from './routes/favorites.routes'
databaseService.connect()
const app = express()
const port = 4000

app.use(express.json())
const corsOption: CorsOptions = {
  origin: (origin, callback) => {
    // Cho phép Postman, Server-to-Server (không có origin)
    if (!origin) {
      return callback(null, true)
    }

    // Cho phép Localhost HOẶC bất kỳ link nào có đuôi .vercel.app
    if (origin.includes('localhost') || origin.endsWith('.vercel.app')) {
      callback(null, true)
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`))
    }
  },
  optionsSuccessStatus: 200,
  credentials: true // 3. FIX LỖI CHÍNH TẢ: Phải viết thường chữ 'c'
}
app.use(cors(corsOption))
app.use('/users', usersRouter)
app.use('/movies', moviesRouter)
app.use('/analytics', analyticsRouter)
app.use('/comments', commentsRouter)
app.use('/ratings', ratingsRouter)
app.use('/favorites', favoritesRouter)
// Default Error handler
app.use(defaultErrorHandler)
app.listen(port, () => {
  console.log(`${port}`)
})
