import { Request, Response } from "express";
import { pool } from "../config/db";

async function safeQuery<T = any>(label: string, sql: string, params: any[] = []) {
  try {
    const [rows]: any = await pool.query(sql, params);
    return { data: rows as T[], error: null };
  } catch (err: any) {
    console.error(`[Dashboard] ${label} ERROR:`, err?.sqlMessage || err?.message || err);
    return { data: [] as T[], error: `${label}: ${err?.code || err?.message || "SQL error"}` };
  }
}

export async function getSummary(req: Request, res: Response) {
  // Top 5 por likes (like_noticia) y destacado
  const qTopLikes = `
    SELECT n.ID_Noticia,
           n.Titulo,
           n.Fecha_Publicacion,
           COUNT(ln.ID_Like) AS total_likes
    FROM dba_rosmo.noticia n
    LEFT JOIN dba_rosmo.like_noticia ln
      ON ln.ID_Noticia = n.ID_Noticia
    WHERE n.Estado = 'Publicada'
    GROUP BY n.ID_Noticia, n.Titulo, n.Fecha_Publicacion
    ORDER BY total_likes DESC, n.Fecha_Publicacion DESC
    LIMIT 5
  `;

  // Más reciente publicada
  const qMasReciente = `
    SELECT ID_Noticia, Titulo, Fecha_Publicacion
    FROM dba_rosmo.noticia
    WHERE Estado = 'Publicada'
    ORDER BY Fecha_Publicacion DESC
    LIMIT 1
  `;

  // Cumpleaños de HOY (usa Nombre/Apellido)
  const qCumplesHoy = `
    SELECT
      e.ID_Empleado AS id,
      CONCAT(e.Nombre, ' ', e.Apellido) AS nombre,
      e.Fecha_Nacimiento AS fecha
    FROM dba_rosmo.empleado e
    WHERE e.Fecha_Nacimiento IS NOT NULL
      AND DATE_FORMAT(e.Fecha_Nacimiento, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d')
    ORDER BY nombre
  `;

  // Aniversarios HOY (usa Nombre/Apellido)
  const qAnivHoy = `
    SELECT
      e.ID_Empleado AS id,
      CONCAT(e.Nombre, ' ', e.Apellido) AS nombre,
      e.Fecha_Contratacion AS fecha,
      TIMESTAMPDIFF(YEAR, e.Fecha_Contratacion, CURDATE()) AS anios
    FROM dba_rosmo.empleado e
    WHERE e.Fecha_Contratacion IS NOT NULL
      AND e.Fecha_Contratacion <= CURDATE()
      AND DATE_FORMAT(e.Fecha_Contratacion, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d')
    ORDER BY nombre
  `;

  // Archivos recientes (reglamentos) en archivo_corporativo
  // Si tu Categoria exacta no es 'Reglamento', ajústalo o usa LOWER(...) = 'reglamento'
  const qArchivos = `
    SELECT
      ac.ID_Archivo AS id,
      ac.Nombre_Archivo AS titulo,
      ac.Ruta AS url,
      ac.Fecha_Creacion
    FROM dba_rosmo.archivo_corporativo ac
    WHERE ac.Categoria IS NOT NULL AND LOWER(ac.Categoria) = 'reglamento'
    ORDER BY ac.Fecha_Creacion DESC
    LIMIT 6
  `;

  // Encuestas recientes (Link_Externo en vez de Slug)
  // Devolvemos url preferentemente externa; si no hay, una ruta interna
  const qEncuestas = `
    SELECT
      e.ID_Encuesta AS id,
      e.Titulo AS titulo,
      COALESCE(e.Link_Externo, CONCAT('/encuestas/', e.ID_Encuesta)) AS url,
      e.Fecha_Publicacion
    FROM dba_rosmo.encuesta e
    ORDER BY e.Fecha_Publicacion DESC
    LIMIT 5
  `;

  const [
    topLikesRes,
    masRecienteRes,
    cumplesRes,
    anivRes,
    archivosRes,
    encuestasRes,
  ] = await Promise.all([
    safeQuery("topLikes", qTopLikes),
    safeQuery("masReciente", qMasReciente),
    safeQuery("cumpleaniosHoy", qCumplesHoy),
    safeQuery("aniversariosHoy", qAnivHoy),
    safeQuery("archivosRecientes", qArchivos),
    safeQuery("encuestasRecientes", qEncuestas),
  ]);

  const anyError = [
    topLikesRes.error,
    masRecienteRes.error,
    cumplesRes.error,
    anivRes.error,
    archivosRes.error,
    encuestasRes.error,
  ].filter(Boolean);

  res.status(anyError.length ? 207 : 200).json({
    destacadoPorLikes: topLikesRes.data[0] || null,
    masReciente: masRecienteRes.data[0] || null,
    topLikes: topLikesRes.data,
    cumpleaniosHoy: cumplesRes.data,
    aniversariosHoy: anivRes.data,
    archivosRecientes: archivosRes.data,
    encuestasRecientes: encuestasRes.data,
    _warnings: anyError, // quítalo cuando termines de depurar
  });
}
export const getDashboard = (req: Request, res: Response) => {
  const user = req.user;
  res.json({
    message: `Bienvenido al dashboard, usuario ID ${user?.id}`,
    rol: (user as any)?.rol,
    empleado: (user as any)?.empleado,
  });
};