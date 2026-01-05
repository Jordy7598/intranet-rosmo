import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerEncuestas, type Encuesta } from "../../api/encuestas.api";
import { Plus, Calendar, Clock, CheckCircle, AlertCircle, FileText } from "lucide-react";
import "../../styles/Encuestas.css";

const EncuestasList = () => {
  const navigate = useNavigate();
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todas" | "activas" | "programadas" | "cerradas">("activas");

  const rol = parseInt(localStorage.getItem("usuario_rol") || "0");
  const puedeCrear = rol === 1 || rol === 2 || rol === 3; // Admin, RH, Jefe

  useEffect(() => {
    cargarEncuestas();
  }, []);

  const cargarEncuestas = async () => {
    try {
      const data = await obtenerEncuestas();
      setEncuestas(data);
    } catch (error) {
      console.error("Error al cargar encuestas:", error);
    } finally {
      setLoading(false);
    }
  };

  const encuestasFiltradas = encuestas.filter((enc) => {
    if (filtro === "todas") return true;
    if (filtro === "activas") return enc.Estado === "Activa";
    if (filtro === "programadas") return enc.Estado === "Programada";
    if (filtro === "cerradas") return enc.Estado === "Cerrada";
    return true;
  });

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Activa":
        return (
          <span className="badge badge-activa">
            <CheckCircle size={14} />
            Activa
          </span>
        );
      case "Programada":
        return (
          <span className="badge badge-programada">
            <Clock size={14} />
            Programada
          </span>
        );
      case "Cerrada":
        return (
          <span className="badge badge-cerrada">
            <AlertCircle size={14} />
            Cerrada
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="encuestas-page">
        <div className="encuestas-page .card">
          <p>Cargando encuestas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="encuestas-page">
      <section className="encuestas-page .card encuestas-header-card">
        <div className="card-head">
          <div>
            <h2>Encuestas</h2>
            <p>Participa en las encuestas de la empresa</p>
          </div>
          {puedeCrear && (
            <button
              className="btn-primary"
              onClick={() => navigate("/encuestas/crear")}
            >
              <Plus size={20} />
              Nueva Encuesta
            </button>
          )}
        </div>
      </section>

      {/* Filtros */}
      <section className="encuestas-page .card filtros-card">
        <div className="filtros-container">
          <button
            className={`filtro-btn ${filtro === "activas" ? "active" : ""}`}
            onClick={() => setFiltro("activas")}
          >
            <CheckCircle size={16} />
            Activas
          </button>
          <button
            className={`filtro-btn ${filtro === "programadas" ? "active" : ""}`}
            onClick={() => setFiltro("programadas")}
          >
            <Clock size={16} />
            Programadas
          </button>
          <button
            className={`filtro-btn ${filtro === "cerradas" ? "active" : ""}`}
            onClick={() => setFiltro("cerradas")}
          >
            <AlertCircle size={16} />
            Cerradas
          </button>
          <button
            className={`filtro-btn ${filtro === "todas" ? "active" : ""}`}
            onClick={() => setFiltro("todas")}
          >
            Todas
          </button>
        </div>
      </section>

      {/* Lista de encuestas */}
      <section className="encuestas-grid">
        {encuestasFiltradas.length === 0 ? (
          <div className="empty-state">
            <FileText size={64} />
            <p>No hay encuestas {filtro !== "todas" ? filtro : "disponibles"}</p>
            {puedeCrear && (
              <button
                className="btn-primary"
                onClick={() => navigate("/encuestas/crear")}
              >
                <Plus size={20} />
                Crear primera encuesta
              </button>
            )}
          </div>
        ) : (
          encuestasFiltradas.map((encuesta) => (
            <div
              key={encuesta.ID_Encuesta}
              className="encuesta-card"
              onClick={() => navigate(`/encuestas/${encuesta.ID_Encuesta}`)}
            >
              <div className="encuesta-header">
                {getEstadoBadge(encuesta.Estado)}
              </div>

              <div className="encuesta-content">
                <h3>{encuesta.Titulo}</h3>
                <p className="encuesta-description">{encuesta.Descripcion}</p>

                <div className="encuesta-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>Inicia: {formatearFecha(encuesta.Fecha_Publicacion)}</span>
                  </div>
                  <div className="meta-item">
                    <Clock size={14} />
                    <span>Cierra: {formatearFecha(encuesta.Fecha_Cierre)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default EncuestasList;
