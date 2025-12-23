import { Request, Response } from "express";
import { pool } from "../config/db";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "noticias");
const MAX_AGE_HOURS = 24; // Eliminar imágenes huérfanas de más de 24 horas

export const cleanupOrphanImages = async (req: Request, res: Response) => {
  console.log("[Maintenance] Iniciando limpieza de imágenes huérfanas...");

  try {
    // Obtener todas las imágenes usadas en las noticias
    const [usedImages]: any = await pool.query(
      `SELECT DISTINCT Imagen_Principal FROM noticia WHERE Imagen_Principal IS NOT NULL`
    );

    const usedFilenames = new Set(
      usedImages.map((row: any) => {
        // Extraer el nombre del archivo de la ruta /uploads/noticias/filename.jpg
        const match = row.Imagen_Principal.match(/\/uploads\/noticias\/(.+)$/);
        return match ? match[1] : null;
      }).filter(Boolean)
    );

    console.log(`[Maintenance] Imágenes en uso: ${usedFilenames.size}`);

    // Leer archivos en el directorio
    if (!fs.existsSync(UPLOAD_DIR)) {
      console.log("[Maintenance] Directorio de uploads no existe");
      return res.status(404).json({ error: "Directorio de uploads no existe" });
    }

    const files = fs.readdirSync(UPLOAD_DIR);
    console.log(`[Maintenance] Archivos en directorio: ${files.length}`);

    let deletedCount = 0;
    const now = Date.now();
    const deletedFiles: string[] = [];
    const skippedFiles: string[] = [];

    for (const file of files) {
      // Si la imagen NO está siendo usada
      if (!usedFilenames.has(file)) {
        const filePath = path.join(UPLOAD_DIR, file);
        const stats = fs.statSync(filePath);
        const ageHours = (now - stats.mtimeMs) / (1000 * 60 * 60);

        // Solo eliminar si tiene más de X horas
        if (ageHours > MAX_AGE_HOURS) {
          fs.unlinkSync(filePath);
          console.log(`[Maintenance] Eliminado: ${file} (edad: ${ageHours.toFixed(1)}h)`);
          deletedFiles.push(file);
          deletedCount++;
        } else {
          console.log(`[Maintenance] Omitido (muy reciente): ${file} (edad: ${ageHours.toFixed(1)}h)`);
          skippedFiles.push(file);
        }
      }
    }

    console.log(`[Maintenance] Limpieza completada. Archivos eliminados: ${deletedCount}`);

    res.json({
      message: "Limpieza completada exitosamente",
      totalFiles: files.length,
      deletedCount,
      skippedCount: skippedFiles.length,
      inUseCount: usedFilenames.size,
      deletedFiles: deletedFiles.length > 0 ? deletedFiles : undefined
    });
  } catch (error) {
    console.error("[Maintenance] Error en limpieza de imágenes:", error);
    res.status(500).json({ error: "Error al ejecutar la limpieza de imágenes" });
  }
};
