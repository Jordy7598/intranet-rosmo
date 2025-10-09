// src/pages/Vacaciones/Historial.tsx
import { useEffect, useState } from "react";
import { mis } from "../../api/vacaciones.api";
import type { Vacacion } from "../../api/vacaciones.api";

export default function Historial() {
  const [data, setData] = useState<Vacacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await mis();
        const aprobadas = (res.data || []).filter((v: Vacacion) => v.Estado === "Aprobado");
        setData(aprobadas);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="hdr">
        <div>
          <h2 className="title">Historial de vacaciones</h2>
          <p className="subtitle">Registros <b>aprobados</b> y finalizados</p>
        </div>
        <div className="summary">
          <div className="pill">
            <span className="dot ok" />
            {data.length} {data.length === 1 ? "registro" : "registros"}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="state">
          <span className="spinner" />
          <span>Cargando historial...</span>
        </div>
      ) : data.length === 0 ? (
        <div className="empty">
          <div className="empty-ico" aria-hidden>
            <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3>No hay vacaciones aprobadas</h3>
          <p>Cuando se aprueben solicitudes, las verás listadas aquí.</p>
        </div>
      ) : (
        <ul className="list">
          {data.map((v) => (
            <li key={v.ID_vacacion} className="row">
              <div className="row-left">
                <div className="dates">
                  <span className="date">{fmt(v.Fecha_Inicio)}</span>
                  <span className="arrow">→</span>
                  <span className="date">{fmt(v.Fecha_Fin)}</span>
                </div>
                {v.Motivo ? <div className="motivo" title={v.Motivo}>{v.Motivo}</div> : null}
              </div>

              <div className="row-right">
                <span className="days">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 5 17 10" />
                    <line x1="12" y1="5" x2="12" y2="20" />
                  </svg>
                  {v.Dias_Solicitados} {v.Dias_Solicitados === 1 ? "día" : "días"}
                </span>

                <span className="badge success" title="Aprobado">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Aprobado
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <style>{css}</style>
    </div>
  );
}

const css = `
:root{
  --primary:#cc0000;
  --primary-600:#a30000;
  --card:#ffffff;
  --border:#e5e7eb;
  --border-2:#e9ecef;
  --muted:#6b7280;
  --text:#111827;
  --bg:#f9fafb;
  --ok:#16a34a;
}

.card{
  background:var(--card);
  border:1.5px solid var(--border);
  border-radius:14px;
  box-shadow:0 1px 3px rgba(0,0,0,.08);
}

.hdr{
  display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px
}
.title{font-size:20px;letter-spacing:-.2px}
.subtitle{font-size:13px;color:var(--muted)}

.summary{display:flex;align-items:center;gap:8px}
.pill{
  display:inline-flex;align-items:center;gap:8px;
  padding:.45rem .7rem;border:1px solid var(--border);border-radius:999px;font-weight:600;
  color:#374151;background:#fff;
}
.dot{width:8px;height:8px;border-radius:50%}
.dot.ok{background:var(--ok)}

.state{
  padding:44px 10px;display:flex;align-items:center;justify-content:center;gap:10px;color:var(--muted)
}
.spinner{
  width:18px;height:18px;border:3px solid rgba(0,0,0,.1);border-top-color:var(--primary);
  border-radius:50%;animation:spin .8s linear infinite;
}
@keyframes spin{to{transform:rotate(360deg)}}

.empty{
  border:1px dashed var(--border);
  border-radius:12px;
  padding:32px;
  background:var(--bg);
  text-align:center;
  color:var(--muted);
}
.empty h3{color:var(--text);font-size:16px;margin:8px 0 4px}
.empty-ico{
  width:64px;height:64px;border-radius:50%;margin:0 auto 8px;
  display:grid;place-items:center;border:1px solid var(--border-2);color:#9ca3af;background:#fff;
}

.list{list-style:none;margin:10px 0 0;padding:0}
.row{
  display:flex;align-items:center;justify-content:space-between;gap:16px;
  padding:14px 6px;border-top:1px solid var(--border-2);
}
.row:first-child{border-top:none}

.row-left{min-width:0}
.dates{display:flex;align-items:center;gap:8px;font-weight:700;color:#111827}
.date{white-space:nowrap}
.arrow{opacity:.6}

.motivo{
  margin-top:4px;font-size:13px;color:var(--muted);
  max-width:680px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;
}

.row-right{
  display:flex;align-items:center;gap:10px;flex-shrink:0
}
.days{
  display:inline-flex;align-items:center;gap:6px;
  background:#fff;border:1px solid var(--border);border-radius:10px;padding:.35rem .55rem;font-weight:600;
  color:#374151;
}
.badge{
  display:inline-flex;align-items:center;gap:6px;
  border-radius:999px;padding:.35rem .6rem;font-size:12px;font-weight:700;letter-spacing:.2px
}
.badge.success{background:rgba(22,163,74,.1);color:var(--ok);border:1px solid rgba(22,163,74,.2)}

@media (max-width:720px){
  .row{align-items:flex-start;flex-direction:column}
  .row-right{width:100%;justify-content:space-between}
}
`;
