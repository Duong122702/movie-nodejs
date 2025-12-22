import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import Rating from '~/models/schemas/Rating.schema'

class RatingsService {
  // 1. Chấm điểm (Tạo mới hoặc Cập nhật)
  async ratingContent(user_id: string, content_id: string, score: number) {
    // Dùng updateOne với upsert: true để: Nếu chưa vote -> Tạo mới, Nếu vote rồi -> Sửa điểm
    await databaseService.rating.updateOne(
      {
        user_id: new ObjectId(user_id),
        content_id: new ObjectId(content_id)
      },
      {
        $set: {
          score: score,
          updated_at: new Date()
        },
        $setOnInsert: {
          created_at: new Date()
        }
      },
      { upsert: true }
    )

    // Quan trọng: Tính toán lại rating_avg và rating_count cho phim
    await this.updateMovieRatingStats(content_id)

    return { message: 'Đánh giá thành công' }
  }

  // 2. Lấy điểm user đã chấm
  async getUserRating(user_id: string, content_id: string) {
    const rating = await databaseService.rating.findOne({
      user_id: new ObjectId(user_id),
      content_id: new ObjectId(content_id)
    })
    return rating
  }

  // 3. Xóa đánh giá
  async deleteRating(user_id: string, content_id: string) {
    await databaseService.rating.deleteOne({
      user_id: new ObjectId(user_id),
      content_id: new ObjectId(content_id)
    })
    // Tính lại điểm sau khi xóa
    await this.updateMovieRatingStats(content_id)
    return { message: 'Xóa đánh giá thành công' }
  }

  async getRatingsByContentId({
    content_id,
    page = 1,
    limit = 10
  }: {
    content_id: string
    page: number
    limit: number
  }) {
    const skip = (page - 1) * limit
    const match = { content_id: new ObjectId(content_id) }

    const ratings = await databaseService.rating
      .aggregate([
        { $match: match },
        { $sort: { created_at: -1 } }, // Mới nhất lên đầu
        { $skip: skip },
        { $limit: limit },
        // Join User để lấy avatar/tên
        {
          $lookup: {
            from: process.env.DB_USERS_COLLECTION as string,
            localField: 'user_id',
            foreignField: '_id',
            as: 'author'
          }
        },
        { $unwind: '$author' },
        {
          $project: {
            _id: 1,
            score: 1,
            created_at: 1,
            author: {
              _id: '$author._id',
              username: '$author.username',
              avatar: '$author.avatar'
            }
          }
        }
      ])
      .toArray()

    const total = await databaseService.rating.countDocuments(match)

    return {
      ratings,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit)
    }
  }

  // --- HELPER: Tính toán lại điểm trung bình ---
  private async updateMovieRatingStats(content_id: string) {
    const id = new ObjectId(content_id)

    // Aggregation để tính trung bình
    const stats = await databaseService.rating
      .aggregate([
        { $match: { content_id: id } },
        {
          $group: {
            _id: '$content_id',
            avgScore: { $avg: '$score' },
            totalVotes: { $sum: 1 }
          }
        }
      ])
      .toArray()

    const rating_avg = stats.length > 0 ? stats[0].avgScore : 0
    const rating_count = stats.length > 0 ? stats[0].totalVotes : 0

    // Cập nhật ngược lại vào collection Content (Movies)
    await databaseService.content.updateOne(
      { _id: id },
      {
        $set: {
          rating_avg: Math.round(rating_avg * 10) / 10, // Làm tròn 1 chữ số thập phân
          rating_count: rating_count
        }
      }
    )
  }
}

const ratingsService = new RatingsService()
export default ratingsService
