import { Router } from "express";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middlewares";
import { listDirectory, getEmployeeById } from "../controllers/directorio.controller";

const router = Router();
/** Acceso para todos los roles autenticados (1..5) */
router.get("/", verifyToken, authorizeRoles(1,2,3,4,5), listDirectory);
router.get("/:id", verifyToken, authorizeRoles(1,2,3,4,5), getEmployeeById);

export default router;
