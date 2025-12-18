import { Router } from "express";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middlewares";
import * as vacacionesCtrl from "../controllers/vacacion.controller";

const router = Router();

// Empleado: crea y ve sus solicitudes
router.post("/", verifyToken, authorizeRoles(1,2,3,4,5), vacacionesCtrl.crearSolicitud);
router.get("/mias", verifyToken, authorizeRoles(1,2,3,4,5), vacacionesCtrl.misSolicitudes);

// Rutas de SALDO
router.get("/saldo", verifyToken, authorizeRoles(1,2,3,4,5), vacacionesCtrl.saldoActual);
router.get("/saldo/:empleadoId", verifyToken, authorizeRoles(1,2,3), vacacionesCtrl.saldoPorEmpleado);

// Reporte de vacaciones (Admin, TH, Jefe)
router.get("/reporte", verifyToken, authorizeRoles(1,2,3), vacacionesCtrl.obtenerReporteVacaciones);

// Consulta por empleado 
router.get("/empleado/:empleadoId", verifyToken, authorizeRoles(1,2,3), vacacionesCtrl.solicitudesPorEmpleado);

// Búsqueda por rango - para calendario/mes
router.get("/buscar", verifyToken, authorizeRoles(1,2,3,4,5), vacacionesCtrl.buscarPorRango);
router.get("/", verifyToken, authorizeRoles(1,2,3,4,5), vacacionesCtrl.buscarPorRango);

router.get("/:id", verifyToken, authorizeRoles(1,2,3,4,5), vacacionesCtrl.detalleSolicitud);

// Gestión (Jefe, Talento Humano, Admin)
router.post("/:id/aprobar", verifyToken, authorizeRoles(1,2,3), vacacionesCtrl.aprobarSolicitud);
router.post("/:id/rechazar", verifyToken, authorizeRoles(1,2,3), vacacionesCtrl.rechazarSolicitud);

export default router;

/*
import { Router } from "express";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middlewares";
import * as vacacionesCtrl from "../controllers/vacacion.controller";
const router = Router();
// Empleado: crea y ve sus solicitudes
router.post("/", verifyToken, authorizeRoles(1,2,3,4), vacacionesCtrl.crearSolicitud); // Admin, TH, Jefe, Empleado
router.get("/mias", verifyToken, authorizeRoles(1,2,3,4,5), vacacionesCtrl.misSolicitudes);
router.get("/:id", verifyToken, authorizeRoles(1,2,3,4,5), vacacionesCtrl.detalleSolicitud);
// Gestión (Jefe, Talento Humano, Admin)
router.post("/:id/aprobar", verifyToken, authorizeRoles(1,2,3), vacacionesCtrl.aprobarSolicitud);
router.post("/:id/rechazar", verifyToken, authorizeRoles(1,2,3), vacacionesCtrl.rechazarSolicitud);
// Consulta por empleado (Jefe, TH, Admin)
router.get("/empleado/:empleadoId", verifyToken, authorizeRoles(1,2,3), vacacionesCtrl.solicitudesPorEmpleado);
// para calendario/mes
router.get("/", verifyToken, authorizeRoles(1,2,3,4,5), vacacionesCtrl.buscarPorRango);
// /api/vacaciones?desde=2025-09-01&hasta=2025-09-30
router.get("/saldo", verifyToken,authorizeRoles(1,2,3,4,5),vacacionesCtrl.saldoActual
);
// SALDO por empleado (solo Admin, TH, Jefe)
router.get( "/saldo/:empleadoId",verifyToken,authorizeRoles(1,2,3),vacacionesCtrl.saldoPorEmpleado);
export default router;
*/ 