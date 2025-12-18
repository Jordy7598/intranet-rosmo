//src/pages/Principales/Notificacion.tsx
import React, { useEffect, useState, useRef } from "react";
import { Bell, X, Check, CheckCheck, Trash2, Calendar, FileText, MessageCircle, Image, BarChart3, User } from "lucide-react";

interface Notificacion {
  ID_Notificacion: number;
  Titulo: string;
  Mensaje: string;
  Tipo: 'Vacacion' | 'Solicitud' | 'Noticia' | 'Galeria' | 'Encuesta' | 'General';
  Fecha_Creacion: string;
  Leido: boolean;
  Link_Destino?: string;
}

interface NotificationSystemProps {
  useNotificaciones: () => {
    notificaciones: Notificacion[];
    contador: number;
    loading: boolean;
    marcarTodasComoLeidas: () => Promise<void>;
    marcarComoLeida: (id: number) => Promise<void>;
    fetchNotificaciones: () => Promise<void>;
  };
  eliminarNotificacion?: (id: number) => Promise<void>;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  useNotificaciones,
  eliminarNotificacion
}) => {
  const {
    notificaciones,
    contador,
    loading,
    marcarTodasComoLeidas,
    marcarComoLeida,
    fetchNotificaciones
  } = useNotificaciones();

  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Obtener icono según tipo
  const getIconoTipo = (tipo: string) => {
    const iconos = {
      Vacacion: <Calendar className="w-4 h-4" />,
      Solicitud: <FileText className="w-4 h-4" />,
      Noticia: <MessageCircle className="w-4 h-4" />,
      Galeria: <Image className="w-4 h-4" />,
      Encuesta: <BarChart3 className="w-4 h-4" />,
      General: <User className="w-4 h-4" />
    };
    return iconos[tipo as keyof typeof iconos] || <Bell className="w-4 h-4" />;
  };

  // Obtener color según tipo
  const getColorTipo = (tipo: string) => {
    const colores = {
      Vacacion: 'text-blue-600 bg-blue-100',
      Solicitud: 'text-green-600 bg-green-100',
      Noticia: 'text-red-600 bg-red-100',
      Galeria: 'text-purple-600 bg-purple-100',
      Encuesta: 'text-orange-600 bg-orange-100',
      General: 'text-gray-600 bg-gray-100'
    };
    return colores[tipo as keyof typeof colores] || 'text-gray-600 bg-gray-100';
  };

  // Formatear fecha relativa
  const formatearFecha = (fecha: string) => {
    const now = new Date();
    const fechaNotif = new Date(fecha);
    const diffMs = now.getTime() - fechaNotif.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHoras < 24) return `${diffHoras}h`;
    if (diffDias < 7) return `${diffDias}d`;
    return fechaNotif.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  // Filtrar notificaciones
  const notificacionesFiltradas = soloNoLeidas
    ? notificaciones.filter(n => !n.Leido)
    : notificaciones;

  // Cerrar panel al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setMostrarPanel(false);
      }
    };

    if (mostrarPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarPanel]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (!mostrarPanel) {
        fetchNotificaciones();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [mostrarPanel, fetchNotificaciones]);

  const handleOpenPanel = () => {
    setMostrarPanel(!mostrarPanel);
    if (!mostrarPanel) {
      fetchNotificaciones();
    }
  };

  const handleNotificationClick = async (notificacion: Notificacion) => {
    if (!notificacion.Leido) {
      await marcarComoLeida(notificacion.ID_Notificacion);
    }

    if (notificacion.Link_Destino) {
      // Aquí podrías usar React Router si lo tienes configurado
      window.location.href = notificacion.Link_Destino;
    }

    setMostrarPanel(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Botón de notificaciones - Adaptado al estilo de tu header */}
      <button
        onClick={handleOpenPanel}
        className="header-btn relative"
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          color: 'white',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
          fontSize: '20px'
        }}
      >
        <Bell size={20} />
        {contador > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1 min-w-5 h-5 flex items-center justify-center font-medium"
            style={{
              fontSize: '11px',
              minWidth: '20px',
              height: '20px'
            }}
          >
            {contador > 99 ? '99+' : contador}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {mostrarPanel && (
        <div
          className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg border border-gray-200 z-50 overflow-hidden"
          style={{
            width: '400px',
            maxHeight: '500px',
            top: '60px'
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-lg">Notificaciones</h3>
              <button
                onClick={() => setMostrarPanel(false)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Controles */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSoloNoLeidas(!soloNoLeidas)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${soloNoLeidas
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                  {soloNoLeidas ? 'Ver todas' : 'Solo no leídas'}
                </button>
                {contador > 0 && (
                  <span className="text-sm text-gray-500">
                    {contador} sin leer
                  </span>
                )}
              </div>

              {contador > 0 && (
                <button
                  onClick={() => {
                    marcarTodasComoLeidas();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  Marcar todas
                </button>
              )}
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-3"></div>
                <p className="text-sm text-gray-500">Cargando notificaciones...</p>
              </div>
            ) : notificacionesFiltradas.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  {soloNoLeidas ? 'No tienes notificaciones sin leer' : 'No hay notificaciones'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {soloNoLeidas ? 'Todas las notificaciones han sido leídas' : 'Las notificaciones aparecerán aquí'}
                </p>
              </div>
            ) : (
              notificacionesFiltradas.map((notificacion) => (
                <div
                  key={notificacion.ID_Notificacion}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-all cursor-pointer group ${!notificacion.Leido ? 'bg-red-50 border-l-4 border-l-red-500' : ''
                    }`}
                  onClick={() => handleNotificationClick(notificacion)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icono de tipo */}
                    <div className={`p-2.5 rounded-lg ${getColorTipo(notificacion.Tipo)} flex-shrink-0`}>
                      {getIconoTipo(notificacion.Tipo)}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className={`font-semibold text-sm leading-tight ${!notificacion.Leido ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                          {notificacion.Titulo}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-500 font-medium">
                            {formatearFecha(notificacion.Fecha_Creacion)}
                          </span>
                          {!notificacion.Leido && (
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                        {notificacion.Mensaje}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium px-2 py-1 bg-gray-100 rounded-full">
                          {notificacion.Tipo}
                        </span>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notificacion.Leido && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                marcarComoLeida(notificacion.ID_Notificacion);
                              }}
                              className="p-1.5 hover:bg-green-100 rounded-full text-gray-500 hover:text-green-600 transition-colors"
                              title="Marcar como leída"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {eliminarNotificacion && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                eliminarNotificacion(notificacion.ID_Notificacion);
                              }}
                              className="p-1.5 hover:bg-red-100 rounded-full text-gray-500 hover:text-red-600 transition-colors"
                              title="Eliminar notificación"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notificaciones.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setMostrarPanel(false);
                  // Aquí podrías navegar a una página completa de notificaciones
                  // navigate('/notificaciones');
                }}
                className="w-full text-sm text-red-600 hover:text-red-700 font-medium py-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default NotificationSystem;