import { Request, Response } from "express";
import * as svc from "../services/vacaciones.service";
import { pool } from "../config/db"

export async function crearSolicitud(req: Request, res: Response) {
  try {
    const user = req.user!;
    const { fechaInicio, fechaFin, motivo } = req.body;

    // días solicitados (inclusive)
    const diasSolicitados = Math.max(
      0,
      Math.floor((new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / (1000*60*60*24))
    ) + 1;

    // saldo según tu regla (años * anuales - gozados)
    const saldo = await svc.obtenerSaldo(user.empleado);
    if (!saldo) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    if (diasSolicitados > saldo.disponibles) {
      return res.status(400).json({
        message: `No puedes solicitar ${diasSolicitados} día(s). Disponibles: ${saldo.disponibles}.`
      });
    }

    // todo OK: crear
    const out = await svc.crearSolicitud({
      empleadoId: user.empleado,
      usuarioId: user.id,
      fechaInicio,
      fechaFin,
      motivo
    });

    res.json(out);
  } catch (e:any) {
    res.status(e.statusCode || 500).json({ message: e.message || "Error al crear solicitud" });
  }
}

export async function misSolicitudes(req: Request, res: Response) {
  try {
    const user = req.user!;
    const data = await svc.listarPorEmpleado(user.empleado);
    res.json(data);
  } catch (e:any) {
    res.status(500).json({ message: e.message || "Error al listar" });
  }
}

export async function detalleSolicitud(req: Request, res: Response) {
  try {
    const user = req.user!;
    const id = Number(req.params.id);
    const data = await svc.obtenerDetalle(id, user);
    if (!data) return res.status(404).json({ message: "No encontrada" });
    res.json(data);
  } catch (e:any) {
    res.status(e.statusCode || 500).json({ message: e.message || "Error al obtener detalle" });
  }
}

export async function aprobarSolicitud(req: Request, res: Response) {
  try {
    const user = req.user!;
    const id = Number(req.params.id);
    const { comentario } = req.body;
    const out = await svc.cambiarEstado({
      solicitudId: id,
      aprobadorUsuarioId: user.id,
      aprobadorRolId: user.rol,
      estado: "Aprobado",
      comentario
    });
    res.json(out);
  } catch (e:any) {
    res.status(e.statusCode || 500).json({ message: e.message || "Error al aprobar" });
  }
}

export async function rechazarSolicitud(req: Request, res: Response) {
  try {
    const user = req.user!;
    const id = Number(req.params.id);
    const { motivo } = req.body;
    const out = await svc.cambiarEstado({
      solicitudId: id,
      aprobadorUsuarioId: user.id,
      aprobadorRolId: user.rol,
      estado: "Rechazado",
      comentario: motivo
    });
    res.json(out);
  } catch (e:any) {
    res.status(e.statusCode || 500).json({ message: e.message || "Error al rechazar" });
  }
}

export async function solicitudesPorEmpleado(req: Request, res: Response) {
  try {
    const empleadoId = Number(req.params.empleadoId);
    const data = await svc.listarPorEmpleado(empleadoId);
    res.json(data);
  } catch (e:any) {
    res.status(500).json({ message: e.message || "Error" });
  }
}

export async function buscarPorRango(req: Request, res: Response) {
  try {
    const { desde, hasta } = req.query as { desde?: string; hasta?: string };
    const data = await svc.buscarPorRango(desde, hasta);
    res.json(data);
  } catch (e:any) {
    res.status(500).json({ message: e.message || "Error" });
  }
}

async function obtenerEmpleadoIdDesdeUsuarioId(usuarioId: number): Promise<number | null> {
  const [rows]: any = await pool.query(
    "SELECT ID_Empleado FROM usuario WHERE ID_Usuario = ? LIMIT 1",
    [usuarioId]
  );
  if (!rows.length) return null;
  const emp = rows[0].ID_Empleado;
  return emp ? Number(emp) : null;
}

export async function saldoActual(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    //  Log temporal para ver qué trae el token
    // console.log("[saldoActual] token user:", req.user);

    let empleadoId = Number(req.user.empleado);

    // Fallback si el token no trae 'empleado'
    if (!Number.isFinite(empleadoId) || empleadoId <= 0) {
      if (req.user.id) {
        const emp = await obtenerEmpleadoIdDesdeUsuarioId(req.user.id);
        if (emp) empleadoId = emp;
      }
    }

    // Última validación antes de ir al service (evita NaN en el SQL)
    if (!Number.isFinite(empleadoId) || empleadoId <= 0) {
      return res.status(400).json({ message: "No se pudo determinar el empleado asociado" });
    }

    const saldo = await svc.obtenerSaldo(empleadoId);
    if (!saldo) return res.status(404).json({ message: "Empleado no encontrado" });

    res.json(saldo);
  } catch (e: any) {
    console.error("[saldoActual] error:", e?.message, e);
    res.status(e?.statusCode || 500).json({ message: e?.message || "Error al obtener saldo" });
  }
}

export async function saldoPorEmpleado(req: Request, res: Response) {
  try {
    const empleadoId = Number(req.params.empleadoId);
    if (!empleadoId) return res.status(400).json({ message: "empleadoId inválido" });
    const saldo = await svc.obtenerSaldo(empleadoId);
    if (!saldo) return res.status(404).json({ message: "Empleado no encontrado" });
    res.json(saldo);
  } catch (e: any) {
    console.error("[saldoPorEmpleado] error:", e?.message, e);
    res.status(e?.statusCode || 500).json({ message: e?.message || "Error al obtener saldo" });
  }
}
