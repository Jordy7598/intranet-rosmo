// src/pages/Requerimientos/CrearCarta.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { postCarta } from "../../api/solicitudes.api";

export default function CrearCarta() {
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgOk, setMsgOk] = useState<string | null>(null);
  const [msgErr, setMsgErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsgOk(null);
    setMsgErr(null);
    try {
      const res = await postCarta({ motivo });
      setMsgOk(res?.message ?? "Solicitud registrada correctamente.");
      setMotivo("");
    } catch (e: any) {
      setMsgErr(e?.response?.data?.message ?? "No fue posible registrar la solicitud.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="req-shell">
        <header className="req-header">
          <div>
            <h1 className="req-title">Carta de Ingresos</h1>
            <p className="req-subtitle">
              Genera una solicitud para obtener tu carta de ingresos. Nuestro equipo la procesará y te notificará.
            </p>
          </div>
        </header>

        <div className="req-card">
          <form onSubmit={onSubmit} className="req-form">
            <div className="form-group">
              <label htmlFor="motivo" className="form-label">
                Motivo (opcional)
              </label>
              <textarea
                id="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="form-textarea"
                placeholder="Ej. Solicito la carta para trámite bancario…"
                rows={5}
              />
              <div className="field-hint">Puedes dejar este campo vacío si no es necesario.</div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" /> Enviando…
                  </>
                ) : (
                  "Enviar solicitud"
                )}
              </button>
            </div>

            {msgOk && (
              <div className="alert success">
                <span className="dot" />
                {msgOk}
              </div>
            )}
            {msgErr && (
              <div className="alert danger">
                <span className="dot" />
                {msgErr}
              </div>
            )}
          </form>
        </div>

        <footer className="req-footer">
          <div className="meta">
            <div className="meta-item">
              <span className="meta-label">Tiempo estimado</span>
              <span className="meta-value">24 – 48 h hábiles</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Área responsable</span>
              <span className="meta-value">Talento Humano</span>
            </div>
          </div>
        </footer>
      </section>

      <style>{`
        :root{
          --primary:#cc0000;
          --primary-600:#a30000;
          --bg:#f5f7fa;
          --card:#ffffff;
          --text:#111827;
          --muted:#6b7280;
          --border:#e5e7eb;
          --border-strong:#d1d5db;
          --shadow:0 1px 3px rgba(0,0,0,.08);
          --shadow-md:0 8px 24px rgba(0,0,0,.08);
          --radius:14px;
        }
        *{box-sizing:border-box}
        .req-shell{
          display:flex; flex-direction:column; gap:16px;
          font-family: 'Inter', sans-serif;
        }
        .req-header{
          background:var(--card);
          border:1px solid var(--border);
          border-radius:var(--radius);
          padding:20px 22px;
          box-shadow:var(--shadow);
        }
        .req-title{ font-size:22px; font-weight:800; letter-spacing:-.2px; color:var(--text); margin:0 0 6px; }
        .req-subtitle{ color:var(--muted); font-size:14px; margin:0; }

        .req-card{
          background:var(--card);
          border:1px solid var(--border);
          border-radius:var(--radius);
          box-shadow:var(--shadow);
          padding:22px;
        }
        .req-form{ display:flex; flex-direction:column; gap:18px; }
        .form-group{ display:flex; flex-direction:column; gap:8px; }
        .form-label{ font-size:14px; font-weight:700; color:var(--text); }
        .form-textarea{
          width:100%;
          resize:vertical;
          min-height:120px;
          border:1px solid var(--border);
          border-radius:12px;
          padding:12px 14px;
          font-size:15px;
          background:#f9fafb;
          outline:none;
          transition:.2s;
        }
        .form-textarea:focus{
          background:#fff;
          border-color:var(--primary);
          box-shadow:0 0 0 3px #fee2e2;
        }
        .field-hint{ font-size:12px; color:var(--muted); }

        .form-actions{ display:flex; gap:10px; justify-content:flex-end; }
        .btn-primary{
          border:1px solid var(--primary);
          background:var(--primary);
          color:#fff;
          font-weight:800;
          padding:12px 16px;
          border-radius:12px;
          cursor:pointer;
          transition:.2s;
          display:inline-flex; align-items:center; gap:10px;
        }
        .btn-primary:hover{ background:var(--primary-600); }
        .btn-primary:disabled{ opacity:.7; cursor:not-allowed; }
        .spinner{
          width:16px; height:16px; border-radius:50%;
          border:2px solid rgba(255,255,255,.5);
          border-top-color:#fff; animation:spin .8s linear infinite;
        }
        @keyframes spin{ to{ transform:rotate(360deg); } }

        .alert{
          display:flex; align-items:center; gap:10px;
          border-radius:10px; padding:12px 14px; font-size:14px; border:1px solid;
        }
        .alert .dot{
          width:8px; height:8px; border-radius:50%;
          display:inline-block;
        }
        .alert.success{
          background:#f0fdf4; color:#166534; border-color:#bbf7d0;
        }
        .alert.success .dot{ background:#16a34a; }
        .alert.danger{
          background:#fef2f2; color:#991b1b; border-color:#fecaca;
        }
        .alert.danger .dot{ background:#ef4444; }

        .req-footer{
          display:flex; align-items:center; justify-content:flex-end;
        }
        .meta{ display:flex; gap:18px; }
        .meta-item{ display:flex; flex-direction:column; }
        .meta-label{ font-size:12px; color:var(--muted); }
        .meta-value{ font-size:14px; font-weight:700; color:var(--text); }
        
        @media (max-width: 720px){
          .req-card{ padding:16px; }
          .req-title{ font-size:20px; }
        }
      `}</style>
    </>
  );
}
