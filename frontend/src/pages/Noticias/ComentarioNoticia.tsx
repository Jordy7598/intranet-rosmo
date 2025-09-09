// src/components/noticias/ComentariosNoticia.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

interface Comentario {
  ID_Comentario: number;
  Comentario: string;
  Fecha_Comentario: string;
  Nombre_Usuario: string;
  ID_Usuario: number;
}

interface Noticia {
  ID_Noticia: number;
  Titulo: string;
  Cuerpo: string;
  Autor: string;
  Fecha_Publicacion: string;
  total_likes: number;
  total_comentarios: number;
}

const ComentariosNoticia = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener la noticia
        const noticiaRes = await api.get(`/noticias/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNoticia(noticiaRes.data);

        // Obtener comentarios
        const comentariosRes = await api.get(`/interactions/noticias/${id}/comentarios`);
        setComentarios(comentariosRes.data);

        // Verificar si el usuario actual ya dio like
        if (token) {
          const likeRes = await api.get(`/interactions/noticias/${id}/likes/check`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIsLiked(likeRes.data.liked);

          // Obtener ID del usuario actual (asumiendo que está en el token decodificado)
          const userPayload = JSON.parse(atob(token.split('.')[1]));
          setCurrentUserId(userPayload.id);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    fetchData();
  }, [id, token]);

  const handleLike = async () => {
    if (!token) {
      alert("Debes iniciar sesión para dar like");
      return;
    }

    try {
      const response = await api.post(`/interactions/noticias/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsLiked(response.data.liked);
      
      // Actualizar contador en la noticia
      if (noticia) {
        setNoticia({
          ...noticia,
          total_likes: response.data.liked 
            ? noticia.total_likes + 1 
            : noticia.total_likes - 1
        });
      }
    } catch (error) {
      console.error("Error al manejar like:", error);
    }
  };

  const handleSubmitComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      alert("Debes iniciar sesión para comentar");
      return;
    }

    if (!nuevoComentario.trim()) {
      alert("El comentario no puede estar vacío");
      return;
    }

    try {
      await api.post(`/interactions/noticias/${id}/comentarios`, {
        comentario: nuevoComentario
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Recargar comentarios
      const comentariosRes = await api.get(`/interactions/noticias/${id}/comentarios`);
      setComentarios(comentariosRes.data);
      
      // Limpiar formulario
      setNuevoComentario("");

      // Actualizar contador en la noticia
      if (noticia) {
        setNoticia({
          ...noticia,
          total_comentarios: noticia.total_comentarios + 1
        });
      }
    } catch (error) {
      console.error("Error al crear comentario:", error);
      alert("Error al crear comentario");
    }
  };

  const handleDeleteComentario = async (comentarioId: number) => {
    if (!confirm("¿Estás seguro de eliminar este comentario?")) return;

    try {
      await api.delete(`/interactions/comentarios/${comentarioId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remover comentario de la lista
      setComentarios(prev => prev.filter(c => c.ID_Comentario !== comentarioId));

      // Actualizar contador
      if (noticia) {
        setNoticia({
          ...noticia,
          total_comentarios: noticia.total_comentarios - 1
        });
      }
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      alert("Error al eliminar comentario");
    }
  };

  if (!noticia) {
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", padding: "0 20px" }}>
      {/* Header con botón de regreso */}
      <div style={{ marginBottom: "20px" }}>
        <Link 
          to="/noticias"
          style={{ 
            background: "#6c757d", 
            color: "white", 
            padding: "8px 15px", 
            borderRadius: "5px", 
            textDecoration: "none" 
          }}
        >
          ← Volver a Noticias
        </Link>
      </div>

      {/* Contenido de la noticia */}
      <article style={{ 
        border: "1px solid #ddd", 
        borderRadius: "8px", 
        padding: "25px",
        backgroundColor: "#fff",
        marginBottom: "30px"
      }}>
        <h1 style={{ margin: "0 0 15px 0", color: "#333" }}>
          {noticia.Titulo}
        </h1>
        
        <div style={{ fontSize: "0.9em", color: "#666", marginBottom: "20px" }}>
          <span>👤 {noticia.Autor}</span> | 
          <span> 📅 {new Date(noticia.Fecha_Publicacion).toLocaleDateString()}</span>
        </div>

        <div style={{ lineHeight: "1.6", marginBottom: "20px" }}>
          {noticia.Cuerpo.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* Botón de like */}
        <div style={{ 
          borderTop: "1px solid #eee", 
          paddingTop: "15px",
          display: "flex",
          alignItems: "center",
          gap: "20px"
        }}>
          <button
            onClick={handleLike}
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              color: isLiked ? "#e74c3c" : "#666",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}
          >
            {isLiked ? "❤️" : "🤍"} {noticia.total_likes}
          </button>
          
          <span style={{ fontSize: "16px", color: "#666" }}>
            💬 {noticia.total_comentarios} comentarios
          </span>
        </div>
      </article>

      {/* Sección de comentarios */}
      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "20px" }}>Comentarios</h3>

        {/* Formulario para nuevo comentario */}
        {token ? (
          <form onSubmit={handleSubmitComentario} style={{ marginBottom: "30px" }}>
            <textarea
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              placeholder="Escribe tu comentario..."
              style={{
                width: "100%",
                minHeight: "80px",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                resize: "vertical",
                fontFamily: "inherit",
                marginBottom: "10px"
              }}
              required
            />
            <button
              type="submit"
              style={{
                background: "#007bff",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              💬 Comentar
            </button>
          </form>
        ) : (
          <div style={{ 
            padding: "20px", 
            background: "#f8f9fa", 
            borderRadius: "5px", 
            textAlign: "center",
            marginBottom: "30px"
          }}>
            <p>Debes iniciar sesión para comentar</p>
          </div>
        )}

        {/* Lista de comentarios */}
        <div style={{ display: "grid", gap: "15px" }}>
          {comentarios.map(comentario => (
            <div key={comentario.ID_Comentario} style={{
              border: "1px solid #eee",
              borderRadius: "5px",
              padding: "15px",
              backgroundColor: "#f9f9f9"
            }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-start",
                marginBottom: "10px"
              }}>
                <div>
                  <strong style={{ color: "#333" }}>
                    {comentario.Nombre_Usuario}
                  </strong>
                  <span style={{ color: "#666", fontSize: "0.9em", marginLeft: "10px" }}>
                    {new Date(comentario.Fecha_Comentario).toLocaleString()}
                  </span>
                </div>
                
                {currentUserId === comentario.ID_Usuario && (
                  <button
                    onClick={() => handleDeleteComentario(comentario.ID_Comentario)}
                    style={{
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      padding: "5px 8px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>
              
              <p style={{ margin: "0", lineHeight: "1.5" }}>
                {comentario.Comentario}
              </p>
            </div>
          ))}
        </div>

        {comentarios.length === 0 && (
          <div style={{ 
            textAlign: "center", 
            padding: "30px", 
            color: "#666",
            background: "#f8f9fa",
            borderRadius: "5px"
          }}>
            <p>No hay comentarios aún</p>
            <p>¡Sé el primero en comentar!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComentariosNoticia;