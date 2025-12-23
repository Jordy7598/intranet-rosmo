import { Router } from "express";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middlewares";
import  {
    crearAlmuerzo,
    listaAlmuerzoPorFecha,
    statusAlmuerzoHoy,
    crearCarta,
    crearBoleta,
    obtenerBoleta,
    crearSalidaAnticipada,
    misSolicitudes,
    solicitudesPendientes,
    detalleSolicitud,
    aprobarSolicitud,
    rechazarSolicitud
} from "../controllers/solicitud.controller";

const router = Router();
/** Roles: 1=Admin, 2=Talento Humano, 3=Jefe, 4=Empleado, 5=Mercadeo */
// ALMUERZO
router.post("/almuerzo", verifyToken, authorizeRoles(1, 2, 3, 4, 5), crearAlmuerzo);
router.get("/almuerzo/status", verifyToken, authorizeRoles(1, 2, 3, 4, 5), statusAlmuerzoHoy);
router.get("/almuerzo/lista", verifyToken, authorizeRoles(1,2), listaAlmuerzoPorFecha);

// CARTA DE INGRESOS
router.post(  "/carta", verifyToken, authorizeRoles(1, 2, 3, 4, 5), crearCarta);

// BOLETA DE PAGO
router.post("/boleta", verifyToken, authorizeRoles(1, 2, 3, 4, 5), crearBoleta );
router.get( "/boleta", verifyToken, authorizeRoles(1, 2, 3, 4, 5), obtenerBoleta );

// SALIDA ANTICIPADA
router.post("/salida", verifyToken, authorizeRoles(1, 2, 3, 4, 5), crearSalidaAnticipada);

// RUTAS GENERALES
router.get("/mias",verifyToken,authorizeRoles(1, 2, 3, 4, 5), misSolicitudes);
router.get("/pendientes", verifyToken, authorizeRoles(1,2, 3, 5), solicitudesPendientes);
router.get("/:id", verifyToken,authorizeRoles(1, 2, 3, 4, 5), detalleSolicitud);
router.patch("/:id/aprobar", verifyToken,authorizeRoles(1,2, 3), aprobarSolicitud);
router.patch("/:id/rechazar", verifyToken, authorizeRoles(1,2, 3), rechazarSolicitud);

export default router;
