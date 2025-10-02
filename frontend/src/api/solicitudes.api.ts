/*eslint-disable @typescript-eslint/no-explicit-any */

import api from "./axios";

export type TipoSolicitud = "CARTA" | "BOLETA" | "SALIDA" | "ALMUERZO";
export type EstadoSolicitud = "Pendiente" | "PendienteRH" | "APROBADA" | "RECHAZADA" | "ENTREGADA";

export interface Solicitud {
  ID_Solicitud: number;
  ID_Usuario: number;
  Tipo: TipoSolicitud;
  Estado: EstadoSolicitud;
  Detalle?: string | null;
  Motivo?: string | null;
  Fecha_Creacion: string;         // ISO
  Fecha_Inicio?: string | null;   // ISO
  Fecha_Fin?: string | null;      // ISO
  Quincena?: 1 | 2 | null;
  Mes?: number | null;
  Anio?: number | null;
}

export interface Planilla {
  ID_Empleado: number;
  Quincena: 1 | 2 | null;
  Mes: number | null;
  Anio: number | null;
  // + los demás campos que tengas (Sueldo_Base, Bonos, etc.)
}

export interface ApiList<T> {
  ok: boolean;
  total: number;
  data: T[];
  [k: string]: any;
}
export interface ApiItem<T> {
  ok: boolean;
  data: T;
  [k: string]: any;
}
export interface ApiOk {
  ok: boolean;
  message?: string;
  [k: string]: any;
}

// ---- Endpoints ----

// ALMUERZO
export async function postAlmuerzo(): Promise<ApiOk> {
  const { data } = await api.post("/solicitudes/almuerzo");
  return data;
}
export async function getListaAlmuerzo(params?: { fecha?: string }): Promise<ApiList<any>> {
  const { data } = await api.get("/solicitudes/almuerzo/lista", { params });
  return data;
}

// CARTA DE INGRESOS
export async function postCarta(payload: { motivo?: string }): Promise<ApiOk> {
  const { data } = await api.post("/solicitudes/carta", payload);
  return data;
}

// BOLETA
export async function postBoleta(payload: { quincena: 1 | 2; mes: number; anio: number }): Promise<ApiOk> {
  const { data } = await api.post("/solicitudes/boleta", payload);
  return data;
}
export async function getBoleta(params: { quincena: 1 | 2; mes: number; anio: number }): Promise<ApiItem<Planilla>> {
  const { data } = await api.get("/solicitudes/boleta", { params });
  return data;
}

// SALIDA ANTICIPADA
export async function postSalida(payload: { motivo: string; fecha_inicio: string; fecha_fin: string }): Promise<ApiOk> {
  const { data } = await api.post("/solicitudes/salida", payload);
  return data;
}

// GENERALES
export async function getMisSolicitudes(): Promise<ApiList<Solicitud>> {
  const { data } = await api.get("/solicitudes/mias");
  return data;
}
export async function getPendientes(): Promise<ApiList<Solicitud>> {
  const { data } = await api.get("/solicitudes/pendientes");
  return data;
}
export async function getSolicitudById(id: number): Promise<ApiItem<Solicitud>> {
  const { data } = await api.get(`/solicitudes/${id}`);
  return data;
}
export async function aprobarSolicitud(id: number): Promise<ApiOk> {
  const { data } = await api.patch(`/solicitudes/${id}/aprobar`);
  return data;
}
export async function rechazarSolicitud(id: number, payload?: { motivo?: string }): Promise<ApiOk> {
  const { data } = await api.patch(`/solicitudes/${id}/rechazar`, payload ?? {});
  return data;
}
