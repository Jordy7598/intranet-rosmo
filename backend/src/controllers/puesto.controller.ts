import { Request, Response } from "express";
import { pool } from "../config/db";

// Obtener todos los puestos
export const getPuestos = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      "SELECT ID_Puesto, Nombre_Puesto, Descripcion FROM Puesto"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener puestos:", error);
    res.status(500).json({ error: "Error al obtener puestos" });
  }
};

// Crear un puesto
export const createPuesto = async (req: Request, res: Response) => {
  const { Nombre_Puesto, Descripcion } = req.body;

  if (!Nombre_Puesto) {
    return res.status(400).json({ error: "El nombre del puesto es obligatorio" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO Puesto (Nombre_Puesto, Descripcion) VALUES (?, ?)",
      [Nombre_Puesto, Descripcion || null]
    );

    res.status(201).json({
      message: "Puesto creado correctamente",
      id: (result as any).insertId
    });
  } catch (error) {
    console.error("Error al crear puesto:", error);
    res.status(500).json({ error: "Error al crear puesto" });
  }
};
