import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Trash2,
  Send,
  X,
  Calendar,
  User,
  Image as ImageIcon,
} from "lucide-react";
import {
  obtenerGaleria,
  eliminarGaleria,
  toggleLikeGaleria,
  agregarComentario,
  eliminarComentario,
} from "../../api/galeria.api";
import type {
  GaleriaDetalle as GaleriaDetalleType,
  ArchivoGaleria,
} from "../../api/galeria.api";
import "../../styles/Galeria.css";

export default function GaleriaDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<GaleriaDetalleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [comentario, setComentario] = useState("");
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<ArchivoGaleria | null>(null);

  const rol = Number(localStorage.getItem("usuario_rol"));
  const userId = Number(localStorage.getItem("usuario_id"));
  const puedeEliminar = rol === 1 || rol === 2 || (data && data.galeria.ID_Creador === userId);

  useEffect(() => {
    if (id) {
      cargarGaleria();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cargarGaleria = async () => {
    try {
      setLoading(true);
      const galeria = await obtenerGaleria(Number(id));
      setData(galeria);
    } catch (error) {
      console.error("Error al cargar galería:", error);
      alert("Error al cargar la galería");
      navigate("/galeria");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!data) return;
    try {
      const response = await toggleLikeGaleria(data.galeria.ID_Galeria);
      setData({
        ...data,
        galeria: {
          ...data.galeria,
          Usuario_Dio_Like: response.liked ? 1 : 0,
          Total_Likes: response.liked
            ? data.galeria.Total_Likes + 1
            : data.galeria.Total_Likes - 1,
        },
      });
    } catch (error) {
      console.error("Error al dar like:", error);
    }
  };

  const handleEnviarComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !comentario.trim()) return;

    try {
      setEnviandoComentario(true);
      const response = await agregarComentario(data.galeria.ID_Galeria, comentario);
      setData({
        ...data,
        comentarios: [response.comentario, ...data.comentarios],
        galeria: {
          ...data.galeria,
          Total_Comentarios: data.galeria.Total_Comentarios + 1,
        },
      });
      setComentario("");
    } catch (error) {
      console.error("Error al agregar comentario:", error);
      alert("Error al agregar comentario");
    } finally {
      setEnviandoComentario(false);
    }
  };

  const handleEliminarComentario = async (comentarioId: number) => {
    if (!data) return;
    if (!confirm("¿Estás seguro de eliminar este comentario?")) return;

    try {
      await eliminarComentario(data.galeria.ID_Galeria, comentarioId);
      setData({
        ...data,
        comentarios: data.comentarios.filter((c) => c.ID_Comentario !== comentarioId),
        galeria: {
          ...data.galeria,
          Total_Comentarios: data.galeria.Total_Comentarios - 1,
        },
      });
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      alert("Error al eliminar comentario");
    }
  };

  const handleEliminarGaleria = async () => {
    if (!data) return;
    if (!confirm(`¿Estás seguro de eliminar el álbum "${data.galeria.Titulo}"? Esta acción no se puede deshacer.`)) return;

    try {
      await eliminarGaleria(data.galeria.ID_Galeria);
      alert("Álbum eliminado exitosamente");
      navigate("/galeria");
    } catch (error) {
      console.error("Error al eliminar galería:", error);
      alert("Error al eliminar el álbum");
    }
  };

  const getUrlCompleta = (ruta: string) => {
    const baseUrl = import.meta.env.VITE_API_URL_Images || "";
    return `${baseUrl}${ruta}`;
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || !data) {
    return (
      <div className="galeria-page">
        <div className="card">
          <p>Cargando álbum...</p>
        </div>
      </div>
    );
  }

  const { galeria, archivos, comentarios } = data;

  return (
    <div className="galeria-page">
      {/* Header */}
      <section className="card galeria-header-card">
        <div className="card-head">
          <button className="btn-back" onClick={() => navigate("/galeria")}>
            <ArrowLeft size={20} />
            Volver
          </button>
          <div className="galeria-header-actions">
            <h2>{galeria.Titulo}</h2>
            {puedeEliminar && (
              <button className="btn-danger-outline" onClick={handleEliminarGaleria}>
                <Trash2 size={18} />
                Eliminar Álbum
              </button>
            )}
          </div>
        </div>
        <p className="galeria-description-large">{galeria.Descripcion}</p>
        
        <div className="galeria-info-bar">
          <div className="galeria-info-item">
            <User size={16} />
            <span>{galeria.Nombre_Creador}</span>
          </div>
          <div className="galeria-info-item">
            <Calendar size={16} />
            <span>{formatearFecha(galeria.Fecha_Creacion)}</span>
          </div>
          <div className="galeria-info-item">
            <ImageIcon size={16} />
            <span>{archivos.length} archivos</span>
          </div>
        </div>
      </section>

      {/* Grid de archivos */}
      <section className="card">
        <div className="archivos-grid">
          {archivos.map((archivo) => (
            <div
              key={archivo.ID_Archivo}
              className="archivo-item"
              onClick={() => setArchivoSeleccionado(archivo)}
            >
              {archivo.Tipo === "Imagen" ? (
                <img
                  src={getUrlCompleta(archivo.Ruta)}
                  alt={archivo.Nombre_Archivo}
                  className="archivo-thumbnail"
                />
              ) : (
                <video
                  src={getUrlCompleta(archivo.Ruta)}
                  className="archivo-thumbnail"
                  controls={false}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Interacciones */}
      <section className="card galeria-interactions">
        <div className="interactions-bar">
          <button
            className={`btn-interaction ${galeria.Usuario_Dio_Like ? "liked" : ""}`}
            onClick={handleLike}
          >
            <Heart
              size={24}
              fill={galeria.Usuario_Dio_Like ? "#cc0000" : "none"}
              color={galeria.Usuario_Dio_Like ? "#cc0000" : "currentColor"}
            />
            <span>{galeria.Total_Likes} Me gusta</span>
          </button>
          <div className="btn-interaction">
            <MessageCircle size={24} />
            <span>{galeria.Total_Comentarios} Comentarios</span>
          </div>
        </div>

        {/* Formulario de comentario */}
        <form onSubmit={handleEnviarComentario} className="comentario-form">
          <input
            type="text"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Escribe un comentario..."
            disabled={enviandoComentario}
          />
          <button
            type="submit"
            disabled={!comentario.trim() || enviandoComentario}
            className="btn-send"
          >
            <Send size={20} />
          </button>
        </form>

        {/* Lista de comentarios */}
        <div className="comentarios-list">
          {comentarios.map((com) => (
            <div key={com.ID_Comentario} className="comentario-item">
              <img
                src={
                  com.Foto_Perfil ||
                  `https://ui-avatars.com/api/?name=${com.Nombre_Usuario}&background=cc0000&color=fff`
                }
                alt={com.Nombre_Usuario}
                className="comentario-avatar"
              />
              <div className="comentario-content">
                <div className="comentario-header">
                  <strong>{com.Nombre_Usuario}</strong>
                  <span className="comentario-fecha">
                    {formatearFecha(com.Fecha_Comentario)}
                  </span>
                </div>
                <p>{com.Comentario}</p>
              </div>
              {(com.ID_Usuario === userId || rol === 1 || rol === 2) && (
                <button
                  className="btn-delete-comentario"
                  onClick={() => handleEliminarComentario(com.ID_Comentario)}
                  title="Eliminar comentario"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          {comentarios.length === 0 && (
            <p className="empty-comentarios">
              No hay comentarios aún. ¡Sé el primero en comentar!
            </p>
          )}
        </div>
      </section>

      {/* Modal de visualización */}
      {archivoSeleccionado && (
        <div className="modal-overlay" onClick={() => setArchivoSeleccionado(null)}>
          <div className="modal-viewer" onClick={(e) => e.stopPropagation()}>
            <button
              className="btn-close-modal"
              onClick={() => setArchivoSeleccionado(null)}
            >
              <X size={32} />
            </button>
            {archivoSeleccionado.Tipo === "Imagen" ? (
              <img
                src={getUrlCompleta(archivoSeleccionado.Ruta)}
                alt={archivoSeleccionado.Nombre_Archivo}
                className="modal-content"
              />
            ) : (
              <video
                src={getUrlCompleta(archivoSeleccionado.Ruta)}
                controls
                className="modal-content"
                autoPlay
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
