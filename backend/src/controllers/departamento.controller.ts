import { Request, Response } from "express";
import { pool } from "../config/db";

// Obtener todos los departamentos
export const getDepartamentos = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT ID_Departamento, Nombre_Departamento FROM Departamento");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener departamentos" });
  }
};
