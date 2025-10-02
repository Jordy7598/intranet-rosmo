/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { getMisSolicitudes, type Solicitud } from "../../api/solicitudes.api";
import { Link } from "react-router-dom";

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

  if (loading) return <div className="p-4">Cargando…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-3">Mis solicitudes</h2>
      <div className="space-y-2">
        {rows.map(s => (
          <Link key={s.ID_Solicitud} to={`/centro/solicitud/${s.ID_Solicitud}`} className="block border p-3 rounded">
            <div className="font-medium">{s.Tipo} · <EstadoBadge estado={s.Estado} /></div>
            <div className="text-sm text-gray-600">Creada: {new Date(s.Fecha_Creacion).toLocaleString()}</div>
            {s.Motivo && <div className="text-sm">Motivo: {s.Motivo}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const cls =
    estado === "APROBADA" ? "bg-green-100 text-green-700" :
    estado === "RECHAZADA" ? "bg-red-100 text-red-700" :
    estado === "PendienteRH" ? "bg-amber-100 text-amber-700" :
    estado === "ENTREGADA" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700";
  return <span className={`px-2 py-0.5 rounded text-xs ${cls}`}>{estado}</span>;
}
