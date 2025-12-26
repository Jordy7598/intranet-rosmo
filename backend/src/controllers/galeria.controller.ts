import { Request, Response } from "express";
import { pool } from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import path from "path";
import fs from "fs";

interface GaleriaRow extends RowDataPacket {
  ID_Galeria: number;
  Titulo: string;
  Descripcion: string;
  Fecha_Creacion: string;
  ID_Creador: number;
  Nombre_Creador: string;
  Total_Likes: number;
  Total_Comentarios: number;
  Total_Archivos: number;
  Usuario_Dio_Like: number;
  Imagen_Portada?: string;
}

interface ArchivoGaleriaRow extends RowDataPacket {
  ID_Archivo: number;
  Nombre_Archivo: string;
  Ruta: string;
  Tipo: "Imagen" | "Video";
}

interface ComentarioRow extends RowDataPacket {
  ID_Comentario: number;
  Comentario: string;
  Fecha_Comentario: string;
  ID_Usuario: number;
  Nombre_Usuario: string;
  Foto_Perfil: string;
}

// Listar todas las galerías con información de likes, comentarios y archivos
export const listarGalerias = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || 0;

    const [rows] = await pool.query<GaleriaRow[]>(
      `SELECT 
        g.ID_Galeria,
        g.Titulo,
        g.Descripcion,
        g.Fecha_Creacion,
        g.ID_Creador,
        u.Nombre_Usuario as Nombre_Creador,
        COUNT(DISTINCT l.ID_Like) as Total_Likes,
        COUNT(DISTINCT c.ID_Comentario) as Total_Comentarios,
        COUNT(DISTINCT a.ID_Archivo) as Total_Archivos,
        MAX(CASE WHEN l.ID_Usuario = ? THEN 1 ELSE 0 END) as Usuario_Dio_Like,
        (SELECT Ruta FROM archivo_galeria WHERE ID_Galeria = g.ID_Galeria ORDER BY ID_Archivo ASC LIMIT 1) as Imagen_Portada
      FROM galeria g
      LEFT JOIN usuario u ON g.ID_Creador = u.ID_Usuario
      LEFT JOIN like_galeria l ON g.ID_Galeria = l.ID_Galeria
      LEFT JOIN comentario_galeria c ON g.ID_Galeria = c.ID_Galeria
      LEFT JOIN archivo_galeria a ON g.ID_Galeria = a.ID_Galeria
      GROUP BY g.ID_Galeria
      ORDER BY g.Fecha_Creacion DESC`,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error("[Galería] Error al listar galerías:", error);
    res.status(500).json({ error: "Error al obtener galerías" });
  }
};

// Obtener detalle de una galería específica
export const obtenerGaleria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 0;

    // Obtener información de la galería
    const [galeriaRows] = await pool.query<GaleriaRow[]>(
      `SELECT 
        g.ID_Galeria,
        g.Titulo,
        g.Descripcion,
        g.Fecha_Creacion,
        g.ID_Creador,
        u.Nombre_Usuario as Nombre_Creador,
        COUNT(DISTINCT l.ID_Like) as Total_Likes,
        COUNT(DISTINCT c.ID_Comentario) as Total_Comentarios,
        MAX(CASE WHEN l.ID_Usuario = ? THEN 1 ELSE 0 END) as Usuario_Dio_Like
      FROM galeria g
      LEFT JOIN usuario u ON g.ID_Creador = u.ID_Usuario
      LEFT JOIN like_galeria l ON g.ID_Galeria = l.ID_Galeria
      LEFT JOIN comentario_galeria c ON g.ID_Galeria = c.ID_Galeria
      WHERE g.ID_Galeria = ?
      GROUP BY g.ID_Galeria`,
      [userId, id]
    );

    if (galeriaRows.length === 0) {
      return res.status(404).json({ error: "Galería no encontrada" });
    }

    // Obtener archivos de la galería
    const [archivos] = await pool.query<ArchivoGaleriaRow[]>(
      `SELECT ID_Archivo, Nombre_Archivo, Ruta, Tipo
       FROM archivo_galeria
       WHERE ID_Galeria = ?
       ORDER BY ID_Archivo ASC`,
      [id]
    );

    // Obtener comentarios
    const [comentarios] = await pool.query<ComentarioRow[]>(
      `SELECT 
        c.ID_Comentario,
        c.Comentario,
        c.Fecha_Comentario,
        c.ID_Usuario,
        u.Nombre_Usuario,
        u.Foto_Perfil
      FROM comentario_galeria c
      LEFT JOIN usuario u ON c.ID_Usuario = u.ID_Usuario
      WHERE c.ID_Galeria = ?
      ORDER BY c.Fecha_Comentario DESC`,
      [id]
    );

    res.json({
      galeria: galeriaRows[0],
      archivos,
      comentarios,
    });
  } catch (error) {
    console.error("[Galería] Error al obtener galería:", error);
    res.status(500).json({ error: "Error al obtener galería" });
  }
};

// Crear nueva galería (álbum)
export const crearGaleria = async (req: Request, res: Response) => {
  try {
    const { titulo, descripcion } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    if (!titulo || !descripcion) {
      return res.status(400).json({ error: "Título y descripción son obligatorios" });
    }

    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "Debe subir al menos un archivo" });
    }

    // Crear la galería
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO galeria (Titulo, Descripcion, Fecha_Creacion, ID_Creador)
       VALUES (?, ?, NOW(), ?)`,
      [titulo, descripcion, userId]
    );

    const galeriaId = result.insertId;

    // Crear carpeta para la galería
    const galeriaFolder = path.join(process.cwd(), "uploads", "galeria", `album-${galeriaId}`);
    if (!fs.existsSync(galeriaFolder)) {
      fs.mkdirSync(galeriaFolder, { recursive: true });
    }

    // Mover archivos y registrarlos
    for (const file of files) {
      const tipo = file.mimetype.startsWith("image/") ? "Imagen" : "Video";
      const newPath = path.join(galeriaFolder, file.filename);
      const oldPath = path.join(process.cwd(), "uploads", "temp", file.filename);
      
      fs.renameSync(oldPath, newPath);

      const ruta = `/uploads/galeria/album-${galeriaId}/${file.filename}`;
      
      await pool.query(
        `INSERT INTO archivo_galeria (ID_Galeria, Nombre_Archivo, Ruta, Tipo)
         VALUES (?, ?, ?, ?)`,
        [galeriaId, file.filename, ruta, tipo]
      );
    }

    console.log("[Galería] Álbum creado:", titulo, "ID:", galeriaId);

    res.status(201).json({
      message: "Álbum creado exitosamente",
      ID_Galeria: galeriaId,
    });
  } catch (error) {
    console.error("[Galería] Error al crear galería:", error);
    res.status(500).json({ error: "Error al crear galería" });
  }
};

// Eliminar galería
export const eliminarGaleria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Verificar que el usuario es el creador o admin/RH
    const [galeriaRows] = await pool.query<RowDataPacket[]>(
      "SELECT ID_Creador FROM galeria WHERE ID_Galeria = ?",
      [id]
    );

    if (galeriaRows.length === 0) {
      return res.status(404).json({ error: "Galería no encontrada" });
    }

    const rol = req.user?.rol || 0;
    const esCreador = galeriaRows[0].ID_Creador === userId;
    const esAdminRH = rol === 1 || rol === 2;

    if (!esCreador && !esAdminRH) {
      return res.status(403).json({ error: "No tienes permiso para eliminar esta galería" });
    }

    // Eliminar archivos físicos
    const galeriaFolder = path.join(process.cwd(), "uploads", "galeria", `album-${id}`);
    if (fs.existsSync(galeriaFolder)) {
      fs.rmSync(galeriaFolder, { recursive: true, force: true });
    }

    // Eliminar registros de BD (cascada automática debería eliminar archivos, likes y comentarios)
    await pool.query("DELETE FROM archivo_galeria WHERE ID_Galeria = ?", [id]);
    await pool.query("DELETE FROM like_galeria WHERE ID_Galeria = ?", [id]);
    await pool.query("DELETE FROM comentario_galeria WHERE ID_Galeria = ?", [id]);
    await pool.query("DELETE FROM galeria WHERE ID_Galeria = ?", [id]);

    console.log("[Galería] Álbum eliminado:", id);
    res.json({ message: "Galería eliminada exitosamente" });
  } catch (error) {
    console.error("[Galería] Error al eliminar galería:", error);
    res.status(500).json({ error: "Error al eliminar galería" });
  }
};

// Toggle like en galería
export const toggleLikeGaleria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    // Verificar si ya dio like
    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT ID_Like FROM like_galeria WHERE ID_Galeria = ? AND ID_Usuario = ?",
      [id, userId]
    );

    if (existing.length > 0) {
      // Quitar like
      await pool.query(
        "DELETE FROM like_galeria WHERE ID_Galeria = ? AND ID_Usuario = ?",
        [id, userId]
      );
      res.json({ message: "Like eliminado", liked: false });
    } else {
      // Dar like
      await pool.query(
        "INSERT INTO like_galeria (ID_Galeria, ID_Usuario) VALUES (?, ?)",
        [id, userId]
      );
      res.json({ message: "Like agregado", liked: true });
    }
  } catch (error) {
    console.error("[Galería] Error al toggle like:", error);
    res.status(500).json({ error: "Error al procesar like" });
  }
};

// Agregar comentario
export const agregarComentario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { comentario } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    if (!comentario || comentario.trim() === "") {
      return res.status(400).json({ error: "El comentario no puede estar vacío" });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO comentario_galeria (ID_Galeria, ID_Usuario, Comentario, Fecha_Comentario)
       VALUES (?, ?, ?, NOW())`,
      [id, userId, comentario.trim()]
    );

    // Obtener el comentario creado
    const [comentarios] = await pool.query<ComentarioRow[]>(
      `SELECT 
        c.ID_Comentario,
        c.Comentario,
        c.Fecha_Comentario,
        c.ID_Usuario,
        u.Nombre_Usuario,
        u.Foto_Perfil
      FROM comentario_galeria c
      LEFT JOIN usuario u ON c.ID_Usuario = u.ID_Usuario
      WHERE c.ID_Comentario = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: "Comentario agregado",
      comentario: comentarios[0],
    });
  } catch (error) {
    console.error("[Galería] Error al agregar comentario:", error);
    res.status(500).json({ error: "Error al agregar comentario" });
  }
};

// Eliminar comentario
export const eliminarComentario = async (req: Request, res: Response) => {
  try {
    const { id, comentarioId } = req.params;
    const userId = req.user?.id;
    const rol = req.user?.rol || 0;

    // Verificar que el usuario es el autor del comentario o admin/RH
    const [comentarioRows] = await pool.query<RowDataPacket[]>(
      "SELECT ID_Usuario FROM comentario_galeria WHERE ID_Comentario = ? AND ID_Galeria = ?",
      [comentarioId, id]
    );

    if (comentarioRows.length === 0) {
      return res.status(404).json({ error: "Comentario no encontrado" });
    }

    const esAutor = comentarioRows[0].ID_Usuario === userId;
    const esAdminRH = rol === 1 || rol === 2;

    if (!esAutor && !esAdminRH) {
      return res.status(403).json({ error: "No tienes permiso para eliminar este comentario" });
    }

    await pool.query(
      "DELETE FROM comentario_galeria WHERE ID_Comentario = ?",
      [comentarioId]
    );

    res.json({ message: "Comentario eliminado" });
  } catch (error) {
    console.error("[Galería] Error al eliminar comentario:", error);
    res.status(500).json({ error: "Error al eliminar comentario" });
  }
};
