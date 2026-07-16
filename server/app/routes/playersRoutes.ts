import express from "express";
import {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from "../controller/PlayersController.ts";

const router = express.Router();

/**
 * @route GET /api/players
 * @description Obtains all players from the database and sends them in the response.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
router.get("/", getPlayers);

/**
 * @route GET /api/players/:id
 * @description Obtains a specific player by their ID from the database and sends it in the response.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
router.get("/:id", getPlayerById);

/**
 * @route POST /api/players
 * @description Creates a new player in the database and sends the created player in the response.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
router.post("/", createPlayer);

/**
 * @route PUT /api/players/:id
 * @description Updates an existing player in the database and sends the updated player in the response.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
router.put("/:id", updatePlayer);

/**
 * @route DELETE /api/players/:id
 * @description Deletes a player from the database. If the player has associated performances, it will either throw an error or delete the performances first based on the `force` query parameter.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
router.delete("/:id", deletePlayer);

export default router;