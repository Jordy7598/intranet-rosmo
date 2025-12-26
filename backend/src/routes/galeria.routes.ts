import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middlewares";
import {
  listarGalerias,
  obtenerGaleria,
  crearGaleria,
  eliminarGaleria,
  toggleLikeGaleria,
  agregarComentario,
  eliminarComentario,
} from "../controllers/galeria.controller";

const router = Router();

// Asegurar que las carpetas existen
const tempPath = path.join(process.cwd(), "uploads", "temp");
const galeriaPath = path.join(process.cwd(), "uploads", "galeria");

if (!fs.existsSync(tempPath)) {
  fs.mkdirSync(tempPath, { recursive: true });
}

if (!fs.existsSync(galeriaPath)) {
  fs.mkdirSync(galeriaPath, { recursive: true });
}

// Configuración de multer para subir múltiples archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    // Imágenes
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    // Videos
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, GIF, WEBP) y videos (MP4, MOV, AVI, WEBM)."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB límite por archivo
});

// Rutas públicas (cualquier usuario autenticado puede ver)
router.get("/", verifyToken, listarGalerias);
router.get("/:id", verifyToken, obtenerGaleria);

// Interacciones (todos los usuarios autenticados)
router.post("/:id/like", verifyToken, toggleLikeGaleria);
router.post("/:id/comentarios", verifyToken, agregarComentario);
router.delete("/:id/comentarios/:comentarioId", verifyToken, eliminarComentario);

// Rutas protegidas (solo Admin, RH y Mercadeo pueden crear/eliminar)
router.post("/", verifyToken, authorizeRoles(1, 2, 5), upload.array("archivos", 20), crearGaleria);
router.delete("/:id", verifyToken, authorizeRoles(1, 2, 5), eliminarGaleria);

export default router;
