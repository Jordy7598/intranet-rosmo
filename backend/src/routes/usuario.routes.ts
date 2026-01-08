import { Router } from "express";
import {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getJefesInmediatos,
  getMiPerfil,
  uploadFotoPerfil,
  subirFotoPerfil
} from "../controllers/usuario.controller";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middlewares";

const router = Router();


router.use(verifyToken);

router.get("/mi-perfil", getMiPerfil);
router.get("/", authorizeRoles(1), getUsuarios);
router.get("/:id", getUsuarioById);
router.post("/upload-foto", uploadFotoPerfil.single("foto"), subirFotoPerfil);
router.post("/", authorizeRoles(1), createUsuario);
router.put("/:id", authorizeRoles(1), updateUsuario);
router.delete("/:id", authorizeRoles(1), deleteUsuario);
router.get("/extras/jefes", getJefesInmediatos);


export default router;
