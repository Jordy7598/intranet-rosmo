import { Request, Response } from "express";
import { pool } from "../config/db";

/* Obtener todos los empleados
export const getEmpleados = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Empleado");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener empleados:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener un solo empleado
export const getEmpleadoById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM Empleado WHERE ID_Empleado = ?", [id]) as [any[], any];
    if (rows.length === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener empleado:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};*/

// Crear un nuevo empleado
export const createEmpleado = async (req: Request, res: Response) => {
  const {
    Nombre,
    Apellido,
    Correo,
    Fecha_Contratacion,
    Dias_Vacaciones_Anuales,
    Dias_Vacaciones_Tomados,
    ID_Departamento,
    ID_Puesto,
    ID_Jefe_Inmediato,
    Estado
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO Empleado (Nombre, Apellido, Correo, Fecha_Contratacion, Dias_Vacaciones_Anuales, Dias_Vacaciones_Tomados, ID_Departamento, ID_Puesto, ID_Jefe_Inmediato, Estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [Nombre, Apellido, Correo, Fecha_Contratacion, Dias_Vacaciones_Anuales, Dias_Vacaciones_Tomados, ID_Departamento, ID_Puesto, ID_Jefe_Inmediato || null, Estado]
    );
    res.status(201).json({ message: "Empleado creado", id: (result as any).insertId });
  } catch (error) {
    console.error("Error al crear empleado:", error);
    res.status(500).json({ message: "Error al crear empleado" });
  }
};

// Actualizar empleado
export const updateEmpleado = async (req: Request, res: Response) => {
  const { id } = req.params;
  const datos = req.body;

  try {
    const [result] = await pool.query("UPDATE Empleado SET ? WHERE ID_Empleado = ?", [datos, id]);
    res.json({ message: "Empleado actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar empleado:", error);
    res.status(500).json({ message: "Error al actualizar empleado" });
  }
};

// Eliminar empleado
export const deleteEmpleado = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM Empleado WHERE ID_Empleado = ?", [id]);
    res.json({ message: "Empleado eliminado" });
  } catch (error) {
    console.error("Error al eliminar empleado:", error);
    res.status(500).json({ message: "Error al eliminar empleado" });
  }
};

// Obtener todos los empleados
export const getEmpleados = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.ID_Empleado,
        e.Nombre,
        e.Apellido,
        e.Correo,
        e.Fecha_Contratacion,
        e.Dias_Vacaciones_Anuales,
        e.Dias_Vacaciones_Tomados,
        e.ID_Departamento,
        d.Nombre_Departamento,
        e.ID_Puesto,
        p.Nombre_Puesto,
        e.ID_Jefe_Inmediato,
        CONCAT(j.Nombre, ' ', j.Apellido) AS Nombre_Jefe_Inmediato,
        e.Estado
      FROM Empleado e
      LEFT JOIN Departamento d ON e.ID_Departamento = d.ID_Departamento
      LEFT JOIN Puesto p ON e.ID_Puesto = p.ID_Puesto
      LEFT JOIN Empleado j ON e.ID_Jefe_Inmediato = j.ID_Empleado
      ORDER BY e.ID_Empleado DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener empleados:", error);
    res.status(500).json({ message: "Error al obtener empleados" });
  }
};

export const getEmpleadoById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows]: any = await pool.query(
      `
      SELECT e.ID_Empleado, e.Nombre, e.Apellido, e.Correo, e.Fecha_Contratacion,
             e.Dias_Vacaciones_Anuales, e.Dias_Vacaciones_Tomados,
             e.ID_Departamento, d.Nombre_Departamento,
             e.ID_Puesto, p.Nombre_Puesto,
             e.ID_Jefe_Inmediato,
              CONCAT(j.Nombre, ' ', j.Apellido) AS Nombre_Jefe_Inmediato,
             e.Estado
      FROM Empleado e
      LEFT JOIN Departamento d ON e.ID_Departamento = d.ID_Departamento
      LEFT JOIN Puesto p ON e.ID_Puesto = p.ID_Puesto
      LEFT JOIN Empleado j ON e.ID_Jefe_Inmediato = j.ID_Empleado
      WHERE e.ID_Empleado = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener empleado:", error);
    res.status(500).json({ message: "Error al obtener empleado" });
  }
};

