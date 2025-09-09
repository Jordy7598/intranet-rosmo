/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CrearUsuario = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    Nombre_Usuario: "",
    Correo: "",
    Contraseña: "",
    Foto_Perfil: "",
    ID_Empleado: 0,
    ID_Rol: 0,
    Estado: "Activo"
  });

  const [empleados, setEmpleados] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!token) {
      alert("❌ Sesión expirada. Inicia sesión.");
      navigate("/");
      return;
    }
    const fetchData = async () => {
      try {
        const empleadosRes = await api.get("/empleados", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const rolesRes = await api.get("/roles", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmpleados(empleadosRes.data);
        setRoles(rolesRes.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
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
    try {
      await api.post("/usuarios", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje("✅ Usuario creado correctamente");
      setTimeout(() => navigate("/usuarios"), 1000);
    } catch (error) {
      console.error("Error al crear usuario:", error);
      setMensaje("❌ Error al crear usuario");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "30px auto" }}>
      <h2>Crear Usuario</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px" }}>
        Nombre de Usuario
        <input name="Nombre_Usuario" value={form.Nombre_Usuario} onChange={handleChange} required />
        
        Correo
        <input name="Correo" type="email" value={form.Correo} onChange={handleChange} required />
        
        Contraseña
        <input name="Contraseña" type="password" value={form.Contraseña} onChange={handleChange} required />

        Foto de Perfil (URL)
        <input name="Foto_Perfil" value={form.Foto_Perfil} onChange={handleChange} />

        Rol
        <select name="ID_Rol" value={form.ID_Rol} onChange={handleChange} required>
          <option value="">Seleccionar rol</option>
          {roles.map((rol) => (
            <option key={rol.ID_Rol} value={rol.ID_Rol}>{rol.Nombre_Rol}</option>
          ))}
        </select>

        Empleado Asociado
        <select name="ID_Empleado" value={form.ID_Empleado} onChange={handleChange} required>
          <option value="">Seleccionar empleado</option>
          {empleados.map((emp) => (
            <option key={emp.ID_Empleado} value={emp.ID_Empleado}>
              {emp.Nombre} {emp.Apellido}
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

export default CrearUsuario;
