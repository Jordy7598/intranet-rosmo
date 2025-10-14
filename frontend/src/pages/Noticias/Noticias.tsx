// src/pages/Noticias/Noticias.tsx
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

function HeartIcon({ liked }: { liked: boolean }) {
  return (
    <svg
      className="icon-heart"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill={liked ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

const ListaNoticias = () => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [likesStatus, setLikesStatus] = useState<{ [key: number]: boolean }>({});
  const token = localStorage.getItem("token");
  const rol = Number(localStorage.getItem("usuario_rol"));
  const puedePublicar = [1, 2, 3, 5].includes(rol);

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const res = await api.get("/noticias", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: Noticia[] = res.data || [];
        setNoticias(data);

        if (token && data.length) {
          const checks = await Promise.all(
            data.map((n) =>
              api
                .get(`/interactions/noticias/${n.ID_Noticia}/likes/check`, {
                  headers: { Authorization: `Bearer ${token}` },
                })
                .then((r) => ({ id: n.ID_Noticia, liked: !!r.data?.liked }))
                .catch(() => ({ id: n.ID_Noticia, liked: false }))
            )
          );
          const map: { [key: number]: boolean } = {};
          checks.forEach((c) => (map[c.id] = c.liked));
          setLikesStatus(map);
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
      const response = await api.post(
        `/interactions/noticias/${noticiaId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const liked = !!response.data.liked;

      setLikesStatus((prev) => ({ ...prev, [noticiaId]: liked }));
      setNoticias((prev) =>
        prev.map((n) =>
          n.ID_Noticia === noticiaId
            ? {
                ...n,
                total_likes: liked
                  ? n.total_likes + 1
                  : Math.max(0, n.total_likes - 1),
              }
            : n
        )
      );
    } catch (error) {
      console.error("Error al manejar like:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Comparar solo las fechas (sin horas)
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = nowOnly.getTime() - dateOnly.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const timeStr = date.toLocaleTimeString("es-ES", { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    if (diffDays === 0) return `Hoy a las ${timeStr}`;
    if (diffDays === 1) return `Ayer a las ${timeStr}`;
    if (diffDays < 7) return `Hace ${diffDays} días a las ${timeStr}`;
    
    return date.toLocaleDateString("es-ES", { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    }) + ` a las ${timeStr}`;
  };

  return (
    <>
      <div className="social-container">
        <header className="social-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="page-title">Feed de Noticias</h1>
              <p className="page-subtitle">Mantente al día con las últimas novedades del equipo</p>
            </div>
            {puedePublicar && (
              <Link to="/noticias/nueva" className="btn-create">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Crear Publicación
              </Link>
            )}
          </div>
        </header>

        <main className="feed-container">
          {noticias.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3>No hay publicaciones aún</h3>
              <p>Sé el primero en compartir novedades con el equipo</p>
              {puedePublicar && (
                <Link to="/noticias/nueva" className="btn-create-alt">
                  Crear primera publicación
                </Link>
              )}
            </div>
          ) : (
            <div className="feed-list">
              {noticias.map((noticia) => (
                <article key={noticia.ID_Noticia} className="post-card">
                  <div className="post-header">
                    <div className="author-info">
                      <div className="author-avatar">
                        {noticia.Autor.charAt(0).toUpperCase()}
                      </div>
                      <div className="author-details">
                        <h3 className="author-name">{noticia.Autor}</h3>
                        <div className="post-meta">
                          <span className="post-date">{formatDate(noticia.Fecha_Publicacion)}</span>
                          {noticia.Areas && (
                            <>
                              <span className="meta-dot">•</span>
                              <span className="post-category">{noticia.Areas}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {puedePublicar && (
                      <div className="post-actions-menu">
                        <Link to={`/noticias/editar/${noticia.ID_Noticia}`} className="btn-edit">
                          Editar
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="post-content">
                    <h2 className="post-title">{noticia.Titulo}</h2>
                    
                    <p className="post-body">
                      {noticia.Cuerpo.length > 300
                        ? noticia.Cuerpo.substring(0, 300) + "..."
                        : noticia.Cuerpo}
                    </p>

                    {noticia.Imagen_Principal && (
                      <div className="post-image-container">
                        <img
                          className="post-image"
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${noticia.Imagen_Principal}`}
                          alt={noticia.Titulo}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {noticia.Cuerpo.length > 300 && (
                      <Link to={`/noticias/${noticia.ID_Noticia}`} className="read-more">
                        Leer más
                      </Link>
                    )}
                  </div>

                  <div className="post-footer">
                    <div className="engagement-stats">
                      <span className="stat-item">
                        {noticia.total_likes} {noticia.total_likes === 1 ? 'me gusta' : 'me gusta'}
                      </span>
                      <span className="stat-item">
                        {noticia.total_comentarios} {noticia.total_comentarios === 1 ? 'comentario' : 'comentarios'}
                      </span>
                    </div>

                    <div className="interaction-bar">
                      <button
                        className={`interact-btn ${likesStatus[noticia.ID_Noticia] ? "active" : ""}`}
                        onClick={() => handleLike(noticia.ID_Noticia)}
                        title={likesStatus[noticia.ID_Noticia] ? "Quitar me gusta" : "Me gusta"}
                      >
                        <HeartIcon liked={!!likesStatus[noticia.ID_Noticia]} />
                        <span>Me gusta</span>
                      </button>

                      <Link
                        to={`/noticias/${noticia.ID_Noticia}/comentarios`}
                        className="interact-btn"
                      >
                        <CommentIcon />
                        <span>Comentar</span>
                      </Link>

                      <Link
                        to={`/noticias/${noticia.ID_Noticia}`}
                        className="interact-btn"
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span>Ver detalle</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      <style>{`
        :root {
          --primary: #cc0000;
          --primary-hover: #a30000;
          --primary-light: #fee2e2;
          --bg-main: #f5f7fa;
          --bg-card: #ffffff;
          --text-primary: #111827;
          --text-secondary: #6b7280;
          --text-muted: #9ca3af;
          --border: #e5e7eb;
          --border-light: #f3f4f6;
          --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
          --shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
          --radius: 12px;
          --radius-lg: 16px;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: var(--bg-main);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: var(--text-primary);
          line-height: 1.5;
        }

        .social-container {
          min-height: 100vh;
          padding-bottom: 40px;
        }

        /* Header */
        .social-header {
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
          padding: 20px 0;
          margin-bottom: 24px;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: var(--shadow-sm);
        }

        .header-content {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .header-left {
          flex: 1;
        }

        .page-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
          letter-spacing: -0.3px;
        }

        .page-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 400;
        }

        .btn-create {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--primary);
          color: white;
          padding: 10px 18px;
          border-radius: var(--radius);
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: var(--shadow);
          white-space: nowrap;
        }

        .btn-create:hover {
          background: var(--primary-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .btn-create svg {
          display: block;
        }

        /* Feed Container */
        .feed-container {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .feed-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Post Card */
        .post-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all 0.2s;
          box-shadow: var(--shadow);
        }

        .post-card:hover {
          box-shadow: var(--shadow-md);
          border-color: #d1d5db;
        }

        /* Post Header */
        .post-header {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-light);
        }

        .author-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .author-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), #ff4444);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(204, 0, 0, 0.15);
        }

        .author-details {
          display: flex;
          flex-direction: column;
        }

        .author-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .post-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .meta-dot {
          opacity: 0.5;
        }

        .post-category {
          background: var(--border-light);
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .post-actions-menu {
          display: flex;
          gap: 8px;
        }

        .btn-edit {
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-edit:hover {
          background: var(--border-light);
          color: var(--text-primary);
        }

        /* Post Content */
        .post-content {
          padding: 0 20px 16px;
        }

        .post-title {
          font-size: 19px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.4;
          margin-bottom: 12px;
          letter-spacing: -0.2px;
        }

        .post-image-container {
          margin: 16px 0;
          border-radius: var(--radius);
          overflow: hidden;
          background: var(--border-light);
        }

        .post-image {
          width: 100%;
          height: auto;
          max-height: 400px;
          object-fit: cover;
          display: block;
        }

        .post-body {
          font-size: 15px;
          color: var(--text-primary);
          line-height: 1.6;
          margin-top: 12px;
          white-space: pre-wrap;
        }

        .read-more {
          display: inline-block;
          margin-top: 8px;
          color: var(--primary);
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }

        .read-more:hover {
          color: var(--primary-hover);
          text-decoration: underline;
        }

        /* Post Footer */
        .post-footer {
          border-top: 1px solid var(--border-light);
        }

        .engagement-stats {
          padding: 12px 20px;
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .stat-item {
          font-weight: 500;
        }

        .interaction-bar {
          display: flex;
          border-top: 1px solid var(--border-light);
          padding: 6px 8px;
        }

        .interact-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .interact-btn:hover {
          background: var(--border-light);
          color: var(--text-primary);
        }

        .interact-btn.active {
          color: var(--primary);
        }

        .interact-btn.active .icon-heart {
          animation: heartBeat 0.3s ease;
        }

        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .interact-btn svg {
          display: block;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
        }

        .empty-icon {
          margin: 0 auto 20px;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--border-light);
          border-radius: 50%;
          color: var(--text-muted);
        }

        .empty-state h3 {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .empty-state p {
          font-size: 15px;
          color: var(--text-secondary);
          margin-bottom: 24px;
        }

        .btn-create-alt {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--primary);
          color: white;
          padding: 12px 24px;
          border-radius: var(--radius);
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: var(--shadow);
        }

        .btn-create-alt:hover {
          background: var(--primary-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: stretch;
          }

          .btn-create {
            justify-content: center;
          }

          .page-title {
            font-size: 20px;
          }

          .post-header {
            padding: 14px 16px;
          }

          .post-content {
            padding: 0 16px 14px;
          }

          .interaction-bar {
            padding: 4px;
          }

          .interact-btn {
            font-size: 13px;
            padding: 8px 12px;
            gap: 6px;
          }

          .interact-btn span {
            display: none;
          }

          .interact-btn svg {
            width: 22px;
            height: 22px;
          }
        }

        @media (min-width: 1024px) {
          .feed-container {
            max-width: 720px;
          }

          .header-content {
            max-width: 720px;
          }
        }
      `}</style>
    </>
  );
};

export default ListaNoticias;