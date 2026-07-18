import type { Request, Response } from "express";
import * as PlayersModel from "../models/PlayersModel.ts";

/**
 * @function getPlayers
 * @description Obtains players from the database matching the frontend search, sorting, and pagination parameters.
 * @param req - Express Request carrying URL query strings
 * @param res - Express Response
 * @returns {Promise<void>}
 */
export const getPlayers = async (req: Request, res: Response) => {
  try {
    const queryOptions: PlayersModel.GetPlayersOptions = {};

    if (req.query.page) {
      queryOptions.page = parseInt(req.query.page as string, 10);
    }
    if (req.query.limit) {
      queryOptions.limit = parseInt(req.query.limit as string, 10);
    }
    if (req.query.search) {
      queryOptions.search = (req.query.search as string).trim();
    }
    if (req.query.sortBy) {
      queryOptions.sortBy = req.query.sortBy as string;
    }
    if (req.query.sortOrder === "ASC" || req.query.sortOrder === "DESC") {
      queryOptions.sortOrder = req.query.sortOrder;
    }

    const result = await PlayersModel.getAll(queryOptions);
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getPlayers controller pipeline:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @function getPlayerById
 * @description Obtains a specific player by their ID from the database and sends it in the response.
 * @param req, @param res 
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
export const getPlayerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const player = await PlayersModel.getById(String(id));

    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    res.status(200).json(player);
  } catch (error) {
    console.error("Error in getPlayerById:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @function createPlayer
 * @description Creates a new player in the database and sends the created player in the response.
 * @param req, @param res 
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
export const createPlayer = async (req: Request, res: Response) => {
  try {
    const playerData = req.body;
    
    // Validating required fields for player creation
    if (!playerData.player_id || !playerData.player_name) {
      return res.status(400).json({ error: "player_id and player_name are required fields." });
    }

    const newPlayer = await PlayersModel.create(playerData);
    res.status(201).json(newPlayer);
  } catch (error: any) {
    console.error("Error in createPlayer:", error);
    
    // Capturing unique constraint violation for player_id in Postgres (error code 23505)
    if (error.code === "23505") {
      return res.status(409).json({ 
        error: "Conflict", 
        details: `A player with ID '${req.body.player_id}' already exists in the database.` 
      });
    }
    
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 4. Modificar un jugador existente
/**
 * @function updatePlayer
 * @description Updates an existing player in the database and sends the updated player in the response.
 * @param req, @param res 
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
export const updatePlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedPlayer = await PlayersModel.update(String(id), req.body);

    if (!updatedPlayer) {
      return res.status(404).json({ error: `Player with ID '${id}' not found or no updates applied.` });
    }

    res.status(200).json(updatedPlayer);
  } catch (error) {
    console.error("Error in updatePlayer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @function deletePlayer
 * @description Deletes a player from the database. If the player has associated performances, it will either throw an error or delete the performances first based on the `force` query parameter.
 * @param req, @param res 
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
export const deletePlayer = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Opctional query parameter to force deletion of associated performances
    const force = req.query.force === "true";

    const success = await PlayersModel.remove(String(id), force);

    if (!success) {
      return res.status(404).json({ error: `Player with ID '${id}' not found.` });
    }

    // Code 204 No Content indicates that the request was successful but there is no content to send in the response.
    res.status(204).send();
  } catch (error: any) {
    console.error("Error in deletePlayer:", error);
    
    // FK violation error code in Postgres is 23503, which occurs when trying to delete a player that has associated performances.
    if (error.code === "23503") {
      return res.status(400).json({
        error: "Constraint Violation",
        details: `Cannot delete player '${id}' because they have recorded match performances in the database.`,
        solution: "Delete their match performance records first, or append '?force=true' to this request to delete the player along with all their match history in a secure transaction."
      });
    }
    
    res.status(500).json({ error: "Internal Server Error" });
  }
};