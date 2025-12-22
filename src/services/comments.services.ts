import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import Comment from '~/models/schemas/Comment.schema'
import Reaction from '~/models/schemas/Reaction.schema'
import { CreateCommentReqBody } from '../models/requests/comments.request'

class CommentsService {
  // 1. Tạo bình luận
  async createComment(user_id: string, payload: CreateCommentReqBody) {
    const comment = new Comment({
      user_id: new ObjectId(user_id),
      content_id: new ObjectId(payload.content_id),
      parent_id: payload.parent_id ? new ObjectId(payload.parent_id) : null,
      content: payload.content
    })
    
    // Nếu là reply, có thể cần tăng biến đếm reply ở comment cha (tùy logic)
    
    const result = await databaseService.comment.insertOne(comment)
    
    // Trả về comment vừa tạo kèm thông tin user để frontend hiển thị ngay
    const fullComment = await this.getCommentById(result.insertedId.toString())
    return fullComment
  }

  // 2. Lấy danh sách bình luận (Có phân trang & Join User)
  async getCommentsByContentId({ content_id, page = 1, limit = 10 }: { content_id: string, page: number, limit: number }) {
    const skip = (page - 1) * limit
    
    // Chỉ lấy comment gốc (parent_id = null) trước, reply sẽ load sau hoặc load lồng nhau tùy UI
    const match: any = {
      content_id: new ObjectId(content_id),
      parent_id: null 
    }

    const comments = await databaseService.comment.aggregate([
      { $match: match },
      { $sort: { created_at: -1 } }, // Mới nhất lên đầu
      { $skip: skip },
      { $limit: limit },
      // Join với User để lấy thông tin người comment
      {
        $lookup: {
          from: process.env.DB_USERS_COLLECTION as string,
          localField: 'user_id',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' },
      // Join để lấy danh sách reply (Optional: Nếu muốn hiện luôn reply)
      {
        $lookup: {
          from: process.env.DB_COMMENT_COLLECTION as string,
          let: { comment_id: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$parent_id', '$$comment_id'] } } },
            { $sort: { created_at: 1 } }, // Reply cũ nhất lên đầu
            // Join User cho reply
            {
              $lookup: {
                from: process.env.DB_USERS_COLLECTION as string,
                localField: 'user_id',
                foreignField: '_id',
                as: 'reply_author'
              }
            },
            { $unwind: '$reply_author' },
            {
              $project: {
                _id: 1,
                content: 1,
                created_at: 1,
                author: { username: '$reply_author.username', avatar: '$reply_author.avatar' }
              }
            }
          ],
          as: 'replies'
        }
      },
      {
        $project: {
          _id: 1,
          content: 1,
          reaction_counts: 1,
          created_at: 1,
          author: { _id: '$author._id', username: '$author.username', avatar: '$author.avatar' },
          replies: 1
        }
      }
    ]).toArray()

    const total = await databaseService.comment.countDocuments(match)

    return {
      comments,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit)
    }
  }

  // 3. Reaction (Like/Unlike)
  async reactionComment(user_id: string, comment_id: string) {
    const commentId = new ObjectId(comment_id)
    const userId = new ObjectId(user_id)
    
    // Kiểm tra xem đã like chưa
    const existingReaction = await databaseService.reaction.findOne({
      user_id: userId,
      comment_id: commentId
    })

    if (existingReaction) {
      // Nếu có rồi -> Unlike (Xóa reaction & Giảm count)
      await Promise.all([
        databaseService.reaction.deleteOne({ _id: existingReaction._id }),
        databaseService.comment.updateOne(
          { _id: commentId },
          { $inc: { 'reaction_counts.like': -1 } } // Giả sử key là 'like'
        )
      ])
      return { message: 'Unlike thành công', active: false }
    } else {
      // Nếu chưa -> Like (Tạo reaction & Tăng count)
      await Promise.all([
        databaseService.reaction.insertOne(
          new Reaction({
            user_id: userId,
            comment_id: commentId,
            reaction_type: 'like'
          })
        ),
        databaseService.comment.updateOne(
          { _id: commentId },
          { $inc: { 'reaction_counts.like': 1 } }
        )
      ])
      return { message: 'Like thành công', active: true }
    }
  }
  
  // Helper lấy 1 comment full info (để trả về sau khi create/update)
  private async getCommentById(id: string) {
      const result = await databaseService.comment.aggregate([
      // 1. Tìm đúng comment theo _id
      { 
        $match: { 
          _id: new ObjectId(id) 
        } 
      },
      // 2. Join User để lấy thông tin người post (author)
      {
        $lookup: {
          from: process.env.DB_USERS_COLLECTION as string,
          localField: 'user_id',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' }, // Gỡ mảng author thành object
      
      // 3. Join lấy các replies (trả lời) của comment này
      {
        $lookup: {
          from: process.env.DB_COMMENT_COLLECTION as string,
          let: { comment_id: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$parent_id', '$$comment_id'] } } },
            { $sort: { created_at: 1 } }, // Reply cũ xếp trên
            // Join User cho từng reply
            {
              $lookup: {
                from: process.env.DB_USERS_COLLECTION as string,
                localField: 'user_id',
                foreignField: '_id',
                as: 'reply_author'
              }
            },
            { $unwind: '$reply_author' },
            {
              $project: {
                _id: 1,
                content: 1,
                created_at: 1,
                // Format lại author của reply cho gọn
                author: { 
                  _id: '$reply_author._id',
                  username: '$reply_author.username', 
                  avatar: '$reply_author.avatar' 
                }
              }
            }
          ],
          as: 'replies'
        }
      },
      // 4. Định dạng dữ liệu đầu ra (Projection)
      {
        $project: {
          _id: 1,
          content: 1,
          content_id: 1,
          parent_id: 1,
          reaction_counts: 1,
          created_at: 1,
          updated_at: 1,
          author: { 
            _id: '$author._id', 
            username: '$author.username', 
            avatar: '$author.avatar' 
          },
          replies: 1
        }
      }
    ]).toArray()

    // Trả về phần tử đầu tiên hoặc null
    return result[0] || null
  }
}

const commentsService = new CommentsService()
export default commentsService