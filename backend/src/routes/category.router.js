import { Router } from "express";
import { obtenerCategorias, obtenerCategoriaPorId } from "../controllers/category.controller.js";

const router = Router();

router.get("/", obtenerCategorias);
router.get("/:id", obtenerCategoriaPorId);

export default router;