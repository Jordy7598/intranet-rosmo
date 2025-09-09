import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller";
import { verifyToken } from "../middlewares/auth.middlewares";

const router = Router();

router.get("/", verifyToken, getDashboard);

export default router;
