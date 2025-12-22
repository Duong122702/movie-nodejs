// src/middlewares/movies.middlewares.ts
import { checkSchema } from 'express-validator'
import { MOVIE_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validate'

export const movieIdValidator = validate(
  checkSchema({
    id: {
      in: 'params',
      isMongoId: {
        errorMessage: MOVIE_MESSAGES.MOVIE_NOT_FOUND // Hoặc message "Invalid ID"
      }
    }
  })
)