/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getListaAlmuerzo } from "../../api/solicitudes.api";

export default function AlmuerzoLista() {
  const [fecha, setFecha] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load(f?: string) {
    setLoading(true);
    setErr(null);
    try {
      const res = await getListaAlmuerzo(f ? { fecha: f } : undefined);
      setRows(res.data ?? []);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Error al cargar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <div className="alm-container">
        <header className="alm-header no-print">
          <div>
            <h1 className="alm-title">Lista de Almuerzo</h1>
            <p className="alm-subtitle">
              Registros del día. Las columnas de firma aparecen solo al imprimir.
            </p>
          </div>

        </header>

        <div className="alm-toolbar no-print">
          <div className="alm-filters">
            <label className="alm-label" htmlFor="fecha">Fecha</label>
            <input
              id="fecha"
              className="alm-input"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
            <button className="alm-btn" onClick={() => load(fecha)}>Filtrar</button>
          </div>

          <div className="alm-actions">
            <button className="alm-btn ghost" onClick={() => { setFecha(""); load(); }}>
              Limpiar
            </button>
            <button
              className="alm-btn primary"  onClick={() => window.location.href = "/requerimientos/almuerzo-lista-Print" + (fecha ? `?fecha=${fecha}` : "")}>
              Imprimir
            </button>
          </div>
        </div>

        <section className="alm-card">
          {loading ? (
            <div className="alm-loading">Cargando…</div>
          ) : err ? (
            <div className="alm-error">{err}</div>
          ) : (
            <div className="alm-table-wrap">
              <table className="alm-table">
                <thead>
                  <tr>
                    <th className="sticky">#</th>
                    <th className="sticky">Nombre</th>
                    <th className="sticky">Departamento</th>
                    <th className="sticky">Hora registro</th>

                    {/* Columnas SOLO impresión */}
                    <th className="sticky print-only">Hora salida</th>
                    <th className="sticky print-only">Firma</th>
                    <th className="sticky print-only">Hora entrada</th>
                    <th className="sticky print-only">Firma</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td className="cell" colSpan={8} style={{ textAlign: "center", color: "#6b7280" }}>
                        No hay registros para la fecha seleccionada
                      </td>
                    </tr>
                  ) : (
                    rows.map((r, i) => (
                      <tr key={i}>
                        <td className="cell index">{i + 1}</td>
                        <td className="cell">
                          {[r?.Nombre, r?.Apellido].filter(Boolean).join(" ") || r?.Nombre_Usuario}
                        </td>
                        <td className="cell">{r?.Nombre_Departamento ?? "-"}</td>
                        <td className="cell">{r?.Hora_Registro ?? "-"}</td>

                        {/* Celdas vacías para firmar / escribir a mano */}
                        <td className="cell print-only"></td>
                        <td className="cell print-only signature"></td>
                        <td className="cell print-only"></td>
                        <td className="cell print-only signature"></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Pie con lugar para firmas generales al imprimir */}
        <footer className="alm-print-footer print-only">
          <div className="sign-box">
            <div className="line"></div>
            <div className="label">Revisó</div>
          </div>
          <div className="sign-box">
            <div className="line"></div>
            <div className="label">Jefe Inmediato</div>
          </div>
          <div className="sign-box">
            <div className="line"></div>
            <div className="label">Talento Humano</div>
          </div>
        </footer>
      </div>

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
          --shadow-md:0 8px 24px rgba(0,0,0,.10);
          --radius:14px;
        }
        *{box-sizing:border-box}
        body{color:var(--text); font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto, sans-serif}

        .alm-container{
          padding:24px;
          max-width:1100px;
          margin:0 auto;
        }

        .alm-header{
          display:flex;
          align-items:flex-end;
          justify-content:space-between;
          margin-bottom:16px;
        }
        .alm-title{
          font-size:22px;
          font-weight:800;
          letter-spacing:-.2px;
        }
        .alm-subtitle{
          margin-top:6px;
          color:var(--muted);
          font-size:14px;
        }

        .alm-toolbar{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          background:var(--card);
          border:1px solid var(--border);
          border-radius:var(--radius);
          padding:14px;
          box-shadow:var(--shadow);
          margin-bottom:16px;
        }
        .alm-filters{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
        .alm-label{ font-size:13px; font-weight:600; color:var(--muted); }
        .alm-input{
          padding:10px 12px;
          border:1px solid var(--border);
          border-radius:10px;
          background:#f9fafb;
          outline:none;
          transition:.2s;
        }
        .alm-input:focus{ border-color:var(--primary); background:#fff; box-shadow:0 0 0 3px #fee2e2; }

        .alm-actions{ display:flex; gap:8px; }
        .alm-btn{
          border:1px solid var(--border);
          background:#fff;
          color:#111827;
          padding:10px 14px;
          font-weight:700;
          border-radius:10px;
          cursor:pointer;
          transition:.2s;
        }
        .alm-btn:hover{ background:#f9fafb; }
        .alm-btn.primary{ background:var(--primary); color:#fff; border-color:var(--primary); }
        .alm-btn.primary:hover{ background:var(--primary-600); }
        .alm-btn.ghost{ background:transparent; }

        .alm-card{
          background:var(--card);
          border:1px solid var(--border);
          border-radius:var(--radius);
          box-shadow:var(--shadow);
          overflow:hidden;
        }
        .alm-loading,.alm-error{ padding:20px; }
        .alm-error{ color:#b91c1c; }

        .alm-table-wrap{
          overflow:auto;
          max-height: calc(100vh - 260px);
        }
        .alm-table{
          width:100%;
          border-collapse:separate;
          border-spacing:0;
          min-width:900px;
        }
        thead th{
          position:sticky;
          top:0;
          z-index:1;
          background:#fafafa;
          color:#111827;
          text-align:left;
          font-size:13px;
          font-weight:800;
          letter-spacing:.2px;
          border-bottom:1px solid var(--border);
          padding:12px 12px;
        }
        .cell{
          padding:12px 12px;
          border-bottom:1px solid var(--border);
          font-size:14px;
        }
        tbody tr:hover{ background:#fafafa; }
        .index{ width:56px; color:#374151; }

        /* --- Columnas solo impresión --- */
        .print-only{ display:none; }

        /* --- Footer de firmas solo impresión --- */
        .alm-print-footer{
          display:none;
          margin-top:18px;
          gap:24px;
        }
        .sign-box{ flex:1; display:flex; flex-direction:column; align-items:center; }
        .sign-box .line{
          width:100%;
          border-bottom:1px solid #000;
          height:48px; /* espacio para firma */
          margin-bottom:6px;
        }
        .sign-box .label{
          font-size:12px;
          color:#111827;
          font-weight:700;
          text-transform:uppercase;
          letter-spacing:.4px;
        }

        /* --------- IMPRESIÓN / PDF --------- */
        @media print {
          :root{
            --border:#000;
          }
          @page {
            size: A4 landscape;
            margin: 14mm;
          }
          body { background:#fff; }
          .no-print{ display:none !important; }

          .alm-container{ padding:0; max-width:none; }
          .alm-card{ border:none; box-shadow:none; }

          .alm-table-wrap{ max-height:none; overflow:visible; }
          thead th, .cell{ border-color:#000; }
          thead th{ background:#fff; }
          tbody tr:hover{ background:transparent; }

          /* Mostrar columnas para firmas y horas */
          .print-only{ display:table-cell; }

          /* Celdas de firma con espacio y borde */
          .signature{
            min-width: 120px;
            border-bottom: 1px solid #000;
          }

          /* Footer firmas visible */
          .alm-print-footer{
            display:flex;
          }
        }

        @media (max-width: 720px){
          .alm-toolbar{ flex-direction:column; align-items:stretch; }
          .alm-actions{ width:100%; justify-content:flex-end; }
          .alm-input{ width:100%; }
        }
      `}</style>
    </>
  );
}
