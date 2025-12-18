import { useState, useEffect } from "react";
import { obtenerReporte, type ReporteVacacion } from "../../api/vacaciones.api";
import "../../styles/Dashboard.css";

export default function ReporteVacaciones() {
  const [datos, setDatos] = useState<ReporteVacacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Función para formatear tiempo laborado
  const formatearTiempoLaborado = (anios: number, meses: number) => {
    if (anios === 0) {
      return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    }
    if (meses === 0) {
      return `${anios} ${anios === 1 ? 'año' : 'años'}`;
    }
    return `${anios} ${anios === 1 ? 'año' : 'años'} ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  };
  
  // Filtros
  const [departamentoFiltro, setDepartamentoFiltro] = useState("");
  const [departamentos, setDepartamentos] = useState<string[]>([]);

  useEffect(() => {
    cargarReporte();
  }, []);

  const cargarReporte = async () => {
    try {
      setCargando(true);
      setError("");
      const res = await obtenerReporte();
      setDatos(res.data);
      
      // Extraer departamentos únicos para el filtro
      const deptosUnicos = Array.from(
        new Set(res.data.map((d) => d.Nombre_Departamento).filter(Boolean))
      ).sort();
      setDepartamentos(deptosUnicos as string[]);
    } catch (err) {
      console.error(err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any).response?.data?.message || "Error al cargar el reporte");
    } finally {
      setCargando(false);
    }
  };

  const datosFiltrados = datos.filter((d) => {
    if (departamentoFiltro && d.Nombre_Departamento !== departamentoFiltro) {
      return false;
    }
    return true;
  });

  const exportarCSV = () => {
    const encabezados = [
      "Nombre",
      "Departamento",
      "Puesto",
      "Fecha Contratación",
      "Tiempo Laborado",
      "Días Anuales",
      "Días Acumulados",
      "Días Tomados",
      "Días Pendientes",
      "Días Disponibles"
    ];

    const filas = datosFiltrados.map((d) => [
      d.Nombre_Completo,
      d.Nombre_Departamento || "",
      d.Nombre_Puesto || "",
      new Date(d.Fecha_Contratacion).toLocaleDateString(),
      formatearTiempoLaborado(d.Anios_Laborados, d.Meses_Laborados),
      d.Dias_Anuales,
      d.Dias_Acumulados_Proporcional || 0,
      d.Dias_Tomados,
      d.Dias_Pendientes,
      d.Dias_Disponibles
    ]);

    const csv = [
      encabezados.join(","),
      ...filas.map((fila) => fila.join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte_vacaciones_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportarExcel = () => {
    // Generar HTML tabla para Excel
    const tabla = `
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Departamento</th>
            <th>Puesto</th>
            <th>Fecha Contratación</th>
            <th>Tiempo Laborado</th>
            <th>Días Anuales</th>
            <th>Días Acumulados</th>
            <th>Días Tomados</th>
            <th>Días Pendientes</th>
            <th>Días Disponibles</th>
          </tr>
        </thead>
        <tbody>
          ${datosFiltrados
            .map(
              (d) => `
            <tr>
              <td>${d.Nombre_Completo}</td>
              <td>${d.Nombre_Departamento || ""}</td>
              <td>${d.Nombre_Puesto || ""}</td>
              <td>${new Date(d.Fecha_Contratacion).toLocaleDateString()}</td>
              <td>${formatearTiempoLaborado(d.Anios_Laborados, d.Meses_Laborados)}</td>
              <td>${d.Dias_Anuales}</td>
              <td>${d.Dias_Acumulados_Proporcional || 0}</td>
              <td>${d.Dias_Tomados}</td>
              <td>${d.Dias_Pendientes}</td>
              <td>${d.Dias_Disponibles}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;

    const blob = new Blob([tabla], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte_vacaciones_${new Date().toISOString().split("T")[0]}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (cargando) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Reporte de Vacaciones</h1>
        </div>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Cargando reporte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Reporte de Vacaciones</h1>
      </div>

      {error && (
        <div style={{ 
          padding: "1rem", 
          backgroundColor: "#fee", 
          border: "1px solid #c00",
          borderRadius: "4px",
          marginBottom: "1rem"
        }}>
          {error}
        </div>
      )}

      {/* Filtros y acciones */}
      <div style={{ 
        display: "flex", 
        gap: "1rem", 
        marginBottom: "1rem",
        flexWrap: "wrap",
        alignItems: "center"
      }}>
        <div style={{ flex: "1", minWidth: "200px" }}>
          <label htmlFor="departamento-filtro" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
            Filtrar por Departamento:
          </label>
          <select
            id="departamento-filtro"
            value={departamentoFiltro}
            onChange={(e) => setDepartamentoFiltro(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ddd",
              borderRadius: "4px"
            }}
          >
            <option value="">Todos los departamentos</option>
            {departamentos.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
          <button
            onClick={exportarCSV}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: 500
            }}
          >
            📄 Exportar CSV
          </button>
          <button
            onClick={exportarExcel}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: 500
            }}
          >
            📊 Exportar Excel
          </button>
          <button
            onClick={cargarReporte}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: 500
            }}
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "1.5rem"
      }}>
        <div style={{
          padding: "1rem",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "1px solid #dee2e6"
        }}>
          <div style={{ fontSize: "0.875rem", color: "#6c757d", marginBottom: "0.25rem" }}>
            Total Empleados
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#212529" }}>
            {datosFiltrados.length}
          </div>
        </div>
        
        <div style={{
          padding: "1rem",
          backgroundColor: "#e7f3ff",
          borderRadius: "8px",
          border: "1px solid #b3d9ff"
        }}>
          <div style={{ fontSize: "0.875rem", color: "#004085", marginBottom: "0.25rem" }}>
            Total Días Disponibles
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#004085" }}>
            {datosFiltrados.reduce((sum, d) => sum + Number(d.Dias_Disponibles), 0).toLocaleString('es-ES')}
          </div>
        </div>
        
        <div style={{
          padding: "1rem",
          backgroundColor: "#fff3cd",
          borderRadius: "8px",
          border: "1px solid #ffc107"
        }}>
          <div style={{ fontSize: "0.875rem", color: "#856404", marginBottom: "0.25rem" }}>
            Total Días Pendientes
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#856404" }}>
            {datosFiltrados.reduce((sum, d) => sum + Number(d.Dias_Pendientes), 0).toLocaleString('es-ES')}
          </div>
        </div>
        
        <div style={{
          padding: "1rem",
          backgroundColor: "#d4edda",
          borderRadius: "8px",
          border: "1px solid #c3e6cb"
        }}>
          <div style={{ fontSize: "0.875rem", color: "#155724", marginBottom: "0.25rem" }}>
            Total Días Tomados
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#155724" }}>
            {datosFiltrados.reduce((sum, d) => sum + Number(d.Dias_Tomados), 0).toLocaleString('es-ES')}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "white",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Departamento</th>
              <th style={thStyle}>Puesto</th>
              <th style={thStyle}>Fecha Contratación</th>
              <th style={thStyle}>Tiempo Laborado</th>
              <th style={thStyle}>Días Anuales</th>
              <th style={thStyle}>Acumulados</th>
              <th style={thStyle}>Tomados</th>
              <th style={thStyle}>Pendientes</th>
              <th style={thStyle}>Disponibles</th>
            </tr>
          </thead>
          <tbody>
            {datosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ padding: "2rem", textAlign: "center", color: "#6c757d" }}>
                  No hay datos para mostrar
                </td>
              </tr>
            ) : (
              datosFiltrados.map((d) => (
                <tr 
                  key={d.ID_Empleado}
                  style={{
                    borderBottom: "1px solid #dee2e6",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={tdStyle}>{d.Nombre_Completo}</td>
                  <td style={tdStyle}>{d.Nombre_Departamento || "-"}</td>
                  <td style={tdStyle}>{d.Nombre_Puesto || "-"}</td>
                  <td style={tdStyle}>
                    {new Date(d.Fecha_Contratacion).toLocaleDateString("es-ES")}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 500 }}>
                    {formatearTiempoLaborado(d.Anios_Laborados, d.Meses_Laborados)}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 500 }}>
                    {d.Dias_Anuales}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#007bff" }}>
                    {d.Dias_Acumulados_Proporcional || 0}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#28a745" }}>
                    {d.Dias_Tomados}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#ffc107" }}>
                    {d.Dias_Pendientes}
                  </td>
                  <td style={{ 
                    ...tdStyle, 
                    textAlign: "center", 
                    fontWeight: "bold",
                    color: d.Dias_Disponibles < 5 ? "#dc3545" : "#007bff"
                  }}>
                    {d.Dias_Disponibles}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Estilos reutilizables
const thStyle: React.CSSProperties = {
  padding: "0.75rem",
  textAlign: "left",
  fontWeight: 600,
  fontSize: "0.875rem",
  color: "#495057",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const tdStyle: React.CSSProperties = {
  padding: "0.75rem",
  fontSize: "0.875rem",
  color: "#212529"
};
