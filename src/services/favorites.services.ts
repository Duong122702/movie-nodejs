import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import Favorites from '~/models/schemas/Favorites.schema'
import { FavoritesItemType } from '~/constants/enums'

class FavoritesService {
  // 1. Thêm yêu thích (Upsert - Nếu có rồi thì thôi, chưa có thì thêm)
  async addFavorite(user_id: string, item_id: string, item_type: FavoritesItemType) {
    const userId = new ObjectId(user_id)
    const itemId = item_type === FavoritesItemType.Movie ? new ObjectId(item_id) : item_id

    const result = await databaseService.favorite.updateOne(
      { userId: userId, itemId: itemId },
      {
        $setOnInsert: new Favorites({
          userId: userId,
          itemId: itemId as any,
          itemType: item_type
        })
      },
      { upsert: true }
    )

    return {
      message: result.upsertedCount > 0 ? 'Đã thêm vào yêu thích' : 'Phim này đã có trong danh sách'
    }
  }

  // 2. Xóa yêu thích
  async removeFavorite(user_id: string, item_id: string) {
    let idCodition: any = item_id
    try {
      idCodition = new ObjectId(item_id)
    } catch {
      idCodition = item_id
    }
    await databaseService.favorite.deleteOne({
      userId: new ObjectId(user_id),
      itemId: idCodition
    })
    return { message: 'Đã xóa khỏi yêu thích' }
  }

  // 3. Lấy danh sách yêu thích (Join với bảng Content để lấy tên, poster...)
  async getFavorites(user_id: string, page = 1, limit = 10, item_type: FavoritesItemType = FavoritesItemType.Movie) {
    const skip = (page - 1) * limit
    const userId = new ObjectId(user_id)

    const pipeline: any[] = [
      { $match: { userId: userId, itemType: item_type } },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]

    if (item_type === FavoritesItemType.Movie) {
      pipeline.push(
        {
          $lookup: {
            from: process.env.DB_CONTENT_COLLECTION as string,
            localField: 'itemId',
            foreignField: '_id',
            as: 'movie'
          }
        },
        { $unwind: '$movie' },
        {
          $project: {
            _id: '$movie._id',
            title: '$movie.title',
            images: '$movie.images',
            slug: '$movie.slug',
            type: '$movie.type',
            added_at: '$created_at'
          }
        }
      )
    } else if (item_type === FavoritesItemType.Actor) {
      pipeline.push(
        // 1. Lookup vào bảng Content (Movies) để tìm thông tin diễn viên
        {
          $lookup: {
            from: process.env.DB_CONTENT_COLLECTION as string,
            let: { actorName: '$itemId' }, // itemId đang lưu tên diễn viên
            pipeline: [
              // Tìm phim có chứa diễn viên này
              { $match: { $expr: { $in: ['$$actorName', '$casts.actorName'] } } },
              // Chỉ cần lấy 1 phim là đủ để lấy ảnh
              { $limit: 1 },
              // Tách mảng casts ra để lọc đúng diễn viên đó
              { $unwind: '$casts' },
              { $match: { $expr: { $eq: ['$casts.actorName', '$$actorName'] } } },
              // Chỉ lấy trường ảnh
              { $project: { _id: 0, image: '$casts.actorImage' } }
            ],
            as: 'actorInfo'
          }
        },
        // 2. Format lại dữ liệu đầu ra cho khớp với Frontend (cấu trúc images[])
        {
          $project: {
            _id: '$_id',
            title: '$itemId', // Tên diễn viên
            // Tạo mảng images giả lập để MovieCard ở Frontend đọc được
            images: [
              {
                type: 'poster',
                url: {
                  $ifNull: [
                    { $arrayElemAt: ['$actorInfo.image', 0] }, // Lấy ảnh tìm được
                    'https://via.placeholder.com/300x450?text=No+Image' // Hoặc ảnh mặc định
                  ]
                }
              }
            ],
            type: 'actor',
            added_at: '$created_at'
          }
        }
      )
    }

    const favorites = await databaseService.favorite.aggregate(pipeline).toArray()
    const total = await databaseService.favorite.countDocuments({ userId: userId, itemType: item_type })

    return {
      movies: favorites, // Frontend đang dùng key 'movies', giữ nguyên để tránh lỗi
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit)
    }
  }

  // 4. Kiểm tra trạng thái (Để hiển thị nút tim đỏ/trắng)
  async checkFavorite(user_id: string, item_id: string) {
    let idCondition: any = item_id
    try {
      idCondition = new ObjectId(item_id)
    } catch (e) {
      idCondition = item_id
    }

    const result = await databaseService.favorite.findOne({
      userId: new ObjectId(user_id),
      itemId: idCondition
    })
    return { is_favorite: Boolean(result) }
  }
}

const favoritesService = new FavoritesService()
export default favoritesService
