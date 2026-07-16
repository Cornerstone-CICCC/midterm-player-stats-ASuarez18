import express from "express";
import {
  getPerformances,
  getPerformanceById,
  createPerformance,
  updatePerformance,
  deletePerformance,
} from "../controller/PerformancesController.ts";

const router = express.Router();

// GET /api/performances - Listado con paginación, filtros y búsqueda
router.get("/", getPerformances);

// GET /api/performances/:id - Detalle de un rendimiento específico para edición
router.get("/:id", getPerformanceById);

// POST /api/performances - Crear un nuevo rendimiento ("Add Performance")
router.post("/", createPerformance);

// PUT /api/performances/:id - Actualizar rendimiento existente ("Update Performance")
router.put("/:id", updatePerformance);

// DELETE /api/performances/:id - Eliminar rendimiento ("Delete")
router.delete("/:id", deletePerformance);

export default router;