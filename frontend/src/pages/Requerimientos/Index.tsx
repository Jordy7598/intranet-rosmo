import { useNavigate } from "react-router-dom";

export default function CentroIndex() {
  const nav = useNavigate();
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Centro de Requerimientos</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <button className="btn" onClick={() => nav("/centro/crear/carta")}>Carta de Ingresos</button>
        <button className="btn" onClick={() => nav("/centro/crear/boleta")}>Boleta de Pago</button>
        <button className="btn" onClick={() => nav("/centro/crear/salida")}>Salida Anticipada</button>
        <button className="btn" onClick={() => nav("/centro/mis-solicitudes")}>Mis Solicitudes</button>
        <button className="btn" onClick={() => nav("/centro/pendientes")}>Pendientes</button>
        <button className="btn" onClick={() => nav("/centro/almuerzo/lista")}>Lista de Almuerzo (hoy)</button>
      </div>
    </div>
  );
}
