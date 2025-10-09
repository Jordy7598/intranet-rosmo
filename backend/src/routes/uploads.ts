// backend/src/routes/uploads.ts
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

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

export default router;
