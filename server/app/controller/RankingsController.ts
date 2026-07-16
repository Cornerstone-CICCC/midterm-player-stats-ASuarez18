import type { Request, Response } from "express";
import * as RankingsModel from "../models/RankingsModel.ts";

/**
 * @function getRankings
 * @description Handles the request to obtain the top 10 players from the database based on the specified sorting criteria (goals, assists, or rating).
 * @param req, @param res 
 * @returns {Promise<void>} - Sends a JSON response containing the rankings or an error message.
 */
export const getRankings = async (req: Request, res: Response) => {
  try {
    // Tomamos el criterio de ordenamiento del query string (por defecto 'goals')
    const sortBy = ((req.query.sortBy as string) || "goals").toLowerCase();

    if (sortBy !== "goals" && sortBy !== "assists" && sortBy !== "rating") {
      return res
        .status(400)
        .json({
          error:
            "Invalid sortBy parameter. Use 'goals', 'assists', or 'rating'.",
        });
    }

    const rankings = await RankingsModel.getLeaderboard(sortBy);
    res.status(200).json(rankings);
  } catch (error) {
    console.error("Error in getRankings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
