import { Router } from "express";
import { obtenerUsuarioPorId } from "../controllers/user.controller.js";

const router = Router();

router.get("/:id", obtenerUsuarioPorId);

export default router;