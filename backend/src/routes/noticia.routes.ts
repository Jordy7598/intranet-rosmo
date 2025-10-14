import { Router } from "express";
import { getNoticias, getNoticiaById, createNoticia, updateNoticia, deleteNoticia } from "../controllers/noticia.controller";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middlewares";

const router = Router();


router.use(verifyToken);

/** Roles: 1=Admin, 2=Talento Humano, 3=Jefe, 4=Empleado, 5=Mercadeo */
router.get("/", verifyToken, authorizeRoles(1, 2, 3, 4, 5), getNoticias);
router.get("/:id", verifyToken, authorizeRoles(1, 2, 3, 4, 5), getNoticiaById);
router.post("/", verifyToken, authorizeRoles(1, 2, 5), createNoticia);
router.put("/:id", verifyToken, authorizeRoles(1, 2, 5), updateNoticia);
router.delete("/:id", verifyToken, authorizeRoles(1, 2, 5), deleteNoticia);

export default router;