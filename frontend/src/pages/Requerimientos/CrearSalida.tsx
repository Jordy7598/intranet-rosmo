import { useState } from "react";
import { postSalida } from "../../api/solicitudes.api";

export default function CrearSalida() {
  const [motivo, setMotivo] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null); setErr(null);
    try {
      if (!inicio || !fin) throw new Error("Selecciona fechas");
      const res = await postSalida({ motivo, fecha_inicio: inicio, fecha_fin: fin });
      setMsg(res.message ?? "Solicitud creada");
      setMotivo(""); setInicio(""); setFin("");
      /*eslint-disable-next-line @typescript-eslint/no-explicit-any */
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? e?.message ?? "Error al crear");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-lg">
      <h2 className="text-lg font-semibold mb-3">Salida Anticipada</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Motivo" value={motivo} onChange={e => setMotivo(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <input className="border p-2 rounded" type="datetime-local" value={inicio} onChange={e => setInicio(e.target.value)} />
          <input className="border p-2 rounded" type="datetime-local" value={fin} onChange={e => setFin(e.target.value)} />
        </div>
        <button className="btn" disabled={loading}>{loading ? "Creando..." : "Crear"}</button>
      </form>
      {msg && <div className="mt-3 text-green-600">{msg}</div>}
      {err && <div className="mt-3 text-red-600">{err}</div>}
    </div>
  );
}
