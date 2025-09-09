import { Request, Response } from "express";
import { pool } from "../config/db";
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import "express";

declare module "express" {
  export interface Request {
    user?: {
      id: number;
      rol: number;
      empleado: number;
    };
  }
}


// Interfaces para tipado
interface Usuario extends RowDataPacket {
  ID_Usuario: number;
}

interface Notificacion extends RowDataPacket {
  ID_Notificacion: number;
  Titulo: string;
  Mensaje: string;
  Tipo: string;
  Fecha_Creacion: Date;
  Leido: boolean;
  Link_Destino?: string;
}

interface CountResult extends RowDataPacket {
  total_no_leidas: number;
  total: number;
}

// Obtener notificaciones del usuario
export const getNotificaciones = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const idUsuario = req.user.id;
    const { page = 1, limit = 20, solo_no_leidas = false } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT n.ID_Notificacion, n.Titulo, n.Mensaje, n.Tipo, 
             n.Fecha_Creacion, n.Leido, n.Link_Destino
      FROM Notificacion n
      WHERE n.ID_Usuario = ?
    `;

    const params: any[] = [idUsuario];

    if (solo_no_leidas === 'true') {
      query += " AND n.Leido = FALSE";
    }

    query += " ORDER BY n.Fecha_Creacion DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), offset);

    const [notificaciones] = await pool.query<Notificacion[]>(query, params);

    // Obtener el total de notificaciones no leídas
    const [countResult] = await pool.query<CountResult[]>(
      "SELECT COUNT(*) as total_no_leidas FROM Notificacion WHERE ID_Usuario = ? AND Leido = FALSE",
      [idUsuario]
    );

    res.json({
      notificaciones,
      total_no_leidas: countResult[0].total_no_leidas,
      pagina_actual: Number(page),
      total_paginas: Math.ceil(Number(limit) > 0 ? countResult[0].total_no_leidas / Number(limit) : 1)
    });
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({ message: "Error al obtener notificaciones" });
  }
};

// Marcar notificación como leída
export const marcarComoLeida = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const { id } = req.params;
    const idUsuario = req.user.id;

    // Verificar que la notificación pertenece al usuario
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT ID_Notificacion FROM Notificacion WHERE ID_Notificacion = ? AND ID_Usuario = ?",
      [id, idUsuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    await pool.query<ResultSetHeader>(
      "UPDATE Notificacion SET Leido = TRUE WHERE ID_Notificacion = ?",
      [id]
    );

    res.json({ message: "Notificación marcada como leída" });
  } catch (error) {
    console.error("Error al marcar notificación:", error);
    res.status(500).json({ message: "Error al marcar notificación" });
  }
};

// Marcar todas las notificaciones como leídas
export const marcarTodasComoLeidas = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const idUsuario = req.user.id;

    await pool.query<ResultSetHeader>(
      "UPDATE Notificacion SET Leido = TRUE WHERE ID_Usuario = ? AND Leido = FALSE",
      [idUsuario]
    );

    res.json({ message: "Todas las notificaciones marcadas como leídas" });
  } catch (error) {
    console.error("Error al marcar notificaciones:", error);
    res.status(500).json({ message: "Error al marcar notificaciones" });
  }
};

// Eliminar notificación
export const eliminarNotificacion = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const { id } = req.params;
    const idUsuario = req.user.id;

    // Verificar que la notificación pertenece al usuario
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT ID_Notificacion FROM Notificacion WHERE ID_Notificacion = ? AND ID_Usuario = ?",
      [id, idUsuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    await pool.query<ResultSetHeader>("DELETE FROM Notificacion WHERE ID_Notificacion = ?", [id]);

    res.json({ message: "Notificación eliminada" });
  } catch (error) {
    console.error("Error al eliminar notificación:", error);
    res.status(500).json({ message: "Error al eliminar notificación" });
  }
};

// Crear notificación (para administradores)
export const crearNotificacion = async (req: Request, res: Response) => {
  try {
    const { ID_Usuario, Titulo, Mensaje, Tipo, Link_Destino } = req.body;

    if (!Titulo || !Mensaje || !Tipo) {
      return res.status(400).json({ 
        message: "Título, mensaje y tipo son obligatorios" 
      });
    }

    // Validar tipo de notificación
    const tiposValidos = ['Vacacion', 'Solicitud', 'Noticia', 'Galeria', 'Encuesta', 'General'];
    if (!tiposValidos.includes(Tipo)) {
      return res.status(400).json({ 
        message: "Tipo de notificación inválido" 
      });
    }

    await pool.query<ResultSetHeader>(
      `INSERT INTO Notificacion (ID_Usuario, Titulo, Mensaje, Tipo, Fecha_Creacion, Leido, Link_Destino) 
       VALUES (?, ?, ?, ?, NOW(), FALSE, ?)`,
      [ID_Usuario, Titulo, Mensaje, Tipo, Link_Destino || null]
    );

    res.status(201).json({ message: "Notificación creada correctamente" });
  } catch (error) {
    console.error("Error al crear notificación:", error);
    res.status(500).json({ message: "Error al crear notificación" });
  }
};

// Crear notificación masiva (para todos los usuarios o por rol)
export const crearNotificacionMasiva = async (req: Request, res: Response) => {
  try {
    const { Titulo, Mensaje, Tipo, Link_Destino, ID_Rol, todos_usuarios } = req.body;

    if (!Titulo || !Mensaje || !Tipo) {
      return res.status(400).json({ 
        message: "Título, mensaje y tipo son obligatorios" 
      });
    }

    // Validar tipo de notificación
    const tiposValidos = ['Vacacion', 'Solicitud', 'Noticia', 'Galeria', 'Encuesta', 'General'];
    if (!tiposValidos.includes(Tipo)) {
      return res.status(400).json({ 
        message: "Tipo de notificación inválido" 
      });
    }

    let usuarios: Usuario[];

    if (todos_usuarios) {
      // Obtener todos los usuarios activos
      [usuarios] = await pool.query<Usuario[]>(
        "SELECT ID_Usuario FROM Usuario WHERE Estado = 'Activo'"
      );
    } else if (ID_Rol) {
      // Obtener usuarios por rol
      [usuarios] = await pool.query<Usuario[]>(
        "SELECT ID_Usuario FROM Usuario WHERE ID_Rol = ? AND Estado = 'Activo'",
        [ID_Rol]
      );
    } else {
      return res.status(400).json({ 
        message: "Debe especificar 'todos_usuarios' o 'ID_Rol'" 
      });
    }

    if (usuarios.length === 0) {
      return res.status(404).json({ 
        message: "No se encontraron usuarios para enviar la notificación" 
      });
    }

    // Crear notificaciones para cada usuario
    const valores = usuarios.map((usuario: Usuario) => [
      usuario.ID_Usuario,
      Titulo,
      Mensaje,
      Tipo,
      Link_Destino || null
    ]);

    await pool.query<ResultSetHeader>(
      `INSERT INTO Notificacion (ID_Usuario, Titulo, Mensaje, Tipo, Link_Destino, Fecha_Creacion, Leido) 
       VALUES ${valores.map(() => '(?, ?, ?, ?, ?, NOW(), FALSE)').join(', ')}`,
      valores.flat()
    );

    res.status(201).json({ 
      message: `Notificación enviada a ${usuarios.length} usuario(s)` 
    });
  } catch (error) {
    console.error("Error al crear notificación masiva:", error);
    res.status(500).json({ message: "Error al crear notificación masiva" });
  }
};

// Obtener contador de notificaciones no leídas
export const getContadorNoLeidas = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const idUsuario = req.user.id;

    const [rows] = await pool.query<CountResult[]>(
      "SELECT COUNT(*) as total FROM Notificacion WHERE ID_Usuario = ? AND Leido = FALSE",
      [idUsuario]
    );

    res.json({ total_no_leidas: rows[0].total });
  } catch (error) {
    console.error("Error al obtener contador:", error);
    res.status(500).json({ message: "Error al obtener contador" });
  }
};