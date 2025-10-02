/* src/controllers/noticia.controller.ts
import { Request, Response } from "express";
import { pool } from "../config/db";

// Obtener todas las noticias (con autor)
export const getNoticias = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT n.ID_Noticia, n.Titulo, n.Cuerpo, n.Imagen_Principal,
              n.Fecha_Publicacion, n.Areas, n.Estado,
              u.Nombre_Usuario AS Autor
       FROM Noticia n
       LEFT JOIN Usuario u ON n.ID_Autor = u.ID_Usuario
       ORDER BY n.Fecha_Publicacion DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener noticias:", error);
    res.status(500).json({ message: "Error al obtener noticias" });
  }
};

// Obtener una noticia por ID
export const getNoticiaById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows]: any = await pool.query(
      `SELECT n.ID_Noticia, n.Titulo, n.Cuerpo, n.Imagen_Principal,
              n.Fecha_Publicacion, n.Areas, n.Estado,
              u.Nombre_Usuario AS Autor
       FROM Noticia n
       LEFT JOIN Usuario u ON n.ID_Autor = u.ID_Usuario
       WHERE n.ID_Noticia = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Noticia no encontrada" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener noticia:", error);
    res.status(500).json({ message: "Error al obtener noticia" });
  }
};

// Crear noticia
export const createNoticia = async (req: Request, res: Response) => {
  try {
    const { Titulo, Cuerpo, Imagen_Principal, Areas, Estado } = req.body;
    const ID_Autor = req.user?.id;

    if (!ID_Autor) {
      return res.status(401).json({ message: "No se pudo identificar al autor" });
    }

    await pool.query(
      `INSERT INTO Noticia (Titulo, Cuerpo, Imagen_Principal, Fecha_Publicacion, ID_Autor, Areas, Estado)
       VALUES (?, ?, ?, NOW(), ?, ?, ?)`,
      [Titulo, Cuerpo, Imagen_Principal, ID_Autor, Areas, Estado]
    );

    res.json({ message: "✅ Noticia creada correctamente" });
  } catch (error) {
    console.error("Error al crear noticia:", error);
    res.status(500).json({ message: "Error al crear noticia" });
  }
};

// Actualizar noticia
export const updateNoticia = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { Titulo, Cuerpo, Imagen_Principal, Areas, Estado } = req.body;
  try {
    await pool.query(
      `UPDATE Noticia 
       SET Titulo = ?, Cuerpo = ?, Imagen_Principal = ?, Areas = ?, Estado = ?
       WHERE ID_Noticia = ?`,
      [Titulo, Cuerpo, Imagen_Principal, Areas, Estado, id]
    );
    res.json({ message: "✅ Noticia actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar noticia:", error);
    res.status(500).json({ message: "Error al actualizar noticia" });
  }
};

// Eliminar noticia
export const deleteNoticia = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM Noticia WHERE ID_Noticia = ?`, [id]);
    res.json({ message: "✅ Noticia eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar noticia:", error);
    res.status(500).json({ message: "Error al eliminar noticia" });
  }
};*/

// src/controllers/noticia.controller.ts
import { Request, Response } from "express";
import { pool } from "../config/db";

// Obtener todas las noticias (con autor y conteo de likes/comentarios)
export const getNoticias = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT n.ID_Noticia, n.Titulo, n.Cuerpo, n.Imagen_Principal,
              n.Fecha_Publicacion, n.Areas, n.Estado,
              u.Nombre_Usuario AS Autor,
              COALESCE(likes.total_likes, 0) as total_likes,
              COALESCE(comentarios.total_comentarios, 0) as total_comentarios
       FROM Noticia n
       LEFT JOIN Usuario u ON n.ID_Autor = u.ID_Usuario
       LEFT JOIN (
         SELECT ID_Noticia, COUNT(*) as total_likes 
         FROM Like_Noticia 
         GROUP BY ID_Noticia
       ) likes ON n.ID_Noticia = likes.ID_Noticia
       LEFT JOIN (
         SELECT ID_Noticia, COUNT(*) as total_comentarios 
         FROM Comentario_Noticia 
         GROUP BY ID_Noticia
       ) comentarios ON n.ID_Noticia = comentarios.ID_Noticia
       ORDER BY n.Fecha_Publicacion DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener noticias:", error);
    res.status(500).json({ message: "Error al obtener noticias" });
  }
};

// Obtener una noticia por ID (con conteos)
export const getNoticiaById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows]: any = await pool.query(
      `SELECT n.ID_Noticia, n.Titulo, n.Cuerpo, n.Imagen_Principal,
              n.Fecha_Publicacion, n.Areas, n.Estado,
              u.Nombre_Usuario AS Autor,
              COALESCE(likes.total_likes, 0) as total_likes,
              COALESCE(comentarios.total_comentarios, 0) as total_comentarios
       FROM Noticia n
       LEFT JOIN Usuario u ON n.ID_Autor = u.ID_Usuario
       LEFT JOIN (
         SELECT ID_Noticia, COUNT(*) as total_likes 
         FROM Like_Noticia 
         WHERE ID_Noticia = ?
       ) likes ON n.ID_Noticia = likes.ID_Noticia
       LEFT JOIN (
         SELECT ID_Noticia, COUNT(*) as total_comentarios 
         FROM Comentario_Noticia 
         WHERE ID_Noticia = ?
       ) comentarios ON n.ID_Noticia = comentarios.ID_Noticia
       WHERE n.ID_Noticia = ?`,
      [id, id, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Noticia no encontrada" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener noticia:", error);
    res.status(500).json({ message: "Error al obtener noticia" });
  }
};

// Crear noticia
export const createNoticia = async (req: Request, res: Response) => {
  try {
    const { Titulo, Cuerpo, Imagen_Principal, Areas, Estado } = req.body;
    const ID_Autor = req.user?.id;

    if (!ID_Autor) {
      return res.status(401).json({ message: "No se pudo identificar al autor" });
    }

    await pool.query(
      `INSERT INTO Noticia (Titulo, Cuerpo, Imagen_Principal, Fecha_Publicacion, ID_Autor, Areas, Estado)
       VALUES (?, ?, ?, NOW(), ?, ?, ?)`,
      [Titulo, Cuerpo, Imagen_Principal, ID_Autor, Areas, Estado]
    );

    res.json({ message: "✅ Noticia creada correctamente" });
  } catch (error) {
    console.error("Error al crear noticia:", error);
    res.status(500).json({ message: "Error al crear noticia" });
  }
};

// Actualizar noticia
export const updateNoticia = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { Titulo, Cuerpo, Imagen_Principal, Areas, Estado } = req.body;

  try {
    await pool.query(
      `UPDATE Noticia
       SET Titulo = ?, Cuerpo = ?, Imagen_Principal = ?, Areas = ?, Estado = ?
       WHERE ID_Noticia = ?`,
      [Titulo, Cuerpo, Imagen_Principal, Areas, Estado, id]
    );

    res.json({ message: "✅ Noticia actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar noticia:", error);
    res.status(500).json({ message: "Error al actualizar noticia" });
  }
};

// Eliminar noticia
export const deleteNoticia = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Eliminar en orden debido a foreign keys
    await pool.query(`DELETE FROM Like_Noticia WHERE ID_Noticia = ?`, [id]);
    await pool.query(`DELETE FROM Comentario_Noticia WHERE ID_Noticia = ?`, [id]);
    await pool.query(`DELETE FROM Visto_Noticia WHERE ID_Noticia = ?`, [id]);
    await pool.query(`DELETE FROM Noticia WHERE ID_Noticia = ?`, [id]);

    res.json({ message: "✅ Noticia eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar noticia:", error);
    res.status(500).json({ message: "Error al eliminar noticia" });
  }
};
