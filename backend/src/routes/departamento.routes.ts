import { Router } from "express";
import { getDepartamentos } from "../controllers/departamento.controller";
import { verifyToken } from "../middlewares/auth.middlewares";

const router = Router();

router.use(verifyToken); // proteger rutas
router.get("/", getDepartamentos);

export default router;
