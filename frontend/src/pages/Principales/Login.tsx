import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const Login = () => {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/login", { correo, contrasena });

      const { token, usuario } = res.data;

      // Guardar el token y el usuario en localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("usuario_nombre", usuario.nombre);
      localStorage.setItem("usuario_rol", usuario.rol);

      // Redirigir al dashboard
      navigate("/dashboard");
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { status?: number } }).response?.status === "number"
      ) {
        if ((err as { response: { status: number } }).response.status === 401) {
          setError("Correo o contraseña incorrectos.");
        } else {
          setError("Error al iniciar sesión.");
        }
      } else {
        setError("Error al iniciar sesión.");
      }
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2 style={{ textAlign: "center" }}>Iniciar Sesión</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "10px" }}>
          <label>Correo:</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Contraseña:</label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
        <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px" }}>
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
};

export default Login;
