/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const ListaEmpleados = () => {
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      alert("❌ Sesión expirada. Inicia sesión nuevamente.");
      navigate("/");
      return;
    }

    const fetchEmpleados = async () => {
      try {
        const res = await api.get("/empleados", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmpleados(res.data);
      } catch (error) {
        console.error("Error al obtener empleados:", error);
        setMensaje("Error al cargar empleados.");
      }
    };

    fetchEmpleados();
  }, [token, navigate]);

  return (
    <div style={{ maxWidth: "900px", margin: "30px auto" }}>
      <h2>Lista de Empleados</h2>
      <Link to="/empleados/crear">
        <button style={{ marginBottom: "10px" }}>➕ Crear Empleado</button>
      </Link>

      {mensaje && <p>{mensaje}</p>}

      <table border={1} cellPadding={8} cellSpacing={0} style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Correo</th>
            <th>Departamento</th>
            <th>Puesto</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map(empleado => (
            <tr key={empleado.ID_Empleado}>
              <td>{empleado.ID_Empleado}</td>
              <td>{empleado.Nombre}</td>
              <td>{empleado.Apellido}</td>
              <td>{empleado.Correo}</td>
              <td>{empleado.Nombre_Departamento}</td>
              <td>{empleado.Nombre_Puesto}</td>
              <td>{empleado.Estado}</td>
              <td>
                <Link to={`/editar-empleado/${empleado.ID_Empleado}`}>
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

export default ListaEmpleados;
