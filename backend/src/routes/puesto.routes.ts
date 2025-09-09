import { Router } from "express";
import { getPuestos, createPuesto } from "../controllers/puesto.controller";
import { verifyToken } from "../middlewares/auth.middlewares";

const router = Router();
router.use(verifyToken);


router.get("/", getPuestos);
router.post("/", createPuesto);

export default router;
