// src/pages/Noticias/CrearNoticia.tsx
import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";

const areaOptions = ["General", "RRHH", "Ventas", "Operaciones", "IT", "Finanzas", "Marketing"];

export default function CrearNoticia() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [titulo, setTitulo] = useState("");
  const [imagen, setImagen] = useState<string>(""); // URL devuelta por el backend
  const [areas, setAreas] = useState<string>("General");
  const [cuerpo, setCuerpo] = useState("");

  const [errors, setErrors] = useState<{ titulo?: string; cuerpo?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const validate = () => {
    const e: typeof errors = {};
    if (!titulo.trim()) e.titulo = "El título es obligatorio.";
    if (!cuerpo.trim()) e.cuerpo = "El contenido es obligatorio.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePickFile = () => inputFileRef.current?.click();

  const handleFileChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    await uploadImageFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadImageFile(file);
  };

  const uploadImageFile = async (file: File) => {
    try {
      setUploading(true);
      setProgress(0);

      const form = new FormData();
      form.append("file", file);

      const res = await api.post("/uploads/noticias", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (e) => {
          if (!e.total) return;
          setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      if (res?.data?.url) {
        setImagen(res.data.url); // guardamos URL devuelta
      } else {
        alert("No se recibió la URL de la imagen.");
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    if (uploading) {
      alert("Espera a que finalice la subida de la imagen.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        Titulo: titulo.trim(),
        Cuerpo: cuerpo,
        Imagen_Principal: imagen || null, // URL del archivo subido (o null si no subiste)
        Areas: areas || "General",
      };

      await api.post("/noticias", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/noticias");
    } catch (error) {
      console.error("Error al crear noticia:", error);
      alert("No se pudo crear la noticia. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="news-form-wrap">
        <header className="form-header">
          <div>
            <h1 className="form-title">Crear noticia</h1>
            <p className="form-subtitle">
              Sube una imagen (opcional) y redacta tu publicación.
            </p>
          </div>
          <Link to="/noticias" className="btn btn-ghost">Volver</Link>
        </header>

        <form className="form-card" onSubmit={handleSubmit} noValidate>
          <div className="form-col">
            {/* Título */}
            <div className="field">
              <label className="label" htmlFor="titulo">
                Título <span className="req">*</span>
              </label>
              <input
                id="titulo"
                type="text"
                className={`input input-sm ${errors.titulo ? "has-error" : ""}`}
                placeholder="Ej. Comunicado oficial…"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
              {errors.titulo && <div className="error">{errors.titulo}</div>}
            </div>

            {/* Área */}
            <div className="field">
              <label className="label" htmlFor="area">Área</label>
              <select
                id="area"
                className="input input-sm"
                value={areas}
                onChange={(e) => setAreas(e.target.value)}
              >
                {areaOptions.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* Contenido */}
            <div className="field">
              <label className="label" htmlFor="cuerpo">
                Contenido <span className="req">*</span>
              </label>
              <textarea
                id="cuerpo"
                className={`textarea textarea-sm ${errors.cuerpo ? "has-error" : ""}`}
                placeholder="Escribe la noticia…"
                value={cuerpo}
                onChange={(e) => setCuerpo(e.target.value)}
                rows={8}
              />
              {errors.cuerpo && <div className="error">{errors.cuerpo}</div>}
            </div>

            {/* Subir imagen (solo archivo) */}
            <div className="field">
              <label className="label">Imagen (opcional)</label>
              <div
                className="dropzone"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={handleDrop}
              >
                <div className="dz-left">
                  <p className="dz-title">Arrastra y suelta una imagen</p>
                  <p className="dz-sub">o</p>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={handlePickFile}>
                    Elegir archivo
                  </button>
                  <input
                    ref={inputFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden-input"
                    onChange={handleFileChange}
                  />
                  <p className="dz-hint">Formatos: JPG, PNG, WEBP. Máx 5MB.</p>
                </div>
                <div className="dz-right">
                  {uploading ? (
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                  ) : (
                    <div className="upload-status">
                      {imagen ? <span className="ok">Imagen cargada</span> : <span className="muted">Sin imagen</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate("/noticias")}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || uploading}
              >
                {submitting ? "Publicando…" : "Publicar"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        :root{
          --primary:#cc0000; --primary-700:#a30000;
          --card:#ffffff; --text:#111827; --muted:#6b7280;
          --border:#e5e7eb; --border-soft:#f3f4f6;
          --shadow:0 1px 3px rgba(0,0,0,0.08); --shadow-md:0 4px 12px rgba(0,0,0,0.10);
          --radius:12px; --radius-lg:16px;
        }
        .news-form-wrap{ max-width: 820px; margin: 0 auto; padding: 16px 16px 40px; }
        .form-header{ display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; gap:12px; }
        .form-title{ font-size:22px; font-weight:700; color:var(--text); letter-spacing:-.2px; }
        .form-subtitle{ color:var(--muted); font-size:13px; margin-top:2px; }

        .btn{ display:inline-flex; align-items:center; gap:8px; padding:10px 14px; border-radius:10px; border:1px solid transparent; font-size:14px; font-weight:600; text-decoration:none; cursor:pointer; transition:all .2s ease; user-select:none; }
        .btn-sm{ padding:8px 12px; font-size:13px; border-radius:8px; }
        .btn-ghost{ background:#f3f4f6; color:#111827; border-color:var(--border); }
        .btn-ghost:hover{ background:#e5e7eb; }
        .btn-primary{ background:var(--primary); color:#fff; box-shadow:var(--shadow); }
        .btn-primary:hover{ background:var(--primary-700); transform:translateY(-1px); box-shadow:var(--shadow-md); }

        .form-card{ background:var(--card); border:1px solid var(--border); border-radius:var(--radius-lg); box-shadow:var(--shadow); padding:16px; }
        .form-col{ display:flex; flex-direction:column; gap:12px; }

        .field{ display:flex; flex-direction:column; gap:6px; }
        .label{ font-weight:600; font-size:13px; color:#374151; }
        .req{ color: var(--primary); }

        .input, .textarea, select.input{
          width:100%; border:1px solid var(--border); border-radius:10px;
          padding:9px 11px; font-size:14px; color:#111827; background:#fff;
          transition:border-color .2s ease, box-shadow .2s ease;
        }
        .input-sm{ padding:8px 10px; font-size:13.5px; }
        .textarea-sm{ padding:9px 11px; font-size:14px; }
        .input:focus, .textarea:focus, select.input:focus{
          outline:none; border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(204,0,0,0.08);
        }
        .textarea{ resize: vertical; }
        .has-error{ border-color:#ef4444; }
        .error{ color:#b91c1c; font-size:12.5px; margin-top:-2px; }

        /* Dropzone (compacta, sin preview) */
        .dropzone{
          display:grid; grid-template-columns: 1fr 260px; gap: 12px; align-items:center;
          border:1px dashed var(--border); border-radius:12px; padding:12px; background:#fafafa;
        }
        @media (max-width: 720px){ .dropzone{ grid-template-columns: 1fr; } }
        .dz-left{ display:flex; flex-direction:column; gap:6px; justify-content:center; }
        .dz-title{ font-weight:700; color:#374151; font-size:14px; }
        .dz-sub{ font-size:12px; color:#6b7280; }
        .dz-hint{ font-size:12px; color:#9ca3af; }
        .hidden-input{ display:none; }
        .dz-right{ display:flex; flex-direction:column; gap:8px; align-items:flex-end; }
        .upload-status{ font-size:13px; }
        .upload-status .ok{ color:#059669; font-weight:700; }
        .muted{ color:#9ca3af; }
        .progress{ width:100%; height:8px; background:#f3f4f6; border-radius:999px; overflow:hidden; }
        .progress-bar{ height:100%; background:var(--primary); width:0%; transition: width .2s ease; }

        .actions{ display:flex; justify-content:flex-end; gap:10px; margin-top:4px; border-top:1px solid var(--border); padding-top:10px; }
      `}</style>
    </>
  );
}
