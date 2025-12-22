import { ObjectId } from "mongodb";
import databaseService from "./database.services";

class SeasonsService {
  async getSeasonByMovieId(movieId: ObjectId) {
    const result = await databaseService.seasons.find({series_id: movieId}).toArray();
    return {
      results: result,
      total: result.length
    }
  }
}

const SeasonsServices = new SeasonsService();
export default SeasonsServices