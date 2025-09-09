/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const EditarUsuario = () => {
  const { id } = useParams();
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

  // Cargar datos iniciales
  useEffect(() => {
    if (!token) {
      alert("❌ Sesión expirada. Inicia sesión nuevamente.");
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        // Usuario
        const { data } = await api.get(`/usuarios/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForm({
          Nombre_Usuario: data.Nombre_Usuario,
          Correo: data.Correo,
          Contraseña: "", // No traer la contraseña real por seguridad
          Foto_Perfil: data.Foto_Perfil || "",
          ID_Empleado: data.ID_Empleado || 0,
          ID_Rol: data.ID_Rol || 0,
          Estado: data.Estado
        });

        // Empleados
        const empleadosRes = await api.get("/empleados", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmpleados(empleadosRes.data);

        // Roles
        const rolesRes = await api.get("/roles", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRoles(rolesRes.data);

      } catch (error) {
        console.error("Error al cargar datos:", error);
        setMensaje("Error al cargar datos.");
      }
    };

    fetchData();
  }, [id, token, navigate]);

  // Manejar cambios en inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Guardar cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/usuarios/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje("✅ Usuario actualizado correctamente.");
      setTimeout(() => navigate("/usuarios"), 1000);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      setMensaje("❌ Error al actualizar usuario.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "30px auto" }}>
      <h2>Editar Usuario</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px" }}>
        Nombre de Usuario
        <input
          name="Nombre_Usuario"
          value={form.Nombre_Usuario}
          onChange={handleChange}
          required
        />
        Correo
        <input
          type="email"
          name="Correo"
          value={form.Correo}
          onChange={handleChange}
          required
        />
        Contraseña (dejar vacío si no se cambia)
        <input
          type="password"
          name="Contraseña"
          value={form.Contraseña}
          onChange={handleChange}
        />
        Foto de perfil (URL)
        <input
          name="Foto_Perfil"
          value={form.Foto_Perfil}
          onChange={handleChange}
        />
        Empleado
        <select
          name="ID_Empleado"
          value={form.ID_Empleado}
          onChange={handleChange}
          required
        >
          <option value="">-- Selecciona un empleado --</option>
          {empleados.map(emp => (
            <option key={emp.ID_Empleado} value={emp.ID_Empleado}>
              {emp.Nombre} {emp.Apellido}
            </option>
          ))}
        </select>
        Rol
        <select
          name="ID_Rol"
          value={form.ID_Rol}
          onChange={handleChange}
          required
        >
          <option value="">-- Selecciona un rol --</option>
          {roles.map(rol => (
            <option key={rol.ID_Rol} value={rol.ID_Rol}>
              {rol.Nombre_Rol}
            </option>
          ))}
        </select>
        Estado
        <select name="Estado" value={form.Estado} onChange={handleChange}>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
        <button type="submit">Guardar Cambios</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default EditarUsuario;
