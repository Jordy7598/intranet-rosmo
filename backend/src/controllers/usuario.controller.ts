import { Request, Response } from "express";
import { pool } from "../config/db";
import bcrypt from "bcryptjs";

// Obtener todos los usuarios
export const getUsuarios = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT *,r.Nombre_Rol FROM Usuario u LEFT JOIN Rol r ON u.ID_Rol=r.ID_Rol");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

// Obtener usuario por ID
export const getUsuarioById = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM Usuario WHERE ID_Usuario = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener usuario" });
  }
};

// Crear usuario
export const createUsuario = async (req: Request, res: Response) => {
  const {
    Nombre_Usuario,
    Correo,
    Contraseña,
    Foto_Perfil,
    ID_Empleado,
    ID_Rol,
    Estado,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(Contraseña, 10);
    await pool.query(
      "INSERT INTO Usuario (Nombre_Usuario, Correo, `Contraseña`, Foto_Perfil, ID_Empleado, ID_Rol, Fecha_Creacion, Estado) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)",
      [
        Nombre_Usuario,
        Correo,
        hashedPassword,
        Foto_Perfil || null,
        ID_Empleado || null,
        ID_Rol,
        Estado,
      ]
    );
    res.status(201).json({ message: "Usuario creado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear usuario" });
  }
};

// Actualizar usuario
export const updateUsuario = async (req: Request, res: Response) => {
  const {
    Nombre_Usuario,
    Correo,
    Contraseña,
    Foto_Perfil,
    ID_Empleado,
    ID_Rol,
    Estado,
  } = req.body;

  try {
    let updateQuery =
      "UPDATE Usuario SET Nombre_Usuario = ?, Correo = ?, Foto_Perfil = ?, ID_Empleado = ?, ID_Rol = ?, Estado = ?";
    const params: any[] = [
      Nombre_Usuario,
      Correo,
      Foto_Perfil || null,
      ID_Empleado || null,
      ID_Rol,
      Estado,
    ];

    if (Contraseña) {
      const hashedPassword = await bcrypt.hash(Contraseña, 10);
      updateQuery += ", `Contraseña` = ?";
      params.push(hashedPassword);
    }

    updateQuery += " WHERE ID_Usuario = ?";
    params.push(req.params.id);

    await pool.query(updateQuery, params);
    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
};

// Eliminar usuario
export const deleteUsuario = async (req: Request, res: Response) => {
  try {
    await pool.query("DELETE FROM Usuario WHERE ID_Usuario = ?", [
      req.params.id,
    ]);
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};

// Obtener jefes inmediatos
export const getJefesInmediatos = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.ID_Usuario, CONCAT(e.Nombre, ' ', e.Apellido) AS NombreCompleto
      FROM Usuario u
      INNER JOIN Empleado e ON u.ID_Empleado = e.ID_Empleado
      INNER JOIN Rol r ON u.ID_Rol = r.ID_Rol
      WHERE r.Nombre_Rol IN ('Jefe', 'Administrador')
        AND u.Estado = 'Activo'
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener jefes inmediatos" });
  }
};

//obtener mi p erfil
export const getMiPerfil = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const idUsuario = req.user.id;

    const [rows]: any = await pool.query(
      `
      SELECT 
        -- Usuario
        u.ID_Usuario,
        u.Nombre_Usuario,
        u.Correo            AS Correo_Usuario,
        u.Foto_Perfil,
        u.Fecha_Creacion,
        u.Estado            AS Estado_Usuario,
        r.Nombre_Rol,

        -- Empleado
        e.ID_Empleado,
        e.Nombre            AS Nombre_Empleado,
        e.Apellido          AS Apellido_Empleado,
        e.Correo            AS Correo_Empleado,
        e.Fecha_Contratacion,
        e.Dias_Vacaciones_Anuales,
        e.Dias_Vacaciones_Tomados,
        e.Estado            AS Estado_Empleado,

        -- Departamento / Puesto
        e.ID_Departamento,
        d.Nombre_Departamento,
        e.ID_Puesto,
        p.Nombre_Puesto,

        -- Jefe inmediato
        e.ID_Jefe_Inmediato,
        CONCAT(j.Nombre, ' ', j.Apellido) AS Nombre_Jefe_Inmediato

      FROM Usuario u
      LEFT JOIN Empleado e   ON u.ID_Empleado = e.ID_Empleado
      LEFT JOIN Rol r        ON u.ID_Rol = r.ID_Rol
      LEFT JOIN Departamento d ON e.ID_Departamento = d.ID_Departamento
      LEFT JOIN Puesto p       ON e.ID_Puesto = p.ID_Puesto
      LEFT JOIN Empleado j     ON e.ID_Jefe_Inmediato = j.ID_Empleado
      WHERE u.ID_Usuario = ?
      `,
      [idUsuario]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ message: "Error al obtener perfil" });
  }
};
