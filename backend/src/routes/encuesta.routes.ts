import { Router } from "express";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middlewares";
import {
  listarEncuestas,
  obtenerEncuesta,
  crearEncuesta,
  actualizarEncuesta,
  eliminarEncuesta,
} from "../controllers/encuesta.controller";

const router = Router();

// Rutas públicas (cualquier usuario autenticado puede ver)
router.get("/", verifyToken, listarEncuestas);
router.get("/:id", verifyToken, obtenerEncuesta);

// Rutas protegidas (solo Admin, RH y Jefes pueden crear/editar/eliminar)
router.post("/", verifyToken, authorizeRoles(1, 2, 3), crearEncuesta);
router.put("/:id", verifyToken, authorizeRoles(1, 2, 3), actualizarEncuesta);
router.delete("/:id", verifyToken, authorizeRoles(1, 2, 3), eliminarEncuesta);

export default router;
