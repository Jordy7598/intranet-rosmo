// backend/src/routes/uploads.ts
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middlewares";
import { cleanupOrphanImages } from "../controllers/maintenance.controller";

const router = Router();

// Carpeta destino: ./uploads/noticias
const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "noticias");
fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Solo se permiten imágenes"));
  },
}); 

// POST /uploads/noticias  (multipart/form-data, campo: "file")
router.post("/noticias", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const publicUrl = `/uploads/noticias/${req.file.filename}`;
  res.json({ url: publicUrl });
});

// DELETE /uploads/noticias/:filename - Eliminar imagen específica
router.delete("/noticias/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(UPLOAD_ROOT, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }
    
    fs.unlinkSync(filePath);
    res.json({ message: "Imagen eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    res.status(500).json({ error: "Error al eliminar imagen" });
  }
});

// POST /uploads/cleanup - Limpiar imágenes huérfanas (solo administradores)
router.post("/cleanup", verifyToken, authorizeRoles(1), cleanupOrphanImages);

export default router;
