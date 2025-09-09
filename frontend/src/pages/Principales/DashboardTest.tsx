import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Dashboard() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<{ nombre: string; rol: number } | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

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
        rol: parseInt(rolGuardado)
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

  return (
    <>
      <div className="dashboard-layout">
        {/* Header Principal */}
        <header className="main-header">
          <div className="header-left">
            <div className="logo">
              <span className="logo-icon">✨</span>
              <span className="logo-text">Unidos</span>
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
            <div className="notifications">
              <span className="notification-badge">1</span>
              <span className="notification-icon">🔔</span>
            </div>
            
            {/* Perfil */}
            <div className="profile-container">
              <img
                src={localStorage.getItem("usuario_foto") || `https://ui-avatars.com/api/?name=${usuario?.nombre || "U"}&background=6f42c1&color=fff`}
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
                src={localStorage.getItem("usuario_foto") || `https://ui-avatars.com/api/?name=${usuario?.nombre || "U"}&background=6f42c1&color=fff`} 
                alt="Avatar" 
                className="user-avatar"
              />
              <span className="user-name">{usuario?.nombre}</span>
            </div>

            <nav className="sidebar-nav">
              <Link to="/dashboard" className="nav-item active">
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
              <Link to="/requerimientos" className="nav-item">
                <span className="nav-icon">📌</span>
                Centro de requerimientos
                <span className="nav-arrow">❮</span>
              </Link>
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
              <Link to="/liquidaciones" className="nav-item">
                <span className="nav-icon">💰</span>
                Liquidaciones
              </Link>
              <Link to="/vacaciones" className="nav-item">
                <span className="nav-icon">✈️</span>
                Vacaciones
                <span className="nav-arrow">❮</span>
              </Link>
              <Link to="/calendario" className="nav-item">
                <span className="nav-icon">📅</span>
                Calendario
              </Link>
              <Link to="/directorio" className="nav-item">
                <span className="nav-icon">📇</span>
                Directorio de usuarios
              </Link>
              <Link to="/publicar-estado" className="nav-item">
                <span className="nav-icon">✏️</span>
                Publicar estado
              </Link>
              <Link to="/marketplace" className="nav-item">
                <span className="nav-icon">🛒</span>
                Marketplace
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            {/* Content Tabs */}
            <div className="content-tabs">
              <button className="tab active">EMPRESA</button>
              <button className="tab">SEGUIDOS</button>
              <button className="tab">TODO</button>
            </div>

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
              </div>
            </div>
          </main>

          {/* Sidebar Right */}
          <aside className="right-sidebar">
            <div className="sidebar-section">
              <div className="section-header">
                <span className="section-title">¡Este mes! 🎉</span>
              </div>
              
              <div className="birthday-section">
                <h4>🎂 Cumpleaños</h4>
                <div className="birthday-list">
                  <div className="birthday-item">
                    <img src="https://ui-avatars.com/api/?name=Ana+Martinez&background=e91e63&color=fff" alt="Ana" className="birthday-avatar" />
                  </div>
                  <div className="birthday-item">
                    <img src="https://ui-avatars.com/api/?name=Carlos+Lopez&background=2196f3&color=fff" alt="Carlos" className="birthday-avatar" />
                  </div>
                  <div className="birthday-item">
                    <img src="https://ui-avatars.com/api/?name=Maria+Rodriguez&background=4caf50&color=fff" alt="María" className="birthday-avatar" />
                  </div>
                </div>
              </div>

              <div className="anniversary-section">
                <h4>⭐ Aniversarios</h4>
                <div className="anniversary-list">
                  <div className="anniversary-item">
                    <img src="https://ui-avatars.com/api/?name=Juan+Perez&background=ff9800&color=fff" alt="Juan" className="anniversary-avatar" />
                  </div>
                  <div className="anniversary-item">
                    <img src="https://ui-avatars.com/api/?name=Sofia+Garcia&background=9c27b0&color=fff" alt="Sofía" className="anniversary-avatar" />
                  </div>
                </div>
              </div>
            </div>

            <div className="sidebar-section">
              <h4>Últimos archivos</h4>
              <div className="file-item">
                <div className="file-icon">📄</div>
                <div className="file-info">
                  <div className="file-name">Reglamentos internos</div>
                  <div className="file-date">22 febrero 2023</div>
                </div>
              </div>
            </div>

            <div className="sidebar-section">
              <h4>Últimas noticias</h4>
              <div className="news-item">
                <img src="https://images.unsplash.com/photo-1577415124269-fc1140a69e91?w=100&h=60&fit=crop" alt="Noticia" className="news-image" />
                <div className="news-info">
                  <div className="news-title">Comunicación interna en 2023</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          height: 100%;
          width: 100%;
          overflow: hidden; /* Evita barras de desplazamiento innecesarias */
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #f8f9fa;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 5px solid #e3e3e3;
          border-top: 5px solid #6f42c1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 24px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .dashboard-layout {
          height: 100vh;
          width: 100vw;
          background: #f8f9fa;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* Header */
        .main-header {
          background: #6f42c1;
          color: white;
          padding: 16px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 24px;
          font-weight: bold;
        }

        .logo-icon {
          font-size: 28px;
        }

        .breadcrumb a {
          color: white;
          text-decoration: none;
          opacity: 0.8;
          font-size: 16px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-btn {
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          font-size: 20px;
        }

        .header-btn:hover {
          background: rgba(255,255,255,0.2);
        }

        .notifications {
          position: relative;
          cursor: pointer;
        }

        .notification-badge {
          position: absolute;
          top: -10px;
          right: -10px;
          background: #ff4757;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-container {
          position: relative;
        }

        .profile-photo {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.3);
        }

        .profile-dropdown {
          position: absolute;
          top: 60px;
          right: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          overflow: hidden;
          min-width: 200px;
          z-index: 100;
        }

        .dropdown-item {
          width: 100%;
          padding: 14px 20px;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: background 0.2s;
          color: #333;
          font-size: 16px;
        }

        .dropdown-item:hover {
          background: #f8f9fa;
        }

        .dropdown-item.logout:hover {
          background: #ffe6e6;
          color: #d63031;
        }

        /* Content */
        .dashboard-content {
          display: grid;
          grid-template-columns: 350px 1fr 350px; /* Aumentamos el ancho de las barras laterales */
          height: calc(100vh - 72px); /* Ajustamos altura restando el header */
          width: 100%;
          gap: 20px;
          padding: 20px;
        }

        /* Sidebar */
        .sidebar {
          background: white;
          padding: 30px;
          border-right: 1px solid #e9ecef;
          overflow-y: auto;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 40px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
        }

        .user-name {
          font-weight: 600;
          color: #333;
          font-size: 18px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 14px 20px;
          text-decoration: none;
          color: #666;
          border-radius: 8px;
          transition: all 0.2s;
          position: relative;
          font-size: 16px;
        }

        .nav-item:hover {
          background: #f8f9fa;
          color: #333;
        }

        .nav-item.active {
          background: #6f42c1;
          color: white;
        }

        .nav-icon {
          font-size: 20px;
        }

        .nav-arrow {
          margin-left: auto;
          font-size: 14px;
          opacity: 0.6;
        }

        /* Main Content */
        .main-content {
          display: flex;
          flex-direction: column;
          gap: 30px;
          overflow-y: auto;
          padding: 30px;
        }

        .content-tabs {
          display: flex;
          gap: 0;
          background: white;
          border-radius: 10px;
          padding: 6px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          width: fit-content;
        }

        .tab {
          padding: 14px 30px;
          border: none;
          background: none;
          cursor: pointer;
          font-weight: 600;
          border-radius: 8px;
          transition: all 0.2s;
          color: #666;
          font-size: 16px;
        }

        .tab.active {
          background: #6f42c1;
          color: white;
        }

        .welcome-section {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .welcome-section h1 {
          font-size: 32px;
          color: #333;
          margin-bottom: 12px;
        }

        .welcome-section p {
          color: #666;
          font-size: 18px;
        }

        .quick-actions {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .quick-actions h3 {
          margin-bottom: 30px;
          color: #333;
          font-size: 20px;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .action-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 25px;
          background: #f8f9fa;
          border-radius: 10px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }

        .action-card:hover {
          background: #e9ecef;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .action-icon {
          font-size: 28px;
          width: 60px;
          height: 60px;
          background: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .action-content h4 {
          margin-bottom: 6px;
          color: #333;
          font-size: 18px;
        }

        .action-content p {
          color: #666;
          font-size: 15px;
        }

        /* Right Sidebar */
        .right-sidebar {
          background: white;
          padding: 30px;
          border-left: 1px solid #e9ecef;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .sidebar-section {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .section-header {
          margin-bottom: 20px;
        }

        .section-title {
          font-weight: 600;
          color: #333;
          font-size: 18px;
        }

        .sidebar-section h4 {
          margin-bottom: 20px;
          color: #333;
          font-size: 18px;
        }

        .birthday-list, .anniversary-list {
          display: flex;
          gap: 12px;
        }

        .birthday-avatar, .anniversary-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
        }

        .file-item, .news-item {
          display: flex;
          gap: 15px;
          align-items: center;
          margin-bottom: 15px;
        }

        .file-icon {
          font-size: 24px;
        }

        .file-info {
          flex: 1;
        }

        .file-name, .news-title {
          font-weight: 500;
          color: #333;
          margin-bottom: 6px;
          font-size: 16px;
        }

        .file-date {
          font-size: 14px;
          color: #666;
        }

        .news-image {
          width: 80px;
          height: 50px;
          border-radius: 6px;
          object-fit: cover;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .dashboard-content {
            grid-template-columns: 300px 1fr 300px;
          }
        }

        @media (max-width: 992px) {
          .dashboard-content {
            grid-template-columns: 250px 1fr 250px;
          }
          .sidebar, .right-sidebar {
            padding: 20px;
          }
          .main-content {
            padding: 20px;
          }
          .actions-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .dashboard-content {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto auto;
          }
          .sidebar, .right-sidebar {
            width: 100%;
          }
          .right-sidebar {
            border-left: none;
            border-top: 1px solid #e9ecef;
          }
          .main-content {
            order: -1; /* Mueve el contenido principal arriba en móviles */
          }
          .actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

export default Dashboard;