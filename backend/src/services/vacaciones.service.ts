import { pool } from "../config/db";

class AppError extends Error { statusCode:number; constructor(msg:string, code=400){super(msg);this.statusCode=code;} }

type Estado = "Pendiente" | "PendienteRH" | "Aprobado" | "Rechazado";

const ROL_ADMIN = 1;
const ROL_TH    = 2;
const ROL_JEFE  = 3;
const ROL_EMPL  = 4;
const ROL_LECT  = 5;

/* ===================== Helpers ===================== */

async function getUsuarioIdByEmpleado(conn: any, empleadoId: number): Promise<number | null> {
  const [rows]: any = await conn.query(
    `SELECT u.ID_Usuario
       FROM usuario u
      WHERE u.ID_Empleado = ?
      LIMIT 1`,
    [empleadoId]
  );
  return rows.length ? rows[0].ID_Usuario : null;
}

async function getJefeInmediatoUsuarioId(conn: any, empleadoId: number): Promise<number | null> {
  // empleado -> jefe (empleado) -> usuario
  const [rows]: any = await conn.query(
    `SELECT e2.ID_Empleado AS JefeEmpleadoId
       FROM empleado e
  LEFT JOIN empleado e2 ON e.ID_Jefe_Inmediato = e2.ID_Empleado
      WHERE e.ID_Empleado=?`,
    [empleadoId]
  );
  if (!rows.length || !rows[0].JefeEmpleadoId) return null;
  return getUsuarioIdByEmpleado(conn, rows[0].JefeEmpleadoId);
}

async function getUsuariosTalentoHumano(conn: any): Promise<number[]> {
  const [rows]: any = await conn.query(
    `SELECT ID_Usuario FROM usuario WHERE ID_Rol=?`,
    [ROL_TH]
  );
  return rows.map((r: any) => r.ID_Usuario);
}

async function notify(
  conn: any,
  userId: number,
  title: string,
  message: string,
  link: string
) {
  await conn.query(
    `INSERT INTO notificacion (ID_Usuario, Titulo, Mensaje, Tipo, Fecha_Creacion, Leido, Link_Destino)
     VALUES (?, ?, ?, 'Vacacion', NOW(), 0, ?)`,
    [userId, title, message, link]
  );
}

/* ===================== Crear solicitud ===================== */

export async function crearSolicitud(params: {
  empleadoId: number;
  usuarioId: number; // no se usa para notificar al solicitante, solo por si lo necesitas
  fechaInicio: string; // 'YYYY-MM-DD'
  fechaFin: string;   // 'YYYY-MM-DD'
  motivo?: string;
}) {
  const { empleadoId, fechaInicio, fechaFin, motivo } = params;

  if (!fechaInicio || !fechaFin) throw new AppError("Fechas obligatorias");
  const dIni = new Date(fechaInicio + "T00:00:00");
  const dFin = new Date(fechaFin + "T00:00:00");
  if (dFin < dIni) throw new AppError("La fecha fin no puede ser menor a inicio");

  const diasSolicitados = Math.floor((dFin.getTime() - dIni.getTime()) / 86400000) + 1;
  if (diasSolicitados <= 0) throw new AppError("Rango de fechas inválido");

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // empleado activo y días disponibles
    const [empRows]: any = await conn.query(
      `SELECT ID_Empleado, Nombre, Apellido, Dias_Vacaciones_Anuales,
              IFNULL(Dias_Vacaciones_Tomados,0) AS Tomados, Estado
         FROM empleado WHERE ID_Empleado=?`, [empleadoId]
    );
    if (empRows.length === 0) throw new AppError("Empleado no existe", 404);
    if (empRows[0].Estado !== "Activo") throw new AppError("Empleado inactivo");
    const disponibles = (empRows[0].Dias_Vacaciones_Anuales || 0) - (empRows[0].Tomados || 0);
    if (diasSolicitados > disponibles) throw new AppError(`No tiene días suficientes. Disponibles: ${disponibles}`);

    // solapamiento
    const [overlap]: any = await conn.query(
      `SELECT COUNT(*) AS cnt
         FROM vacacion
        WHERE ID_Empleado=?
          AND Estado IN ('Pendiente','PendienteRH','Aprobado')
          AND ( (Fecha_Inicio <= ? AND Fecha_Fin >= ?)
             OR (Fecha_Inicio <= ? AND Fecha_Fin >= ?)
             OR (Fecha_Inicio >= ? AND Fecha_Fin <= ?) )`,
      [empleadoId, fechaInicio, fechaInicio, fechaFin, fechaFin, fechaInicio, fechaFin]
    );
    if (overlap[0].cnt > 0) throw new AppError("Existe una solicitud que se solapa con ese rango");

    await conn.query(
      `INSERT INTO vacacion (ID_Empleado, Fecha_Solicitud, Fecha_Inicio, Fecha_Fin, Dias_Solicitados, Motivo, Estado)
       VALUES (?, NOW(), ?, ?, ?, ?, 'Pendiente')`,
      [empleadoId, fechaInicio, fechaFin, diasSolicitados, motivo || null]
    );

    /* Notificación: nueva solicitud → Jefe inmediato */
    const jefeUsuarioId = await getJefeInmediatoUsuarioId(conn, empleadoId);
    if (jefeUsuarioId) {
      const nombre = `${empRows[0].Nombre || ""} ${empRows[0].Apellido || ""}`.trim();
      const msg = `${nombre} solicitó vacaciones del ${fechaInicio} al ${fechaFin}.`;
      await notify(conn, jefeUsuarioId, "Nueva solicitud de vacaciones", msg, "/vacaciones/aprobar");
    }

    await conn.commit();
    return { ok: true };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/* ===================== Listar / Detalle ===================== */

export async function listarPorEmpleado(empleadoId: number) {
  const [rows] = await pool.query(
    `SELECT v.*, 
            DATE_FORMAT(v.Fecha_Solicitud,'%Y-%m-%d %H:%i:%s') AS Fecha_Solicitud_Format,
            DATE_FORMAT(v.Fecha_Inicio,'%Y-%m-%d') AS Fecha_Inicio_Format,
            DATE_FORMAT(v.Fecha_Fin,'%Y-%m-%d') AS Fecha_Fin_Format,
            e.Nombre, e.Apellido
       FROM vacacion v
  LEFT JOIN empleado e ON e.ID_Empleado = v.ID_Empleado
      WHERE v.ID_Empleado = ?
      ORDER BY v.Fecha_Solicitud DESC`,
    [empleadoId]
  );
  return rows;
}

export async function obtenerDetalle(id: number, user: { id:number; rol:number; empleado:number }) {
  const [rows]: any = await pool.query(
    `SELECT v.*, e.Nombre, e.Apellido
       FROM vacacion v
  LEFT JOIN empleado e ON e.ID_Empleado = v.ID_Empleado
      WHERE v.ID_vacacion = ?`, [id]
  );
  if (rows.length === 0) return null;

  const reg = rows[0];
  if (user.rol === ROL_EMPL || user.rol === ROL_LECT) {
    if (reg.ID_Empleado !== user.empleado) throw new AppError("No autorizado", 403);
  }
  return reg;
}

/* ===================== Cambiar estado (2 niveles + notificaciones) ===================== */

export async function cambiarEstado(params: {
  solicitudId: number;
  aprobadorUsuarioId: number;
  aprobadorRolId: number; // 1 Admin, 2 TH, 3 Jefe
  estado: "Aprobado" | "Rechazado";
  comentario?: string;
}) {
  const { solicitudId, aprobadorUsuarioId, aprobadorRolId, estado, comentario } = params;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // bloquear la solicitud
    const [rows]: any = await conn.query(
      `SELECT ID_vacacion, ID_Empleado, Estado, Fecha_Inicio, Fecha_Fin
         FROM vacacion WHERE ID_vacacion=? FOR UPDATE`,
      [solicitudId]
    );
    if (rows.length === 0) throw new AppError("Solicitud no existe", 404);
    const vac = rows[0] as { ID_vacacion:number; ID_Empleado:number; Estado:Estado; Fecha_Inicio:string; Fecha_Fin:string };

    // usuario solicitante (mapeo empleado -> usuario)
    const solicitanteUsuarioId = await getUsuarioIdByEmpleado(conn, vac.ID_Empleado);

    // Rechazo: notificar a usuario
    if (estado === "Rechazado") {
      await conn.query(
        `UPDATE vacacion SET Estado='Rechazado' WHERE ID_vacacion=?`,
        [solicitudId]
      );
      await conn.query(
        `INSERT INTO aprobacion_vacacion (ID_Vacacion, ID_Aprobador, Nivel_Aprobacion, Fecha_Aprobacion, Estado)
         VALUES (?, ?, ?, NOW(), 'Rechazado')`,
        [solicitudId, aprobadorUsuarioId, nivelPorRol(aprobadorRolId)]
      );

      if (solicitanteUsuarioId) {
        const motivo = comentario ? ` Motivo: ${comentario}` : "";
        await notify(conn, solicitanteUsuarioId, "Vacaciones rechazadas", `Tu solicitud fue rechazada.${motivo}`, "/vacaciones/solicitudes");
      }

      await conn.commit();
      return { ok: true };
    }

    // Aprobación por Jefe → pasa a PendienteRH y notifica
    if (aprobadorRolId === ROL_JEFE) {
      if (vac.Estado !== "Pendiente")
        throw new AppError("El Jefe solo puede aprobar solicitudes en estado Pendiente");

      await conn.query(
        `INSERT INTO aprobacion_vacacion (ID_Vacacion, ID_Aprobador, Nivel_Aprobacion, Fecha_Aprobacion, Estado)
         VALUES (?, ?, 1, NOW(), 'Aprobado')`,
        [solicitudId, aprobadorUsuarioId]
      );

      await conn.query(
        `UPDATE vacacion SET Estado='PendienteRH' WHERE ID_vacacion=?`,
        [solicitudId]
      );

      // Notificar a solicitante y a RH
      if (solicitanteUsuarioId) {
        await notify(conn, solicitanteUsuarioId, "Aprobación de Jefe", "Tu solicitud fue aprobada por tu Jefe inmediato. Falta aprobación de Talento Humano.", "/vacaciones/solicitudes");
      }
      const listaRH = await getUsuariosTalentoHumano(conn);
      if (listaRH.length) {
        const msgRH = `Solicitud ID ${solicitudId} aprobada por Jefe. Revisar aprobación final.`;
        for (const rhId of listaRH) {
          await notify(conn, rhId, "Solicitud de vacaciones pendiente (RH)", msgRH, "/vacaciones/aprobar");
        }
      }

      await conn.commit();
      return { ok: true };
    }

    // Aprobación por RH/Admin → pasa a Aprobado y notifica
    if (aprobadorRolId === ROL_TH || aprobadorRolId === ROL_ADMIN) {
      if (vac.Estado !== "PendienteRH")
        throw new AppError("RH/Admin solo puede aprobar solicitudes en estado PendienteRH");

      const [aprs]: any = await conn.query(
        `SELECT COUNT(*) AS cnt FROM aprobacion_vacacion 
          WHERE ID_Vacacion=? AND Nivel_Aprobacion=1 AND Estado='Aprobado'`,
        [solicitudId]
      );
      if ((aprs[0]?.cnt || 0) === 0)
        throw new AppError("No existe aprobación previa del Jefe");

      await conn.query(
        `INSERT INTO aprobacion_vacacion (ID_Vacacion, ID_Aprobador, Nivel_Aprobacion, Fecha_Aprobacion, Estado)
         VALUES (?, ?, 2, NOW(), 'Aprobado')`,
        [solicitudId, aprobadorUsuarioId]
      );

      await conn.query(
        `UPDATE vacacion SET Estado='Aprobado' WHERE ID_vacacion=?`,
        [solicitudId]
      );

      // Sumar días a tomados
      const [diasRow]: any = await conn.query(
        `SELECT DATEDIFF(Fecha_Fin, Fecha_Inicio)+1 AS dias FROM vacacion WHERE ID_vacacion=?`,
        [solicitudId]
      );
      const dias = Number(diasRow[0]?.dias || 0);
      await conn.query(
        `UPDATE empleado SET Dias_Vacaciones_Tomados = IFNULL(Dias_Vacaciones_Tomados,0) + ? WHERE ID_Empleado=?`,
        [dias, vac.ID_Empleado]
      );

      // Notificar a solicitante
      if (solicitanteUsuarioId) {
        const msg = `Tus vacaciones del ${vac.Fecha_Inicio} al ${vac.Fecha_Fin} han sido aprobadas.`;
        await notify(conn, solicitanteUsuarioId, "Vacaciones aprobadas", msg, "/vacaciones/solicitudes");
      }

      await conn.commit();
      return { ok: true };
    }

    throw new AppError("No autorizado para aprobar", 403);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

function nivelPorRol(rolId:number): number {
  if (rolId === ROL_JEFE) return 1;
  if (rolId === ROL_TH || rolId === ROL_ADMIN) return 2;
  return 0;
}

/* ===================== Búsqueda por rango ===================== */

export async function buscarPorRango(desde?: string, hasta?: string) {
  const params: any[] = [];
  let where = "1=1";
  if (desde) { where += " AND v.Fecha_Inicio >= ?"; params.push(desde); }
  if (hasta) { where += " AND v.Fecha_Fin <= ?"; params.push(hasta); }

  const [rows] = await pool.query(
    `SELECT v.*, e.Nombre, e.Apellido
       FROM vacacion v
  LEFT JOIN empleado e ON e.ID_Empleado = v.ID_Empleado
      WHERE ${where}
      ORDER BY v.Fecha_Inicio ASC`,
    params
  );
  return rows;
}

/* ===================== Obtener saldo Vacaciones ===================== */
export async function obtenerSaldo(empleadoId: number) {
  const empId = Number(empleadoId);
  if (!Number.isFinite(empId) || empId <= 0) {
    throw Object.assign(new Error("empleadoId inválido"), { statusCode: 400 });
  }

  const [rows]: any = await pool.query(
    `
    SELECT 
      anios_laborando,
      anuales,
      acumulado,
      tomados,
      pendientes,   
      disponibles
    FROM vw_vacaciones_disponibles_simple
    WHERE ID_Empleado = ?
    `,
    [empId]
  );

  if (!rows.length) return null;
  return rows[0] as {
    anios_laborando: number;
    anuales: number;       // días por año
    acumulado: number;     // años * anuales
    tomados: number;       // gozados
    pendientes: number;    // 0 en esta vista
    disponibles: number;   // acumulado - tomados
  };
}