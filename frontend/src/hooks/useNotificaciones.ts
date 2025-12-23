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

    // Polling inteligente: actualizar cada 30 segundos
    const POLLING_INTERVAL = 30000; // 30 segundos
    let intervalId: NodeJS.Timeout;

    const startPolling = () => {
      intervalId = setInterval(() => {
        // Solo hacer polling si la pestaña está visible
        if (!document.hidden) {
          fetchContador();
          fetchNotificaciones();
        }
      }, POLLING_INTERVAL);
    };

    // Manejar visibilidad de la pestaña
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pausar polling cuando la pestaña no está visible
        if (intervalId) {
          clearInterval(intervalId);
        }
      } else {
        // Reanudar polling y actualizar inmediatamente cuando la pestaña vuelve a ser visible
        fetchContador();
        fetchNotificaciones();
        startPolling();
      }
    };

    // Iniciar polling
    startPolling();

    // Escuchar cambios de visibilidad
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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
