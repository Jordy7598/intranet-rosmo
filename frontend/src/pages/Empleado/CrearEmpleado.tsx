/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CrearEmpleado = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    Nombre: "",
    Apellido: "",
    Correo: "",
    Fecha_Contratacion: "",
    Dias_Vacaciones_Anuales: 0,
    Dias_Vacaciones_Tomados: 0,
    ID_Departamento: 0,
    ID_Puesto: 0,
    ID_Jefe_Inmediato: 0,
    Estado: "Activo"
  });
  const [mensaje, setMensaje] = useState("");
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [puestos, setPuestos] = useState<any[]>([]);
  const [jefes, setJefes] = useState<any[]>([]);
  const token = localStorage.getItem("token");

  // Verificar token y cargar datos
  useEffect(() => {
    if (!token) {
      alert("❌ Error de autenticación. Por favor inicia sesión.");
      navigate("/");
      return;
    }
    const fetchData = async () => {
      try {
        const [depRes, pueRes, jefRes] = await Promise.all([
          api.get("/departamentos", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/puestos", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/empleados", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setDepartamentos(depRes.data);
        setPuestos(pueRes.data);
        setJefes(jefRes.data);
      } catch (err) {
        console.error("Error cargando datos iniciales", err);
      }
    };
    fetchData();
  }, [token, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMensaje("No hay token de autenticación. Por favor inicia sesión.");
      return;
    }
    try {
      await api.post("/empleados", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje("Empleado creado correctamente.");
      setTimeout(() => navigate("/empleados"), 1000);
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status === 403
      ) {
        setMensaje("No autorizado. Por favor verifica tus permisos o vuelve a iniciar sesión.");
        navigate("/");
      } else {
        setMensaje("Error al crear empleado.");
      }
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "30px auto" }}>
      <h2>Crear Empleado</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px" }}>
        Nombre
        <input name="Nombre" placeholder="Nombre" value={form.Nombre} onChange={handleChange} required />
        Apellido
        <input name="Apellido" placeholder="Apellido" value={form.Apellido} onChange={handleChange} required />
        Email
        <input name="Correo" type="email" placeholder="Correo" value={form.Correo} onChange={handleChange} required />
        Fecha de contratación
        <input name="Fecha_Contratacion" type="date" value={form.Fecha_Contratacion} onChange={handleChange} required />
        Vacaciones Anuales
        <input name="Dias_Vacaciones_Anuales" type="number" value={form.Dias_Vacaciones_Anuales} onChange={handleChange} />
        Vacaciones tomadas
        <input name="Dias_Vacaciones_Tomados" type="number" value={form.Dias_Vacaciones_Tomados} onChange={handleChange} />
        
        Departamento
        <select name="ID_Departamento" value={form.ID_Departamento} onChange={handleChange} required>
          <option value="">-- Seleccione --</option>
          {departamentos.map(dep => (
            <option key={dep.ID_Departamento} value={dep.ID_Departamento}>
              {dep.Nombre_Departamento}
            </option>
          ))}
        </select>

        Puesto
        <select name="ID_Puesto" value={form.ID_Puesto} onChange={handleChange} required>
          <option value="">-- Seleccione --</option>
          {puestos.map(p => (
            <option key={p.ID_Puesto} value={p.ID_Puesto}>
              {p.Nombre_Puesto}
            </option>
          ))}
        </select>

        Jefe Inmediato
        <select name="ID_Jefe_Inmediato" value={form.ID_Jefe_Inmediato} onChange={handleChange}>
          <option value="">-- Ninguno --</option>
          {jefes.map(j => (
            <option key={j.ID_Empleado} value={j.ID_Empleado}>
              {j.Nombre} {j.Apellido}
            </option>
          ))}
        </select>

        Estado
        <select name="Estado" value={form.Estado} onChange={handleChange}>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>

        <button type="submit">Guardar</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default CrearEmpleado;
