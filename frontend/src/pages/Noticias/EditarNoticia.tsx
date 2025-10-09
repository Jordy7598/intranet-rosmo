// src/pages/Noticias/EditarNoticia.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../api/axios";

type NoticiaDTO = {
  ID_Noticia: number;
  Titulo: string;
  Cuerpo: string;
  Imagen_Principal: string | null;
  Areas: string | null;
  Autor?: string;
  Fecha_Publicacion?: string;
};

const areaOptions = [
  "General",
  "RRHH",
  "Ventas",
  "Operaciones",
  "IT",
  "Finanzas",
  "Marketing",
];

export default function EditarNoticia() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [imagen, setImagen] = useState("");
  const [areas, setAreas] = useState<string>("General");
  const [cuerpo, setCuerpo] = useState("");

  const [errors, setErrors] = useState<{ titulo?: string; cuerpo?: string }>({});

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get<NoticiaDTO>(`/noticias/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const n = res.data;
        setTitulo(n.Titulo || "");
        setImagen(n.Imagen_Principal || "");
        setAreas(n.Areas || "General");
        setCuerpo(n.Cuerpo || "");
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

  const validate = () => {
    const e: typeof errors = {};
    if (!titulo.trim()) e.titulo = "El título es obligatorio.";
    if (!cuerpo.trim()) e.cuerpo = "El cuerpo de la noticia es obligatorio.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      const payload = {
        Titulo: titulo.trim(),
        Cuerpo: cuerpo,
        Imagen_Principal: imagen.trim() || null,
        Areas: areas || "General",
      };
      await api.put(`/noticias/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(`/noticias/${id}`);
    } catch (e) {
      console.error("Error al actualizar noticia:", e);
      alert("No se pudo actualizar la noticia. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="news-form-wrap">
        <div className="skeleton-card">
          <div className="skeleton-line w-48"></div>
          <div className="skeleton-line w-80 mt-2"></div>
          <div className="skeleton-body mt-6"></div>
        </div>
        <style>{`
          .news-form-wrap{max-width:780px;margin:0 auto;padding:16px}
          .skeleton-card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:18px}
          .skeleton-line{height:16px;background:#eef2f7;border-radius:8px}
          .w-48{width:192px}.w-80{width:320px}
          .mt-2{margin-top:8px}.mt-6{margin-top:24px}
          .skeleton-body{height:180px;background:#eef2f7;border-radius:12px}
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div className="news-form-wrap">
        <header className="form-header">
          <div>
            <h1 className="form-title">Editar noticia</h1>
            <p className="form-subtitle">
              Actualiza el contenido de tu publicación y guarda los cambios.
            </p>
          </div>
          <div className="header-actions">
            <Link to={`/noticias/${id}`} className="btn btn-ghost">Ver detalle</Link>
            <Link to="/noticias" className="btn btn-ghost">Volver</Link>
          </div>
        </header>

        <form className="form-card" onSubmit={handleSubmit} noValidate>
          {/* Título */}
          <div className="form-field">
            <label className="label" htmlFor="titulo">
              Título <span className="req">*</span>
            </label>
            <input
              id="titulo"
              type="text"
              className={`input ${errors.titulo ? "has-error" : ""}`}
              placeholder="Ej. Comunicado oficial…"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
            {errors.titulo && <div className="error">{errors.titulo}</div>}
          </div>

          {/* Imagen + Área */}
          <div className="row">
            <div className="form-field">
              <label className="label" htmlFor="imagen">Imagen (URL)</label>
              <input
                id="imagen"
                type="url"
                className="input"
                placeholder="https://…"
                value={imagen}
                onChange={(e) => setImagen(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="label" htmlFor="area">Área</label>
              <select
                id="area"
                className="input"
                value={areas}
                onChange={(e) => setAreas(e.target.value)}
              >
                {areaOptions.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cuerpo */}
          <div className="form-field">
            <label className="label" htmlFor="cuerpo">
              Contenido <span className="req">*</span>
            </label>
            <textarea
              id="cuerpo"
              className={`textarea ${errors.cuerpo ? "has-error" : ""}`}
              placeholder="Escribe la noticia…"
              value={cuerpo}
              onChange={(e) => setCuerpo(e.target.value)}
              rows={14}
            />
            {errors.cuerpo && <div className="error">{errors.cuerpo}</div>}
          </div>

          {/* Acciones */}
          <div className="actions">
            <Link to={`/noticias/${id}`} className="btn btn-ghost" aria-disabled={saving}>
              Cancelar
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        :root{
          --primary:#cc0000;
          --primary-700:#a30000;
          --card:#ffffff;
          --text:#111827;
          --muted:#6b7280;
          --border:#e5e7eb;
          --border-soft:#f3f4f6;
          --shadow:0 1px 3px rgba(0,0,0,0.08);
          --shadow-md:0 4px 12px rgba(0,0,0,0.10);
          --radius:12px;
          --radius-lg:16px;
        }

        .news-form-wrap{ 
          max-width:780px; 
          margin:0 auto; 
          padding:16px 16px 40px; 
        }

        .form-header{ 
          display:flex; 
          align-items:center; 
          justify-content:space-between; 
          margin-bottom:16px; 
          gap:12px; 
        }
        .form-title{ 
          font-size:22px; 
          font-weight:700; 
          color:var(--text); 
          letter-spacing:-.2px; 
        }
        .form-subtitle{ 
          color:var(--muted); 
          font-size:14px; 
          margin-top:2px; 
        }
        .header-actions{ 
          display:flex; 
          gap:8px; 
        }

        .btn{ 
          display:inline-flex; 
          align-items:center; 
          gap:8px; 
          padding:10px 14px; 
          border-radius:10px; 
          border:1px solid transparent; 
          font-size:14px; 
          font-weight:600; 
          text-decoration:none; 
          cursor:pointer; 
          transition:all .2s ease; 
          user-select:none; 
        }
        .btn-ghost{ 
          background:#f3f4f6; 
          color:#111827; 
          border-color:var(--border); 
        }
        .btn-ghost:hover{ 
          background:#e5e7eb; 
        }
        .btn-primary{ 
          background:var(--primary); 
          color:#fff; 
          box-shadow:var(--shadow); 
        }
        .btn-primary:hover{ 
          background:var(--primary-700); 
          transform:translateY(-1px); 
          box-shadow:var(--shadow-md); 
        }
        .btn-primary:disabled{
          opacity:0.6;
          cursor:not-allowed;
          transform:none;
        }

        .form-card{ 
          background:var(--card); 
          border:1px solid var(--border); 
          border-radius:var(--radius-lg); 
          box-shadow:var(--shadow); 
          padding:20px; 
          display:flex;
          flex-direction:column;
          gap:16px;
        }

        .form-field{
          display:flex;
          flex-direction:column;
          gap:6px;
        }

        .label{ 
          font-weight:600; 
          font-size:14px; 
          color:#374151; 
        }
        .req{ 
          color:var(--primary); 
        }

        .input, .textarea, select.input{
          width:100%; 
          border:1px solid var(--border); 
          border-radius:10px;
          padding:10px 12px; 
          font-size:14px; 
          color:#111827; 
          background:#fff;
          transition:border-color .2s ease, box-shadow .2s ease;
        }
        .input:focus, .textarea:focus, select.input:focus{
          outline:none; 
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(204,0,0,0.08);
        }
        .textarea{ 
          resize: vertical; 
          min-height: 200px;
          font-family: inherit;
          line-height: 1.6;
        }

        .has-error{ 
          border-color:#ef4444; 
        }
        .error{ 
          color:#b91c1c; 
          font-size:12.5px; 
          margin-top:-2px; 
        }

        .row{ 
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:12px; 
        }

        .actions{ 
          display:flex; 
          justify-content:flex-end; 
          gap:10px; 
          margin-top:8px; 
          padding-top:16px; 
          border-top:1px solid var(--border); 
        }

        @media (max-width: 640px){
          .form-header{
            flex-direction:column;
            align-items:flex-start;
          }
          .header-actions{
            width:100%;
            justify-content:flex-end;
          }
          .row{
            grid-template-columns:1fr;
          }
        }
      `}</style>
    </>
  );
}