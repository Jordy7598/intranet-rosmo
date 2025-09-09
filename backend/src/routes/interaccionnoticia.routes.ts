// src/routes/interaction.routes.ts
import { Router } from "express";
import {
  toggleLike,
  getLikesCount,
  checkUserLike,
  getComentarios,
  createComentario,
  deleteComentario
} from "../controllers/interaccionnoticia.controller";
import { verifyToken } from "../middlewares/auth.middlewares";

const router = Router();

// ============ RUTAS DE LIKES ============
router.post("/noticias/:noticiaId/like", verifyToken, toggleLike);
router.get("/noticias/:noticiaId/likes/count", getLikesCount);
router.get("/noticias/:noticiaId/likes/check", verifyToken, checkUserLike);

// ============ RUTAS DE COMENTARIOS ============
router.get("/noticias/:noticiaId/comentarios", getComentarios);
router.post("/noticias/:noticiaId/comentarios", verifyToken, createComentario);
router.delete("/comentarios/:comentarioId", verifyToken, deleteComentario);

export default router;