import { useEffect, useState } from "react";
import { mis } from "../../api/vacaciones.api";
import type { Vacacion } from "../../api/vacaciones.api";

export default function Historial() {
  const [data, setData] = useState<Vacacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await mis();
      setData((res.data || []).filter(v => v.Estado === "Aprobado"));
      setLoading(false);
    })();
  }, []);

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="card">
      <h2>Historial de vacaciones aprobadas</h2>
      {data.length === 0 ? (
        <p>No hay registros aprobados.</p>
      ) : (
        <ul className="list">
          {data.map(v => (
            <li key={v.ID_vacacion}>
              <strong>{v.Fecha_Inicio.slice(0,10)} → {v.Fecha_Fin.slice(0,10)}</strong>
              <span> · {v.Dias_Solicitados} días</span>
              {v.Motivo ? <em> · {v.Motivo}</em> : null}
            </li>
          ))}
        </ul>
      )}
      <style>{styles}</style>
    </div>
  );
}

const styles = `
.card{background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,.07)}
.list{list-style:none;padding:0;margin:12px 0}
.list li{padding:10px 0;border-bottom:1px solid #eee}
`;
