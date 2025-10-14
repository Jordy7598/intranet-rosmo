// backend/src/controllers/calendario.controller.ts
import { Request, Response } from "express";
import { pool } from "../config/db";

/** Roles: 1=Admin, 2=Talento Humano, 3=Jefe, 4=Empleado, 5=Mercadeo */
const ROLES_EMPRESA = [0,1, 2]; // pueden ver "Toda la empresa"

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (s: string, n: number) => {
  const d = new Date(s); d.setDate(d.getDate() + n); return iso(d);
};
const isValidDate = (v: any) => {
  const d = new Date(v); return !isNaN(d.getTime());
};
/** Devuelve YYYY-MM-DD para ese "día/mes" en el año indicado (ajusta 29-feb si no es bisiesto) */
function dateForYearSameMonthDay(base: Date, year: number): string {
  const month = base.getMonth() + 1;
  const day = base.getDate();
  const isLeap = (year % 400 === 0) || (year % 4 === 0 && year % 100 !== 0);
  const finalDay = (month === 2 && day === 29 && !isLeap) ? 28 : day;
  const mm = String(month).padStart(2, "0");
  const dd = String(finalDay).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/**
 * GET /api/calendario?year=YYYY&month=MM&view=usuario|equipo|empresa
 * - Cumpleaños y aniversarios: SOLO si el mes real coincide con month (colocados en el año solicitado).
 * - Eventos corporativos: por año/mes.
 * - Vacaciones: rangos que intersectan el mes; filtros por vista y rol.
 */
export async function getCalendario(req: Request, res: Response) {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    const view = String(req.query.view || "usuario"); // usuario | equipo | empresa

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ ok: false, message: "'year' y 'month' inválidos" });
    }

    // Usuario autenticado según tu JwtPayload: { id, rol, empleado }
    //console.log("[Calendario] req.user completo:", req.user);
    const userAuth = req.user || { id: 0, rol: 0, empleado: 0 };
    const roleId: number = Number(userAuth.rol || 0);
    const employeeId: number = Number(userAuth.empleado || 0);
    //console.log(`[Calendario] User: ID=${userAuth.id}, Rol=${userAuth.rol}, Empleado=${userAuth.empleado}, View=${view}`);

    const eventos: any[] = [];

    // === 1) Empleados (cumpleaños/aniversarios) — tolerante a tabla vacía ===
    const [rowsEmpleados] = await pool.execute(
      `SELECT ID_Empleado, Nombre, Apellido, Fecha_Nacimiento, Fecha_Contratacion, ID_Jefe_Inmediato
       FROM empleado
       WHERE Estado='Activo'`
    );
    const empleados: any[] = Array.isArray(rowsEmpleados) ? (rowsEmpleados as any[]) : [];

    // Cumpleaños (solo si el MES real del nacimiento coincide con 'month')
    for (const emp of empleados) {
      if (emp.Fecha_Nacimiento && isValidDate(emp.Fecha_Nacimiento)) {
        const baseDate = new Date(emp.Fecha_Nacimiento);
        const baseMonth = baseDate.getMonth() + 1;
        if (baseMonth === month) {
          const start = dateForYearSameMonthDay(baseDate, year);
          eventos.push({
            id: `bd-${emp.ID_Empleado}-${start}`,
            title: `🎂 Cumpleaños de ${emp.Nombre} ${emp.Apellido}`,
            start,
            allDay: true,
            color: "#F59E0B",
            extendedProps: { tipo: "cumple", empleadoId: emp.ID_Empleado }
          });
        }
      }
    }

    // Aniversarios (solo si el MES real de contratación coincide con 'month')
    for (const emp of empleados) {
      if (emp.Fecha_Contratacion && isValidDate(emp.Fecha_Contratacion)) {
        const baseDate = new Date(emp.Fecha_Contratacion);
        const baseMonth = baseDate.getMonth() + 1;
        if (baseMonth === month) {
          const start = dateForYearSameMonthDay(baseDate, year);
          eventos.push({
            id: `an-${emp.ID_Empleado}-${start}`,
            title: `🎉 Aniversario de ${emp.Nombre} ${emp.Apellido}`,
            start,
            allDay: true,
            color: "#10B981",
            extendedProps: { tipo: "aniv", empleadoId: emp.ID_Empleado }
          });
        }
      }
    }

    // === 2) Eventos corporativos (si la tabla está vacía, simplemente no agrega) ===
    const [rowsEventosCorp] = await pool.execute(
      `SELECT ID_Evento, Titulo, Tipo, DATE(Fecha_Evento) AS Fecha
       FROM evento_corporativo
       WHERE YEAR(Fecha_Evento)=? AND MONTH(Fecha_Evento)=?`,
      [year, month]
    );
    const eventosCorp: any[] = Array.isArray(rowsEventosCorp) ? (rowsEventosCorp as any[]) : [];
    for (const ev of eventosCorp) {
      if (ev.Fecha && isValidDate(ev.Fecha)) {
        eventos.push({
          id: `ev-${ev.ID_Evento}`,
          title: ev.Titulo,
          start: ev.Fecha,
          allDay: true,
          color: ev.Tipo === "Actividad" ? "#3B82F6" : "#6366F1",
          extendedProps: { tipo: "evento", subtipo: ev.Tipo }
        });
      }
    }

    // === 3) Vacaciones — rangos que intersectan el mes, sin binds undefined ===
    // Notas para garantizar resultados:
    // - Usamos DATE() para ignorar horas y evitar off-by-one.
    // - Intersección de rango: inicio <= lastDay && fin >= firstDay.
    const firstDayOfMonth = iso(new Date(year, month - 1, 1));
    const lastDayOfMonth = iso(new Date(year, month, 0));

    let sqlVacaciones = `
      SELECT 
        v.ID_vacacion,
        v.ID_Empleado,
        DATE(v.Fecha_Inicio) AS Fecha_Inicio,  -- normalizamos a DATE por si hay horas
        DATE(v.Fecha_Fin)    AS Fecha_Fin,
        v.Estado,
        CONCAT(e.Nombre,' ',e.Apellido) AS Nombre,
        e.ID_Jefe_Inmediato
      FROM vacacion v
      JOIN empleado e ON e.ID_Empleado = v.ID_Empleado
      WHERE DATE(v.Fecha_Inicio) <= ? 
        AND DATE(v.Fecha_Fin)    >= ?
    `;
    const sqlParamsVac: any[] = [lastDayOfMonth, firstDayOfMonth];

    if (view === "usuario") {
      if (employeeId > 0) {
        sqlVacaciones += " AND v.ID_Empleado = ?";
        sqlParamsVac.push(employeeId);
      } else {
        // Si el usuario (p.ej. Admin) no está ligado a empleado, no mostramos vacaciones en 'usuario'
        sqlVacaciones += " AND 1=0";
      }
    } else if (view === "equipo") {
      if (employeeId > 0) {
        // Ve sus vacaciones + las de su equipo
        sqlVacaciones += " AND (v.ID_Empleado = ? OR e.ID_Jefe_Inmediato = ?)";
        sqlParamsVac.push(employeeId, employeeId);
      } else {
        sqlVacaciones += " AND 1=0";
      }
    } else if (view === "empresa") {
      if (!ROLES_EMPRESA.includes(roleId)) {
        return res.status(403).json({ ok: false, message: "No autorizado (empresa)" });
      }
      // sin filtro extra (Admin/TH ven todas las vacaciones que intersectan)
    } else {
      return res.status(400).json({ ok: false, message: "view inválido (usuario|equipo|empresa)" });
    }

    const [rowsVacaciones] = await pool.execute(sqlVacaciones, sqlParamsVac);
    const vacaciones: any[] = Array.isArray(rowsVacaciones) ? (rowsVacaciones as any[]) : [];

    // Mapeo de estado a color – soporta variaciones comunes
    const colorByEstado = (estado: string) => {
      const e = (estado || "").toLowerCase();
      if (e.includes("aprob")) return "#22C55E";          // Aprobado/Aprobada
      if (e.includes("pend")) return "#EAB308";           // Pendiente/PendienteRH
      if (e.includes("rech")) return "#EF4444";           // Rechazado/Rechazada
      return "#64748B"; // gris por defecto
    };

    for (const vac of vacaciones) {
      if (isValidDate(vac.Fecha_Inicio) && isValidDate(vac.Fecha_Fin)) {
        eventos.push({
          id: `va-${vac.ID_vacacion}`,
          title: `🗓️ Vacaciones ${vac.Nombre}`,
          start: vac.Fecha_Inicio,
          end: addDays(vac.Fecha_Fin, 1), // end exclusivo para calendarios
          allDay: true,
          color: colorByEstado(vac.Estado),
          extendedProps: { tipo: "vacacion", empleadoId: vac.ID_Empleado, estado: vac.Estado }
        });
      }
    }

    return res.json({ ok: true, eventos });
  } catch (error) {
    console.error("Calendario ERROR:", error);
    return res.status(500).json({ ok: false, message: "Error en calendario" });
  }
}
