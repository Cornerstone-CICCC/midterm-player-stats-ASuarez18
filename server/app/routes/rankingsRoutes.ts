import express from "express";
import { getRankings } from "../controller/RankingsController.ts";

const router = express.Router();

/**
 * @route GET /api/rankings
 * @description Obtains the top 10 players from the database based on the specified sorting criteria (goals, assists, or rating).
 * @query {string} sortBy - The sorting criteria (goals, assists, or rating). Default is 'goals'.
 * @returns {Promise<void>} - Sends a JSON response containing the rankings or an error message.
 */
router.get("/", getRankings);

export default router;