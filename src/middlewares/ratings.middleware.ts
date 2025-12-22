import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validate'
import { ObjectId } from 'mongodb'
import databaseService from '~/services/database.services'
import { ErrorWithStatus } from '~/utils/Errors'
import { HTTP_STATUS } from '~/constants/httpStatus'

export const ratingValidator = validate(
  checkSchema({
    content_id: {
      in: 'body',
      isMongoId: { errorMessage: 'Content ID không hợp lệ' },
      custom: {
        options: async (value) => {
          const movie = await databaseService.content.findOne({ _id: new ObjectId(value) })
          if (!movie) {
            throw new ErrorWithStatus({ message: 'Không tìm thấy phim', status: HTTP_STATUS.NOT_FOUND })
          }
          return true
        }
      }
    },
    score: {
      in: 'body',
      isInt: {
        options: { min: 1, max: 10 },
        errorMessage: 'Điểm số phải là số nguyên từ 1 đến 10'
      }
    }
  })
)