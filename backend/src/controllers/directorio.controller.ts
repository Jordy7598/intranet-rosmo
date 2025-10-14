import { Request, Response } from "express";
import { pool } from "../config/db";

export async function listDirectory(req: Request, res: Response) {
  try {
    const q = req.query.q as string;
    const area = req.query.area as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        e.ID_Empleado AS id,
        CONCAT(e.Nombre, ' ', e.Apellido) AS nombre,
        e.Correo AS correo,
        p.Nombre_Puesto AS puesto,
        d.Nombre_Departamento AS area
      FROM empleado e
      LEFT JOIN puesto p ON e.ID_Puesto = p.ID_Puesto
      LEFT JOIN departamento d ON e.ID_Departamento = d.ID_Departamento
      WHERE e.Estado = 'Activo'
    `;

    const params: any[] = [];

    if (q && q.trim() !== "") {
      query += ` AND (
        e.Nombre LIKE ? OR
        e.Apellido LIKE ? OR
        e.Correo LIKE ? OR
        p.Nombre_Puesto LIKE ? OR
        d.Nombre_Departamento LIKE ?
      )`;
      const searchTerm = `%${q.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (area && area.trim() !== "") {
      query += ` AND d.Nombre_Departamento = ?`;
      params.push(area.trim());
    }

    query += ` ORDER BY e.Nombre, e.Apellido LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [empleados]: any = await pool.query(query, params);

    let countQuery = `
      SELECT COUNT(*) AS total
      FROM empleado e
      LEFT JOIN puesto p ON e.ID_Puesto = p.ID_Puesto
      LEFT JOIN departamento d ON e.ID_Departamento = d.ID_Departamento
      WHERE e.Estado = 'Activo'
    `;

    const countParams: any[] = [];
    
    if (q && q.trim() !== "") {
      countQuery += ` AND (
        e.Nombre LIKE ? OR
        e.Apellido LIKE ? OR
        e.Correo LIKE ? OR
        p.Nombre_Puesto LIKE ? OR
        d.Nombre_Departamento LIKE ?
      )`;
      const searchTerm = `%${q.trim()}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (area && area.trim() !== "") {
      countQuery += ` AND d.Nombre_Departamento = ?`;
      countParams.push(area.trim());
    }

    const [countResult]: any = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      data: empleados,
      page: page,
      limit: limit,
      total: total,
      hasMore: offset + empleados.length < total
    });

  } catch (error: any) {
    console.error("Error al listar directorio:", error.message);
    res.status(500).json({ message: "Error al listar el directorio" });
  }
}

export async function getEmployeeById(req: Request, res: Response) {
  try {
    const id = req.params.id;

    const query = `
      SELECT 
        e.ID_Empleado AS id,
        e.Nombre AS nombre,
        e.Apellido AS apellido,
        e.Correo AS correo,
        p.Nombre_Puesto AS puesto,
        d.Nombre_Departamento AS area,
        e.Fecha_Nacimiento AS fechaNacimiento,
        e.Fecha_Contratacion AS fechaContratacion,
        e.Estado AS estado
      FROM empleado e
      LEFT JOIN puesto p ON e.ID_Puesto = p.ID_Puesto
      LEFT JOIN departamento d ON e.ID_Departamento = d.ID_Departamento
      WHERE e.ID_Empleado = ?
      LIMIT 1
    `;

    const [empleados]: any = await pool.query(query, [id]);

    if (!empleados || empleados.length === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    const empleado = empleados[0];

    let edad = null;
    if (empleado.fechaNacimiento) {
      const hoy = new Date();
      const nacimiento = new Date(empleado.fechaNacimiento);
      edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
    }

    let aniosEmpresa = null;
    if (empleado.fechaContratacion) {
      const hoy = new Date();
      const contratacion = new Date(empleado.fechaContratacion);
      aniosEmpresa = hoy.getFullYear() - contratacion.getFullYear();
      const mes = hoy.getMonth() - contratacion.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < contratacion.getDate())) {
        aniosEmpresa--;
      }
    }

    empleado.edad = edad;
    empleado.aniosEmpresa = aniosEmpresa;

    res.json(empleado);

  } catch (error: any) {
    console.error("Error al obtener empleado:", error.message);
    res.status(500).json({ message: "Error al obtener el empleado" });
  }
}