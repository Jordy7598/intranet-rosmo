// src/pages/Requerimientos/CrearAlmuerzo.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { postAlmuerzo } from "../../api/solicitudes.api";

export default function CrearAlmuerzo() {
  const [loading, setLoading] = useState(false);
  const [msgOk, setMsgOk] = useState<string | null>(null);
  const [msgErr, setMsgErr] = useState<string | null>(null);

  // Reloj en vivo simple (minutos)
  const [now, setNow] = useState<Date>(new Date());
  useMemo(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const fechaLarga = now.toLocaleDateString("es-GT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const horaCorta = now.toLocaleTimeString("es-GT", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsgOk(null);
    setMsgErr(null);
    setLoading(true);
    try {
      const res = await postAlmuerzo();
      setMsgOk(res?.message ?? "Salida de almuerzo registrada correctamente.");
    } catch (e: any) {
      const s = e?.response?.status;
      if (s === 409) {
        setMsgErr(e?.response?.data?.message ?? "Ya registraste tu salida de almuerzo hoy.");
      } else {
        setMsgErr(e?.response?.data?.message ?? "Error al registrar salida de almuerzo.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="req-shell">
        <header className="req-header">
          <div>
            <h1 className="req-title">Salida de almuerzo</h1>
            <p className="req-subtitle">
              Registra tu salida de almuerzo. Solo es posible un registro por día.
            </p>
          </div>
        </header>

        <div className="req-card">
          {/* Bloque de fecha y hora actuales */}
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon info-calendar" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <div className="info-label">Fecha</div>
                <div className="info-value">{fechaLarga}</div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon info-clock" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
              </div>
              <div>
                <div className="info-label">Hora actual</div>
                <div className="info-value">{horaCorta}</div>
              </div>
            </div>
          </div>

          {/* Aviso de política */}
          <div className="note">
            <div className="note-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="note-content">
              <p className="note-title">Importante</p>
              <ul className="note-list">
                <li>Solo puedes registrar una salida de almuerzo por día.</li>
                <li>Horario de almuerzo sugerido: 1:00 PM a 2:00 PM.</li>
                <li>Este registro es para control interno de la empresa.</li>
              </ul>
            </div>
          </div>

          {/* Formulario de confirmación */}
          <form onSubmit={onSubmit} className="req-form">
            <div className="confirm-box">
              <h3 className="confirm-title">Confirmación</h3>
              <p className="confirm-text">
                Al presionar <strong>Registrar</strong>, se guardará tu salida de almuerzo para el día de hoy.
              </p>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" />
                    Registrando…
                  </>
                ) : (
                  "Registrar salida de almuerzo"
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
              <span className="meta-label">Registro</span>
              <span className="meta-value">1 por día</span>
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
          --blue-50:#eff6ff;
          --blue-200:#bfdbfe;
          --yellow-50:#fffbeb;
          --yellow-200:#fde68a;
          --green-50:#f0fdf4;
          --green-200:#bbf7d0;
          --red-50:#fef2f2;
          --red-200:#fecaca;
          --shadow:0 1px 3px rgba(0,0,0,.08);
          --shadow-md:0 8px 24px rgba(0,0,0,.08);
          --radius:14px;
        }
        *{box-sizing:border-box}
        .req-shell{ display:flex; flex-direction:column; gap:16px; }
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
          display:flex;
          flex-direction:column;
          gap:18px;
        }

        .info-grid{
          display:grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap:12px;
        }
        @media (max-width:700px){
          .info-grid{ grid-template-columns: 1fr; }
        }
        .info-card{
          display:flex; align-items:center; gap:12px;
          border:1px solid var(--border);
          border-radius:12px;
          padding:14px;
          background:#f9fafb;
        }
        .info-icon{
          width:38px; height:38px; border-radius:10px;
          display:flex; align-items:center; justify-content:center;
        }
        .info-calendar{ background:var(--blue-50); border:1px solid var(--blue-200); color:#1d4ed8; }
        .info-clock{ background:#f0f9ff; border:1px solid #bae6fd; color:#0369a1; }
        .info-label{ font-size:12px; color:var(--muted); }
        .info-value{ font-size:15px; font-weight:700; color:var(--text); }

        .note{
          display:flex; gap:12px; align-items:flex-start;
          background:var(--yellow-50);
          border:1px solid var(--yellow-200);
          border-radius:12px;
          padding:14px;
        }
        .note-icon{
          width:34px; height:34px; border-radius:8px;
          display:flex; align-items:center; justify-content:center;
          background:#fff7ed; border:1px dashed #facc15; color:#a16207;
          flex-shrink:0;
        }
        .note-title{ font-weight:800; color:#92400e; margin:0 0 6px; }
        .note-list{ margin:0; padding-left:16px; color:#78350f; }

        .req-form{ display:flex; flex-direction:column; gap:16px; }
        .confirm-box{
          background:#f9fafb;
          border:1px solid var(--border);
          border-radius:12px;
          padding:16px;
        }
        .confirm-title{ margin:0 0 6px; font-size:16px; font-weight:800; color:var(--text); }
        .confirm-text{ margin:0; color:var(--muted); font-size:14px; }

        .form-actions{ display:flex; justify-content:flex-end; }
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
        .alert .dot{ width:8px; height:8px; border-radius:50%; display:inline-block; }
        .alert.success{ background:var(--green-50); color:#166534; border-color:var(--green-200); }
        .alert.success .dot{ background:#16a34a; }
        .alert.danger{ background:var(--red-50); color:#991b1b; border-color:var(--red-200); }
        .alert.danger .dot{ background:#ef4444; }

        .req-footer{ display:flex; align-items:center; justify-content:flex-end; }
        .meta{ display:flex; gap:18px; flex-wrap:wrap; }
        .meta-item{ display:flex; flex-direction:column; }
        .meta-label{ font-size:12px; color:var(--muted); }
        .meta-value{ font-size:14px; font-weight:700; color:var(--text); }
      `}</style>
    </>
  );
}
