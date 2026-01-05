import { Request, Response } from "express";
import { pool } from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

interface EncuestaRow extends RowDataPacket {
  ID_Encuesta: number;
  Titulo: string;
  Descripcion: string;
  Link_Externo: string;
  Fecha_Publicacion: string;
  Fecha_Cierre: string;
  ID_Creador: number;
  Nombre_Creador: string;
  Estado: "Activa" | "Cerrada" | "Programada";
}

// Listar encuestas (filtra solo las activas o programadas)
export const listarEncuestas = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<EncuestaRow[]>(
      `SELECT 
        e.ID_Encuesta,
        e.Titulo,
        e.Descripcion,
        e.Link_Externo,
        e.Fecha_Publicacion,
        e.Fecha_Cierre,
        e.ID_Creador,
        u.Nombre_Usuario as Nombre_Creador,
        CASE 
          WHEN NOW() < e.Fecha_Publicacion THEN 'Programada'
          WHEN NOW() BETWEEN e.Fecha_Publicacion AND e.Fecha_Cierre THEN 'Activa'
          ELSE 'Cerrada'
        END as Estado
      FROM encuesta e
      LEFT JOIN usuario u ON e.ID_Creador = u.ID_Usuario
      ORDER BY e.Fecha_Publicacion DESC`
    );

    res.json(rows);
  } catch (error) {
    console.error("[Encuesta] Error al listar encuestas:", error);
    res.status(500).json({ error: "Error al obtener encuestas" });
  }
};

// Obtener una encuesta específica
export const obtenerEncuesta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query<EncuestaRow[]>(
      `SELECT 
        e.ID_Encuesta,
        e.Titulo,
        e.Descripcion,
        e.Link_Externo,
        e.Fecha_Publicacion,
        e.Fecha_Cierre,
        e.ID_Creador,
        u.Nombre_Usuario as Nombre_Creador,
        CASE 
          WHEN NOW() < e.Fecha_Publicacion THEN 'Programada'
          WHEN NOW() BETWEEN e.Fecha_Publicacion AND e.Fecha_Cierre THEN 'Activa'
          ELSE 'Cerrada'
        END as Estado
      FROM encuesta e
      LEFT JOIN usuario u ON e.ID_Creador = u.ID_Usuario
      WHERE e.ID_Encuesta = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Encuesta no encontrada" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("[Encuesta] Error al obtener encuesta:", error);
    res.status(500).json({ error: "Error al obtener encuesta" });
  }
};

// Crear nueva encuesta
export const crearEncuesta = async (req: Request, res: Response) => {
  try {
    const { titulo, descripcion, link_externo, fecha_publicacion, fecha_cierre } = req.body;
    const userId = req.user?.id;

    if (!titulo || !link_externo || !fecha_publicacion || !fecha_cierre) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios: titulo, link_externo, fecha_publicacion, fecha_cierre",
      });
    }

    // Validar que la fecha de cierre sea posterior a la de publicación
    if (new Date(fecha_cierre) <= new Date(fecha_publicacion)) {
      return res.status(400).json({
        error: "La fecha de cierre debe ser posterior a la fecha de publicación",
      });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO encuesta (Titulo, Descripcion, Link_Externo, Fecha_Publicacion, Fecha_Cierre, ID_Creador)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [titulo, descripcion || null, link_externo, fecha_publicacion, fecha_cierre, userId]
    );

    res.status(201).json({
      message: "Encuesta creada exitosamente",
      ID_Encuesta: result.insertId,
    });
  } catch (error) {
    console.error("[Encuesta] Error al crear encuesta:", error);
    res.status(500).json({ error: "Error al crear encuesta" });
  }
};

// Actualizar encuesta
export const actualizarEncuesta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, link_externo, fecha_publicacion, fecha_cierre } = req.body;

    if (!titulo || !link_externo || !fecha_publicacion || !fecha_cierre) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios: titulo, link_externo, fecha_publicacion, fecha_cierre",
      });
    }

    // Validar que la fecha de cierre sea posterior a la de publicación
    if (new Date(fecha_cierre) <= new Date(fecha_publicacion)) {
      return res.status(400).json({
        error: "La fecha de cierre debe ser posterior a la fecha de publicación",
      });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE encuesta 
       SET Titulo = ?, Descripcion = ?, Link_Externo = ?, Fecha_Publicacion = ?, Fecha_Cierre = ?
       WHERE ID_Encuesta = ?`,
      [titulo, descripcion || null, link_externo, fecha_publicacion, fecha_cierre, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Encuesta no encontrada" });
    }

    res.json({ message: "Encuesta actualizada exitosamente" });
  } catch (error) {
    console.error("[Encuesta] Error al actualizar encuesta:", error);
    res.status(500).json({ error: "Error al actualizar encuesta" });
  }
};

// Eliminar encuesta
export const eliminarEncuesta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM encuesta WHERE ID_Encuesta = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Encuesta no encontrada" });
    }

    res.json({ message: "Encuesta eliminada exitosamente" });
  } catch (error) {
    console.error("[Encuesta] Error al eliminar encuesta:", error);
    res.status(500).json({ error: "Error al eliminar encuesta" });
  }
};
