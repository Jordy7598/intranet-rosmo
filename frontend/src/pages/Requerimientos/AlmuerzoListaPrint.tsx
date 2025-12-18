/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
      <div className="alm-page">
        {/* Barra superior: volver */}
        <div className="topbar no-print">
          <Link to="/requerimientos/almuerzo-lista" className="btn-back" aria-label="Regresar al Dashboard">
            Regresar
          </Link>
          <div className="top-actions">
            <button className="alm-btn ghost" onClick={() => { setFecha(""); load(); }}>
              Limpiar
            </button>
            <button className="alm-btn primary" onClick={() => window.print()}>
              Imprimir / PDF
            </button>
          </div>
        </div>

        {/* Cabecera institucional */}
        <header className="alm-header">
          <img src="/ROSMOR.png" alt="ROSMO" className="brand-logo" />
          <div className="header-text">
            <h1 className="title">Lista de Almuerzo</h1>
            <p className="subtitle">
              Empleados autorizados para salida en horario de almuerzo
            </p>
          </div>
        </header>

        {/* Filtros */}
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
        </div>

        {/* Contenido */}
        <main className="alm-content">
          <section className="alm-card">
            {loading ? (
              <div className="alm-state">Cargando…</div>
            ) : err ? (
              <div className="alm-state error">{err}</div>
            ) : (
              <div className="alm-table-wrap">
                <table className="alm-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Departamento</th>
                      <th>Hora registro</th>
                      {/* Solo impresión */}
                      <th className="print-only">Hora salida</th>
                      <th className="print-only">Firma</th>
                      <th className="print-only">Hora entrada</th>
                      <th className="print-only">Firma</th>
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

                          {/* Celdas para firmas (solo impresión) */}
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

          {/* Pie de firmas (solo impresión) */}
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
        </main>
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
          --page-width: 1020px;
        }

        *{box-sizing:border-box}
        body{color:var(--text); background: var(--bg); font-family: 'Inter', sans-serif;}

        /* Página independiente, centrada */
        .alm-page{
          min-height: 100vh;
          display:flex;
          flex-direction:column;
          align-items:center;
          padding: 24px;
        }

        .topbar{
          width:100%;
          max-width: var(--page-width);
          display:flex;
          align-items:center;
          justify-content:space-between;
          margin-bottom: 10px;
        }
        .btn-back{
          display:inline-flex;
          align-items:center;
          gap:8px;
          padding:10px 14px;
          text-decoration:none;
          font-weight:700;
          color:#111827;
          border:1px solid var(--border);
          background:#fff;
          border-radius:10px;
          transition:.2s;
        }
        .btn-back:hover{ background:#f9fafb; }
        .top-actions{ display:flex; gap:8px; }

        .alm-header{
          width:100%;
          max-width: var(--page-width);
          display:flex;
          flex-direction:column;
          align-items:center;
          text-align:center;
          gap:10px;
          padding: 10px 0 16px;
        }
        .brand-logo{
          height: 64px;
          width: auto;
          object-fit: contain;
        }
        .header-text{ max-width: 760px; }
        .title{ font-size: 26px; font-weight: 800; letter-spacing:-.2px; margin:0; }
        .subtitle{ color: var(--muted); margin: 6px 0 0; }

        .alm-toolbar{
          width:100%;
          max-width: var(--page-width);
          display:flex;
          align-items:center;
          justify-content:center;
          gap:12px;
          background:var(--card);
          border:1px solid var(--border);
          border-radius:var(--radius);
          padding:12px;
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

        .alm-content{
          width: 100%;
          max-width: var(--page-width);
          display:flex;
          flex-direction:column;
          align-items:center;
          gap: 14px;
        }

        .alm-card{
          width:100%;
          background:var(--card);
          border:1px solid var(--border);
          border-radius:var(--radius);
          box-shadow:var(--shadow);
          overflow:hidden;
        }
        .alm-state{ padding:20px; text-align:center; color:#111827; }
        .alm-state.error{ color:#b91c1c; }

        .alm-table-wrap{
          overflow:auto;
          max-height: calc(100vh - 360px);
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

        /* Solo impresión */
        .print-only{ display:none; }

        .alm-print-footer{
          width:100%;
          max-width: var(--page-width);
          display:none;
          margin-top:18px;
          gap:24px;
        }
        .sign-box{ flex:1; display:flex; flex-direction:column; align-items:center; }
        .sign-box .line{ width:100%; border-bottom:1px solid #000; height:48px; margin-bottom:6px; }
        .sign-box .label{ font-size:12px; color:#111827; font-weight:700; text-transform:uppercase; letter-spacing:.4px; }

        /* ====== IMPRESIÓN / PDF ====== */
        @media print {
          * { box-shadow: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background:#fff !important; }

          /* Ocultar cualquier layout externo (si existiera) */
          .main-header,
          .sidebar,
          .right-sidebar,
          .breadcrumb,
          .header-right,
          .profile-container { display: none !important; }

          /* Ocultar controles de navegación */
          .no-print { display: none !important; }

          /* Página horizontal con márgenes */
          @page { size: A4; margin: 14mm; }

          .alm-page { padding: 0 !important; }
          .alm-header { padding: 0 0 8px !important; }
          .brand-logo { height: 56px !important; }

          .alm-content { max-width: none !important; width: 100% !important; }
          .alm-card{ border:none !important; box-shadow:none !important; }
          .alm-table-wrap{ max-height: none !important; overflow: visible !important; }

          .alm-table{ min-width:auto !important; width:100% !important; }
          thead th, .cell{ border-color:#000 !important; background:#fff !important; color:#000 !important; }
          tbody tr:hover{ background:transparent !important; }

          /* Mostrar columnas de firmas y horas solo al imprimir */
          .print-only{ display:table-cell !important; }

          /* Footer de firmas visible en impresión */
          .alm-print-footer{ display:flex !important; }

          /* Evitar cortes */
          table, thead, tbody, tr, td, th { page-break-inside: avoid !important; }
        }

        @media (max-width: 720px){
          .alm-toolbar{ flex-direction:column; align-items:stretch; }
          .alm-input{ width:100%; }
          .topbar{ flex-direction:column; gap:10px; align-items:stretch; }
          .top-actions{ justify-content:flex-end; }
        }
      `}</style>
    </>
  );
}
