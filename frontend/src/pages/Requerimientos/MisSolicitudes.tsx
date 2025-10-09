// src/pages/Requerimientos/MisSolicitudes.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMisSolicitudes, type Solicitud } from "../../api/solicitudes.api";

export default function MisSolicitudes() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Solicitud[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMisSolicitudes();
        setRows(res.data ?? []);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error al cargar");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="card-ms">
      <div className="hdr-ms">
        <div>
          <h2 className="title-ms">Mis solicitudes</h2>
          <p className="subtitle-ms">Consulta el estado y detalle de tus solicitudes</p>
        </div>
        <div className="summary-ms">
          <div className="pill-ms">
            <span className="dot-ms" />
            {rows.length} {rows.length === 1 ? "registro" : "registros"}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="state-ms">
          <span className="spinner-ms" />
          <span>Cargando solicitudes…</span>
        </div>
      ) : error ? (
        <div className="empty-ms error-ms">
          <div className="empty-ico-ms" aria-hidden>
            <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.7">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3>Algo no salió bien</h3>
          <p>{error}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="empty-ms">
          <div className="empty-ico-ms" aria-hidden>
            <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3>No tienes solicitudes aún</h3>
          <p>Cuando crees una solicitud, aparecerá listada aquí.</p>
        </div>
      ) : (
        <ul className="list-ms">
          {rows.map((s) => (
            <li key={s.ID_Solicitud} className="row-ms">
              <div className="row-left-ms">
                <div className="topline-ms">
                  <span className="tipo-ms" title={s.Tipo}>{s.Tipo}</span>
                  <EstadoBadge estado={s.Estado} />
                </div>
                {s.Motivo ? <div className="motivo-ms" title={s.Motivo}>{s.Motivo}</div> : null}
                <div className="meta-ms">Creada: {fmtDateTime(s.Fecha_Creacion)}</div>
              </div>

              <div className="row-right-ms">
                <Link to={`/requerimientos/detalle/${s.ID_Solicitud}`} className="btn-outline-ms">
                  Ver detalle
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <style>{css}</style>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const key = (estado || "").toUpperCase();
  const cls =
    key.includes("APROB") ? "ok" :
    key.includes("RECHAZ") ? "danger" :
    key.includes("ENTREG") ? "info" :
    key.includes("PEND")   ? "warn" :
    "neutral";

  // Píldora sobria con borde suave y tipografía regular (consistente)
  return <span className={`badge-ms ${cls}`}>{estado}</span>;
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-ES", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const css = `
:root{
  --primary:#cc0000;
  --primary-600:#a30000;

  --card:#ffffff;
  --border:#e5e7eb;
  --border-2:#eceff3;

  --text:#111827;
  --muted:#6b7280;
  --muted-2:#9aa3af;

  --ok:#15803d;
  --warn:#a16207;
  --info:#1d4ed8;
  --danger:#991b1b;
  --neutral:#374151;

  --shadow:0 1px 3px rgba(0,0,0,.06);
  --radius:14px;
}

*{box-sizing:border-box}
.card-ms{
  background:var(--card);
  border:1px solid var(--border);
  border-radius:var(--radius);
  box-shadow:var(--shadow);
  padding:20px 22px;
  font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color:var(--text);
}

.hdr-ms{
  display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px;
}
.title-ms{ font-size:20px; font-weight:700; letter-spacing:-.2px; margin:0; }
.subtitle-ms{ font-size:13px; color:var(--muted); margin:4px 0 0; }

.summary-ms{ display:flex; align-items:center; gap:8px; }
.pill-ms{
  display:inline-flex; align-items:center; gap:8px;
  padding:6px 10px; border:1px solid var(--border); border-radius:999px;
  font-size:13px; color:#374151; background:#fff; font-weight:600;
}
.dot-ms{ width:8px; height:8px; border-radius:50%; background:#cbd5e1; }

.state-ms{
  padding:44px 10px; display:flex; align-items:center; justify-content:center; gap:10px; color:var(--muted);
}
.spinner-ms{
  width:18px; height:18px; border:3px solid rgba(0,0,0,.08); border-top-color:var(--primary);
  border-radius:50%; animation:spin .8s linear infinite;
}
@keyframes spin{ to{ transform:rotate(360deg) } }

.empty-ms{
  border:1px dashed var(--border);
  border-radius:12px;
  padding:30px;
  background:#f9fafb;
  text-align:center;
  color:var(--muted);
}
.empty-ms h3{ color:var(--text); font-size:16px; margin:8px 0 4px; }
.empty-ico-ms{
  width:64px; height:64px; border-radius:50%; margin:0 auto 8px;
  display:grid; place-items:center; border:1px solid var(--border-2); color:#9ca3af; background:#fff;
}
.error-ms .empty-ico-ms{ color:#b91c1c; border-color:#fecaca; }

.list-ms{ list-style:none; margin:10px 0 0; padding:0; }
.row-ms{
  display:flex; align-items:center; justify-content:space-between; gap:16px;
  padding:14px 6px; border-top:1px solid var(--border-2);
}
.row-ms:first-child{ border-top:none; }

.row-left-ms{ min-width:0; display:flex; flex-direction:column; gap:6px; }
.topline-ms{ display:flex; align-items:center; gap:10px; }
.tipo-ms{ font-weight:600; color:#0f172a; white-space:nowrap; }

.motivo-ms{
  font-size:13px; color:var(--muted);
  max-width:780px; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;
}
.meta-ms{ font-size:12px; color:var(--muted-2); }

.row-right-ms{ display:flex; align-items:center; gap:10px; flex-shrink:0; }
.btn-outline-ms{
  background:#fff; border:1.5px solid var(--border); color:#111827;
  padding:.55rem .85rem; border-radius:10px; font-weight:600; cursor:pointer; text-decoration:none;
}
.btn-outline-ms:hover{ border-color:#d1d5db; }

/* Badges sobrios (misma tipografía y tono general del sistema) */
.badge-ms{
  display:inline-flex; align-items:center;
  padding:4px 10px; border-radius:999px;
  font-size:12px; font-weight:600; letter-spacing:.1px;
  border:1px solid #e6e7ea; background:#fff; color:#374151;
}
.badge-ms.ok{     border-color:rgba(21,128,61,.25);  color:#166534; background:rgba(21,128,61,.06); }
.badge-ms.warn{   border-color:rgba(161,98,7,.25);   color:#92400e; background:rgba(161,98,7,.06); }
.badge-ms.info{   border-color:rgba(29,78,216,.22);  color:#1e40af; background:rgba(29,78,216,.06); }
.badge-ms.danger{ border-color:rgba(153,27,27,.25);  color:#991b1b; background:rgba(153,27,27,.06); }
.badge-ms.neutral{border-color:#e6e7ea;               color:#374151; background:#fff; }

@media (max-width:720px){
  .row-ms{ align-items:flex-start; flex-direction:column; }
  .row-right-ms{ width:100%; justify-content:flex-end; }
}
`;
