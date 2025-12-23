import { Request, Response } from "express";
import { pool } from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import path from "path";
import fs from "fs";

interface ArchivoRow extends RowDataPacket {
  ID_Archivo: number;
  Nombre_Archivo: string;
  Ruta: string;
  Categoria: string;
  Fecha_Creacion: string;
  ID_Creador: number;
  Nombre_Creador: string;
}

export const listarArchivos = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<ArchivoRow[]>(
      `SELECT 
        ac.ID_Archivo,
        ac.Nombre_Archivo,
        ac.Ruta,
        ac.Categoria,
        ac.Fecha_Creacion,
        ac.ID_Creador,
        CONCAT(u.Nombre_Usuario, ' (', u.Correo, ')') as Nombre_Creador
      FROM archivo_corporativo ac
      LEFT JOIN usuario u ON ac.ID_Creador = u.ID_Usuario
      ORDER BY ac.Fecha_Creacion DESC`
    );

    res.json(rows);
  } catch (error) {
    console.error("[Archivos Corporativos] Error al listar archivos:", error);
    res.status(500).json({ error: "Error al obtener archivos corporativos" });
  }
};

export const crearArchivo = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se ha subido ningún archivo" });
    }

    const { categoria } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const nombreArchivo = req.file.filename;
    const ruta = `/uploads/archivos/${nombreArchivo}`;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO archivo_corporativo 
       (Nombre_Archivo, Ruta, Categoria, Fecha_Creacion, ID_Creador) 
       VALUES (?, ?, ?, NOW(), ?)`,
      [nombreArchivo, ruta, categoria || "General", userId]
    );

    console.log("[Archivos Corporativos] Archivo creado:", nombreArchivo);

    res.status(201).json({
      message: "Archivo subido exitosamente",
      archivo: {
        ID_Archivo: result.insertId,
        Nombre_Archivo: nombreArchivo,
        Ruta: ruta,
        Categoria: categoria || "General",
      },
    });
  } catch (error) {
    console.error("[Archivos Corporativos] Error al crear archivo:", error);

    if (req.file) {
      const filePath = path.join(__dirname, "../../uploads/archivos", req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("[Archivos Corporativos] Archivo eliminado tras error:", req.file.filename);
      }
    }

    res.status(500).json({ error: "Error al subir el archivo" });
  }
};

export const eliminarArchivo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query<ArchivoRow[]>(
      "SELECT Ruta, Nombre_Archivo FROM archivo_corporativo WHERE ID_Archivo = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    const archivo = rows[0];
    const fileName = archivo.Nombre_Archivo;
    const filePath = path.join(__dirname, "../../uploads/archivos", fileName);

    await pool.query("DELETE FROM archivo_corporativo WHERE ID_Archivo = ?", [id]);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("[Archivos Corporativos] Archivo eliminado del sistema:", fileName);
    }

    console.log("[Archivos Corporativos] Registro eliminado de BD:", id);
    res.json({ message: "Archivo eliminado exitosamente" });
  } catch (error) {
    console.error("[Archivos Corporativos] Error al eliminar archivo:", error);
    res.status(500).json({ error: "Error al eliminar el archivo" });
  }
};
