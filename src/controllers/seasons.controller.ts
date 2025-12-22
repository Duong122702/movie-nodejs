import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { SEASON_MESSAGES } from "~/constants/messages";
import SeasonsServices from "~/services/seasons.services";
import { ErrorWithStatus } from "~/utils/Errors";

export const getSeasonByMovieIdController = async (req: Request, res: Response, next: NextFunction) => {
  const { movieId} = req.params
  const result = await SeasonsServices.getSeasonByMovieId(new ObjectId(movieId))
  if(!result) {
    throw new ErrorWithStatus({
      message: "Season not found",
      status: HttpStatusCode.NotFound
    })
  }
  return res.json({
    message: SEASON_MESSAGES.GET_SEASON_BY_MOVIE_ID_SUCCESS,
    result
  })
}