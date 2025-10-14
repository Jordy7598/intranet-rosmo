import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

type Emp = {
  id: number;
  nombre: string;
  apellido: string;
  correo?: string;
  telefono?: string;
  puesto?: string;
  area?: string;
  foto?: string;
  fechaNacimiento?: string;
  fechaContratacion?: string;
  edad?: number;
  aniosEmpresa?: number;
};

export default function DirectorioDetalle() {
  const { id } = useParams<{ id: string }>();
  const [emp, setEmp] = useState<Emp | null>(null);

  useEffect(() => {
    api.get(`/directorio/${id}`).then(({ data }) => setEmp(data)).catch(() => {});
  }, [id]);

  if (!emp) return <div>Cargando…</div>;
  const nombreCompleto = `${emp.nombre} ${emp.apellido}`;

  return (
    <div className="card-detalle">
      <div className="top">
        <img
          className="big-avatar"
          src={emp.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&background=cc0000&color=fff&size=128`}
          alt={nombreCompleto}
        />
        <div className="info">
          <h2>{nombreCompleto}</h2>
          <div className="muted">
            {emp.puesto && <span>{emp.puesto}</span>}
            {emp.area && <span> • {emp.area}</span>}
          </div>
          <div className="meta">
            {emp.correo && <div>✉️ {emp.correo}</div>}
            {emp.telefono && <div>📞 {emp.telefono}</div>}
            {emp.edad != null && <div>🎂 {emp.edad} años</div>}
            {emp.aniosEmpresa != null && <div>⭐ {emp.aniosEmpresa} año(s) en la empresa</div>}
          </div>
        </div>
      </div>

      <div className="actions">
        <Link to="/directorio" className="btn">← Volver al directorio</Link>
      </div>

      <style>{`
        .card-detalle { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px; }
        .top { display: flex; gap: 16px; align-items: center; }
        .big-avatar { width: 96px; height: 96px; border-radius: 9999px; object-fit: cover; border: 1px solid #e5e7eb; }
        .info h2 { margin: 0 0 6px; }
        .muted { color: #6b7280; margin-bottom: 6px; }
        .meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 12px; font-size: 14px; }
        .actions { margin-top: 16px; }
        .btn { display: inline-block; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; text-decoration: none; }
      `}</style>
    </div>
  );
}
