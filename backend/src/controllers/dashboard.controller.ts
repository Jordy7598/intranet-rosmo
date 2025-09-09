import { Request, Response } from "express";

export const getDashboard = (req: Request, res: Response) => {
  const user = req.user;
  res.json({
    message: `Bienvenido al dashboard, usuario ID ${user?.id}`,
    rol: user?.rol,
    empleado: user?.empleado
  });
};
