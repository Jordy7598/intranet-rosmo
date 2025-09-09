/*
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const ListaNoticias = () => {
  const [noticias, setNoticias] = useState<any[]>([]);

  useEffect(() => {
    const fetchNoticias = async () => {
      const token = localStorage.getItem("token");
      
      const res = await api.get("/noticias", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setNoticias(res.data);
    };
    fetchNoticias();
  }, []);

  return (
    <div>
      <h2>Noticias</h2>
      <Link to="/noticias/nueva">➕ Nueva Noticia</Link>
      <ul>
        {noticias.map(n => (
          <li key={n.ID_Noticia}>
            <h3>{n.Titulo}</h3>
            <small>Autor: {n.Autor} | {new Date(n.Fecha_Publicacion).toLocaleDateString()}</small>
            <p>{n.Cuerpo.substring(0, 100)}...</p>
            <Link to={`/noticias/editar/${n.ID_Noticia}`}>✏️ Editar</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListaNoticias;*/

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

interface Noticia {
  ID_Noticia: number;
  Titulo: string;
  Cuerpo: string;
  Imagen_Principal: string;
  Fecha_Publicacion: string;
  Autor: string;
  Areas: string;
  Estado: string;
  total_likes: number;
  total_comentarios: number;
}

const ListaNoticias = () => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [likesStatus, setLikesStatus] = useState<{[key: number]: boolean}>({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const res = await api.get("/noticias", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNoticias(res.data);

        // Verificar likes del usuario para cada noticia
        if (token) {
          const likesChecks = await Promise.all(
            res.data.map((noticia: Noticia) =>
              api.get(`/interactions/noticias/${noticia.ID_Noticia}/likes/check`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            )
          );

          const likesStatusMap: {[key: number]: boolean} = {};
          res.data.forEach((noticia: Noticia, index: number) => {
            likesStatusMap[noticia.ID_Noticia] = likesChecks[index].data.liked;
          });
          setLikesStatus(likesStatusMap);
        }
      } catch (error) {
        console.error("Error al cargar noticias:", error);
      }
    };
    fetchNoticias();
  }, [token]);

  const handleLike = async (noticiaId: number) => {
    if (!token) {
      alert("Debes iniciar sesión para dar like");
      return;
    }

    try {
      const response = await api.post(`/interactions/noticias/${noticiaId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Actualizar estado de like
      setLikesStatus(prev => ({
        ...prev,
        [noticiaId]: response.data.liked
      }));

      // Actualizar contador de likes en la noticia
      setNoticias(prev => 
        prev.map(noticia => 
          noticia.ID_Noticia === noticiaId
            ? { 
                ...noticia, 
                total_likes: response.data.liked 
                  ? noticia.total_likes + 1 
                  : noticia.total_likes - 1 
              }
            : noticia
        )
      );
    } catch (error) {
      console.error("Error al manejar like:", error);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", padding: "0 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Noticias</h2>
        <Link 
          to="/noticias/nueva"
          style={{ 
            background: "#007bff", 
            color: "white", 
            padding: "10px 15px", 
            borderRadius: "5px", 
            textDecoration: "none" 
          }}
        >
          ➕ Nueva Noticia
        </Link>
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        {noticias.map(noticia => (
          <div key={noticia.ID_Noticia} style={{ 
            border: "1px solid #ddd", 
            borderRadius: "8px", 
            padding: "20px",
            backgroundColor: "#f9f9f9"
          }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
              {noticia.Titulo}
            </h3>
            
            <div style={{ fontSize: "0.9em", color: "#666", marginBottom: "15px" }}>
              <span>👤 {noticia.Autor}</span> | 
              <span> 📅 {new Date(noticia.Fecha_Publicacion).toLocaleDateString()}</span> |
              <span> 🏷️ {noticia.Areas}</span>
            </div>

            {noticia.Imagen_Principal && (
              <img 
                src={noticia.Imagen_Principal} 
                alt={noticia.Titulo}
                style={{ 
                  width: "100%", 
                  maxHeight: "200px", 
                  objectFit: "cover", 
                  borderRadius: "5px",
                  marginBottom: "15px"
                }}
              />
            )}

            <p style={{ margin: "0 0 15px 0", lineHeight: "1.5" }}>
              {noticia.Cuerpo.length > 150 
                ? noticia.Cuerpo.substring(0, 150) + "..." 
                : noticia.Cuerpo
              }
            </p>

            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              borderTop: "1px solid #eee",
              paddingTop: "15px"
            }}>
              <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <button
                  onClick={() => handleLike(noticia.ID_Noticia)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "16px",
                    cursor: "pointer",
                    color: likesStatus[noticia.ID_Noticia] ? "#e74c3c" : "#666"
                  }}
                >
                  {likesStatus[noticia.ID_Noticia] ? "❤️" : "🤍"} {noticia.total_likes}
                </button>

                <Link 
                  to={`/noticias/${noticia.ID_Noticia}/comentarios`}
                  style={{ textDecoration: "none", color: "#666", fontSize: "16px" }}
                >
                  💬 {noticia.total_comentarios}
                </Link>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <Link 
                  to={`/noticias/${noticia.ID_Noticia}`}
                  style={{ 
                    background: "#28a745", 
                    color: "white", 
                    padding: "5px 10px", 
                    borderRadius: "3px", 
                    textDecoration: "none",
                    fontSize: "14px"
                  }}
                >
                  👁️ Ver
                </Link>
                <Link 
                  to={`/noticias/editar/${noticia.ID_Noticia}`}
                  style={{ 
                    background: "#ffc107", 
                    color: "white", 
                    padding: "5px 10px", 
                    borderRadius: "3px", 
                    textDecoration: "none",
                    fontSize: "14px"
                  }}
                >
                  ✏️ Editar
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {noticias.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          <h3>No hay noticias disponibles</h3>
          <p>Sé el primero en crear una noticia</p>
        </div>
      )}
    </div>
  );
};

export default ListaNoticias;