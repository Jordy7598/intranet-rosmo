// src/pages/Requerimientos/DetalleSolicitud.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { aprobarSolicitud, getSolicitudById, rechazarSolicitud, type Solicitud } from "../../api/solicitudes.api";

export default function DetalleSolicitud() {
  const { id } = useParams();
  const sid = Number(id);
  const [item, setItem] = useState<Solicitud | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await getSolicitudById(sid);
      setItem(res.data);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [sid]);

  useEffect(() => {
    if (sid) load();
  }, [sid, load]);

  async function onAprobar() {
    try {
      await aprobarSolicitud(sid);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Error");
    }
  }

  async function onRechazar() {
    try {
      await rechazarSolicitud(sid, { motivo: motivoRechazo });
      setMotivoRechazo("");
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Error");
    }
  }

  if (loading) return <div className="ds-state"><span className="ds-spinner" />Cargando…</div>;
  if (err) return <div className="ds-state ds-error">{err}</div>;
  if (!item) return <div className="ds-state">No encontrado</div>;

  const puedeAprobar =
    ["Pendiente", "PendienteRH"].includes(item.Estado) && ["SALIDA", "CARTA"].includes(item.Tipo);

  return (
    <>
      <section className="ds-shell">
        {/* Header */}
        <header className="ds-header">
          <div className="ds-header-left">
            <h1 className="ds-title">Detalle de Solicitud #{item.ID_Solicitud}</h1>
            <p className="ds-subtitle">Información y acciones de la solicitud</p>
          </div>
          <div className="ds-header-right">
            <span className={`ds-badge ${mapEstado(item.Estado)}`}>{item.Estado}</span>
          </div>
        </header>

        {/* Tarjeta principal */}
        <div className="ds-card">
          <div className="ds-grid">
            <Info label="Tipo" value={item.Tipo} />
            <Info label="Creada" value={fmtDateTime(item.Fecha_Creacion)} />
            {item.Tipo === "BOLETA" && item.Quincena ? (
              <Info label="Período" value={`Q${item.Quincena} / ${pad2(item.Mes ?? undefined)} / ${item.Anio}`} />
            ) : null}
            {item.Fecha_Inicio ? <Info label="Inicio" value={fmtDateTime(item.Fecha_Inicio)} /> : null}
            {item.Fecha_Fin ? <Info label="Fin" value={fmtDateTime(item.Fecha_Fin)} /> : null}
          </div>

          {item.Motivo ? (
            <div className="ds-block">
              <div className="ds-label">Motivo</div>
              <div className="ds-text">{item.Motivo}</div>
            </div>
          ) : null}
        </div>

        {/* Acciones de aprobación */}
        {puedeAprobar && (
          <div className="ds-actions">
            <div className="ds-actions-row">
              <button className="btn-primary" onClick={onAprobar}>Aprobar</button>
              <div className="ds-rechazo">
                <input
                  className="ds-input"
                  placeholder="Motivo (rechazo)"
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                />
                <button className="btn-outline" onClick={onRechazar}>Rechazar</button>
              </div>
            </div>
            <p className="ds-note">
              * El backend valida el rol según estado (Jefe en Pendiente, Talento Humano en PendienteRH).
            </p>
          </div>
        )}
      </section>

      <style>{`
        :root{
          --primary:#cc0000;
          --primary-600:#a30000;
          --card:#ffffff;
          --bg:#f5f7fa;
          --text:#111827;
          --muted:#6b7280;
          --border:#e5e7eb;
          --border-2:#eceff3;

          --ok:#166534;
          --warn:#92400e;
          --info:#1e40af;
          --danger:#991b1b;

          --radius:14px;
          --shadow:0 1px 3px rgba(0,0,0,.08);
          --shadow-md:0 8px 24px rgba(0,0,0,.08);
        }
        *{box-sizing:border-box}
        .ds-shell{
          display:flex; flex-direction:column; gap:16px;
          font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color:var(--text);
        }

        .ds-header{
          background:var(--card);
          border:1px solid var(--border);
          border-radius:var(--radius);
          padding:18px 20px;
          display:flex; align-items:center; justify-content:space-between; gap:12px;
          box-shadow:var(--shadow);
        }
        .ds-title{ margin:0; font-size:20px; font-weight:800; letter-spacing:-.2px; }
        .ds-subtitle{ margin:4px 0 0; color:var(--muted); font-size:13px; }
        .ds-badge{
          display:inline-flex; align-items:center; padding:6px 12px; border-radius:999px;
          font-size:12px; font-weight:700; border:1px solid #e6e7ea; background:#fff; color:#374151;
        }
        .ds-badge.ok{     color:var(--ok);     background:rgba(22,101,52,.06);  border-color:rgba(22,101,52,.22); }
        .ds-badge.warn{   color:var(--warn);   background:rgba(146,64,14,.06);  border-color:rgba(146,64,14,.22); }
        .ds-badge.info{   color:var(--info);   background:rgba(30,64,175,.06);  border-color:rgba(30,64,175,.22); }
        .ds-badge.danger{ color:var(--danger); background:rgba(153,27,27,.06);  border-color:rgba(153,27,27,.22); }
        .ds-badge.neutral{color:#374151;       background:#fff;                 border-color:#e6e7ea; }

        .ds-card{
          background:var(--card);
          border:1px solid var(--border);
          border-radius:var(--radius);
          box-shadow:var(--shadow);
          padding:18px 20px;
          display:flex; flex-direction:column; gap:16px;
        }
        .ds-grid{
          display:grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap:12px;
        }
        @media (max-width:720px){
          .ds-grid{ grid-template-columns:1fr; }
        }
        .info{
          border:1px solid var(--border);
          border-radius:12px;
          padding:12px 14px;
          background:#f9fafb;
        }
        .info-label{ font-size:12px; color:var(--muted); margin-bottom:4px; }
        .info-value{ font-size:15px; font-weight:700; color:#0f172a; }

        .ds-block{ display:flex; flex-direction:column; gap:6px; }
        .ds-label{ font-size:13px; color:var(--muted); }
        .ds-text{
          background:#fff; border:1px solid var(--border); border-radius:12px; padding:12px 14px; color:#0f172a;
        }

        .ds-actions{
          background:var(--card);
          border:1px solid var(--border);
          border-radius:var(--radius);
          box-shadow:var(--shadow);
          padding:16px 20px;
        }
        .ds-actions-row{ display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
        .ds-rechazo{ display:flex; gap:8px; align-items:center; flex:1; min-width:260px; }
        .ds-input{
          flex:1; padding:10px 12px; border:1px solid var(--border); border-radius:10px; outline:none;
          background:#fff; color:var(--text);
        }
        .ds-input:focus{ border-color:var(--primary); box-shadow:0 0 0 4px rgba(204,0,0,.08); }

        .btn-primary{
          border:1px solid var(--primary);
          background:var(--primary);
          color:#fff;
          font-weight:800;
          padding:10px 14px;
          border-radius:10px;
          cursor:pointer;
          transition:.2s;
        }
        .btn-primary:hover{ background:var(--primary-600); }
        .btn-outline{
          background:#fff; border:1.5px solid var(--border); color:#111827;
          padding:10px 14px; border-radius:10px; font-weight:700; cursor:pointer;
        }
        .btn-outline:hover{ border-color:#d1d5db; }

        .ds-note{ margin-top:10px; color:var(--muted); font-size:12px; }

        .ds-state{
          display:flex; align-items:center; gap:10px; padding:24px; color:var(--muted);
          font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .ds-state.ds-error{ color:var(--danger); }
        .ds-spinner{
          width:18px; height:18px; border:3px solid rgba(0,0,0,.08); border-top-color:var(--primary);
          border-radius:50%; animation:spin .8s linear infinite;
        }
        @keyframes spin{ to{ transform:rotate(360deg) } }
      `}</style>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="info">
      <div className="info-label">{label}</div>
      <div className="info-value">{value}</div>
    </div>
  );
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

function pad2(n?: number) {
  if (typeof n !== "number") return "";
  return String(n).padStart(2, "0");
}

function mapEstado(estado: string) {
  const key = (estado || "").toUpperCase();
  if (key.includes("APROB")) return "ok";
  if (key.includes("RECHAZ")) return "danger";
  if (key.includes("ENTREG")) return "info";
  if (key.includes("PEND")) return "warn";
  return "neutral";
}
