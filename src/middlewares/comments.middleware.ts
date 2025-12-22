import { checkSchema } from "express-validator"
import { ObjectId } from "mongodb"
import { BLACKLIST_WORDS } from "~/constants/blacklist"
import { HTTP_STATUS } from "~/constants/httpStatus"
import { COMMENT_MESSAGES } from "~/constants/messages"
import databaseService from "~/services/database.services"
import { ErrorWithStatus } from "~/utils/Errors"
import { validate } from "~/utils/validate"

export const createCommentValidator = validate(
  checkSchema({
    content: {
      in: 'body',
      notEmpty: { errorMessage: COMMENT_MESSAGES.CONTENT_IS_REQUIRED },
      isString: { errorMessage: COMMENT_MESSAGES.CONTENT_MUST_BE_STRING },
      trim: true,
      custom: {
        options: (value: string) => {
          const lowerCaseContent = value.toLowerCase().split(' ')
          const hasForbbidenWord = BLACKLIST_WORDS.some(word => lowerCaseContent.includes(word))
          if(hasForbbidenWord) {
            throw new ErrorWithStatus({
              message: COMMENT_MESSAGES.CONTENT_CONTAINS_FORBIDDEN_WORDS,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          return true
        }
      }
    },
    content_id: {
      in: 'body',
      notEmpty: { errorMessage: COMMENT_MESSAGES.CONTENT_ID_IS_REQUIRED },
      isMongoId: { errorMessage: COMMENT_MESSAGES.CONTENT_ID_INVALID },
      custom: {
        options: async (value) => {
          // Kiểm tra phim có tồn tại không
          const content = await databaseService.content.findOne({ _id: new ObjectId(value) })
          if (!content) {
            throw new ErrorWithStatus({
              message: COMMENT_MESSAGES.CONTENT_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          return true
        }
      }
    },
    parent_id: {
      in: 'body',
      optional: true, // Trường này không bắt buộc
      isMongoId: { errorMessage: COMMENT_MESSAGES.PARENT_ID_INVALID },
      custom: {
        options: async (value) => {
          if (!value) return true // Nếu null/undefined thì bỏ qua
          // Kiểm tra comment cha có tồn tại không
          const parentComment = await databaseService.comment.findOne({ _id: new ObjectId(value) })
          if (!parentComment) {
            throw new ErrorWithStatus({
              message: COMMENT_MESSAGES.PARENT_COMMENT_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          return true
        }
      }
    }
  })
)

// 2. Validate Param content_id (cho API Get Comments)
export const contentIdValidator = validate(
  checkSchema({
    content_id: {
      in: 'params',
      isMongoId: { errorMessage: COMMENT_MESSAGES.CONTENT_ID_INVALID },
      custom: {
        options: async (value) => {
          const content = await databaseService.content.findOne({ _id: new ObjectId(value) })
          if (!content) {
            throw new ErrorWithStatus({
              message: COMMENT_MESSAGES.CONTENT_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          return true
        }
      }
    }
  })
)

// 3. Validate Param comment_id (cho API Delete/Reaction)
export const commentIdValidator = validate(
  checkSchema({
    comment_id: {
      in: 'params',
      isMongoId: { errorMessage: 'Comment ID invalid' },
      custom: {
        options: async (value) => {
          const comment = await databaseService.comment.findOne({ _id: new ObjectId(value) })
          if (!comment) {
            throw new ErrorWithStatus({
              message: COMMENT_MESSAGES.COMMENT_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          return true
        }
      }
    }
  })
)