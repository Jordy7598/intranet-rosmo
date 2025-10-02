/*eslint-disable @typescript-eslint/no-explicit-any*/
import { useEffect, useState } from "react";
import { getListaAlmuerzo } from "../../api/solicitudes.api";

export default function AlmuerzoLista() {
  const [fecha, setFecha] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load(f?: string) {
    setLoading(true); setErr(null);
    try {
      const res = await getListaAlmuerzo(f ? { fecha: f } : undefined);
      setRows(res.data ?? []);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Error al cargar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-3">Lista de Almuerzo</h2>
      <div className="flex items-center gap-2 mb-3">
        <input className="border p-2 rounded" type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
        <button className="btn" onClick={() => load(fecha)}>Filtrar</button>
      </div>
      {loading ? "Cargando…" : err ? <div className="text-red-600">{err}</div> : (
        <div className="overflow-auto">
          <table className="min-w-[600px] w-full border">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 text-left">Nombre</th>
                <th className="p-2 text-left">Departamento</th>
                <th className="p-2 text-left">Hora Registro</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{[r?.Nombre, r?.Apellido].filter(Boolean).join(" ") || r?.Nombre_Usuario}</td>
                  <td className="p-2">{r?.Nombre_Departamento ?? "-"}</td>
                  <td className="p-2">{r?.Hora_Registro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
