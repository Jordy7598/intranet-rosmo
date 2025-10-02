
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { aprobarSolicitud, getSolicitudById, rechazarSolicitud, type Solicitud } from "../../api/solicitudes.api";

export default function DetalleSolicitud() {
  const { id } = useParams();
  const sid = Number(id);
  const [item, setItem] = useState<Solicitud | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");



  async function load() {
    setLoading(true); setErr(null);
    try {
      const res = await getSolicitudById(sid);
      setItem(res.data);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Error al cargar");
    } finally {
      setLoading(false);
    }
  }

  const memoizedLoad = useCallback(load, [sid]);

  useEffect(() => { 
    if (sid) memoizedLoad(); 
  }, [sid, memoizedLoad]);

  async function onAprobar() {
    try { await aprobarSolicitud(sid); await memoizedLoad(); } catch (e: any) { alert(e?.response?.data?.message ?? "Error"); }
  }
  async function onRechazar() {
    try { await rechazarSolicitud(sid, { motivo: motivoRechazo }); setMotivoRechazo(""); await memoizedLoad(); } catch (e: any) { alert(e?.response?.data?.message ?? "Error"); }
  }

 /* async function onAprobar() {
    try { await aprobarSolicitud(sid); await load(); } catch (e: any) { alert(e?.response?.data?.message ?? "Error"); }
  }
  async function onRechazar() {
    try { await rechazarSolicitud(sid, { motivo: motivoRechazo }); setMotivoRechazo(""); await load(); } catch (e: any) { alert(e?.response?.data?.message ?? "Error"); }
  }*/

  if (loading) return <div className="p-4">Cargando…</div>;
  if (err) return <div className="p-4 text-red-600">{err}</div>;
  if (!item) return <div className="p-4">No encontrado</div>;

  const puedeAprobar = ["Pendiente", "PendienteRH"].includes(item.Estado) && ["SALIDA", "CARTA"].includes(item.Tipo);

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-semibold">Detalle de Solicitud #{item.ID_Solicitud}</h2>
      <div className="border rounded p-3">
        <div><b>Tipo:</b> {item.Tipo}</div>
        <div><b>Estado:</b> {item.Estado}</div>
        <div><b>Creada:</b> {new Date(item.Fecha_Creacion).toLocaleString()}</div>
        {item.Motivo && <div><b>Motivo:</b> {item.Motivo}</div>}
        {item.Fecha_Inicio && <div><b>Inicio:</b> {new Date(item.Fecha_Inicio).toLocaleString()}</div>}
        {item.Fecha_Fin && <div><b>Fin:</b> {new Date(item.Fecha_Fin).toLocaleString()}</div>}
        {item.Tipo === "BOLETA" && item.Quincena && (
          <div><b>Periodo:</b> Q{item.Quincena}/{item.Mes}/{item.Anio}</div>
        )}
      </div>

      {puedeAprobar && (
        <div className="border rounded p-3 space-y-2">
          <button className="btn" onClick={onAprobar}>Aprobar</button>
          <div className="flex gap-2">
            <input className="border p-2 flex-1 rounded" placeholder="Motivo (rechazo)" value={motivoRechazo} onChange={e => setMotivoRechazo(e.target.value)} />
            <button className="btn-outline" onClick={onRechazar}>Rechazar</button>
          </div>
          <p className="text-xs text-gray-500">
            * El backend valida el rol según estado (Jefe en Pendiente, TH en PendienteRH).
          </p>
        </div>
      )}
    </div>
  );
}
