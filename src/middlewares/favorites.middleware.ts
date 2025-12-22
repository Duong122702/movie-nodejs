import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validate'
import { ObjectId } from 'mongodb'
import databaseService from '~/services/database.services'
import { ErrorWithStatus } from '~/utils/Errors'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { FavoritesItemType } from '~/constants/enums'

export const addFavoriteValidator = validate(
  checkSchema({
    item_id: {
      in: 'body',

      custom: {
        options: async (value, { req }) => {
          const type = req.body.item_type

          // Nếu là Movie (0), check trong collection Content
          if (type === FavoritesItemType.Movie) {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({ message: 'Movie ID không hợp lệ', status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
            }

            const movie = await databaseService.content.findOne({ _id: new ObjectId(value) })
            if (!movie) {
              throw new ErrorWithStatus({ message: 'Phim không tồn tại', status: HTTP_STATUS.NOT_FOUND })
            }
          }
          if (type === FavoritesItemType.Actor) {
            if (typeof value !== 'string' || value.trim() === '') {
              throw new ErrorWithStatus({
                message: 'Tên diễn viên không hợp lệ',
                status: HTTP_STATUS.UNPROCESSABLE_ENTITY
              })
            }
            // Tùy chọn: Bạn có thể check xem diễn viên có tồn tại trong list phim không nếu muốn strict hơn
          }
          // Nếu là Actor/Director thì check collection khác (nếu có)

          return true
        }
      }
    },
    item_type: {
      in: 'body',
      isInt: {
        errorMessage: 'Item Type phải là số nguyên (0: Movie, 1: Actor...)'
      }
    }
  })
)
