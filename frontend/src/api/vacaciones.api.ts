import api from "./axios";

export type EstadoVacacion = "Pendiente" | "PendienteRH" | "Aprobado" | "Rechazado";

export interface Vacacion {
  ID_vacacion: number;
  ID_Empleado: number;
  Fecha_Solicitud: string;
  Fecha_Inicio: string;
  Fecha_Fin: string;
  Dias_Solicitados: number;
  Motivo: string | null;
  Estado: EstadoVacacion;
  Fecha_Solicitud_Format?: string;
  Fecha_Inicio_Format?: string;
  Fecha_Fin_Format?: string;
  Nombre?: string;
  Apellido?: string;
}

export interface NuevaVacacion {
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string;    // YYYY-MM-DD
  motivo?: string;
}

export const crear = (data: NuevaVacacion) => api.post("/vacaciones", data);
export const mis = () => api.get<Vacacion[]>("/vacaciones/mias");
export const detalle = (id: number) => api.get<Vacacion>(`/vacaciones/${id}`);
export const aprobar = (id: number, comentario?: string) => api.post(`/vacaciones/${id}/aprobar`, { comentario });
export const rechazar = (id: number, motivo: string) => api.post(`/vacaciones/${id}/rechazar`, { motivo });
export const rango = (desde?: string, hasta?: string) =>
  api.get<Vacacion[]>("/vacaciones/buscar", { params: { desde, hasta } });

// Reporte de vacaciones
export interface ReporteVacacion {
  ID_Empleado: number;
  Nombre_Completo: string;
  Nombre: string;
  Apellido: string;
  Nombre_Departamento: string;
  Nombre_Puesto: string;
  Fecha_Contratacion: string;
  Estado_Empleado: string;
  Dias_Anuales: number;
  Dias_Tomados: number;
  Dias_Pendientes: number;
  Dias_Disponibles: number;
  Anios_Laborados: number;
  Meses_Laborados: number;
  Meses_Totales: number;
  Dias_Acumulados_Proporcional: number;
}

export const obtenerReporte = (departamento?: string, estado?: string) =>
  api.get<ReporteVacacion[]>("/vacaciones/reporte", { 
    params: { departamento, estado } 
  });
