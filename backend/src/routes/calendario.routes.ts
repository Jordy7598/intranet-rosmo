import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middlewares";
import { getCalendario } from "../controllers/calendario.controller";

const router = Router();
// GET /api/calendario?year=2025&month=10&view=usuario
router.get("/", verifyToken, getCalendario);
export default router;
 