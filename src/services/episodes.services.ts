import { ObjectId } from "mongodb"
import databaseService from "./database.services"

class EpisodeService {
  async getEpisodeBySeasonId(seasonId: ObjectId) {
    const result = await databaseService.episode.find({season_id: seasonId}).toArray()
    return {
      results: result,
      total: result.length
    }
  }
}

const episodeServices = new EpisodeService()
export default episodeServices