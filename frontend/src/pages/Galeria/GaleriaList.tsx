import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Image as ImageIcon, Heart, MessageCircle, Calendar, User } from "lucide-react";
import { obtenerGalerias } from "../../api/galeria.api";
import type { Galeria } from "../../api/galeria.api";
import "../../styles/Galeria.css";

export default function GaleriaList() {
  const navigate = useNavigate();
  const [galerias, setGalerias] = useState<Galeria[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const rol = Number(localStorage.getItem("usuario_rol"));
  const puedeCrear = rol === 1 || rol === 2 || rol === 5; // Admin, RH, Mercadeo

  useEffect(() => {
    cargarGalerias();
  }, []);

  const cargarGalerias = async () => {
    try {
      setLoading(true);
      const data = await obtenerGalerias();
      setGalerias(data);
    } catch (error) {
      console.error("Error al cargar galerías:", error);
    } finally {
      setLoading(false);
    }
  };

  const galeriasFiltradas = galerias.filter((galeria) => {
    const searchLower = busqueda.toLowerCase();
    return (
      galeria.Titulo.toLowerCase().includes(searchLower) ||
      galeria.Descripcion.toLowerCase().includes(searchLower)
    );
  });

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="galeria-page">
        <div className="card">
          <p>Cargando galerías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="galeria-page">
      <section className="card galeria-header-card">
        <div className="card-head">
          <div>
            <h2>Galería de la Empresa</h2>
            <p>Eventos, actividades y momentos especiales de nuestra empresa</p>
          </div>
          {puedeCrear && (
            <button
              className="btn-primary"
              onClick={() => navigate("/galeria/crear")}
            >
              <Plus size={20} />
              Crear Álbum
            </button>
          )}
        </div>
      </section>

      {/* Buscador */}
      <section className="card search-card">
        <div className="search-container">
          <svg className="search-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar álbumes por título o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </section>

      {/* Grid de álbumes */}
      <section className="galeria-grid">
        {galeriasFiltradas.length === 0 ? (
          <div className="empty-state">
            <ImageIcon size={64} />
            <p>No hay álbumes disponibles</p>
            {puedeCrear && (
              <button
                className="btn-primary"
                onClick={() => navigate("/galeria/crear")}
              >
                <Plus size={20} />
                Crear primer álbum
              </button>
            )}
          </div>
        ) : (
          galeriasFiltradas.map((galeria) => (
            <div
              key={galeria.ID_Galeria}
              className="galeria-card"
              onClick={() => navigate(`/galeria/${galeria.ID_Galeria}`)}
            >
              <div className="galeria-preview">
                {galeria.Imagen_Portada ? (
                  <img 
                    src={`${import.meta.env.VITE_API_URL_Images}${galeria.Imagen_Portada}`} 
                    alt={galeria.Titulo}
                    className="galeria-preview-img"
                  />
                ) : (
                  <div className="galeria-preview-placeholder">
                    <ImageIcon size={48} />
                    <span>{galeria.Total_Archivos} archivos</span>
                  </div>
                )}
              </div>
              
              <div className="galeria-content">
                <h3>{galeria.Titulo}</h3>
                <p className="galeria-description">{galeria.Descripcion}</p>
                
                <div className="galeria-meta">
                  <div className="galeria-meta-item">
                    <User size={14} />
                    <span>{galeria.Nombre_Creador}</span>
                  </div>
                  <div className="galeria-meta-item">
                    <Calendar size={14} />
                    <span>{formatearFecha(galeria.Fecha_Creacion)}</span>
                  </div>
                </div>
                
                <div className="galeria-stats">
                  <div className="stat-item">
                    <Heart
                      size={16}
                      fill={galeria.Usuario_Dio_Like ? "#cc0000" : "none"}
                      color={galeria.Usuario_Dio_Like ? "#cc0000" : "currentColor"}
                    />
                    <span>{galeria.Total_Likes}</span>
                  </div>
                  <div className="stat-item">
                    <MessageCircle size={16} />
                    <span>{galeria.Total_Comentarios}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
