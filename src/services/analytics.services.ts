// src/services/analytics.services.ts
import databaseService from './database.services'

class AnalyticsService {
  // 1. Tổng quan (Overview cards)
  async getOverview() {
    // Xác định thời gian bắt đầu của ngày hôm nay
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Xác định thời gian bắt đầu của tháng này
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const [totalUsers, usersToday, usersMonth, totalMovies, totalSeries, totalViewsAgg] = await Promise.all([
      databaseService.users.countDocuments(), // Tổng user
      databaseService.users.countDocuments({ created_at: { $gte: today } }), // User mới hôm nay
      databaseService.users.countDocuments({ created_at: { $gte: startOfMonth } }), // User mới tháng này
      databaseService.content.countDocuments({ type: 'movie' }), // Tổng phim lẻ
      databaseService.content.countDocuments({ type: 'series' }), // Tổng phim bộ
      databaseService.content
        .aggregate([
          { $group: { _id: null, total: { $sum: '$views' } } } // Tổng lượt xem (nếu field views có trong DB)
        ])
        .toArray()
    ])

    return {
      total_users: totalUsers,
      users_today: usersToday,
      users_month: usersMonth,
      total_movies: totalMovies, // Phim lẻ
      total_series: totalSeries, // Phim bộ
      total_views: totalViewsAgg[0]?.total || 0
    }
  }

  // ... (Giữ nguyên các hàm getNewUserStats, getTopContent, generateReportCSV bên dưới)
  async getNewUserStats(period: '7days' | '30days' | 'year' = '30days') {
    let startDate = new Date()

    if (period === '7days') startDate.setDate(startDate.getDate() - 7)
    else if (period === '30days') startDate.setDate(startDate.getDate() - 30)
    else if (period === 'year') startDate.setFullYear(startDate.getFullYear() - 1)

    const result = await databaseService.users
      .aggregate([
        {
          $match: {
            created_at: { $gte: startDate } // Lọc user tạo từ ngày bắt đầu
          }
        },
        {
          $group: {
            // Group theo ngày (YYYY-MM-DD)
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } } // Sắp xếp tăng dần theo ngày
      ])
      .toArray()

    return result
  }

  async getTopContent() {
    const topRated = await databaseService.content
      .find({})
      .sort({ rating_avg: -1 })
      .limit(5)
      .project({ title: 1, rating_avg: 1, poster_url: { $arrayElemAt: ['$images.url', 0] } })
      .toArray()

    const topCommented = await databaseService.comment
      .aggregate([
        {
          $group: {
            _id: '$content_id',
            comment_count: { $sum: 1 }
          }
        },
        { $sort: { comment_count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: process.env.DB_CONTENT_COLLECTION as string,
            localField: '_id',
            foreignField: '_id',
            as: 'movie'
          }
        },
        { $unwind: '$movie' },
        {
          $project: {
            title: '$movie.title',
            comment_count: 1
          }
        }
      ])
      .toArray()

    return {
      top_rated: topRated,
      top_commented: topCommented
    }
  }

  async generateReportCSV() {
    const users = await databaseService.users.find().limit(100).toArray()
    let csv = 'User ID,Email,Username,Status,Created At\n'
    users.forEach((user) => {
      csv += `${user._id},${user.email},${user.username},${user.verify},${user.created_at.toISOString()}\n`
    })
    return csv
  }
}

const analyticsService = new AnalyticsService()
export default analyticsService
