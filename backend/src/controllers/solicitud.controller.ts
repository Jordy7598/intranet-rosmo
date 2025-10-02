// backend/src/controllers/solicitud.controller.ts
import { Request, Response } from "express";
import { pool } from "../config/db";

/** ===== Roles ===== */
const ROLES = {
  ADMIN: 1,
  TH: 2,
  JEFE: 3,
  EMPLEADO: 4,
  LECTOR: 5
} as const;

/** ===== Helpers (usuario/rol) ===== */
function getUserId(req: Request): number | null {
  const id = (req as any).user?.id;  
  return typeof id === "number" ? id : null;
}
function getRoleId(req: Request): number | null {
  const roleId = (req as any).user?.rol; 
  return typeof roleId === "number" ? roleId : null;
}

/** ===== Helpers (DB) ===== */
async function enviarNotificacion(
  userId: number,
  titulo: string,
  mensaje: string,
  tipo: string = "Solicitud"
) {
  await pool.query(
    `INSERT INTO Notificacion (ID_Usuario, Titulo, Mensaje, Tipo, Leido, Fecha_Creacion)
     VALUES (?, ?, ?, ?, 0, NOW())`,
    [userId, titulo, mensaje, tipo]
  );
}
async function notificarMany(
  userIds: number[],
  titulo: string,
  mensaje: string,
  tipo?: string
) {
  for (const uid of userIds) {
    await enviarNotificacion(uid, titulo, mensaje, tipo);
  }
}

async function getUsuarioYEmpleado(userId: number) {
  const [r]: any = await pool.query(
    `SELECT u.ID_Usuario, u.Nombre_Usuario, u.ID_Rol, e.ID_Empleado, e.Nombre, e.Apellido, e.ID_Jefe_Inmediato AS ID_Jefe
       FROM Usuario u
  LEFT JOIN Empleado e ON e.ID_Empleado = u.ID_Empleado
      WHERE u.ID_Usuario = ? LIMIT 1`,
    [userId]
  );
  return r[0] || null;
}

async function getUsuariosByRol(rolId: number): Promise<{ ID_Usuario: number; Nombre_Usuario: string }[]> {
  const [r]: any = await pool.query(
    `SELECT ID_Usuario, Nombre_Usuario FROM Usuario WHERE ID_Rol = ?`,
    [rolId]
  );
  return r;
}

async function getJefeUsuario(userId: number): Promise<{ ID_Usuario: number; Nombre_Usuario: string } | null> {
  // Busca el jefe del empleado (por ID_Jefe en Empleado → Usuario)
  const [r]: any = await pool.query(
    `SELECT uj.ID_Usuario, uj.Nombre_Usuario
       FROM Usuario u
  LEFT JOIN Empleado e  ON e.ID_Empleado = u.ID_Empleado
  LEFT JOIN Empleado ej ON ej.ID_Empleado = e.ID_Jefe_Inmediato
  LEFT JOIN Usuario  uj ON uj.ID_Empleado = ej.ID_Empleado
      WHERE u.ID_Usuario = ? LIMIT 1`,
    [userId]
  );
  return r[0] || null;
}

/** ===================== ALMUERZO (sin aprobación) ===================== */
/** POST /api/solicitudes/almuerzo */
export const crearAlmuerzo = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ ok: false, message: "No autenticado" });

    const u = await getUsuarioYEmpleado(userId);

    // Evitar duplicado el mismo día
    const [dup]: any = await pool.query(
      `SELECT ID_Solicitud
         FROM Solicitud
        WHERE ID_Usuario = ?
          AND Tipo = 'ALMUERZO'
          AND DATE(Fecha_Creacion) = CURDATE()
        LIMIT 1`,
      [userId]
    );
    if (dup.length) {
      return res.status(409).json({ ok: false, message: "Ya registraste almuerzo hoy." });
    }

    await pool.query(
      `INSERT INTO Solicitud (ID_Usuario, Tipo, Detalle, Estado, Fecha_Creacion)
       VALUES (?, 'ALMUERZO', 'Salida en horario de almuerzo', 'ENTREGADA', NOW())`,
      [userId]
    );

    // Notifica al empleado (confirmación)
    await enviarNotificacion(
      userId,
      "Almuerzo registrado",
      `Se registró tu salida de almuerzo para hoy${u?.Nombre ? `, ${u.Nombre}` : ""}.`
    );

    return res.json({ ok: true, message: "✅ Almuerzo registrado" });
  } catch (e) {
    console.error("crearAlmuerzo", e);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};

/** GET /api/solicitudes/almuerzo/lista?fecha=YYYY-MM-DD */
export const listaAlmuerzoPorFecha = async (req: Request, res: Response) => {
  try {
    const { fecha } = req.query as { fecha?: string };
    const useDate = fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha : null;

        const [rows]: any = await pool.query(
      `
      SELECT
        s.ID_Solicitud,
        DATE(s.Fecha_Creacion)      AS Fecha,
        TIME(s.Fecha_Creacion)      AS Hora_Registro,
        u.ID_Usuario,
        u.Nombre_Usuario,
        e.ID_Empleado,
        e.Nombre,
        e.Apellido,
        d.Nombre_Departamento
      FROM Solicitud s
      JOIN Usuario u       ON u.ID_Usuario = s.ID_Usuario
      LEFT JOIN Empleado e ON e.ID_Empleado = u.ID_Empleado
      LEFT JOIN Departamento d ON d.ID_Departamento = e.ID_Departamento
      WHERE s.Tipo = 'ALMUERZO'
        AND DATE(s.Fecha_Creacion) = ${useDate ? "?" : "CURDATE()"}
      ORDER BY e.Nombre, e.Apellido
      `,
      useDate ? [useDate] : []
    );

    return res.json({ ok: true, fecha: useDate ?? "HOY", total: rows.length, data: rows });
  } catch (e) {
    console.error("listaAlmuerzoPorFecha", e);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};

/** ===================== CARTA DE INGRESOS (solo TH) ===================== */
/** POST /api/solicitudes/carta */
export const crearCarta = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ ok: false, message: "No autenticado" });

    const u = await getUsuarioYEmpleado(userId);
    const { motivo } = req.body || {};

    await pool.query(
      `INSERT INTO Solicitud (ID_Usuario, Tipo, Detalle, Estado, Fecha_Creacion)
       VALUES (?, 'CARTA', ?, 'PendienteRH', NOW())`,
      [userId, motivo ?? "Carta de ingresos"]
    );

    // Notificar a Talento Humano
    const thUsers = await getUsuariosByRol(ROLES.TH);
    await notificarMany(
      thUsers.map(x => x.ID_Usuario),
      "Nueva solicitud de Carta de Ingresos",
      `El colaborador ${u?.Nombre ?? u?.Nombre_Usuario ?? userId} ha solicitado una carta de ingresos. Estado: PendienteRH.`,
      "Solicitud"
    );

    // Confirmación al solicitante
    await enviarNotificacion(
      userId,
      "Carta de Ingresos creada",
      "Tu solicitud de carta fue registrada y está en PendienteRH."
    );

    return res.json({ ok: true, message: "✅ Solicitud de carta creada (PendienteRH)" });
  } catch (e) {
    console.error("crearCarta", e);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};

/** ===================== BOLETA DE PAGO (sin aprobación) ===================== */
/** POST /api/solicitudes/boleta */
export const crearBoleta = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ ok: false, message: "No autenticado" });

    const u = await getUsuarioYEmpleado(userId);
    const { quincena, mes, anio } = req.body || {};
    if (![1, 2].includes(Number(quincena)) || !(mes >= 1 && mes <= 12) || !(anio >= 2000)) {
      return res.status(400).json({ ok: false, message: "Datos de periodo inválidos" });
    }

    await pool.query(
      `INSERT INTO Solicitud (ID_Usuario, Tipo, Detalle, Estado, Fecha_Creacion, Quincena, Mes, Anio)
       VALUES (?, 'BOLETA', 'Solicitud de boleta de pago', 'ENTREGADA', NOW(), ?, ?, ?)`,
      [userId, quincena, mes, anio]
    );

    // Confirmación al solicitante
    await enviarNotificacion(
      userId,
      "Boleta solicitada",
      `Se registró tu solicitud de boleta (${quincena === 1 ? "Quincena 1" : "Quincena 2"}/${mes}/${anio}).`
    );

    return res.json({ ok: true, message: "✅ Solicitud de boleta registrada" });
  } catch (e) {
    console.error("crearBoleta", e);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};

export const obtenerBoleta = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ ok: false, message: "No autenticado" });

    const quincena = Number(req.query.quincena);
    const mes = Number(req.query.mes);
    const anio = Number(req.query.anio);
    if (![1, 2].includes(quincena) || !(mes >= 1 && mes <= 12) || !(anio >= 2000)) {
      return res.status(400).json({ ok: false, message: "Parámetros de periodo inválidos" });
    }

    const [emp]: any = await pool.query(
      `SELECT e.ID_Empleado FROM Usuario u
        JOIN Empleado e ON e.ID_Empleado = u.ID_Empleado
       WHERE u.ID_Usuario = ? LIMIT 1`,
      [userId]
    );
    if (!emp.length) return res.status(404).json({ ok: false, message: "Empleado no encontrado" });
    const empleadoId = emp[0].ID_Empleado;

    const [rows]: any = await pool.query(
      `SELECT * FROM Planilla
        WHERE ID_Empleado = ? AND Quincena = ? AND Mes = ? AND Anio = ? LIMIT 1`,
      [empleadoId, quincena, mes, anio]
    );
    if (!rows.length) return res.status(404).json({ ok: false, message: "Boleta no encontrada" });

    return res.json({ ok: true, data: rows[0] });
  } catch (e) {
    console.error("obtenerBoleta", e);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};

/** ===================== SALIDA ANTICIPADA (Pendiente -> PendienteRH) ===================== */
/** POST /api/solicitudes/salida */
export const crearSalidaAnticipada = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ ok: false, message: "No autenticado" });

    const u = await getUsuarioYEmpleado(userId);
    const j = await getJefeUsuario(userId);

    const { motivo, fecha_inicio, fecha_fin } = req.body || {};
    if (!motivo || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ ok: false, message: "motivo, fecha_inicio y fecha_fin son requeridos" });
    }

    const [cmp]: any = await pool.query(`SELECT TIMESTAMP(?) <= TIMESTAMP(?) AS ok`, [fecha_inicio, fecha_fin]);
    if (!cmp[0]?.ok) {
      return res.status(400).json({ ok: false, message: "fecha_fin debe ser mayor o igual a fecha_inicio" });
    }

    await pool.query(
      `INSERT INTO Solicitud (ID_Usuario, Tipo, Detalle, Estado, Fecha_Creacion, Motivo, Fecha_Inicio, Fecha_Fin)
       VALUES (?, 'SALIDA', ?, 'Pendiente', NOW(), ?, ?, ?)`,
      [userId, "Salida anticipada", motivo, fecha_inicio, fecha_fin]
    );

    // Notificar a JEFE (si existe) o a todos los rol JEFE
    if (j?.ID_Usuario) {
      await enviarNotificacion(
        j.ID_Usuario,
        "Nueva solicitud de Salida (Pendiente)",
        `El colaborador ${u?.Nombre ?? u?.Nombre_Usuario ?? userId} solicitó salida (${motivo}).`
      );
    } else {
      const jefes = await getUsuariosByRol(ROLES.JEFE);
      if (jefes.length) {
        await notificarMany(
          jefes.map(x => x.ID_Usuario),
          "Nueva solicitud de Salida (Pendiente)",
          `El colaborador ${u?.Nombre ?? u?.Nombre_Usuario ?? userId} solicitó salida (${motivo}).`
        );
      }
    }

    // Confirmación al solicitante
    await enviarNotificacion(
      userId,
      "Solicitud de Salida creada",
      "Tu solicitud fue creada y está en Pendiente (a la espera de tu Jefe)."
    );

    return res.json({ ok: true, message: "✅ Solicitud de salida creada (Pendiente)" });
  } catch (e) {
    console.error("crearSalidaAnticipada", e);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};

/** ===================== LISTADOS / DETALLE ===================== */
export const misSolicitudes = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ ok: false, message: "No autenticado" });

    const [rows]: any = await pool.query(
      `SELECT s.*
         FROM Solicitud s
        WHERE s.ID_Usuario = ?
        ORDER BY s.Fecha_Creacion DESC`,
      [userId]
    );
    return res.json({ ok: true, total: rows.length, data: rows });
  } catch (e) {
    console.error("misSolicitudes", e);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};

export const solicitudesPendientes = async (req: Request, res: Response) => {
  try {
    const roleId = getRoleId(req);
    if (!roleId) return res.status(401).json({ ok: false, message: "No autenticado" });

    let query = "";
    if (roleId === ROLES.JEFE) {
      query = `
        SELECT s.*, u.Nombre_Usuario, e.Nombre, e.Apellido
          FROM Solicitud s
          JOIN Usuario u ON u.ID_Usuario = s.ID_Usuario
     LEFT JOIN Empleado e ON e.ID_Empleado = u.ID_Empleado
         WHERE s.Tipo = 'SALIDA' AND s.Estado = 'Pendiente'
      ORDER BY s.Fecha_Creacion ASC`;
    } else if (roleId === ROLES.TH) {
      query = `
        SELECT s.*, u.Nombre_Usuario, e.Nombre, e.Apellido
          FROM Solicitud s
          JOIN Usuario u ON u.ID_Usuario = s.ID_Usuario
     LEFT JOIN Empleado e ON e.ID_Empleado = u.ID_Empleado
         WHERE (s.Tipo = 'CARTA' AND s.Estado = 'PendienteRH')
            OR (s.Tipo = 'SALIDA' AND s.Estado = 'PendienteRH')
      ORDER BY s.Fecha_Creacion ASC`;
    } else if (roleId === ROLES.ADMIN) {
      query = `
        SELECT s.*, u.Nombre_Usuario, e.Nombre, e.Apellido
          FROM Solicitud s
          JOIN Usuario u ON u.ID_Usuario = s.ID_Usuario
     LEFT JOIN Empleado e ON e.ID_Empleado = u.ID_Empleado
         WHERE (s.Tipo = 'CARTA'  AND s.Estado = 'PendienteRH')
            OR (s.Tipo = 'SALIDA' AND s.Estado IN ('Pendiente','PendienteRH'))
      ORDER BY s.Fecha_Creacion ASC`;
    } else {
      return res.status(403).json({ ok: false, message: "Sin permisos para ver pendientes" });
    }

    const [rows]: any = await pool.query(query);
    return res.json({ ok: true, total: rows.length, data: rows });
  } catch (e) {
    console.error("solicitudesPendientes", e);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};

export const detalleSolicitud = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query(
      `SELECT s.*, u.Nombre_Usuario, e.Nombre, e.Apellido
         FROM Solicitud s
         JOIN Usuario u ON u.ID_Usuario = s.ID_Usuario
    LEFT JOIN Empleado e ON e.ID_Empleado = u.ID_Empleado
        WHERE s.ID_Solicitud = ?
        LIMIT 1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, message: "Solicitud no encontrada" });
    return res.json({ ok: true, data: rows[0] });
  } catch (e) {
    console.error("detalleSolicitud", e);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};

/** ===================== APROBAR / RECHAZAR ===================== */
export const aprobarSolicitud = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const roleId = getRoleId(req);
    const approverId = getUserId(req);
    if (!roleId || !approverId) return res.status(401).json({ ok: false, message: "No autenticado" });

    const [sol]: any = await pool.query(
      `SELECT ID_Usuario, Tipo, Estado FROM Solicitud WHERE ID_Solicitud = ? LIMIT 1`,
      [id]
    );
    if (!sol.length) return res.status(404).json({ ok: false, message: "Solicitud no encontrada" });

    const { ID_Usuario: solicitanteId, Tipo, Estado } = sol[0] as {
      ID_Usuario: number; Tipo: string; Estado: string;
    };

    const solicitante = await getUsuarioYEmpleado(solicitanteId);

    // No aprobables
    if (Tipo === "ALMUERZO" || Tipo === "BOLETA") {
      return res.status(400).json({ ok: false, message: "Esta solicitud no requiere aprobación" });
    }

    // CARTA → Solo TH cuando PendienteRH
    if (Tipo === "CARTA") {
      if (!(roleId === ROLES.TH || roleId === ROLES.ADMIN)) {
        return res.status(403).json({ ok: false, message: "Solo Talento Humano puede aprobar Carta" });
      }
      if (Estado !== "PendienteRH") {
        return res.status(400).json({ ok: false, message: "Carta no está en PendienteRH" });
      }

      await pool.query(`UPDATE Solicitud SET Estado = 'APROBADA' WHERE ID_Solicitud = ?`, [id]);
      await pool.query(
        `INSERT INTO Aprobacion_Solicitud (ID_Solicitud, ID_Aprobador, Nivel_Aprobacion, Fecha_Aprobacion, Estado)
         VALUES (?, ?, 1, NOW(), 'APROBADA')`,
        [id, approverId]
      );

      // Notificar a solicitante
      await enviarNotificacion(
        solicitanteId,
        "Carta de Ingresos aprobada",
        "Tu solicitud de carta fue aprobada por Talento Humano."
      );

      return res.json({ ok: true, message: "✅ Carta aprobada por TH" });
    }

    // SALIDA → JEFE (Pendiente) → TH (PendienteRH)
    if (Tipo === "SALIDA") {
      if (Estado === "Pendiente") {
        if (!(roleId === ROLES.JEFE || roleId === ROLES.ADMIN)) {
          return res.status(403).json({ ok: false, message: "Solo Jefe puede aprobar en Pendiente" });
        }
        await pool.query(`UPDATE Solicitud SET Estado = 'PendienteRH' WHERE ID_Solicitud = ?`, [id]);
        await pool.query(
          `INSERT INTO Aprobacion_Solicitud (ID_Solicitud, ID_Aprobador, Nivel_Aprobacion, Fecha_Aprobacion, Estado)
           VALUES (?, ?, 1, NOW(), 'APROBADA')`,
          [id, approverId]
        );

        // Notificar a solicitante y a TH
        await enviarNotificacion(
          solicitanteId,
          "Tu solicitud de Salida avanzó",
          "Tu solicitud fue aprobada por tu Jefe y pasó a PendienteRH."
        );
        const thUsers = await getUsuariosByRol(ROLES.TH);
        await notificarMany(
          thUsers.map(x => x.ID_Usuario),
          "Solicitud de Salida para autorizar",
          `El colaborador ${solicitante?.Nombre ?? solicitante?.Nombre_Usuario ?? solicitanteId} tiene una solicitud en PendienteRH.`
        );

        return res.json({ ok: true, message: "✅ Aprobación de Jefe registrada (pasa a PendienteRH)" });
      }

      if (Estado === "PendienteRH") {
        if (!(roleId === ROLES.TH || roleId === ROLES.ADMIN)) {
          return res.status(403).json({ ok: false, message: "Solo Talento Humano puede aprobar en PendienteRH" });
        }
        await pool.query(`UPDATE Solicitud SET Estado = 'APROBADA' WHERE ID_Solicitud = ?`, [id]);
        await pool.query(
          `INSERT INTO Aprobacion_Solicitud (ID_Solicitud, ID_Aprobador, Nivel_Aprobacion, Fecha_Aprobacion, Estado)
           VALUES (?, ?, 2, NOW(), 'APROBADA')`,
          [id, approverId]
        );

        // Notificar a solicitante
        await enviarNotificacion(
          solicitanteId,
          "Solicitud de Salida aprobada",
          "Tu solicitud de salida fue aprobada por Talento Humano."
        );

        return res.json({ ok: true, message: "✅ Solicitud de salida aprobada por TH" });
      }

      return res.status(400).json({ ok: false, message: "Estado no válido para aprobar SALIDA" });
    }

    return res.status(400).json({ ok: false, message: "Tipo de solicitud no soportado" });
  } catch (e) {
    console.error("aprobarSolicitud", e);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};

export const rechazarSolicitud = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const roleId = getRoleId(req);
    const approverId = getUserId(req);
    const { motivo } = req.body || {};
    if (!roleId || !approverId) return res.status(401).json({ ok: false, message: "No autenticado" });

    const [sol]: any = await pool.query(
      `SELECT ID_Usuario, Tipo, Estado FROM Solicitud WHERE ID_Solicitud = ? LIMIT 1`,
      [id]
    );
    if (!sol.length) return res.status(404).json({ ok: false, message: "Solicitud no encontrada" });

    const { ID_Usuario: solicitanteId, Tipo, Estado } = sol[0] as {
      ID_Usuario: number; Tipo: string; Estado: string;
    };

    if (Tipo === "ALMUERZO" || Tipo === "BOLETA") {
      return res.status(400).json({ ok: false, message: "Esta solicitud no requiere aprobación" });
    }

    // CARTA → Solo TH cuando PendienteRH
    if (Tipo === "CARTA") {
      if (!(roleId === ROLES.TH || roleId === ROLES.ADMIN)) {
        return res.status(403).json({ ok: false, message: "Solo Talento Humano puede rechazar Carta" });
      }
      if (Estado !== "PendienteRH") {
        return res.status(400).json({ ok: false, message: "Carta no está en PendienteRH" });
      }

      await pool.query(
        `UPDATE Solicitud
            SET Estado = 'RECHAZADA',
                Detalle = CONCAT(COALESCE(Detalle,''), ' | Motivo rechazo: ', ?)
          WHERE ID_Solicitud = ?`,
        [motivo ?? "—", id]
      );
      await pool.query(
        `INSERT INTO Aprobacion_Solicitud (ID_Solicitud, ID_Aprobador, Nivel_Aprobacion, Fecha_Aprobacion, Estado, Observacion)
         VALUES (?, ?, 1, NOW(), 'RECHAZADA', ?)`,
        [id, approverId, motivo ?? ""]
      );

      // Notificar a solicitante
      await enviarNotificacion(
        solicitanteId,
        "Carta de Ingresos rechazada",
        `Tu solicitud fue rechazada por Talento Humano. Motivo: ${motivo ?? "—"}`
      );

      return res.json({ ok: true, message: "✅ Carta rechazada por TH" });
    }

    // SALIDA → Rechazo en Pendiente (Jefe) o PendienteRH (TH)
    if (Tipo === "SALIDA") {
      if (Estado === "Pendiente") {
        if (!(roleId === ROLES.JEFE || roleId === ROLES.ADMIN)) {
          return res.status(403).json({ ok: false, message: "Solo Jefe puede rechazar en Pendiente" });
        }
        await pool.query(
          `UPDATE Solicitud
              SET Estado = 'RECHAZADA',
                  Detalle = CONCAT(COALESCE(Detalle,''), ' | Motivo rechazo: ', ?)
            WHERE ID_Solicitud = ?`,
          [motivo ?? "—", id]
        );
        await pool.query(
          `INSERT INTO Aprobacion_Solicitud (ID_Solicitud, ID_Aprobador, Nivel_Aprobacion, Fecha_Aprobacion, Estado, Observacion)
           VALUES (?, ?, 1, NOW(), 'RECHAZADA', ?)`,
          [id, approverId, motivo ?? ""]
        );

        // Notificar a solicitante
        await enviarNotificacion(
          solicitanteId,
          "Solicitud de Salida rechazada",
          `Tu solicitud fue rechazada por tu Jefe. Motivo: ${motivo ?? "—"}`
        );

        return res.json({ ok: true, message: "✅ Solicitud de salida rechazada por Jefe" });
      }

      if (Estado === "PendienteRH") {
        if (!(roleId === ROLES.TH || roleId === ROLES.ADMIN)) {
          return res.status(403).json({ ok: false, message: "Solo Talento Humano puede rechazar en PendienteRH" });
        }
        await pool.query(
          `UPDATE Solicitud
              SET Estado = 'RECHAZADA',
                  Detalle = CONCAT(COALESCE(Detalle,''), ' | Motivo rechazo: ', ?)
            WHERE ID_Solicitud = ?`,
          [motivo ?? "—", id]
        );
        await pool.query(
          `INSERT INTO Aprobacion_Solicitud (ID_Solicitud, ID_Aprobador, Nivel_Aprobacion, Fecha_Aprobacion, Estado, Observacion)
           VALUES (?, ?, 2, NOW(), 'RECHAZADA', ?)`,
          [id, approverId, motivo ?? ""]
        );

        // Notificar a solicitante
        await enviarNotificacion(
          solicitanteId,
          "Solicitud de Salida rechazada por TH",
          `Tu solicitud fue rechazada por Talento Humano. Motivo: ${motivo ?? "—"}`
        );

        return res.json({ ok: true, message: "✅ Solicitud de salida rechazada por TH" });
      }

      return res.status(400).json({ ok: false, message: "Estado no válido para rechazar SALIDA" });
    }

    return res.status(400).json({ ok: false, message: "Tipo de solicitud no soportado" });
  } catch (e) {
    console.error("rechazarSolicitud", e);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};
