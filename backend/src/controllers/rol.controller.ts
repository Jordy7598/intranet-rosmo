import { Request, Response } from "express";
import { getAllRoles } from "../models/rol.model";
import { pool } from "../config/db";

// Obtener rol por ID
export const getRoles = async (_req: Request, res: Response) => {
  const [rows] = await pool.query("SELECT * FROM rol") as [any[], any];
  res.json(rows);
};

export const getRolById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const [rows] = await pool.query("SELECT * FROM rol WHERE ID_Rol = ?", [id]) as [any[], any];
  if (rows.length === 0) {
    return res.status(404).json({ message: "Rol no encontrado" });
  }
  res.json(rows[0]);
};

export const createRol = async (req: Request, res: Response) => {
  const { Nombre_Rol, Descripcion } = req.body;
  const [result] = await pool.query(
    "INSERT INTO rol (Nombre_Rol, Descripcion) VALUES (?, ?)",
    [Nombre_Rol, Descripcion]
  ) as [any, any];

  res.status(201).json({ id: result.insertId, Nombre_Rol, Descripcion });
};

// Actualizar un rol
export const updateRol = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { Nombre_Rol, Descripcion } = req.body;

  const [result] = await pool.query(
    "UPDATE rol SET Nombre_Rol = ?, Descripcion = ? WHERE ID_Rol = ?",
    [Nombre_Rol, Descripcion, id]
  ) as [any, any];

  res.json({ message: "Rol actualizado correctamente" });
};

// Eliminar un rol
export const deleteRol = async (req: Request, res: Response) => {
  const { id } = req.params;

  const [result] = await pool.query("DELETE FROM rol WHERE ID_Rol = ?", [id]) as [any, any];

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Rol no encontrado" });
  }

  res.json({ message: "Rol eliminado correctamente" });
};
