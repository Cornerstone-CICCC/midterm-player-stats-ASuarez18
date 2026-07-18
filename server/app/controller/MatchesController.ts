import type { Request, Response } from "express";
import * as MatchesModel from "../models/MatchesModel.ts";

/**
 * @function getMatches
 * @description Obtains matches from the database matching frontend pagination, sorting, and search queries.
 * @param req - Express Request carrying URL query strings
 * @param res - Express Response
 * @returns {Promise<void>}
 */
export const getMatches = async (req: Request, res: Response) => {
  try {
    const queryOptions: MatchesModel.GetMatchesOptions = {};

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

    const result = await MatchesModel.getAll(queryOptions);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getMatches controller pipeline:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @function getMatchById
 * @description Obtains a specific match by its ID from the database and sends it in the response.
 * @param req, @param res 
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
export const getMatchById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const match = await MatchesModel.getById(String(id));

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.status(200).json(match);
  } catch (error) {
    console.error("Error in getMatchById:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @function createMatch
 * @description Creates a new match in the database and sends the created match in the response.
 * @param req, @param res 
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
export const createMatch = async (req: Request, res: Response) => {
  try {
    const matchData = req.body;
    
    if (!matchData.match_id) {
      return res.status(400).json({ error: "match_id is a required field." });
    }

    const newMatch = await MatchesModel.create(matchData);
    res.status(201).json(newMatch);
  } catch (error: any) {
    console.error("Error in createMatch:", error);
    
    if (error.code === "23505") { // ID duplicado
      return res.status(409).json({ 
        error: "Conflict", 
        details: `A match with ID '${req.body.match_id}' already exists in the database.` 
      });
    }
    
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 2. Modificar un partido existente
/**
 * @function updateMatch
 * @description Updates an existing match in the database and sends the updated match in the response.
 * @param req, @param res 
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
export const updateMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedMatch = await MatchesModel.update(String(id), req.body);

    if (!updatedMatch) {
      return res.status(404).json({ error: `Match with ID '${id}' not found or no updates applied.` });
    }

    res.status(200).json(updatedMatch);
  } catch (error) {
    console.error("Error in updateMatch:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @function deleteMatch
 * @description Deletes a match from the database. If the `force` query parameter is set to true, it will first delete all associated performances before deleting the match. If `force` is false, it will attempt to delete the match directly, which will fail if there are associated performances due to foreign key constraints.
 * @param req, @param res 
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
export const deleteMatch = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const force = req.query.force === "true"; // Cascade deletion if true

    const success = await MatchesModel.remove(String(id), force);

    if (!success) {
      return res.status(404).json({ error: `Match with ID '${id}' not found.` });
    }

    res.status(204).send();
  } catch (error: any) {
    console.error("Error in deleteMatch:", error);
    
    if (error.code === "23503") { // FK constraint violation
      return res.status(400).json({
        error: "Constraint Violation",
        details: `Cannot delete match '${id}' because there are player performance stats linked to this match.`,
        solution: "Remove those match performance records first, or append '?force=true' to this request to clean up this match and its performance history in one transaction."
      });
    }
    
    res.status(500).json({ error: "Internal Server Error" });
  }
};