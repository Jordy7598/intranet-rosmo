// src/components/noticias/ComentariosNoticia.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  Imagen_Principal: string;
  Autor: string;
  Fecha_Publicacion: string;
  total_likes: number;
  total_comentarios: number;
}

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

const ComentariosNoticia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem("token") || "", []);
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    try {
      const payloadPart = token.split(".")[1];
      const json = JSON.parse(atob(payloadPart));
      if (json?.id !== undefined) setCurrentUserId(Number(json.id));
    } catch {
      // token inválido
    }
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setErrorMsg(null);

        const noticiaRes = await api.get(`/noticias/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setNoticia(noticiaRes.data);

        const comentariosRes = await api.get(
          `/interactions/noticias/${id}/comentarios`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        const lista: Comentario[] = Array.isArray(comentariosRes.data)
          ? comentariosRes.data
          : [];
        lista.sort(
          (a, b) =>
            new Date(b.Fecha_Comentario).getTime() -
            new Date(a.Fecha_Comentario).getTime()
        );
        setComentarios(lista);

        if (token) {
          try {
            const likeRes = await api.get(
              `/interactions/noticias/${id}/likes/check`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsLiked(!!likeRes.data?.liked);
          } catch {
            // Si falla el check, no bloquea
          }
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setErrorMsg("No se pudieron cargar los comentarios.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleLike = async () => {
    if (!token) {
      alert("Debes iniciar sesión para dar me gusta.");
      return;
    }

    try {
      const response = await api.post(
        `/interactions/noticias/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const liked = !!response.data?.liked;
      setIsLiked(liked);
      setNoticia((prev) =>
        prev
          ? {
              ...prev,
              total_likes: liked
                ? prev.total_likes + 1
                : Math.max(0, prev.total_likes - 1),
            }
          : prev
      );
    } catch (error) {
      console.error("Error al manejar like:", error);
    }
  };

  const handleSubmitComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!token) {
      alert("Debes iniciar sesión para comentar.");
      return;
    }

    const texto = nuevoComentario.trim();
    if (!texto) {
      setErrorMsg("El comentario no puede estar vacío.");
      return;
    }

    try {
      setSending(true);

      const tempId = Math.floor(Math.random() * 1e9);
      const ahora = new Date().toISOString();
      const temp: Comentario = {
        ID_Comentario: tempId,
        Comentario: texto,
        Fecha_Comentario: ahora,
        Nombre_Usuario: localStorage.getItem("usuario_nombre") || "Usuario",
        ID_Usuario: currentUserId ?? 0,
      };
      setComentarios((prev) => [temp, ...prev]);
      setNuevoComentario("");
      setNoticia((prev) =>
        prev ? { ...prev, total_comentarios: prev.total_comentarios + 1 } : prev
      );

      const res = await api.post(
        `/interactions/noticias/${id}/comentarios`,
        { comentario: texto },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res?.data?.ID_Comentario) {
        setComentarios((prev) =>
          prev.map((c) => (c.ID_Comentario === tempId ? res.data : c))
        );
      } else {
        const comentariosRes = await api.get(
          `/interactions/noticias/${id}/comentarios`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setComentarios(comentariosRes.data || []);
      }
    } catch (error) {
      console.error("Error al crear comentario:", error);
      setErrorMsg("No se pudo publicar el comentario.");
      setComentarios((prev) => prev.filter((c) => c.ID_Comentario !== 0));
      setNoticia((prev) =>
        prev
          ? {
              ...prev,
              total_comentarios: Math.max(0, prev.total_comentarios - 1),
            }
          : prev
      );
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComentario = async (comentarioId: number) => {
    if (!token) {
      alert("Debes iniciar sesión.");
      return;
    }
    const ok = confirm("¿Eliminar este comentario?");
    if (!ok) return;

    try {
      await api.delete(`/interactions/comentarios/${comentarioId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setComentarios((prev) =>
        prev.filter((c) => c.ID_Comentario !== comentarioId)
      );
      setNoticia((prev) =>
        prev
          ? {
              ...prev,
              total_comentarios: Math.max(0, prev.total_comentarios - 1),
            }
          : prev
      );
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      alert("No se pudo eliminar el comentario.");
    }
  };

  if (loading) {
    return (
      <div className="comments-wrap">
        <div className="skeleton-title" />
        <div className="skeleton-form" />
        <div className="skeleton-cards">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>

        <style>{`
          .comments-wrap{max-width:760px;margin:0 auto;padding:16px}
          .skeleton-title{height:22px;width:60%;background:#eef2f7;border-radius:8px;margin:10px 0 16px}
          .skeleton-form{height:120px;background:#eef2f7;border-radius:12px;margin-bottom:16px}
          .skeleton-cards{display:flex;flex-direction:column;gap:12px}
          .skeleton-card{height:92px;background:#eef2f7;border-radius:12px}
        `}</style>
      </div>
    );
  }

  if (!noticia) {
    return (
      <div className="comments-wrap">
        <div className="error-box">
          <p>No se pudo cargar la noticia.</p>
          <button className="btn btn-ghost" onClick={() => navigate("/noticias")}>
            Volver a noticias
          </button>
        </div>

        <style>{`
          .comments-wrap{max-width:760px;margin:0 auto;padding:16px}
          .error-box{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px}
          .btn{display:inline-flex;align-items:center;gap:8px;padding:9px 14px;border-radius:10px;border:1px solid #e5e7eb;background:#f3f4f6;cursor:pointer}
          .btn-ghost:hover{background:#e5e7eb}
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div className="comments-wrap">
        <header className="head">
          <div className="head-left">
            <h1 className="title">Comentarios</h1>
            <p className="subtitle">
              Sobre:&nbsp;
              <Link to={`/noticias/${noticia.ID_Noticia}`} className="link">
                {noticia.Titulo}
              </Link>
            </p>
          </div>

          <div className="head-actions">
            <button
              className={`like-btn ${isLiked ? "active" : ""}`}
              onClick={handleLike}
              title={isLiked ? "Quitar me gusta" : "Me gusta"}
            >
              <HeartIcon filled={isLiked} />
              <span>{noticia.total_likes}</span>
            </button>
            <Link to={`/noticias/${noticia.ID_Noticia}`} className="btn btn-ghost">
              Volver al detalle
            </Link>
          </div>
        </header>

        <article className="news-card">
          <h2 className="news-title">{noticia.Titulo}</h2>
          <div className="news-meta">
            <span>
              Autor: <strong>{noticia.Autor}</strong>
            </span>
            <span className="dot">•</span>
            <span>
              {new Date(noticia.Fecha_Publicacion).toLocaleDateString("es-ES")}
            </span>
          </div>

          {noticia.Imagen_Principal && (
            <div className="news-image-wrap">
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${noticia.Imagen_Principal}`}
                alt={noticia.Titulo}
                className="news-image"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="news-body">
            {noticia.Cuerpo.split("\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="news-stats">
            <span>{noticia.total_likes} me gusta</span>
            <span>{noticia.total_comentarios} comentarios</span>
          </div>
        </article>

        <section className="card">
          <h3 className="card-title">Agregar comentario</h3>
          {errorMsg && <div className="error">{errorMsg}</div>}
          <form onSubmit={handleSubmitComentario} className="form">
            <textarea
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              placeholder="Escribe tu comentario…"
              className="textarea"
              rows={4}
              required
            />
            <div className="actions">
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? "Publicando…" : "Publicar"}
              </button>
            </div>
          </form>
        </section>

        <section className="list">
          {comentarios.length === 0 ? (
            <div className="empty">
              <p>No hay comentarios aún. Sé el primero en comentar.</p>
            </div>
          ) : (
            comentarios.map((comentario) => (
              <article key={comentario.ID_Comentario} className="comment">
                <div className="avatar">
                  {comentario.Nombre_Usuario?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="content">
                  <div className="row-top">
                    <span className="name">{comentario.Nombre_Usuario}</span>
                    <span className="dot">•</span>
                    <span className="date">
                      {new Date(comentario.Fecha_Comentario).toLocaleString("es-ES")}
                    </span>
                  </div>
                  <p className="text">{comentario.Comentario}</p>
                </div>

                {currentUserId === comentario.ID_Usuario && (
                  <button
                    onClick={() => handleDeleteComentario(comentario.ID_Comentario)}
                    className="btn btn-danger btn-small"
                    title="Eliminar comentario"
                  >
                    Eliminar
                  </button>
                )}
              </article>
            ))
          )}
        </section>
      </div>

      <style>{`
        :root{
          --primary:#cc0000; --primary-700:#a30000;
          --card:#ffffff; --text:#111827; --muted:#6b7280;
          --border:#e5e7eb; --border-soft:#f3f4f6;
          --shadow:0 1px 3px rgba(0,0,0,0.08);
          --shadow-md:0 4px 12px rgba(0,0,0,0.10);
          --radius:12px; --radius-lg:16px;
        }

        .comments-wrap{ max-width: 800px; margin: 0 auto; padding: 16px 16px 40px; }

        .head{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom: 12px; }
        .head-left{ display:flex; flex-direction:column; gap:2px; }
        .title{ font-size:22px; font-weight:800; color:var(--text); letter-spacing:-.2px; }
        .subtitle{ font-size:14px; color:var(--muted); }
        .link{ color:var(--primary); font-weight:700; text-decoration:none; }
        .link:hover{ color:var(--primary-700); text-decoration:underline; }
        .head-actions{ display:flex; align-items:center; gap:8px; }

        .like-btn{
          display:inline-flex; align-items:center; gap:8px;
          padding:8px 12px; border:1px solid var(--border); border-radius:999px;
          background:#f3f4f6; color:#374151; font-weight:700; cursor:pointer; transition:.2s;
        }
        .like-btn:hover{ background:#e5e7eb; }
        .like-btn.active{ background:#fee2e2; color:#dc2626; border-color:#fecaca; }

        .news-card{
          background:var(--card); border:1px solid var(--border);
          border-radius:var(--radius-lg); padding:20px; box-shadow:var(--shadow);
          margin-bottom: 14px;
        }
        .news-title{ margin:0 0 8px 0; color:#111827; font-size:20px; font-weight:800; letter-spacing:-.2px; }
        .news-meta{ display:flex; align-items:center; gap:8px; color:var(--muted); font-size:13px; margin-bottom: 12px; }
        .dot{ opacity:.5; }
        
        .news-image-wrap{
          margin:12px 0;
          border-radius:var(--radius);
          overflow:hidden;
          border:1px solid var(--border);
        }
        .news-image{
          width:100%;
          height:auto;
          max-height:400px;
          object-fit:cover;
          display:block;
        }
        
        .news-body{ line-height:1.6; color:#1f2937; margin-top:12px; }
        .news-body p{ margin: 0 0 10px; }
        .news-stats{ display:flex; gap:16px; font-size:13px; color:var(--muted); margin-top: 12px; }

        .card{
          background:var(--card); border:1px solid var(--border);
          border-radius:var(--radius-lg); box-shadow:var(--shadow);
          padding: 16px; margin-bottom: 14px;
        }
        .card-title{ font-size:14px; font-weight:700; color:#374151; margin-bottom: 8px; }

        .form{ display:flex; flex-direction:column; gap:10px; }
        .textarea{
          width:100%; border:1px solid var(--border); border-radius:10px;
          padding:10px 12px; font-size:14px; color:#111827; background:#fff;
          transition:border-color .2s ease, box-shadow .2s ease; resize:vertical;
        }
        .textarea:focus{ outline:none; border-color:var(--primary); box-shadow:0 0 0 3px rgba(204,0,0,0.08); }

        .actions{ display:flex; justify-content:flex-end; }
        .btn{
          display:inline-flex; align-items:center; gap:8px; padding:9px 14px; border-radius:10px;
          border:1px solid transparent; font-size:14px; font-weight:600; cursor:pointer; transition:all .2s ease;
          text-decoration:none;
        }
        .btn-primary{ background:var(--primary); color:#fff; box-shadow:var(--shadow); }
        .btn-primary:hover{ background:var(--primary-700); }
        .btn-primary:disabled{ opacity:0.6; cursor:not-allowed; }
        .btn-ghost{ background:#f3f4f6; color:#111827; border-color:var(--border); }
        .btn-ghost:hover{ background:#e5e7eb; }
        .btn-danger{ background:#dc2626; color:#fff; }
        .btn-small{ padding:6px 10px; font-size:12px; border-radius:8px; }

        .list{ display:flex; flex-direction:column; gap:10px; }
        .empty{
          background:var(--card); border:1px dashed var(--border); color:var(--muted);
          border-radius:var(--radius-lg); padding:20px; text-align:center;
        }

        .comment{
          background:var(--card); border:1px solid var(--border); border-radius:var(--radius-lg);
          box-shadow:var(--shadow); padding:12px; display:flex; gap:12px; align-items:flex-start;
        }
        .avatar{
          width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;
          background: linear-gradient(135deg, var(--primary), #ff4444); color:#fff; font-weight:800;
          box-shadow: 0 2px 8px rgba(204,0,0,0.15); flex-shrink:0;
        }
        .content{ flex:1; }
        .row-top{ display:flex; align-items:center; gap:8px; color:#6b7280; font-size:13px; }
        .name{ color:#111827; font-weight:700; }
        .date{ white-space:nowrap; }
        .text{ color:#1f2937; font-size:14px; line-height:1.6; margin-top:4px; white-space:pre-wrap; }

        .error{ color:#b91c1c; background:#fee2e2; border:1px solid #fecaca; padding:8px 10px; border-radius:10px; font-size:13px; }

        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        @media (max-width: 768px){
          .comments-wrap{ padding: 12px; }
          .head{ flex-direction:column; align-items:flex-start; gap:8px; }
          .head-actions{ width:100%; justify-content:flex-end; }
        }
      `}</style>
    </>
  );
};

export default ComentariosNoticia;