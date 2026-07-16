import express from "express";
import {
  getMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch
} from "../controller/MatchesController.ts";

const router = express.Router();

/**
 * @route GET /api/matches
 * @description Obtains all matches from the database.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
router.get("/", getMatches);

/**
 * @route GET /api/matches/:id
 * @description Obtains a specific match by its ID from the database.
 * @param {string} id - The ID of the match to retrieve.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
router.get("/:id", getMatchById);

/**
 * @route POST /api/matches
 * @description Creates a new match in the database.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
router.post("/", createMatch);

/**
 * @route PUT /api/matches/:id
 * @description Updates an existing match in the database.
 * @param {string} id - The ID of the match to update.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
router.put("/:id", updateMatch);

/**
 * @route DELETE /api/matches/:id
 * @description Deletes a match from the database. If the `force` query parameter is set to true, it will first delete all associated performances before deleting the match. If `force` is false, it will attempt to delete the match directly, which will fail if there are associated performances due to foreign key constraints.
 * @param {string} id - The ID of the match to delete.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
router.delete("/:id", deleteMatch);

export default router;