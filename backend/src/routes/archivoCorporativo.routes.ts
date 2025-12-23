import { Router } from "express";
import multer from "multer";
import path from "path";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middlewares";
import {
  listarArchivos,
  crearArchivo,
  eliminarArchivo,
} from "../controllers/archivoCorporativo.controller";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/archivos");
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
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de archivo no permitido. Solo se permiten documentos PDF, Word, Excel y PowerPoint."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB límite
});

// Rutas públicas (cualquier usuario autenticado puede ver)
router.get("/", verifyToken, listarArchivos);

// Rutas protegidas (solo Admin y RRHH pueden crear/eliminar)
router.post("/", verifyToken, authorizeRoles(1, 2), upload.single("archivo"), crearArchivo);
router.delete("/:id", verifyToken, authorizeRoles(1, 2), eliminarArchivo);

export default router;
