// src/pages/Noticias/VerNoticia.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

type NoticiaDTO = {
  ID_Noticia: number;
  Titulo: string;
  Cuerpo: string;
  Imagen_Principal: string | null;
  Areas: string | null;
  Autor: string;
  Fecha_Publicacion: string;
  total_likes: number;
  total_comentarios: number;
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill={filled ? "currentColor" : "none"}
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
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function VerNoticia() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [noticia, setNoticia] = useState<NoticiaDTO | null>(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const rol = Number(localStorage.getItem("usuario_rol"));
  const puedePublicar = [1, 2, 3, 5].includes(rol);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get<NoticiaDTO>(`/noticias/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNoticia(res.data);
        setLikesCount(res.data?.total_likes ?? 0);

        // verificar like del usuario
        try {
          const check = await api.get(`/interactions/noticias/${id}/likes/check`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setLiked(!!check.data?.liked);
        } catch {
          // ignorar si falla el check
        }
      } catch (e) {
        console.error("Error al cargar noticia:", e);
        alert("No se pudo cargar la noticia.");
        navigate("/noticias");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id, token, navigate]);

  const toggleLike = async () => {
    if (!token || !id) {
      alert("Debes iniciar sesión para dar like");
      return;
    }
    try {
      const res = await api.post(
        `/interactions/noticias/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const nowLiked = !!res.data?.liked;
      setLiked(nowLiked);
      setLikesCount((c) => (nowLiked ? c + 1 : Math.max(0, c - 1)));
    } catch (e) {
      console.error("Error en like:", e);
    }
  };

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "";

  if (loading) {
    return (
      <div className="news-detail-wrap">
        <div className="skeleton-hero" />
        <div className="skeleton-title" />
        <div className="skeleton-meta" />
        <div className="skeleton-body" />
        <style>{`
          .news-detail-wrap{max-width:860px;margin:0 auto;padding:16px}
          .skeleton-hero{height:220px;border-radius:16px;background:#eef2f7;margin-bottom:16px}
          .skeleton-title{height:24px;width:60%;background:#eef2f7;border-radius:8px;margin:12px 0}
          .skeleton-meta{height:14px;width:40%;background:#eef2f7;border-radius:8px;margin:8px 0 16px}
          .skeleton-body{height:200px;background:#eef2f7;border-radius:12px}
        `}</style>
      </div>
    );
  }

  if (!noticia) return null;

  return (
    <>
      <div className="news-detail-wrap">
        <header className="detail-header">
          <div className="detail-top">
            <h1 className="detail-title">{noticia.Titulo}</h1>
            <div className="detail-actions">
              <Link to="/noticias" className="btn btn-ghost">Volver</Link>
              {puedePublicar && (
                <Link to={`/noticias/editar/${noticia.ID_Noticia}`} className="btn btn-warn">Editar</Link>
              )}

            </div>
          </div>

          <div className="detail-meta">
            <span>Autor: <strong>{noticia.Autor}</strong></span>
            <span className="dot">•</span>
            <span>{formatDate(noticia.Fecha_Publicacion)}</span>
            {noticia.Areas && (
              <>
                <span className="dot">•</span>
                <span className="badge">{noticia.Areas}</span>
              </>
            )}
          </div>
        </header>

        {noticia.Imagen_Principal && (
          <div className="detail-image-wrap">
            <img
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${noticia.Imagen_Principal}`}
              alt={noticia.Titulo}
              className="detail-image"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.style.display = 'none';
              }}
            />
          </div>
        )}

        <article className="detail-body">
          <p className="detail-text">{noticia.Cuerpo}</p>
        </article>

        <footer className="detail-footer">
          <div className="stats">
            <span className="stat">{likesCount} me gusta</span>
            <span className="stat">{noticia.total_comentarios} comentarios</span>
          </div>

          <div className="interaction-bar">
            <button className={`interact-btn ${liked ? "active" : ""}`} onClick={toggleLike}>
              <HeartIcon filled={liked} />
              <span>Me gusta</span>
            </button>

            <Link to={`/noticias/${noticia.ID_Noticia}/comentarios`} className="interact-btn">
              <CommentIcon />
              <span>Comentar</span>
            </Link>
          </div>
        </footer>
      </div>

      <style>{`
        :root{
          --primary:#cc0000;
          --primary-700:#a30000;
          --bg:#f5f7fa;
          --card:#ffffff;
          --text:#111827;
          --muted:#6b7280;
          --border:#e5e7eb;
          --border-soft:#f3f4f6;
          --shadow:0 1px 3px rgba(0,0,0,0.08);
          --shadow-md:0 4px 12px rgba(0,0,0,0.10);
          --radius:12px; --radius-lg:16px;
        }

        .news-detail-wrap{
          max-width: 860px;
          margin: 0 auto;
          padding: 16px 16px 40px;
        }

        .detail-header{
          margin-bottom: 10px;
        }
        .detail-top{
          display:flex; align-items:center; justify-content:space-between; gap:12px;
        }
        .detail-title{
          font-size: 26px; font-weight: 800; color: var(--text);
          letter-spacing: -0.3px; line-height: 1.2; margin: 6px 0 8px;
        }
        .detail-actions{ display:flex; gap:8px; }

        .detail-meta{
          display:flex; flex-wrap:wrap; align-items:center; gap:8px;
          font-size: 13px; color: var(--muted);
          margin-bottom: 8px;
        }
        .dot{ opacity:.6; }
        .badge{
          background: var(--border-soft);
          color: #111827;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .detail-image-wrap{
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--border-soft);
          margin: 10px 0 16px;
          box-shadow: var(--shadow);
        }
        .detail-image{
          width: 100%; height: auto; object-fit: cover; display: block;
          max-height: 460px;
        }

        .detail-body{
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 18px;
          box-shadow: var(--shadow);
        }
        .detail-text{
          color: #1f2937;
          font-size: 16px;
          line-height: 1.75;
          white-space: pre-wrap;
        }

        .detail-footer{
          margin-top: 14px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow);
          overflow: hidden;
        }
        .stats{
          display:flex; gap:16px; padding: 12px 16px; font-size: 13px; color: var(--muted);
        }
        .stat{ font-weight: 500; }

        .interaction-bar{
          display:flex; border-top: 1px solid var(--border-soft);
          padding: 6px; gap: 6px;
        }
        .interact-btn{
          flex:1; display:flex; align-items:center; justify-content:center; gap:8px;
          padding: 10px 16px; font-size:14px; font-weight:700;
          color: #4b5563; background: transparent; border: none; border-radius: 10px;
          cursor: pointer; transition: all .2s ease; text-decoration: none;
        }
        .interact-btn:hover{ background: var(--border-soft); color: #111827; }
        .interact-btn.active{ color: var(--primary); }
        .interact-btn.active svg{ animation: heartBeat .3s ease; }

        .btn{
          display:inline-flex; align-items:center; gap:8px;
          padding:9px 14px; border-radius:10px; border:1px solid transparent;
          font-size:14px; font-weight:600; text-decoration:none; cursor:pointer;
          transition:all .2s ease; user-select:none;
        }
        .btn-ghost{ background:#f3f4f6; color:#111827; border-color:var(--border); }
        .btn-ghost:hover{ background:#e5e7eb; }
        .btn-warn{ background:#f59e0b; color:#fff; }
        .btn-warn:hover{ filter:brightness(.96); }

        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        @media (max-width: 768px){
          .detail-title{ font-size:22px; }
          .detail-top{ flex-direction:column; align-items:flex-start; }
          .detail-actions{ width:100%; justify-content:flex-end; }
        }
      `}</style>
    </>
  );
}