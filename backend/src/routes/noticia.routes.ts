import { Router } from "express";
import { getNoticias, getNoticiaById, createNoticia, updateNoticia, deleteNoticia } from "../controllers/noticia.controller";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middlewares";

const router = Router();

// Aplica verifyToken a TODAS las rutas
router.use(verifyToken);

router.get("/", getNoticias);
router.get("/:id", getNoticiaById);
router.post("/", createNoticia);
router.put("/:id", updateNoticia);
router.delete("/:id", deleteNoticia);

export default router;