import { useEffect, useState } from "react";
import api from "../api/axios";

export interface Notificacion {
  ID_Notificacion: number;
  Titulo: string;
  Mensaje: string;
  Tipo: string;
  Fecha_Creacion: string;
  Leido: boolean;
  Link_Destino?: string;
}

export const useNotificaciones = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [contador, setContador] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notificaciones");
      setNotificaciones(res.data.notificaciones || []);
    } catch (err) {
      console.error("Error al traer notificaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContador = async () => {
    try {
      const res = await api.get("/notificaciones/contador");
      setContador(res.data.total_no_leidas || 0);
    } catch (err) {
      console.error("Error al traer contador:", err);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      await api.put("/notificaciones/marcar-todas-leidas");
      setContador(0);
      setNotificaciones(prev => prev.map(n => ({ ...n, Leido: true })));
    } catch (err) {
      console.error("Error al marcar todas:", err);
    }
  };

  const marcarComoLeida = async (id: number) => {
    try {
      await api.put(`/notificaciones/${id}/leida`);
      setContador(prev => Math.max(prev - 1, 0));
      setNotificaciones(prev => prev.map(n => n.ID_Notificacion === id ? { ...n, Leido: true } : n));
    } catch (err) {
      console.error("Error al marcar notificación:", err);
    }
  };

  const eliminarNotificacion = async (id: number) => {
    try {
      await api.delete(`/notificaciones/${id}`);
      setNotificaciones(prev => prev.filter(n => n.ID_Notificacion !== id));
      setContador(prev => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
    fetchContador();
  }, []);

  return {
    notificaciones,
    contador,
    loading,
    fetchNotificaciones,
    fetchContador,
    marcarTodasComoLeidas,
    marcarComoLeida,
    eliminarNotificacion,
  };
};
