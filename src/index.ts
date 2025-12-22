import express from 'express'
import databaseService from '~/services/database.services'
import usersRouter from './routes/users.routes'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import cors from 'cors'
import moviesRouter from './routes/movies.routes'
import analyticsRouter from './routes/analytics.routes'
import ratingsRouter from './routes/ratings.routes'
import commentsRouter from './routes/comments.routes'
import favoritesRouter from './routes/favorites.routes'
databaseService.connect()
const app = express()
const port = 4000

app.use(express.json())
const allowedOrigins = ['http://localhost:3000', 'https://movie-website-a6g6j6l95-duong122702s-projects.vercel.app/']
const corsOption = {
  origin: allowedOrigins,
  optionsSuccessStatus: 200,
  Credentials: true
}
app.use(cors(corsOption))
app.use('/users', cors(corsOption), usersRouter)
app.use('/movies', cors(corsOption), moviesRouter)
app.use('/analytics', cors(corsOption), analyticsRouter)
app.use('/comments', cors(corsOption), commentsRouter)
app.use('/ratings', cors(corsOption), ratingsRouter)
app.use('/favorites', cors(corsOption), favoritesRouter)
// Default Error handler
app.use(defaultErrorHandler)
app.listen(port, () => {
  console.log(`${port}`)
})
