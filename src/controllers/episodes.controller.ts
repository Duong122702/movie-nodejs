import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import episodeServices from "~/services/episodes.services";

export const getEpisodeBySeasonId = async (req: Request, res: Response) => {
  try {
    const { seasonId} = req.params
    const result = await episodeServices.getEpisodeBySeasonId(new ObjectId(seasonId))    
    return res.json({
      message: "Get episode by season id successfully",
      result
    })
  } catch (error) {
    return res.status(HttpStatusCode.InternalServerError).json({
      message: ""
    })
  }
}