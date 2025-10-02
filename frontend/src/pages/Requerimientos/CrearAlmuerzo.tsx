import { useState } from "react";
import { postAlmuerzo } from "../../api/solicitudes.api";

export default function CrearAlmuerzo() {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); 
    setMsg(null); 
    setErr(null);
    
    try {
      const res = await postAlmuerzo();
      setMsg(res.message ?? "Salida de almuerzo registrada correctamente");
      
      // Opcional: Redirigir después de unos segundos
      setTimeout(() => {
        setMsg(null);
      }, 3000);
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const errorMsg = e?.response?.data?.message;
      
      // Manejar el caso específico de almuerzo duplicado
      if (e?.response?.status === 409) {
        setErr(errorMsg ?? "Ya registraste tu salida de almuerzo hoy");
      } else {
        setErr(errorMsg ?? "Error al registrar salida de almuerzo");
      }
    } finally {
      setLoading(false);
    }
  }

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('es-GT', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('es-GT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-4 max-w-lg">
      <h2 className="text-lg font-semibold mb-3">Registrar Salida de Almuerzo</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center mb-2">
          <span className="text-blue-600 mr-2">📅</span>
          <span className="text-sm text-blue-800">{getCurrentDate()}</span>
        </div>
        <div className="flex items-center">
          <span className="text-blue-600 mr-2">🕒</span>
          <span className="text-sm text-blue-800">Hora actual: {getCurrentTime()}</span>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <span className="text-yellow-600 mr-2 mt-0.5">⚠️</span>
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Importante:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Solo puedes registrar una salida de almuerzo por día</li>
              <li>El Horario de almuerzo es de 1 a 2 PM</li>
              <li>Este registro es para control interno de la empresa</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="bg-gray-50 border rounded-lg p-4">
          <h3 className="font-medium text-gray-700 mb-2">¿Confirmas tu salida de almuerzo?</h3>
          <p className="text-sm text-gray-600">
            Al hacer clic en "Registrar", se guardará tu salida de almuerzo para el día de hoy.
          </p>
        </div>

        <button 
          type="submit"
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registrando...
            </span>
          ) : (
            "🍽️ Registrar Salida de Almuerzo"
          )}
        </button>
      </form>

      {/* Mensajes de estado */}
      {msg && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span className="text-green-800">{msg}</span>
          </div>
        </div>
      )}
      
      {err && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">❌</span>
            <span className="text-red-800">{err}</span>
          </div>
        </div>
      )}
    </div>
  );
}