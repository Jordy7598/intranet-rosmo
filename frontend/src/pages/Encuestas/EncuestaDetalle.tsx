import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerEncuesta, eliminarEncuesta, type Encuesta } from "../../api/encuestas.api";
import { ArrowLeft, Edit, Trash2, Calendar, Clock, User, ExternalLink, Maximize2 } from "lucide-react";
import "../../styles/Encuestas.css";

const EncuestaDetalle = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [encuesta, setEncuesta] = useState<Encuesta | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEncuestaModal, setShowEncuestaModal] = useState(false);

  const rol = parseInt(localStorage.getItem("usuario_rol") || "0");
  const puedeEditar = rol === 1 || rol === 2 || rol === 3;

  useEffect(() => {
    if (id) {
      cargarEncuesta(parseInt(id));
    }
  }, [id]);

  const cargarEncuesta = async (encuestaId: number) => {
    try {
      const data = await obtenerEncuesta(encuestaId);
      setEncuesta(data);
    } catch (error) {
      console.error("Error al cargar encuesta:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!id) return;

    try {
      await eliminarEncuesta(parseInt(id));
      navigate("/encuestas");
    } catch (error) {
      console.error("Error al eliminar encuesta:", error);
    }
  };

  const abrirEnVentanaPopup = () => {
    if (!encuesta) return;
    
    const width = 900;
    const height = 900;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    // Abrir directamente Google Forms
    window.open(
      encuesta.Link_Externo,
      'Encuesta',
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
    );
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="encuestas-page">
        <div className="encuestas-page .card">
          <p>Cargando encuesta...</p>
        </div>
      </div>
    );
  }

  if (!encuesta) {
    return (
      <div className="encuestas-page">
        <div className="encuestas-page .card">
          <p>Encuesta no encontrada</p>
          <button className="btn-primary" onClick={() => navigate("/encuestas")}>
            Volver a encuestas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="encuestas-page">
      {/* Header con botones de acción */}
      <section className="encuestas-page .card">
        <div className="detalle-header">
          <button className="btn-back" onClick={() => navigate("/encuestas")}>
            <ArrowLeft size={20} />
            Volver
          </button>

          {puedeEditar && (
            <div className="header-actions">
              <button
                className="btn-secondary"
                onClick={() => navigate(`/encuestas/editar/${encuesta.ID_Encuesta}`)}
              >
                <Edit size={18} />
                Editar
              </button>
              <button
                className="btn-danger-outline"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 size={18} />
                Eliminar
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Información de la encuesta */}
      <section className="encuestas-page .card">
        <div className="encuesta-info">
          <div className="estado-badge-container">
            {encuesta.Estado === "Activa" && (
              <span className="badge badge-activa-large">Encuesta Activa</span>
            )}
            {encuesta.Estado === "Programada" && (
              <span className="badge badge-programada-large">Próximamente</span>
            )}
            {encuesta.Estado === "Cerrada" && (
              <span className="badge badge-cerrada-large">Encuesta Cerrada</span>
            )}
          </div>

          <h1>{encuesta.Titulo}</h1>
          {encuesta.Descripcion && <p className="descripcion">{encuesta.Descripcion}</p>}

          <div className="encuesta-metadata">
            <div className="meta-item">
              <User size={16} />
              <span>Creado por: {encuesta.Nombre_Creador}</span>
            </div>
            <div className="meta-item">
              <Calendar size={16} />
              <span>Inicia: {formatearFecha(encuesta.Fecha_Publicacion)}</span>
            </div>
            <div className="meta-item">
              <Clock size={16} />
              <span>Cierra: {formatearFecha(encuesta.Fecha_Cierre)}</span>
            </div>
          </div>

          {encuesta.Estado !== "Activa" && (
            <div className={`estado-message ${encuesta.Estado === "Cerrada" ? "cerrada" : "programada"}`}>
              {encuesta.Estado === "Cerrada" && (
                <p>Esta encuesta ya ha cerrado y no acepta más respuestas.</p>
              )}
              {encuesta.Estado === "Programada" && (
                <p>Esta encuesta estará disponible a partir del {formatearFecha(encuesta.Fecha_Publicacion)}.</p>
              )}
            </div>
          )}

        </div>
      </section>

      {/* Botón para abrir encuesta */}
      {encuesta.Estado === "Activa" && (
        <section className="encuestas-page .card encuesta-accion-card">
          <div className="encuesta-accion-content">
            <div className="encuesta-accion-icon">
              <ExternalLink size={64} />
            </div>
            <h2>¡Tu opinión es importante!</h2>
            <p>Responde la encuesta de manera rápida y sencilla:</p>
            <div className="encuesta-botones">
              <button
                onClick={() => setShowEncuestaModal(true)}
                className="btn-abrir-encuesta btn-modal"
              >
                <Maximize2 size={20} />
                Abrir Encuesta
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar esta encuesta? Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
              <button className="btn-danger" onClick={handleEliminar}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para mostrar la encuesta */}
      {showEncuestaModal && encuesta && (
        <div className="modal-overlay encuesta-modal-overlay" onClick={() => setShowEncuestaModal(false)}>
          <div className="modal-encuesta-info" onClick={(e) => e.stopPropagation()}>
            <button
              className="btn-cerrar-modal-info"
              onClick={() => setShowEncuestaModal(false)}
              title="Cerrar"
            >
              ✕
            </button>
            <div className="modal-encuesta-icon">
              <ExternalLink size={80} />
            </div>
            <h2>{encuesta.Titulo}</h2>
            <p className="modal-info-descripcion">
              La encuesta se abrirá en una ventana independiente para que puedas responderla cómodamente
              mientras mantienes la intranet abierta. Al finalizar, simplemente cierra la ventana de la encuesta.
            </p>
            <div className="modal-info-detalles">
              <div className="detalle-item">
                <Calendar size={18} />
                <span>Cierra: {formatearFecha(encuesta.Fecha_Cierre)}</span>
              </div>
            </div>
            <div className="modal-info-botones">
              <button
                onClick={() => {
                  abrirEnVentanaPopup();
                  setShowEncuestaModal(false);
                }}
                className="btn-modal-responder"
              >
                <Maximize2 size={22} />
                Abrir Ventana de Encuesta
              </button>
              <button
                onClick={() => setShowEncuestaModal(false)}
                className="btn-modal-cancelar"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EncuestaDetalle;
