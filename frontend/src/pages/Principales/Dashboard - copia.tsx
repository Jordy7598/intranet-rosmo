import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNotificaciones } from "../../hooks/useNotificaciones";

function Dashboard() {
  const navigate = useNavigate();
  const { notificaciones, contador, marcarTodasComoLeidas } = useNotificaciones();
  const [mostrarNotif, setMostrarNotif] = useState(false);
  const [usuario, setUsuario] = useState<{ nombre: string; rol: number } | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [vacacionesSubmenuOpen, setVacacionesSubmenuOpen] = useState(false);
  const [requerimientosSubmenuOpen, setRequerimientosSubmenuOpen] = useState(false);
  const location = useLocation();

  const toggleVacacionesSubmenu = () => {
    setVacacionesSubmenuOpen(!vacacionesSubmenuOpen);
    setRequerimientosSubmenuOpen(false);
  };

  const toggleRequerimientosSubmenu = () => {
    setRequerimientosSubmenuOpen(!requerimientosSubmenuOpen);
    setVacacionesSubmenuOpen(false);
  };

  const isVacacionesActive = () => location.pathname.includes("/vacaciones");
  const isRequerimientosActive = () => location.pathname.startsWith("/requerimientos");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const nombreGuardado = localStorage.getItem("usuario_nombre");
    const rolGuardado = localStorage.getItem("usuario_rol");
    if (nombreGuardado && rolGuardado) {
      setUsuario({
        nombre: nombreGuardado,
        rol: parseInt(rolGuardado),
      });
    }
  }, [navigate]);

  if (!usuario) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario_nombre");
    localStorage.removeItem("usuario_rol");
    navigate("/");
  };

  const isDashboardHome = location.pathname === "/dashboard";

  return (
    <>
      <div className="dashboard-layout">
        {/* Header Principal */}
        <header className="main-header">
          <div className="header-left">
            <div className="logo">
              <span className="logo-icon">
                <img src="/ROSMO.png" alt="Logo R" className="logo-img" />
              </span>
              <span className="logo-text">somosrosmo.com</span>
            </div>
            <nav className="breadcrumb">
              <Link to="/dashboard">Inicio</Link>
            </nav>
          </div>

          <div className="header-right">
            <button className="header-btn">
              <span className="plus-icon">+</span>
            </button>
            <button className="header-btn">
              <span className="link-icon">🔗</span>
            </button>
            <div className="relative">
              <button
                onClick={() => {
                  setMostrarNotif(!mostrarNotif);
                  if (!mostrarNotif && contador > 0) {
                    marcarTodasComoLeidas();
                  }
                }}
                className="relative"
              >
                🔔
                {contador > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-2">
                    {contador}
                  </span>
                )}
              </button>

              {mostrarNotif && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg p-3 z-50">
                  {notificaciones.length === 0 ? (
                    <p className="text-sm text-gray-500">No tienes notificaciones</p>
                  ) : (
                    notificaciones.map((n) => (
                      <div
                        key={n.ID_Notificacion}
                        className={`p-2 mb-2 border-b last:border-none ${
                          n.Leido ? "bg-gray-100" : "bg-white"
                        }`}
                      >
                        <strong className="block">{n.Titulo}</strong>
                        <p className="text-sm">{n.Mensaje}</p>
                        <small className="text-xs text-gray-500">
                          {new Date(n.Fecha_Creacion).toLocaleString()} · {n.Tipo}
                        </small>
                        {n.Link_Destino && (
                          <a href={n.Link_Destino} className="text-blue-600 text-xs block mt-1">
                            Ver más →
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Perfil */}
            <div className="profile-container">
              <img
                src={
                  localStorage.getItem("usuario_foto") ||
                  `https://ui-avatars.com/api/?name=${usuario?.nombre || "U"}&background=ffffff&color=CC0000`
                }
                alt="Foto de perfil"
                className="profile-photo"
                onClick={() => setMenuAbierto(!menuAbierto)}
              />

              {menuAbierto && (
                <div className="profile-dropdown">
                  <button onClick={() => navigate("/mi-perfil")} className="dropdown-item">
                    <span className="item-icon">👤</span>
                    Mi Perfil
                  </button>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <span className="item-icon">🚪</span>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="user-info">
              <img
                src={
                  localStorage.getItem("usuario_foto") ||
                  `https://ui-avatars.com/api/?name=${usuario?.nombre || "U"}&background=cc0000&color=fff`
                }
                alt="Avatar"
                className="user-avatar"
              />
              <span className="user-name">{usuario?.nombre}</span>
            </div>

            <nav className="sidebar-nav">
              <Link to="/dashboard" className={`nav-item ${isDashboardHome ? "active" : ""}`}>
                <span className="nav-icon">📊</span>
                Dashboard
              </Link>
              <Link to="/noticias" className="nav-item">
                <span className="nav-icon">📰</span>
                Noticias
              </Link>
              <Link to="/galeria" className="nav-item">
                <span className="nav-icon">🖼</span>
                Galería
              </Link>

              {/* Centro de requerimientos con submenú */}
              <div className="nav-item-container">
                <div
                  className={`nav-item ${isRequerimientosActive() ? "active" : ""}`}
                  onClick={toggleRequerimientosSubmenu}
                >
                  <span className="nav-icon">📌</span>
                  Centro de requerimientos
                  <span className={`nav-arrow ${requerimientosSubmenuOpen ? "open" : ""}`}>❮</span>
                </div>
                {requerimientosSubmenuOpen && (
                  <div className="submenu">
                    <Link
                      to="/requerimientos"
                      className={`submenu-item ${location.pathname === "/requerimientos" ? "active" : ""}`}
                    >
                      <span className="submenu-icon">🏠</span>
                      Inicio Centro
                    </Link>
                    <Link
                      to="/requerimientos/crear-carta"
                      className={`submenu-item ${
                        location.pathname === "/requerimientos/crear-carta" ? "active" : ""
                      }`}
                    >
                      <span className="submenu-icon">📝</span>
                      Carta de Ingresos
                    </Link>
                    <Link
                      to="/requerimientos/crear-boleta"
                      className={`submenu-item ${
                        location.pathname === "/requerimientos/crear-boleta" ? "active" : ""
                      }`}
                    >
                      <span className="submenu-icon">💵</span>
                      Boleta de Pago
                    </Link>
                    <Link
                      to="/requerimientos/crear-salida"
                      className={`submenu-item ${
                        location.pathname === "/requerimientos/crear-salida" ? "active" : ""
                      }`}
                    >
                      <span className="submenu-icon">⏱️</span>
                      Salida Anticipada
                    </Link>
                    <Link
                      to="/requerimientos/crear-almuerzo"
                      className={`submenu-item ${
                        location.pathname === "/requerimientos/crear-almuerzo" ? "active" : ""
                      }`}
                    >
                      <span className="submenu-icon">🍽️</span>
                      Registrar Almuerzo
                    </Link>
                    <Link
                      to="/requerimientos/mis-solicitudes"
                      className={`submenu-item ${
                        location.pathname === "/requerimientos/mis-solicitudes" ? "active" : ""
                      }`}
                    >
                      <span className="submenu-icon">📄</span>
                      Mis Solicitudes
                    </Link>
                    <Link
                      to="/requerimientos/pendientes"
                      className={`submenu-item ${
                        location.pathname === "/requerimientos/pendientes" ? "active" : ""
                      }`}
                    >
                      <span className="submenu-icon">✅</span>
                      Pendientes (Aprobar)
                    </Link>
                    <Link
                      to="/requerimientos/almuerzo-lista"
                      className={`submenu-item ${
                        location.pathname === "/requerimientos/almuerzo-lista" ? "active" : ""
                      }`}
                    >
                      <span className="submenu-icon">🍽️</span>
                      Lista de Almuerzo
                    </Link>
                  </div>
                )}
              </div>

              <Link to="/archivos" className="nav-item">
                <span className="nav-icon">📂</span>
                Archivos corporativos
              </Link>
              <Link to="/encuestas" className="nav-item">
                <span className="nav-icon">📋</span>
                Encuestas
              </Link>
              <Link to="/informacion" className="nav-item">
                <span className="nav-icon">ℹ️</span>
                Información
              </Link>

              {/* Vacaciones con submenú */}
              <div className="nav-item-container">
                <div className={`nav-item ${isVacacionesActive() ? "active" : ""}`} onClick={toggleVacacionesSubmenu}>
                  <span className="nav-icon">✈️</span>
                  Vacaciones
                  <span className={`nav-arrow ${vacacionesSubmenuOpen ? "open" : ""}`}>❮</span>
                </div>
                {vacacionesSubmenuOpen && (
                  <div className="submenu">
                    <Link
                      to="/vacaciones/solicitudes"
                      className={`submenu-item ${location.pathname === "/vacaciones/solicitudes" ? "active" : ""}`}
                    >
                      <span className="submenu-icon">📝</span>
                      Solicitudes
                    </Link>
                    <Link
                      to="/vacaciones/crear"
                      className={`submenu-item ${location.pathname === "/vacaciones/crear" ? "active" : ""}`}
                    >
                      <span className="submenu-icon">➕</span>
                      Crear Solicitud
                    </Link>
                    <Link
                      to="/vacaciones/historial"
                      className={`submenu-item ${location.pathname === "/vacaciones/historial" ? "active" : ""}`}
                    >
                      <span className="submenu-icon">📚</span>
                      Historial
                    </Link>
                    <Link
                      to="/vacaciones/aprobar"
                      className={`submenu-item ${location.pathname === "/vacaciones/aprobar" ? "active" : ""}`}
                    >
                      <span className="submenu-icon">✅</span>
                      Aprobar Vacaciones
                    </Link>
                  </div>
                )}
              </div>

              <Link to="/calendario" className="nav-item">
                <span className="nav-icon">📅</span>
                Calendario
              </Link>
              <Link to="/directorio" className="nav-item">
                <span className="nav-icon">📇</span>
                Directorio de usuarios
              </Link>
            </nav>
          </aside>

          {/* Main Content: aquí va TODO el contenido de páginas */}
          <main className="main-content">
            {isDashboardHome ? (
              <>
                {/* Welcome Section */}
                <div className="welcome-section">
                  <h1>Bienvenido, {usuario?.nombre} 👋</h1>
                  <p>Aquí tienes un resumen de lo que está pasando en la empresa.</p>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                  <h3>Acciones Rápidas</h3>
                  <div className="actions-grid">
                    <Link to="/noticias/nueva" className="action-card">
                      <div className="action-icon">📝</div>
                      <div className="action-content">
                        <h4>Crear Noticia</h4>
                        <p>Publica una nueva noticia</p>
                      </div>
                    </Link>

                    <Link to="/crear-empleado" className="action-card">
                      <div className="action-icon">👥</div>
                      <div className="action-content">
                        <h4>Nuevo Empleado</h4>
                        <p>Registrar empleado</p>
                      </div>
                    </Link>

                    <Link to="/crear-usuario" className="action-card">
                      <div className="action-icon">🆕</div>
                      <div className="action-content">
                        <h4>Nuevo Usuario</h4>
                        <p>Crear cuenta de usuario</p>
                      </div>
                    </Link>

                    <Link to="/reporte-vacaciones" className="action-card">
                      <div className="action-icon">📊</div>
                      <div className="action-content">
                        <h4>Reportes</h4>
                        <p>Ver estadísticas</p>
                      </div>
                    </Link>

                    {/* Centro de Requerimientos */}
                    <Link to="/requerimientos/crear-carta" className="action-card">
                      <div className="action-icon">📄</div>
                      <div className="action-content">
                        <h4>Carta de Ingresos</h4>
                        <p>Solicitar carta (PendienteRH)</p>
                      </div>
                    </Link>

                    <Link to="/requerimientos/crear-boleta" className="action-card">
                      <div className="action-icon">💵</div>
                      <div className="action-content">
                        <h4>Boleta de Pago</h4>
                        <p>Solicitar y consultar</p>
                      </div>
                    </Link>

                    <Link to="/requerimientos/crear-salida" className="action-card">
                      <div className="action-icon">⏱️</div>
                      <div className="action-content">
                        <h4>Salida Anticipada</h4>
                        <p>Crear solicitud</p>
                      </div>
                    </Link>

                    <Link to="/requerimientos/mis-solicitudes" className="action-card">
                      <div className="action-icon">📑</div>
                      <div className="action-content">
                        <h4>Mis Solicitudes</h4>
                        <p>Ver historial y estado</p>
                      </div>
                    </Link>

                    <Link to="/requerimientos/pendientes" className="action-card">
                      <div className="action-icon">✅</div>
                      <div className="action-content">
                        <h4>Pendientes (Aprobar)</h4>
                        <p>Jefe / Talento Humano</p>
                      </div>
                    </Link>

                    <Link to="/requerimientos/almuerzo-lista" className="action-card">
                      <div className="action-icon">🍽️</div>
                      <div className="action-content">
                        <h4>Lista de Almuerzo</h4>
                        <p>Registros de hoy</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              // <<— Cualquier ruta hija se inyecta aquí
              <Outlet />
            )}
          </main>

          {/* Sidebar Right */}
          <aside className="right-sidebar">
            <div className="sidebar-section">
              <div className="section-header">
                <span className="section-title">¡Este mes! 🎉</span>
              </div>

              <div className="birthday-section">
                <h4>🎂 Cumpleaños</h4>
                <div className="birthday-list"></div>
              </div>

              <div className="anniversary-section">
                <h4>⭐ Aniversarios</h4>
                <div className="anniversary-list"></div>
              </div>
            </div>

            <div className="sidebar-section">
              <h4>Últimos archivos</h4>
            </div>

            <div className="sidebar-section">
              <h4>Últimas noticias</h4>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; width: 100%; overflow: hidden; }

        .loading-container { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background: #f8f9fa; }
        .loading-spinner { width: 48px; height: 48px; border: 5px solid #e3e3e3; border-top: 5px solid #cc0000; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 24px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .dashboard-layout { height: 100vh; width: 100vw; background: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; }

        .main-header { background: #cc0000; color: white; padding: 16px 40px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 1000; width: 100%; }
        .header-left { display: flex; align-items: center; gap: 30px; }
        .logo { display: flex; align-items: center; gap: 10px; font-size: 24px; font-weight: bold; }
        .logo-icon { font-size: 28px; }
        .breadcrumb a { color: white; text-decoration: none; opacity: 0.8; font-size: 16px; }

        .header-right { display: flex; align-items: center; gap: 20px; }
        .header-btn { background: rgba(255,255,255,0.1); border: none; color: white; width: 48px; height: 48px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; font-size: 20px; }
        .header-btn:hover { background: rgba(255,255,255,0.2); }

        .profile-container { position: relative; }
        .profile-photo { width: 48px; height: 48px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.3); }
        .profile-dropdown { position: absolute; top: 60px; right: 0; background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); overflow: hidden; min-width: 200px; z-index: 100; }
        .dropdown-item { width: 100%; padding: 14px 20px; background: none; border: none; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: background 0.2s; color: #333; font-size: 16px; }
        .dropdown-item:hover { background: #f8f9fa; }
        .dropdown-item.logout:hover { background: #ffe6e6; color: #d63031; }

        .dashboard-content { display: grid; grid-template-columns: 350px 1fr 350px; height: calc(100vh - 72px); width: 100%; gap: 20px; padding: 20px; }

        .sidebar { background: white; padding: 30px; border-right: 1px solid #e9ecef; overflow-y: auto; }
        .user-info { display: flex; align-items: center; gap: 15px; margin-bottom: 40px; padding: 20px; background: #f8f9fa; border-radius: 10px; }
        .user-avatar { width: 48px; height: 48px; border-radius: 50%; }
        .user-name { font-weight: 600; color: #333; font-size: 18px; }

        .sidebar-nav { display: flex; flex-direction: column; gap: 4px; }
        .nav-item { display: flex; align-items: center; gap: 15px; padding: 14px 20px; text-decoration: none; color: #666; border-radius: 8px; transition: all 0.2s; position: relative; font-size: 16px; }
        .nav-item:hover { background: #f8f9fa; color: #333; }
        .nav-item.active { background: #cc0000; color: white; }
        .nav-icon { font-size: 20px; }
        .nav-arrow { margin-left: auto; font-size: 14px; opacity: 0.6; }

        .submenu { display: flex; flex-direction: column; }
        .submenu-item { display: flex; align-items: center; gap: 10px; padding: 10px 20px 10px 40px; text-decoration: none; color: #666; border-radius: 8px; transition: all 0.2s; }
        .submenu-item.active, .submenu-item:hover { background: #f8f9fa; color: #333; }
        .submenu-icon { font-size: 16px; }

        .main-content { display: flex; flex-direction: column; gap: 30px; overflow-y: auto; padding: 30px; }
        .welcome-section { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .welcome-section h1 { font-size: 32px; color: #333; margin-bottom: 12px; }
        .welcome-section p { color: #666; font-size: 18px; }

        .quick-actions { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .quick-actions h3 { margin-bottom: 30px; color: #333; font-size: 20px; }
        .actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .action-card { display: flex; align-items: center; gap: 20px; padding: 25px; background: #f8f9fa; border-radius: 10px; text-decoration: none; color: inherit; transition: all 0.2s; }
        .action-card:hover { background: #e9ecef; transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .action-icon { font-size: 28px; width: 60px; height: 60px; background: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .action-content h4 { margin-bottom: 6px; color: #333; font-size: 18px; }
        .action-content p { color: #666; font-size: 15px; }

        .right-sidebar { background: white; padding: 30px; border-left: 1px solid #e9ecef; overflow-y: auto; display: flex; flex-direction: column; gap: 30px; }
        .sidebar-section { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }

        @media (max-width: 1200px) {
          .dashboard-content { grid-template-columns: 300px 1fr 300px; }
        }
        @media (max-width: 992px) {
          .dashboard-content { grid-template-columns: 250px 1fr 250px; }
          .sidebar, .right-sidebar { padding: 20px; }
          .main-content { padding: 20px; }
          .actions-grid { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
        }
        .logo-img { height: 60px; width: auto; display: block; }
        @media (max-width: 768px) {
          .dashboard-content { grid-template-columns: 1fr; grid-template-rows: auto auto auto; }
          .sidebar, .right-sidebar { width: 100%; }
          .right-sidebar { border-left: none; border-top: 1px solid #e9ecef; }
          .main-content { order: -1; }
          .actions-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}

export default Dashboard;
