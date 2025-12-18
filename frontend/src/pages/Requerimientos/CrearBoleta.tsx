// src/pages/Requerimientos/CrearBoleta.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { postBoleta } from "../../api/solicitudes.api";

export default function CrearBoleta() {
  const now = useMemo(() => new Date(), []);
  const [mes, setMes] = useState<string>(String(now.getMonth() + 1)); // 1..12
  const [anio, setAnio] = useState<string>(String(now.getFullYear()));
  const [quincena, setQuincena] = useState<"1" | "2">(now.getDate() <= 15 ? "1" : "2");

  const [loading, setLoading] = useState(false);
  const [msgOk, setMsgOk] = useState<string | null>(null);
  const [msgErr, setMsgErr] = useState<string | null>(null);

  const meses = [
    { v: "1", n: "Enero" },
    { v: "2", n: "Febrero" },
    { v: "3", n: "Marzo" },
    { v: "4", n: "Abril" },
    { v: "5", n: "Mayo" },
    { v: "6", n: "Junio" },
    { v: "7", n: "Julio" },
    { v: "8", n: "Agosto" },
    { v: "9", n: "Septiembre" },
    { v: "10", n: "Octubre" },
    { v: "11", n: "Noviembre" },
    { v: "12", n: "Diciembre" },
  ];

  const anios = useMemo(() => {
    const current = now.getFullYear();
    const list: number[] = [];
    for (let y = current + 1; y >= current - 6; y--) list.push(y);
    return list;
  }, [now]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsgOk(null);
    setMsgErr(null);

    if (!mes || !anio || !quincena) {
      setMsgErr("Por favor, selecciona quincena, mes y año.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        quincena: (quincena === "1" ? 1 : 2) as 1 | 2,
        mes: Number(mes),
        anio: Number(anio),
      };
      const res = await postBoleta(payload);
      setMsgOk(res?.message ?? "Solicitud registrada correctamente.");
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
            <h1 className="req-title">Boleta de Pago</h1>
            <p className="req-subtitle">
              Solicita la boleta de pago seleccionando quincena, mes y año del período requerido.
            </p>
          </div>
        </header>

        <div className="req-card">
          <form onSubmit={onSubmit} className="req-form">
            <div className="grid-3">
              <div className="form-group">
                <label htmlFor="quincena" className="form-label">Quincena</label>
                <select
                  id="quincena"
                  className="form-input"
                  value={quincena}
                  onChange={(e) => setQuincena(e.target.value as "1" | "2")}
                  required
                >
                  <option value="1">Primera (1–15)</option>
                  <option value="2">Segunda (16–fin de mes)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="mes" className="form-label">Mes</label>
                <select
                  id="mes"
                  className="form-input"
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                  required
                >
                  {meses.map((m) => (
                    <option key={m.v} value={m.v}>
                      {m.n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="anio" className="form-label">Año</label>
                <select
                  id="anio"
                  className="form-input"
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                  required
                >
                  {anios.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
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
              <span className="meta-value">24–48 h hábiles</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Área responsable</span>
              <span className="meta-value">Talento Humano / Nómina</span>
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
        .req-shell{ display:flex; flex-direction:column; gap:16px; font-family: 'Inter', sans-serif; }
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

        .grid-3{
          display:grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap:16px;
        }
        @media (max-width:900px){
          .grid-3{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width:720px){
          .grid-3{ grid-template-columns: 1fr; }
        }

        .form-group{ display:flex; flex-direction:column; gap:8px; }
        .form-label{ font-size:14px; font-weight:700; color:var(--text); }

        .form-input{
          width:100%;
          padding:12px 14px;
          font-size:15px;
          color:var(--text);
          background:#f9fafb;
          border:1px solid var(--border);
          border-radius:12px;
          outline:none;
          transition:.2s;
          appearance:none;
        }
        .form-input:focus{
          background:#fff;
          border-color:var(--primary);
          box-shadow:0 0 0 3px #fee2e2;
        }
        select.form-input{
          background-image:
            linear-gradient(45deg, transparent 50%, #9ca3af 50%),
            linear-gradient(135deg, #9ca3af 50%, transparent 50%);
          background-position: calc(100% - 18px) calc(1em + 2px), calc(100% - 13px) calc(1em + 2px);
          background-size: 5px 5px, 5px 5px;
          background-repeat: no-repeat;
        }

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
        .alert .dot{ width:8px; height:8px; border-radius:50%; display:inline-block; }
        .alert.success{ background:#f0fdf4; color:#166534; border-color:#bbf7d0; }
        .alert.success .dot{ background:#16a34a; }
        .alert.danger{ background:#fef2f2; color:#991b1b; border-color:#fecaca; }
        .alert.danger .dot{ background:#ef4444; }

        .req-footer{ display:flex; align-items:center; justify-content:flex-end; }
        .meta{ display:flex; gap:18px; }
        .meta-item{ display:flex; flex-direction:column; }
        .meta-label{ font-size:12px; color:var(--muted); }
        .meta-value{ font-size:14px; font-weight:700; color:var(--text); }
      `}</style>
    </>
  );
}
