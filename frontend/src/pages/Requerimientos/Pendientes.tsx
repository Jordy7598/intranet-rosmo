/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  getPendientes,
  aprobarSolicitud,
  rechazarSolicitud,
  type Solicitud,
} from "../../api/solicitudes.api";
import { Link } from "react-router-dom";

type Estado = "Pendiente" | "PendienteRH" | "APROBADA" | "RECHAZADA" | "ENTREGADA";

export default function Pendientes() {
  const [data, setData] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Roles: 1=Admin, 2=TH, 3=Jefe (4 Empleado, 5 Lector)
  const rol = useMemo(() => Number(localStorage.getItem("usuario_rol") || 0), []);
  const puede = [1, 2, 3].includes(rol); // igual que en Aprobar Vacaciones

  const rankEstado = (s: Estado) =>
    s === "Pendiente" ? 0 :
    s === "PendienteRH" ? 1 :
    s === "APROBADA" ? 2 :
    s === "ENTREGADA" ? 3 : 4;

  

  const cargar = useCallback(async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await getPendientes();
      const orden = (res.data || []).sort((a: Solicitud, b: Solicitud) =>
        rankEstado(a.Estado as Estado) - rankEstado(b.Estado as Estado)
      );
      setData(orden);
    } catch (e: any) {
      setMsg(e?.response?.data?.message || "Error al cargar pendientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  if (!puede) {
    return <p style={{ color: "crimson", padding: 16 }}>
      No tienes permisos para ver/gestionar pendientes.
    </p>;
  }

  const onAprobar = async (id: number) => {
    if (!confirm("¿Aprobar esta solicitud?")) return;
    try {
      await aprobarSolicitud(id);
      await cargar();
    } catch (e: any) {
      alert(e?.response?.data?.message || "No se pudo aprobar");
    }
  };

  const onRechazar = async (id: number) => {
    const motivo = prompt("Motivo de rechazo:");
    if (motivo === null) return;
    try {
      await rechazarSolicitud(id, { motivo: motivo || "Rechazado desde panel" });
      await cargar();
    } catch (e: any) {
      alert(e?.response?.data?.message || "No se pudo rechazar");
    }
  };

  return (
    <div className="card" style={{ padding: 24 }}>
      <h2 className="text-lg font-semibold mb-3">Pendientes (según tu rol)</h2>

      <div style={{ marginBottom: 12 }}>
        <button className="btn" onClick={cargar} disabled={loading}>
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {msg && <p style={{ color: "#555", marginBottom: 10 }}>{msg}</p>}

      <div className="overflow-auto">
        <table className="table" style={{ minWidth: 820 }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Creada</th>
              <th>Motivo / Detalle</th>
              <th>Acciones</th>
              <th>Ver</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={7}>No hay pendientes</td></tr>
            ) : data.map((s) => {
              const puedeJefe = s.Estado === "Pendiente" && rol === 3;
              const puedeRH   = s.Estado === "PendienteRH" && (rol === 2 || rol === 1);

              return (
                <tr key={s.ID_Solicitud}>
                  <td>{s.ID_Solicitud}</td>
                  <td>{s.Tipo}</td>
                  <td><EstadoBadge estado={s.Estado} /></td>
                  <td>{new Date(s.Fecha_Creacion).toLocaleString()}</td>
                  <td style={{ maxWidth: 280 }}>
                    {s.Motivo || s.Detalle || "-"}
                  </td>
                  <td>
                    {(puedeJefe || puedeRH) ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn" onClick={() => onAprobar(s.ID_Solicitud)}>Aprobar</button>
                        <button className="btn-outline" onClick={() => onRechazar(s.ID_Solicitud)}>Rechazar</button>
                      </div>
                    ) : <em>Sin acciones</em>}
                  </td>
                  <td>
                    {/* LINK CORREGIDO a tu App: /requerimientos/detalle/:id */}
                    <Link to={`/requerimientos/detalle/${s.ID_Solicitud}`} className="btn-outline">Detalle</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style>{cssLocal}</style>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const cls =
    estado === "APROBADA" ? "badge badge-ok" :
    estado === "RECHAZADA" ? "badge badge-err" :
    estado === "PendienteRH" ? "badge badge-rh" :
    estado === "ENTREGADA" ? "badge badge-info" : "badge badge-pend";
  return <span className={cls}>{estado}</span>;
}

const cssLocal = `
.badge{display:inline-block;padding:.15rem .5rem;border-radius:999px;font-size:.75rem;font-weight:600}
.badge-pend{background:#f3f4f6;color:#374151}
.badge-rh{background:#fff7ed;color:#b45309}
.badge-ok{background:#ecfdf5;color:#065f46}
.badge-err{background:#fef2f2;color:#991b1b}
.badge-info{background:#eff6ff;color:#1d4ed8}
.btn{appearance:none;border:1px solid transparent;background:#cc0000;color:#fff;padding:.5rem .75rem;border-radius:10px;font-weight:600;cursor:pointer}
.btn-outline{background:#fff;border:1px solid #e5e7eb;color:#111827;padding:.5rem .75rem;border-radius:10px;font-weight:600;cursor:pointer}
.table{width:100%;border-collapse:collapse}
.table th,.table td{border-bottom:1px solid #e5e7eb;padding:.6rem;text-align:left}
.table thead th{background:#f9fafb}
`;
