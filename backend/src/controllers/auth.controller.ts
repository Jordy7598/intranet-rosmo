import { Request, Response } from "express";
import { pool } from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secreto_default";

// LOGIN
export const login = async (req: Request, res: Response) => {
  const { correo, contrasena } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM Usuario WHERE Correo = ? AND Estado = 'Activo'", [correo]) as any[];
    const user = rows[0];

    if (!user) return res.status(401).json({ message: "Usuario no encontrado o inactivo" });

    const validPassword = await bcrypt.compare(contrasena, user.Contraseña);
    if (!validPassword) return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign(
      {
        id: user.ID_Usuario,
        rol: user.ID_Rol,
        empleado: user.ID_Empleado
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      token,
      usuario: {
        id: user.ID_Usuario,
        nombre: user.Nombre_Usuario,
        rol: user.ID_Rol,
        empleado: user.ID_Empleado,
        foto: user.Foto_Perfil
      }
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// REGISTRO
export const register = async (req: Request, res: Response) => {
  const {
    nombre_usuario,
    correo,
    contrasena,
    id_empleado,
    id_rol
  } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    const [result] = await pool.query(
      `INSERT INTO Usuario (Nombre_Usuario, Correo, Contraseña, ID_Empleado, ID_Rol, Fecha_Creacion, Estado)
       VALUES (?, ?, ?, ?, ?, NOW(), 'Activo')`,
      [nombre_usuario, correo, hashedPassword, id_empleado, id_rol]
    );

    res.status(201).json({
      message: "Usuario creado correctamente",
      id: (result as any).insertId
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ message: "Error al registrar" });
  }
};
