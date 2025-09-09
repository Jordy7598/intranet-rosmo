import { useState } from "react";
import { crear } from "./vacaciones.api";
import { useNavigate } from "react-router-dom";

export default function CrearVacacion() {
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inicio || !fin) { setErr("Debes indicar fecha inicio y fin"); return; }
    setErr(null);
    setLoading(true);
    try {
      await crear({ fechaInicio: inicio, fechaFin: fin, motivo: motivo || undefined });
      navigate("/vacaciones/solicitudes");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e:any) {
      setErr(e?.response?.data?.message || "Error al crear la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Crear solicitud de vacaciones</h2>
      <form onSubmit={onSubmit} className="form">
        <div className="row">
          <label>Fecha inicio</label>
          <input type="date" value={inicio} onChange={e=>setInicio(e.target.value)} />
        </div>
        <div className="row">
          <label>Fecha fin</label>
          <input type="date" value={fin} onChange={e=>setFin(e.target.value)} />
        </div>
        <div className="row">
          <label>Motivo (opcional)</label>
          <textarea value={motivo} onChange={e=>setMotivo(e.target.value)} rows={3} />
        </div>
        {err && <p className="err">{err}</p>}
        <button disabled={loading} className="btn">
          {loading ? "Guardando..." : "Crear"}
        </button>
      </form>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
.card{background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,.07);max-width:560px}
.form{display:flex;flex-direction:column;gap:14px}
.row{display:flex;flex-direction:column;gap:6px}
input,textarea{border:1px solid #ddd;padding:10px;border-radius:8px}
.btn{background:#cc0000;color:#fff;border:none;border-radius:8px;padding:10px 16px;cursor:pointer}
.btn:disabled{opacity:.6}
.err{color:crimson}
`;
