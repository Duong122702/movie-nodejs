import { Collection, Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { Content } from '~/models/schemas/Movies.schema'
import Season from '~/models/schemas/Seasons.schema'
import Episode from '~/models/schemas/Episode.schema'
import Reaction from '~/models/schemas/Reaction.schema'
import Comment from '~/models/schemas/Comment.schema'
import Rating from '~/models/schemas/Rating.schema'
import Favorites from '~/models/schemas/Favorites.schema'
dotenv.config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@moviecinema.iyhraom.mongodb.net/?retryWrites=true&w=majority&appName=MovieCinema`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    // eslint-disable-next-line no-useless-catch
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      throw error
    }
  }
  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }
  get content(): Collection<Content> {
    return this.db.collection(process.env.DB_CONTENT_COLLECTION as string)
  }
  get seasons(): Collection<Season> {
    return this.db.collection(process.env.DB_SEASON_COLLECTION as string)
  }
  get episode(): Collection<Episode> {
    return this.db.collection(process.env.DB_EPISODE_COLLECTION as string)
  }
  get reaction() : Collection<Reaction> {
    return this.db.collection(process.env.DB_REACTION_COLLECTION as string)
  }
  get comment() : Collection<Comment> {
    return this.db.collection(process.env.DB_COMMENT_COLLECTION as string)
  }
  get rating() : Collection<Rating> {
    return this.db.collection(process.env.DB_RATING_COLLECTION as string)
  }
  get favorite() : Collection<Favorites> {
    return this.db.collection(process.env.DB_FAVORITE_COLLECTION as string)
  }
}
const databaseService = new DatabaseService()
export default databaseService
