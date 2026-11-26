import { Router } from "express";
import {obtenerTodosLosArticulos, obtenerArticuloPorId} from "../controllers/article.controller.js";

const router = Router();


router.get("/", obtenerTodosLosArticulos);
router.get("/:id", obtenerArticuloPorId);

export default router;