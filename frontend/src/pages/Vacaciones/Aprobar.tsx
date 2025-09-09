/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { rango, aprobar, rechazar } from "./vacaciones.api";
import type { Vacacion } from "./vacaciones.api";

export default function AprobarVacaciones() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [data, setData] = useState<Vacacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const rol = useMemo(() => Number(localStorage.getItem("usuario_rol") || 0), []);
  const puede = [1,2,3].includes(rol); // Admin=1, Talento Humano=2, Jefe=3 (ajusta si tus IDs difieren)

  const buscar = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await rango(desde || undefined, hasta || undefined);
      const orden = (res.data || []).sort((a, b) => {
      const rank = (s: string) => s === "Pendiente" ? 0 : s === "PendienteRH" ? 1 : 2;
      return rank(a.Estado) - rank(b.Estado);
});

      setData(orden);
    } catch (e:any) {
      setMsg(e?.response?.data?.message || "Error al buscar");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { buscar(); /* carga inicial */ }, []);
  if (!puede) return <p style={{color:"crimson"}}>No tienes permisos para aprobar/rechazar vacaciones.</p>;
  const onAprobar = async (id:number) => {
    if (!confirm("¿Aprobar esta solicitud?")) return;
    try {
      await aprobar(id, "Aprobado desde panel");
      await buscar();
    } catch (e:any) {
      alert(e?.response?.data?.message || "No se pudo aprobar");
    }
  };

  const onRechazar = async (id:number) => {
    const motivo = prompt("Motivo de rechazo:");
    if (motivo === null) return;
    try {
      await rechazar(id, motivo || "Rechazado desde panel");
      await buscar();
    } catch (e:any) {
      alert(e?.response?.data?.message || "No se pudo rechazar");
    }
  };

  return (
    <div className="card">
      <h2>Aprobar / Rechazar Vacaciones</h2>

      <div className="filters">
        <div>
          <label>Desde</label>
          <input type="date" value={desde} onChange={e=>setDesde(e.target.value)} />
        </div>
        <div>
          <label>Hasta</label>
          <input type="date" value={hasta} onChange={e=>setHasta(e.target.value)} />
        </div>
        <button className="btn" onClick={buscar} disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {msg && <p className="msg">{msg}</p>}

      <table className="tbl">
        <thead>
          <tr>
            <th>ID</th>
            <th>Empleado</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Días</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map(v => (
            <tr key={v.ID_vacacion}>
              <td>{v.ID_vacacion}</td>
              <td>{v.Nombre} {v.Apellido}</td>
              <td>{(v.Fecha_Inicio || "").slice(0,10)}</td>
              <td>{(v.Fecha_Fin || "").slice(0,10)}</td>
              <td>{v.Dias_Solicitados}</td>
              <td><span className={`badge ${v.Estado.toLowerCase()}`}>{v.Estado}</span></td>
              <td>
                  {v.Estado === "Pendiente" && rol === 3 ? (
                    <div className="act">
                      <button className="btn ok" onClick={() => onAprobar(v.ID_vacacion)}>Aprobar Jefe</button>
                      <button className="btn cancel" onClick={() => onRechazar(v.ID_vacacion)}>Rechazar</button>
                    </div>
                  ) : v.Estado === "PendienteRH" && (rol === 2 || rol === 1) ? (
                    <div className="act">
                      <button className="btn ok" onClick={() => onAprobar(v.ID_vacacion)}>Aprobar RH</button>
                      <button className="btn cancel" onClick={() => onRechazar(v.ID_vacacion)}>Rechazar</button>
                    </div>
                  ) : (
                    <em>Sin acciones</em>
                  )}
               </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
.card{background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,.07)}
.filters{display:flex;gap:12px;align-items:end;margin:12px 0 20px}
.filters label{display:block;font-size:12px;color:#666}
input{border:1px solid #ddd;padding:8px;border-radius:8px}
.btn{background:#cc0000;color:#fff;border:none;border-radius:8px;padding:8px 12px;cursor:pointer}
.tbl{width:100%;border-collapse:collapse}
.tbl th,.tbl td{border-bottom:1px solid #eee;padding:10px;text-align:left}
.badge{padding:4px 8px;border-radius:6px;font-size:12px}
.badge.pendiente{background:#fff3cd;color:#7a5d00}
.badge.aprobado{background:#d1e7dd;color:#0f5132}
.badge.rechazado{background:#f8d7da;color:#842029}
.act{display:flex;gap:8px}
.btn.ok{background:#0f5132}
.btn.cancel{background:#842029}
.msg{color:#555;margin-bottom:10px}
.badge.pendienterh{background:#e7f1ff;color:#0b5ed7}
`;
