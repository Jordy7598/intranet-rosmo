// src/layouts/DashboardLayout.tsx
import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<{ nombre: string; rol: number } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    const nombreGuardado = localStorage.getItem("usuario_nombre");
    const rolGuardado = localStorage.getItem("usuario_rol");
    if (nombreGuardado && rolGuardado) {
      setUsuario({ nombre: nombreGuardado, rol: parseInt(rolGuardado) });
    }
  }, [navigate]);

  if (!usuario) return <p>Cargando...</p>;

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="main-header"> ... </header>

      <div className="dashboard-content">
        {/* Sidebar izquierda */}
        <aside className="sidebar"> ... menú aquí ... </aside>

        {/* Contenido central: aquí se inyectan las páginas */}
        <main className="main-content">
          <Outlet />
        </main>

        {/* Sidebar derecha */}
        <aside className="right-sidebar"> ... </aside>
      </div>
    </div>
  );
}
