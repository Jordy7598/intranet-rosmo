import { Router } from "express";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middlewares";
import * as vacacionesCtrl from "../controllers/vacacion.controller";

const router = Router();

// Empleado: crea y ve sus solicitudes
router.post("/", verifyToken, authorizeRoles(1,2,3,4), vacacionesCtrl.crearSolicitud);
router.get("/mias", verifyToken, authorizeRoles(1,2,3,4,5), vacacionesCtrl.misSolicitudes);

// Rutas de SALDO - estas DEBEN venir ANTES de la ruta /:id
router.get("/saldo", verifyToken, authorizeRoles(1,2,3,4,5), vacacionesCtrl.saldoActual);
router.get("/saldo/:empleadoId", verifyToken, authorizeRoles(1,2,3), vacacionesCtrl.saldoPorEmpleado);

// Consulta por empleado (Jefe, TH, Admin)
router.get("/empleado/:empleadoId", verifyToken, authorizeRoles(1,2,3), vacacionesCtrl.solicitudesPorEmpleado);

// Búsqueda por rango - para calendario/mes
router.get("/buscar", verifyToken, authorizeRoles(1,2,3,4,5), vacacionesCtrl.buscarPorRango);

// Las rutas parametrizadas van al final
router.get("/:id", verifyToken, authorizeRoles(1,2,3,4,5), vacacionesCtrl.detalleSolicitud);

// Gestión (Jefe, Talento Humano, Admin)
router.post("/:id/aprobar", verifyToken, authorizeRoles(1,2,3), vacacionesCtrl.aprobarSolicitud);
router.post("/:id/rechazar", verifyToken, authorizeRoles(1,2,3), vacacionesCtrl.rechazarSolicitud);

export default router;