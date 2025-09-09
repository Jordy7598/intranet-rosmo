// src/controllers/interaction.controller.ts
import { Request, Response } from "express";
import { pool } from "../config/db";

// ============ LIKES ============
export const toggleLike = async (req: Request, res: Response) => {
  const { noticiaId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  try {
    // Verificar si ya existe el like
    const [existingLike]: any = await pool.query(
      `SELECT ID_Like FROM Like_Noticia WHERE ID_Noticia = ? AND ID_Usuario = ?`,
      [noticiaId, userId]
    );

    if (existingLike.length > 0) {
      // Si existe, eliminarlo (unlike)
      await pool.query(
        `DELETE FROM Like_Noticia WHERE ID_Noticia = ? AND ID_Usuario = ?`,
        [noticiaId, userId]
      );
      res.json({ liked: false, message: "Like eliminado" });
    } else {
      // Si no existe, agregarlo
      await pool.query(
        `INSERT INTO Like_Noticia (ID_Noticia, ID_Usuario) VALUES (?, ?)`,
        [noticiaId, userId]
      );
      res.json({ liked: true, message: "Like agregado" });
    }
  } catch (error) {
    console.error("Error al manejar like:", error);
    res.status(500).json({ message: "Error al manejar like" });
  }
};

export const getLikesCount = async (req: Request, res: Response) => {
  const { noticiaId } = req.params;

  try {
    const [result]: any = await pool.query(
      `SELECT COUNT(*) as total_likes FROM Like_Noticia WHERE ID_Noticia = ?`,
      [noticiaId]
    );
    
    res.json({ total_likes: result[0].total_likes });
  } catch (error) {
    console.error("Error al obtener likes:", error);
    res.status(500).json({ message: "Error al obtener likes" });
  }
};

export const checkUserLike = async (req: Request, res: Response) => {
  const { noticiaId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.json({ liked: false });
  }

  try {
    const [result]: any = await pool.query(
      `SELECT ID_Like FROM Like_Noticia WHERE ID_Noticia = ? AND ID_Usuario = ?`,
      [noticiaId, userId]
    );
    
    res.json({ liked: result.length > 0 });
  } catch (error) {
    console.error("Error al verificar like:", error);
    res.status(500).json({ message: "Error al verificar like" });
  }
};

// ============ COMENTARIOS ============
export const getComentarios = async (req: Request, res: Response) => {
  const { noticiaId } = req.params;

  try {
    const [rows]: any = await pool.query(
      `SELECT c.ID_Comentario, c.Comentario, c.Fecha_Comentario,
              u.Nombre_Usuario, u.ID_Usuario
       FROM Comentario_Noticia c
       LEFT JOIN Usuario u ON c.ID_Usuario = u.ID_Usuario
       WHERE c.ID_Noticia = ?
       ORDER BY c.Fecha_Comentario DESC`,
      [noticiaId]
    );
    
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    res.status(500).json({ message: "Error al obtener comentarios" });
  }
};

export const createComentario = async (req: Request, res: Response) => {
  const { noticiaId } = req.params;
  const { comentario } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  if (!comentario || comentario.trim() === "") {
    return res.status(400).json({ message: "El comentario no puede estar vacío" });
  }

  try {
    await pool.query(
      `INSERT INTO Comentario_Noticia (ID_Noticia, ID_Usuario, Comentario, Fecha_Comentario)
       VALUES (?, ?, ?, NOW())`,
      [noticiaId, userId, comentario.trim()]
    );
    
    res.json({ message: "Comentario agregado correctamente" });
  } catch (error) {
    console.error("Error al crear comentario:", error);
    res.status(500).json({ message: "Error al crear comentario" });
  }
};

export const deleteComentario = async (req: Request, res: Response) => {
  const { comentarioId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  try {
    // Verificar que el comentario pertenece al usuario
    const [comentario]: any = await pool.query(
      `SELECT ID_Usuario FROM Comentario_Noticia WHERE ID_Comentario = ?`,
      [comentarioId]
    );

    if (comentario.length === 0) {
      return res.status(404).json({ message: "Comentario no encontrado" });
    }

    if (comentario[0].ID_Usuario !== userId) {
      return res.status(403).json({ message: "No puedes eliminar este comentario" });
    }

    await pool.query(
      `DELETE FROM Comentario_Noticia WHERE ID_Comentario = ?`,
      [comentarioId]
    );
    
    res.json({ message: "Comentario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    res.status(500).json({ message: "Error al eliminar comentario" });
  }
};