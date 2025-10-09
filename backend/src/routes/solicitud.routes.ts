import { Router } from "express";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middlewares";
import * as solicitudCtrl from "../controllers/solicitud.controller";

const router = Router();

// ALMUERZO
router.post("/almuerzo", verifyToken, authorizeRoles(1, 2, 3, 4, 5),solicitudCtrl.crearAlmuerzo);
router.get("/almuerzo/lista", verifyToken, authorizeRoles(1,2, 3, 5), solicitudCtrl.listaAlmuerzoPorFecha);

// CARTA DE INGRESOS
router.post(  "/carta", verifyToken, authorizeRoles(1, 2, 3, 4, 5), solicitudCtrl.crearCarta);

// BOLETA DE PAGO
router.post("/boleta", verifyToken, authorizeRoles(1, 2, 3, 4, 5), solicitudCtrl.crearBoleta );
router.get( "/boleta", verifyToken, authorizeRoles(1, 2, 3, 4, 5), solicitudCtrl.obtenerBoleta );

// SALIDA ANTICIPADA
router.post("/salida", verifyToken, authorizeRoles(1, 2, 3, 4, 5), solicitudCtrl.crearSalidaAnticipada);

// RUTAS GENERALES
router.get("/mias",verifyToken,authorizeRoles(1, 2, 3, 4, 5), solicitudCtrl.misSolicitudes);
router.get("/pendientes", verifyToken, authorizeRoles(1,2, 3, 5), solicitudCtrl.solicitudesPendientes);
router.get("/:id", verifyToken,authorizeRoles(1, 2, 3, 4, 5), solicitudCtrl.detalleSolicitud);
router.patch("/:id/aprobar", verifyToken,authorizeRoles(1,2, 3), solicitudCtrl.aprobarSolicitud);
router.patch("/:id/rechazar", verifyToken, authorizeRoles(1,2, 3),solicitudCtrl.rechazarSolicitud);

export default router;
