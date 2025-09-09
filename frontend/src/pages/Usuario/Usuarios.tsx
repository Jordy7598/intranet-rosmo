/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const ListaUsuarios = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      alert("❌ Sesión expirada. Inicia sesión nuevamente.");
      navigate("/");
      return;
    }

    const fetchUsuarios = async () => {
      try {
        const res = await api.get("/usuarios", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsuarios(res.data);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
        setMensaje("Error al cargar usuarios.");
      }
    };

    fetchUsuarios();
  }, [token, navigate]);

  return (
    <div style={{ maxWidth: "800px", margin: "30px auto" }}>
      <h2>Lista de Usuarios</h2>
      <Link to="/crear-usuario">
        <button style={{ marginBottom: "10px" }}>➕ Crear Usuario</button>
      </Link>

      {mensaje && <p>{mensaje}</p>}

      <table border={1} cellPadding={8} cellSpacing={0} style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre Usuario</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(usuario => (
            <tr key={usuario.ID_Usuario}>
              <td>{usuario.ID_Usuario}</td>
              <td>{usuario.Nombre_Usuario}</td>
              <td>{usuario.Correo}</td>
              <td>{usuario.Nombre_Rol}</td>
              <td>{usuario.Estado}</td>
              <td>
                <Link to={`/editar-usuario/${usuario.ID_Usuario}`}>
                  <button>✏ Editar</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaUsuarios;
