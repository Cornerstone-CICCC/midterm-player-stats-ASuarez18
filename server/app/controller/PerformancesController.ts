import type { Request, Response } from "express";
import * as PerformancesModel from "../models/PerformancesModel.ts";

export const getPerformances = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 25;
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string;
    const sortOrder = (req.query.sortOrder as string || 'DESC').toUpperCase() as 'ASC' | 'DESC';

    const result = await PerformancesModel.getAllPaginated({
      page,
      limit,
      search,
      sortBy,
      sortOrder
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getPerformances:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPerformanceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const performance = await PerformancesModel.getById(Number(id));

    if (!performance) {
      return res.status(404).json({ error: "Performance record not found" });
    }

    res.status(200).json(performance);
  } catch (error) {
    console.error("Error in getPerformanceById:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createPerformance = async (req: Request, res: Response) => {
  try {
    const performanceData = req.body;
    
    if (!performanceData.player_id || !performanceData.match_id) {
      return res.status(400).json({ error: "player_id and match_id are required" });
    }

    const newPerformance = await PerformancesModel.create(performanceData);
    res.status(201).json(newPerformance);
  } catch (error: any) {
    console.error("Error in createPerformance:", error);
    if (error.code === '23505') { // Código de Postgres para Unique Violation
      return res.status(409).json({ error: "A performance record already exists for this player in this match." });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updatePerformance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedPerformance = await PerformancesModel.update(Number(id), req.body);

    if (!updatedPerformance) {
      return res.status(404).json({ error: "Performance record not found" });
    }

    res.status(200).json(updatedPerformance);
  } catch (error) {
    console.error("Error in updatePerformance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deletePerformance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await PerformancesModel.remove(Number(id));

    if (!success) {
      return res.status(404).json({ error: "Performance record not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error in deletePerformance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};