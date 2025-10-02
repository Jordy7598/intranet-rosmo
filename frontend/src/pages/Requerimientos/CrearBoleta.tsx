
/*eslint-disable @typescript-eslint/no-explicit-any*/

import { useState } from "react";
import { getBoleta, postBoleta } from "../../api/solicitudes.api";

export default function CrearBoleta() {
  const [quincena, setQuincena] = useState<1 | 2>(1);
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [anio, setAnio] = useState<number>(new Date().getFullYear());
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [boleta, setBoleta] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null); setErr(null); setBoleta(null);
    try {
      const res = await postBoleta({ quincena, mes, anio });
      setMsg(res.message ?? "Solicitud registrada");
      const b = await getBoleta({ quincena, mes, anio });
      setBoleta(b.data);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-lg">
      <h2 className="text-lg font-semibold mb-3">Boleta de Pago</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <select className="border p-2 rounded" value={quincena} onChange={e => setQuincena(Number(e.target.value) as 1|2)}>
            <option value={1}>Quincena 1</option>
            <option value={2}>Quincena 2</option>
          </select>
          <input className="border p-2 rounded" type="number" min={1} max={12} value={mes} onChange={e => setMes(Number(e.target.value))} />
          <input className="border p-2 rounded" type="number" min={2000} max={2100} value={anio} onChange={e => setAnio(Number(e.target.value))} />
        </div>
        <button className="btn" disabled={loading}>{loading ? "Procesando..." : "Solicitar y Consultar"}</button>
      </form>

      {msg && <div className="mt-3 text-green-600">{msg}</div>}
      {err && <div className="mt-3 text-red-600">{err}</div>}
      {boleta && (
        <pre className="mt-4 border rounded p-3 bg-gray-50 overflow-auto">{JSON.stringify(boleta, null, 2)}</pre>
      )}
    </div>
  );
}
