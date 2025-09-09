import { Router } from "express";
import {
  getEmpleados,
  getEmpleadoById,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado
} from "../controllers/empleado.controller";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middlewares";

const router = Router();

// Aplicar middleware de autenticación a todas
router.use(verifyToken);

// GET
router.get("/", getEmpleados); 
router.get("/:id", getEmpleadoById);

// POST
router.post("/", authorizeRoles(1), createEmpleado); // Solo admins (rol 1)
router.put("/:id", authorizeRoles(1), updateEmpleado);
router.delete("/:id", authorizeRoles(1), deleteEmpleado);

export default router;
