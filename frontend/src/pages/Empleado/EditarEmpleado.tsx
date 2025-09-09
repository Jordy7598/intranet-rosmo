/*eslint-disable @typescript-eslint/no-explicit-any*/
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const EditarEmpleado = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

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

  useEffect(() => {
    if (!token) {
      alert("❌ Sesión expirada. Inicia sesión nuevamente.");
      navigate("/");
      return;
    }

    const fetchEmpleado = async () => {
      try {
        const res = await api.get(`/empleados/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForm(res.data);
      } catch (error) {
        console.error("Error al obtener empleado:", error);
        setMensaje("Error al cargar datos del empleado.");
      }
try {
        const [depRes, pueRes, jefRes] = await Promise.all([
          api.get("/departamentos", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/puestos", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/usuarios/extras/jefes", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setDepartamentos(depRes.data);
        setPuestos(pueRes.data);
        setJefes(jefRes.data);
      } catch (err) {
        console.error("Error cargando datos iniciales", err);
      }

    };

    fetchEmpleado();
  }, [id, token, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/empleados/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje("✅ Empleado actualizado correctamente.");
      setTimeout(() => navigate("/empleados"), 1000);
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      setMensaje("❌ Error al actualizar empleado.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "30px auto" }}>
      <h2>Editar Empleado</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px" }}>
        Nombre
        <input name="Nombre" value={form.Nombre} onChange={handleChange} required />
        Apellido
        <input name="Apellido" value={form.Apellido} onChange={handleChange} required />
        Email
        <input name="Correo" type="email" value={form.Correo} onChange={handleChange} required />
        Fecha de contratación
        <input name="Fecha_Contratacion" type="date" value={form.Fecha_Contratacion} onChange={handleChange} required />
        Vacaciones Anuales
        <input name="Dias_Vacaciones_Anuales" type="number" value={form.Dias_Vacaciones_Anuales} onChange={handleChange} />
        Vacaciones tomadas
        <input name="Dias_Vacaciones_Tomados" type="number" value={form.Dias_Vacaciones_Tomados} onChange={handleChange} />
        Departamento
        <select name="ID_Departamento" value={form.ID_Departamento} onChange={handleChange} required>
          <option value ="">´{form.ID_Departamento}´</option>
          {departamentos.map(dep => (
            <option key={dep.ID_Departamento} value={dep.ID_Departamento}>
              {dep.Nombre_Departamento}
            </option>
          ))}
        </select>
        Puesto
        <select name ="ID_Puesto" value={form.ID_Puesto} onChange={handleChange} required>
          <option value="">-- Ninguno --</option>

          {puestos.map(pue => (
            <option key={pue.ID_Puesto} value={pue.ID_Puesto}>
              {pue.Nombre_Puesto}
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
        <button type="submit">💾 Guardar Cambios</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default EditarEmpleado;
