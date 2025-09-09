import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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

const DetalleNoticia = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNoticia = async () => {
      try {
        setLoading(true);
        
        // Obtener la noticia
        const noticiaRes = await api.get(`/noticias/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNoticia(noticiaRes.data);

        // Verificar si el usuario actual ya dio like
        if (token) {
          const likeRes = await api.get(`/interactions/noticias/${id}/likes/check`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIsLiked(likeRes.data.liked);
        }
      } catch (error) {
        console.error("Error al cargar noticia:", error);
        setError("Error al cargar la noticia");
      } finally {
        setLoading(false);
      }
    };

    fetchNoticia();
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
      alert("Error al procesar like");
    }
  };

  if (loading) {
    return (
      <div>
        Cargando noticia...
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div>
          <h3>❌ {error}</h3>
          <Link to="/noticias">
            ← Volver a Noticias
          </Link>
        </div>
      </div>
    );
  }

  if (!noticia) {
    return (
      <div>
        <div>
          <h3>Noticia no encontrada</h3>
          <Link to="/noticias">
            ← Volver a Noticias
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header con botones de navegación */}
      <div>
        <Link to="/noticias">
          ← Volver a Noticias
        </Link>
        <div>
          <Link to={`/noticias/editar/${noticia.ID_Noticia}`}>
            ✏️ Editar
          </Link>
          <Link to={`/noticias/${noticia.ID_Noticia}/comentarios`}>
            💬 Ver Comentarios
          </Link>
        </div>
      </div>

      {/* Contenido principal de la noticia */}
      <article>
        {/* Título */}
        <h1>{noticia.Titulo}</h1>
        
        {/* Metadata */}
        <div>
          <span> <strong>{noticia.Autor}</strong></span>
          <span> {new Date(noticia.Fecha_Publicacion).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
          {noticia.Areas && (
            <span>🏷️ <strong>{noticia.Areas}</strong></span>
          )}
        </div>

        {/* Imagen principal */}
        {noticia.Imagen_Principal && (
          <div>
            <img src={noticia.Imagen_Principal} alt={noticia.Titulo} />
          </div>
        )}

        {/* Cuerpo de la noticia */}
        <div>
          {noticia.Cuerpo.split('\n').map((paragraph, index) => (
            paragraph.trim() && (
              <p key={index}>
                {paragraph}
              </p>
            )
          ))}
        </div>

        {/* Estado de la noticia */}
        <div>
          <span>
            {noticia.Estado}
          </span>
        </div>

        {/* Interacciones (likes y comentarios) */}
        <div>
          <div>
            <button onClick={handleLike}>
              {isLiked ? "❤️" : "🤍"} {noticia.total_likes}
            </button>
            <Link to={`/noticias/${noticia.ID_Noticia}/comentarios`}>
              💬 {noticia.total_comentarios}
            </Link>
          </div>
          <Link to={`/noticias/${noticia.ID_Noticia}/comentarios`}>
            💬 Ver todos los comentarios
          </Link>
        </div>
      </article>
    </div>
  );
};

export default DetalleNoticia;