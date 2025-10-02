import { useState } from "react";
import { postCarta } from "../../api/solicitudes.api";

export default function CrearCarta() {
  const [motivo, setMotivo] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null); setErr(null);
    try {
      const res = await postCarta({ motivo });
      setMsg(res.message ?? "Solicitud creada");
      setMotivo("");
      /*eslint-disable-next-line @typescript-eslint/no-explicit-any */
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Error al crear");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-lg">
      <h2 className="text-lg font-semibold mb-3">Solicitud de Carta de Ingresos</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <textarea className="w-full border p-2 rounded" placeholder="Motivo (opcional)"
          value={motivo} onChange={e => setMotivo(e.target.value)} />
        <button className="btn" disabled={loading}>{loading ? "Creando..." : "Crear"}</button>
      </form>
      {msg && <div className="mt-3 text-green-600">{msg}</div>}
      {err && <div className="mt-3 text-red-600">{err}</div>}
    </div>
  );
}
