import { Router } from "express";
import { login, register } from "../controllers/auth.controller";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middlewares";

const router = Router();
/**
 * Roles (por número):
 * 1 = Administrador
 * 2 = Talento Humano
 * 3 = Jefe
 * 4 = Empleado
 * 5 = Mercadeo
 */

router.post("/login", login);
router.post(
  "/register", verifyToken, authorizeRoles(1, 2), register
);

export default router;
