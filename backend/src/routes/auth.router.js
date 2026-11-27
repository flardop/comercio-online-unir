import { Router } from "express";
import { login, me, register, requireAuth } from '../auth.js';

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);


export default router;