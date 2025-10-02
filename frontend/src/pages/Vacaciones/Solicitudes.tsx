import { useEffect, useState } from "react";
import { mis } from "../../api/vacaciones.api";
import type { Vacacion } from "../../api/vacaciones.api";

export default function Solicitudes() {
  const [data, setData] = useState<Vacacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await mis();
        setData(res.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e:any) {
        setErr(e?.response?.data?.message || "Error cargando solicitudes");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (err) return <p style={{color:"crimson"}}>{err}</p>;

  return (
    <div className="card">
      <h2>Mis Solicitudes de Vacaciones</h2>
      <table className="tbl">
        <thead>
          <tr>
            <th>ID</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Días</th>
            <th>Estado</th>
            <th>Creada</th>
          </tr>
        </thead>
        <tbody>
          {data.map(v => (
            <tr key={v.ID_vacacion}>
              <td>{v.ID_vacacion}</td>
              <td>{v.Fecha_Inicio_Format || v.Fecha_Inicio?.slice(0,10)}</td>
              <td>{v.Fecha_Fin_Format || v.Fecha_Fin?.slice(0,10)}</td>
              <td>{v.Dias_Solicitados}</td>
              <td><span className={`badge ${v.Estado.toLowerCase()}`}>{v.Estado}</span></td>
              <td>{v.Fecha_Solicitud_Format || new Date(v.Fecha_Solicitud).toLocaleString()}</td>
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
h2{margin-bottom:12px}
.tbl{width:100%;border-collapse:collapse}
.tbl th,.tbl td{padding:10px;border-bottom:1px solid #eee}
.badge{padding:4px 8px;border-radius:6px;font-size:12px}
.badge.pendiente{background:#fff3cd;color:#7a5d00}
.badge.aprobado{background:#d1e7dd;color:#0f5132}
.badge.rechazado{background:#f8d7da;color:#842029}
.badge.pendienterh{background:#e7f1ff;color:#0b5ed7}
`;
