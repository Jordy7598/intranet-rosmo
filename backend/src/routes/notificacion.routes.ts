import { Router } from "express";
import {
  getNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion,
  crearNotificacion,
  crearNotificacionMasiva,
  getContadorNoLeidas
} from "../controllers/notificacion.controller";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middlewares";

const router = Router();

// Aplicar verificación de token a todas las rutas
router.use(verifyToken);

// Rutas específicas PRIMERO
router.get("/contador", getContadorNoLeidas);
router.put("/marcar-todas-leidas", marcarTodasComoLeidas);
router.post("/masiva", authorizeRoles(1), crearNotificacionMasiva);

// Rutas generales
router.get("/", getNotificaciones);
router.post("/", authorizeRoles(1), crearNotificacion);

// Rutas con parámetros DESPUÉS
router.put("/:id/leida", marcarComoLeida);
router.delete("/:id", eliminarNotificacion);

export default router;