import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useNotificaciones } from "../../hooks/useNotificaciones";
import api from "../../api/axios";
import { getStatusAlmuerzoHoy } from "../../api/solicitudes.api";
import {
  Home, Newspaper, Image, FileText, BarChart3, Info, Calendar,
  Users, Plus, Bell, LogOut, User, Plane, CheckSquare,
  DollarSign, Clock, Utensils, FileCheck, FolderOpen, ClipboardList,
  ThumbsUp, ExternalLink, ChevronLeft, PlusCircle, BellRing, Link as LinkIcon, Settings
} from "lucide-react";

type NoticiaLite = { ID_Noticia: number; Titulo: string; Fecha_Publicacion: string; total_likes?: number };
type PersonaMini = { id: number; nombre: string; fecha: string; anios?: number; foto?: string };
type ArchivoMini = { id: number; titulo: string; url: string; Fecha_Creacion?: string };
type EnlaceMini = { id: number; titulo: string; url: string };

function Dashboard() {
  const navigate = useNavigate();
  const { notificaciones, contador, marcarComoLeida } = useNotificaciones();
  const [mostrarNotif, setMostrarNotif] = useState(false);
  const [usuario, setUsuario] = useState<{ nombre: string; rol: number } | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [vacacionesSubmenuOpen, setVacacionesSubmenuOpen] = useState(false);
  const [requerimientosSubmenuOpen, setRequerimientosSubmenuOpen] = useState(false);
  const [accionesOpen, setAccionesOpen] = useState(false);
  const [ReportOpen, setReportOpen] = useState(false);
  const ReportRef = useRef<HTMLDivElement | null>(null);
  const accionesRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  // Datos del summary
  const [destacadoPorLikes, setDestacadoPorLikes] = useState<NoticiaLite | null>(null);
  const [masReciente, setMasReciente] = useState<NoticiaLite | null>(null);
  const [topLikes, setTopLikes] = useState<NoticiaLite[]>([]);
  const [cumpleaniosHoy, setCumpleaniosHoy] = useState<PersonaMini[]>([]);
  const [aniversariosHoy, setAniversariosHoy] = useState<PersonaMini[]>([]);
  const [archivosRecientes, setArchivosRecientes] = useState<ArchivoMini[]>([]);
  const [encuestasRecientes, setEncuestasRecientes] = useState<EnlaceMini[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [almuerzoHoy, setAlmuerzoHoy] = useState<{ tieneSolicitud: boolean; horaRegistro: string | null } | null>(null);

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
    if (!token) { navigate("/"); return; }

    const nombreGuardado = localStorage.getItem("usuario_nombre");
    const rolGuardado = localStorage.getItem("usuario_rol");
    if (nombreGuardado && rolGuardado) {
      setUsuario({ nombre: nombreGuardado, rol: parseInt(rolGuardado) });
    }
  }, [navigate]);

  // Cerrar dropdown Acciones cuando se hace click fuera
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!accionesRef.current) return;
      if (!accionesRef.current.contains(e.target as Node)) setAccionesOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // Cerrar panel de notificaciones cuando se hace click fuera
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!notifRef.current) return;
      if (!notifRef.current.contains(e.target as Node)) setMostrarNotif(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // lógica para cerrar el menú de "Reportes" al hacer clic fuera
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ReportRef.current) return;
      if (!ReportRef.current.contains(e.target as Node)) setReportOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // Cargar summary del dashboard
  useEffect(() => {
    api.get("/dashboard/summary")
      .then(({ data }) => {
        setDestacadoPorLikes(data.destacadoPorLikes || null);
        setMasReciente(data.masReciente || null);
        setTopLikes(data.topLikes || []);
        setCumpleaniosHoy(data.cumpleaniosHoy || []);
        setAniversariosHoy(data.aniversariosHoy || []);
        setArchivosRecientes(data.archivosRecientes || []);
        setEncuestasRecientes(data.encuestasRecientes || []);
      })
      .catch(() => { });
  }, []);

  // Cargar estado del almuerzo
  useEffect(() => {
    getStatusAlmuerzoHoy()
      .then((data) => {
        setAlmuerzoHoy({ tieneSolicitud: data.tieneSolicitud, horaRegistro: data.horaRegistro });
      })
      .catch(() => { });
  }, []);

  // Escuchar evento de actualización de almuerzo
  useEffect(() => {
    const handleAlmuerzoActualizado = () => {
      getStatusAlmuerzoHoy()
        .then((data) => {
          setAlmuerzoHoy({ tieneSolicitud: data.tieneSolicitud, horaRegistro: data.horaRegistro });
        })
        .catch(() => { });
    };

    window.addEventListener('almuerzoActualizado', handleAlmuerzoActualizado);
    
    return () => {
      window.removeEventListener('almuerzoActualizado', handleAlmuerzoActualizado);
    };
  }, []);

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
  const esAdminTH = usuario.rol === 1 || usuario.rol === 2;
  const esAdmin = usuario.rol === 1;
  const esTH = usuario.rol === 2;
  const esJefe = usuario.rol === 3;

  const puedePendientes = esAdmin || esTH || esJefe;
  const puedeAlmuerzoLista = esAdmin || esTH;
  const puedeAprobarVacaciones = esAdmin || esTH || esJefe;

  return (
    <>
      <div className="dashboard-layout">
        {/* Header */}
        <header className="main-header">
          <div className="header-left">
            <div className="logo">
              <span className="logo-icon">
                <img src="/ROSMO.png" alt="Logo R" className="logo-img" />
              </span>
            </div>
            <nav className="breadcrumb">
              <Link to="/dashboard">Inicio</Link>
            </nav>
            </div >

            <div className="header-right">
            <span className="logo-text" style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '0.5px' }}>somosrosmo.com</span>
            {esAdminTH && (
              <div className="relative" ref={accionesRef}>
              <button
                className="header-btn"
                onClick={() => setAccionesOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={accionesOpen}
              >
                <PlusCircle size={32} strokeWidth={2.5} />
              </button>

              {accionesOpen && (
                <div className="qa-dropdown">
                <div className="qa-title">Acciones rápidas</div>
                <ul className="qa-list">
                      <li><Link to="/noticias/nueva">Publicar noticia</Link></li>
                      <li><Link to="/encuestas/nueva">Crear encuesta</Link></li>
                      <li><Link to="/archivos/nuevo">Agregar reglamento</Link></li>
                      <li><Link to="/requerimientos/pendientes">Pendientes (Aprobar)</Link></li>
                      <li><Link to="/crear-empleado">Nuevo empleado</Link></li>
                      <li><Link to="/crear-usuario">Nuevo usuario</Link></li>
                    </ul>
                  </div>
                )}
              </div>
            )}
            {/* Reportes */}
             {esAdminTH && (
              <div className="header-btn" ref={ReportRef}>
              <button
                className="header-btn"
                onClick={() => setReportOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={ReportOpen}
              >
                
              <LinkIcon size={32} strokeWidth={2.5} />
            </button>

              {ReportOpen && (
                <div className="qa-dropdown">
                <div className="qa-title">Acceso a Reportes</div>
                <ul className="qa-list">
                      <li><Link to="/vacaciones/reporte">Reporte de Vacaciones</Link></li>
                      <li><Link to="/requerimientos/almuerzo-lista">Lista de Almuerzos</Link></li>
                    </ul>
                  </div>
                )}
              </div>
            )} 
              {/* Notificaciones */}
            <div className="relative notif-container" ref={notifRef}>
              <button
                onClick={() => {
                  setMostrarNotif(!mostrarNotif);
                }}
                className="header-btn relative"
                aria-haspopup="listbox"
                aria-expanded={mostrarNotif}
                aria-label="Notificaciones"
              >
                <BellRing size={32} strokeWidth={2.5} />
                {contador > 0 && (
                  <span className="notif-badge">
                    {contador > 99 ? '99+' : contador}
                  </span>
                )}
              </button>

              {mostrarNotif && (
                <div className="notif-panel">
                  <div className="notif-header">
                    <h3 className="notif-title">Notificaciones</h3>
                    {contador > 0 && (
                      <span className="notif-count">{contador} sin leer</span>
                    )}
                  </div>
                  <div className="notif-list">
                    {notificaciones.length === 0 ? (
                      <div className="notif-empty">
                        <Bell size={48} className="notif-empty-icon" />
                        <p className="notif-empty-text">No tienes notificaciones</p>
                      </div>
                    ) : (
                      notificaciones.map((n) => (
                        <div
                          key={n.ID_Notificacion}
                          className={`notif-item ${!n.Leido ? "notif-item-unread" : ""}`}
                          onClick={() => {
                            if (!n.Leido) {
                              marcarComoLeida(n.ID_Notificacion);
                            }
                            if (n.Link_Destino) {
                              navigate(n.Link_Destino);
                              setMostrarNotif(false);
                            }
                          }}
                        >
                          <div className="notif-item-header">
                            <strong className="notif-item-title">{n.Titulo}</strong>
                            {!n.Leido && <div className="notif-item-dot"></div>}
                          </div>
                          <p className="notif-item-message">{n.Mensaje}</p>
                          <div className="notif-item-footer">
                            <small className="notif-item-date">
                              {new Date(n.Fecha_Creacion).toLocaleString()}
                            </small>
                            <span className="notif-item-type">{n.Tipo}</span>
                          </div>
                          {n.Link_Destino && (
                            <span className="notif-item-link">Ver más →</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
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
                    <User size={18} />
                    Mi Perfil
                  </button>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <LogOut size={18} />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Sidebar izquierda */}
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
                <Home size={20} className="nav-icon icon-red" /> Dashboard
              </Link>
              <Link to="/noticias" className="nav-item">
                <Newspaper size={20} className="nav-icon icon-red" /> Noticias
              </Link>
              <Link to="/galeria" className="nav-item">
                <Image size={20} className="nav-icon icon-red" /> Galería
              </Link>

              {/* Centro de requerimientos */}
              <div className="nav-item-container">
                <div className={`nav-item ${isRequerimientosActive() ? "active" : ""}`} onClick={toggleRequerimientosSubmenu}>
                  <FileText size={20} className="nav-icon icon-red" />
                  Centro de requerimientos
                  <ChevronLeft size={16} className={`nav-arrow ${requerimientosSubmenuOpen ? "open" : ""}`} />
                </div>
                {requerimientosSubmenuOpen && (
                  <div className="submenu">
                    <Link to="/requerimientos/crear-carta" className={`submenu-item ${location.pathname === "/requerimientos/crear-carta" ? "active" : ""}`}>
                      <FileCheck size={16} className="submenu-icon icon-red" /> Carta de Ingresos
                    </Link>
                    <Link to="/requerimientos/crear-boleta" className={`submenu-item ${location.pathname === "/requerimientos/crear-boleta" ? "active" : ""}`}>
                      <DollarSign size={16} className="submenu-icon icon-red" /> Boleta de Pago
                    </Link>
                    <Link to="/requerimientos/crear-salida" className={`submenu-item ${location.pathname === "/requerimientos/crear-salida" ? "active" : ""}`}>
                      <Clock size={16} className="submenu-icon icon-red" /> Salida Anticipada
                    </Link>
                    <Link to="/requerimientos/crear-almuerzo" className={`submenu-item ${location.pathname === "/requerimientos/crear-almuerzo" ? "active" : ""}`}>
                      <Utensils size={16} className="submenu-icon icon-red" /> Registrar Almuerzo
                    </Link>
                    <Link to="/requerimientos/mis-solicitudes" className={`submenu-item ${location.pathname === "/requerimientos/mis-solicitudes" ? "active" : ""}`}>
                      <ClipboardList size={16} className="submenu-icon icon-red" /> Mis Solicitudes
                    </Link>
                    {puedePendientes && (
                      <Link to="/requerimientos/pendientes" className={`submenu-item ${location.pathname === "/requerimientos/pendientes" ? "active" : ""}`}>
                        <CheckSquare size={16} className="submenu-icon icon-red" /> Pendientes (Aprobar)
                      </Link>
                    )}
                    {puedeAlmuerzoLista && (
                      <Link to="/requerimientos/almuerzo-lista" className={`submenu-item ${location.pathname === "/requerimientos/almuerzo-lista" ? "active" : ""}`}>
                        <Utensils size={16} className="submenu-icon icon-red" /> Lista de Almuerzo
                      </Link>
                    )}
                  </div>
                )}
              </div>

              <Link to="/archivos" className="nav-item">
                <FolderOpen size={20} className="nav-icon icon-red" /> Archivos corporativos
              </Link>
              <Link to="/encuestas" className="nav-item">
                <ClipboardList size={20} className="nav-icon icon-red" /> Encuestas
              </Link>
              <Link to="/informacion" className="nav-item">
                <Info size={20} className="nav-icon icon-red" /> Información
              </Link>

              {/* Vacaciones */}
              <div className="nav-item-container">
                <div className={`nav-item ${isVacacionesActive() ? "active" : ""}`} onClick={toggleVacacionesSubmenu}>
                  <Plane size={20} className="nav-icon icon-red" />
                  Vacaciones
                  <ChevronLeft size={16} className={`nav-arrow ${vacacionesSubmenuOpen ? "open" : ""}`} />
                </div>
                {vacacionesSubmenuOpen && (
                  <div className="submenu">
                    <Link to="/vacaciones/solicitudes" className={`submenu-item ${location.pathname === "/vacaciones/solicitudes" ? "active" : ""}`}>
                      <FileText size={16} className="submenu-icon icon-red" /> Solicitudes
                    </Link>
                    <Link to="/vacaciones/crear" className={`submenu-item ${location.pathname === "/vacaciones/crear" ? "active" : ""}`}>
                      <Plus size={16} className="submenu-icon icon-red" /> Crear Solicitud
                    </Link>
                    <Link to="/vacaciones/historial" className={`submenu-item ${location.pathname === "/vacaciones/historial" ? "active" : ""}`}>
                      <BarChart3 size={16} className="submenu-icon icon-red" /> Historial
                    </Link>
                    {puedeAprobarVacaciones && (
                      <Link to="/vacaciones/aprobar" className={`submenu-item ${location.pathname === "/vacaciones/aprobar" ? "active" : ""}`}>
                        <CheckSquare size={16} className="submenu-icon icon-red" /> Aprobar Vacaciones
                      </Link>
                    )}
                  </div>
                )}
              </div>

              <Link to="/calendario" className="nav-item">
                <Calendar size={20} className="nav-icon icon-red" /> Calendario
              </Link>
              <Link to="/directorio" className="nav-item">
                <Users size={20} className="nav-icon icon-red" /> Directorio de usuarios
              </Link>

              {/* Mantenimiento - Solo Administradores */}
              {esAdmin && (
                <Link to="/mantenimiento" className="nav-item">
                  <Settings size={20} className="nav-icon icon-red" /> Mantenimiento
                </Link>
              )}
            </nav>
          </aside>

          {/* Main */}
          <main className="main-content">
            {isDashboardHome ? (
              <>
                <div className="welcome-section">
                  <div className="welcome-content">
                    <h1>Bienvenido, {usuario?.nombre} 👋</h1>
                    <p>Aquí tienes un resumen de lo que está pasando en la empresa.</p>
                  </div>
                  
                  <div className="almanaque-widget">
                    <div className="almanaque-header">
                      <button className="almanaque-nav-btn" onClick={() => {
                        const newDate = new Date(currentDate);
                        newDate.setMonth(newDate.getMonth() - 1);
                        setCurrentDate(newDate);
                      }}>‹</button>
                      <span>{currentDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }).toUpperCase()}</span>
                      <button className="almanaque-nav-btn" onClick={() => {
                        const newDate = new Date(currentDate);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setCurrentDate(newDate);
                      }}>›</button>
                    </div>
                    <div className="almanaque-body">
                      <div className="almanaque-days-header">
                        {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].map(day => (
                          <div key={day} className="almanaque-day-name">{day}</div>
                        ))}
                      </div>
                      <div className="almanaque-days-grid">
                        {(() => {
                          const year = currentDate.getFullYear();
                          const month = currentDate.getMonth();
                          const firstDay = new Date(year, month, 1).getDay();
                          const daysInMonth = new Date(year, month + 1, 0).getDate();
                          const today = new Date();
                          const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
                          
                          const days = [];
                          for (let i = 0; i < firstDay; i++) {
                            days.push(<div key={`empty-${i}`} className="almanaque-day-cell empty"></div>);
                          }
                          for (let i = 1; i <= daysInMonth; i++) {
                            const isToday = isCurrentMonth && i === today.getDate();
                            days.push(
                              <div key={i} className={`almanaque-day-cell ${isToday ? 'today' : ''}`}>
                                {i}
                              </div>
                            );
                          }
                          return days;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Destacados */}
                <div className="cards-grid">
                  <section className="card">
                    <h3>Publicación con más likes</h3>
                    {destacadoPorLikes ? (
                      <Link to={`/noticias/${destacadoPorLikes.ID_Noticia}`} className="highlight-link">
                        <div className="highlight-title">{destacadoPorLikes.Titulo}</div>
                        <div className="highlight-meta">
                          <ThumbsUp size={14} style={{ display: 'inline', marginRight: 4 }} /> {destacadoPorLikes.total_likes ?? 0} • {new Date(destacadoPorLikes.Fecha_Publicacion).toLocaleDateString()}
                        </div>
                      </Link>
                    ) : <p>Sin datos</p>}
                  </section>

                  <section className="card">
                    <h3>Publicación más reciente</h3>
                    {masReciente ? (
                      <Link to={`/noticias/${masReciente.ID_Noticia}`} className="highlight-link">
                        <div className="highlight-title">{masReciente.Titulo}</div>
                        <div className="highlight-meta">
                          {new Date(masReciente.Fecha_Publicacion).toLocaleDateString()}
                        </div>
                      </Link>
                    ) : <p>Sin datos</p>}
                  </section>

                  <section className="card">
                    <h3>Noticias más famosas</h3>
                    <ul className="list">
                      {topLikes.slice(0, 5).map((n) => (
                        <li key={n.ID_Noticia}>
                          <Link to={`/noticias/${n.ID_Noticia}`} className="link-row">
                            <span className="title">{n.Titulo}</span>
                            <span className="pill"><ThumbsUp size={12} style={{ display: 'inline', marginRight: 4 }} />{n.total_likes ?? 0}</span>
                          </Link>
                        </li>
                      ))}
                      {topLikes.length === 0 && <li>No hay noticias</li>}
                    </ul>
                  </section>

                  <section className="card">
                    <h3>Archivos recientes</h3>
                    <ul className="list">
                      {archivosRecientes.map((f) => (
                        <li key={f.id}>
                          <span className="title">{f.titulo}</span>
                          <a className="btn-link" href={f.url} target="_blank" rel="noreferrer">Ver</a>
                        </li>
                      ))}
                      {archivosRecientes.length === 0 && <li>Sin archivos</li>}
                    </ul>
                  </section>

                  <section className="card">
                    <h3>Encuestas recientes</h3>
                    <ul className="list">
                      {encuestasRecientes.map((e) => (
                        <li key={e.id}>
                          <Link className="link-row" to={e.url}>
                            <span className="title">{e.titulo}</span>
                            <span className="pill"><ExternalLink size={12} /></span>
                          </Link>
                        </li>
                      ))}
                      {encuestasRecientes.length === 0 && <li>Sin encuestas</li>}
                    </ul>
                  </section>
                </div>
              </>
            ) : (
              <Outlet />
            )}
          </main>

          {/* Sidebar derecha */}
          <aside className="right-sidebar">
            <div className="sidebar-section">
              <div className="section-header">
                <span className="section-title">¡Hoy! 🎉</span>
              </div>

              <div className="birthday-section">
                <h4>🎂 Cumpleaños</h4>
                <div className="avatar-list">
                  {cumpleaniosHoy.map((p) => (
                    <Link key={p.id} to={`/directorio/${p.id}`} className="avatar-item" title={p.nombre}>
                      <img
                        src={p.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nombre)}&background=cc0000&color=fff`}
                        alt={p.nombre}
                      />
                      <span className="avatar-name">{p.nombre}</span>
                    </Link>
                  ))}
                  {cumpleaniosHoy.length === 0 && <div className="empty-msg">Sin cumpleañeros hoy</div>}
                </div>
              </div>

              <div className="anniversary-section" style={{ marginTop: 16 }}>
                <h4>⭐ Aniversarios</h4>
                <div className="avatar-list">
                  {aniversariosHoy.map((p) => (
                    <Link key={p.id} to={`/directorio/${p.id}`} className="avatar-item" title={p.nombre}>
                      <img
                        src={p.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nombre)}&background=0f766e&color=fff`}
                        alt={p.nombre}
                      />
                      <span className="avatar-name">
                        {p.nombre}{p.anios != null ? ` • ${p.anios} año${p.anios === 1 ? "" : "s"}` : ""}
                      </span>
                    </Link>
                  ))}
                  {aniversariosHoy.length === 0 && <div className="empty-msg">Sin aniversarios hoy</div>}
                </div>
              </div>
            </div>

            {/* Tarjeta de estado de almuerzo */}
            <div className="sidebar-section almuerzo-card">
              <div className="almuerzo-icon-container">
                <Utensils size={24} className="almuerzo-icon" />
              </div>
              {almuerzoHoy === null ? (
                <div className="almuerzo-loading">Cargando...</div>
              ) : almuerzoHoy.tieneSolicitud ? (
                <>
                  <h4 className="almuerzo-title">Almuerzo registrado</h4>
                  <p className="almuerzo-message">
                    Ya solicitaste salida para ir a almorzar hoy
                    {almuerzoHoy.horaRegistro && ` a las ${almuerzoHoy.horaRegistro}`}
                  </p>
                </>
              ) : (
                <>
                  <h4 className="almuerzo-title-no">Sin registro</h4>
                  <p className="almuerzo-message">
                    Hoy no saldrás a almorzar
                  </p>
                  <Link to="/requerimientos/crear-almuerzo" className="btn-almuerzo">
                    Registrar almuerzo
                  </Link>
                </>
              )}
            </div>

            <div className="sidebar-section">
              <h4>Últimos archivos</h4>
              <ul className="list">
                {archivosRecientes.slice(0, 5).map((f) => (
                  <li key={f.id}>
                    <span className="title">{f.titulo}</span>
                    <a className="btn-link" href={f.url} target="_blank" rel="noreferrer">Ver</a>
                  </li>
                ))}
                {archivosRecientes.length === 0 && <li>Sin archivos</li>}
              </ul>
            </div>

            <div className="sidebar-section">
              <h4>Últimas noticias</h4>
              <ul className="list">
                {topLikes.slice(0, 5).map((n) => (
                  <li key={n.ID_Noticia}>
                    <Link to={`/noticias/${n.ID_Noticia}`} className="link-row">
                      <span className="title">{n.Titulo}</span>
                      <span className="pill"><ThumbsUp size={12} style={{ display: 'inline', marginRight: 4 }} />{n.total_likes ?? 0}</span>
                    </Link>
                  </li>
                ))}
                {topLikes.length === 0 && <li>Sin noticias</li>}
              </ul>
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
        .header-btn { background: rgba(255,255,255,0.1); border: none; color: white; width: 56px; height: 56px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
        .header-btn:hover { background: rgba(255,255,255,0.2); }

        .qa-dropdown { position: absolute; right: 0; top: 56px; width: 280px; background: #fff; border: 1px solid #e9ecef; border-radius: 12px; box-shadow: 0 12px 32px rgba(0,0,0,0.15); padding: 8px; z-index: 1200; }
        .qa-title { font-size: 12px; color: #6b7280; padding: 6px 8px; }
        .qa-list { list-style: none; padding: 0; margin: 0; }
        .qa-list li { padding: 10px 10px; border-radius: 8px; }
        .qa-list li a { text-decoration: none; color: #111827; display: block; font-size: 14px; }
        .qa-list li:hover { background: #f6f7f9; }

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
        .nav-item { display: flex; align-items: center; gap: 15px; padding: 14px 20px; text-decoration: none; color: #666; border-radius: 8px; transition: all 0.2s; position: relative; font-size: 16px; cursor: pointer; }
        .nav-item:hover { background: #f8f9fa; color: #333; }
        .nav-item.active { background: #cc0000; color: white; }
        .nav-icon { flex-shrink: 0; }
        .nav-arrow { margin-left: auto; transition: transform 0.2s; }
        .nav-arrow.open { transform: rotate(-90deg); }

        /* Colores para iconos */
        .icon-red { color: #cc0000; }
        
        /* Cuando el item está activo, los iconos son blancos */
        .nav-item.active .nav-icon,
        .submenu-item.active .submenu-icon { color: white !important; }

        .submenu { display: flex; flex-direction: column; }
        .submenu-item { display: flex; align-items: center; gap: 10px; padding: 10px 20px 10px 40px; text-decoration: none; color: #666; border-radius: 8px; transition: all 0.2s; }
        .submenu-item.active, .submenu-item:hover { background: #f8f9fa; color: #333; }
        .submenu-icon { flex-shrink: 0; }

        .main-content { display: flex; flex-direction: column; gap: 30px; overflow-y: auto; padding: 30px; }
        .welcome-section { 
          background: white; 
          padding: 40px; 
          border-radius: 12px; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
        }
        .welcome-content { flex: 1; }
        .welcome-section h1 { font-size: 32px; color: #333; margin-bottom: 12px; }
        .welcome-section p { color: #666; font-size: 18px; }

        /* Almanaque Widget */
        .almanaque-widget {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          width: 280px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          flex-shrink: 0;
        }
        .almanaque-header {
          background: #cc0000;
          color: white;
          text-align: center;
          padding: 12px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .almanaque-nav-btn {
          background: transparent;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 0 8px;
          transition: opacity 0.2s;
        }
        .almanaque-nav-btn:hover {
          opacity: 0.8;
        }
        .almanaque-body {
          padding: 12px;
          background: white;
        }
        .almanaque-days-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 8px;
        }
        .almanaque-day-name {
          font-size: 10px;
          font-weight: 700;
          color: #6b7280;
          text-align: center;
          padding: 4px 0;
        }
        .almanaque-days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        .almanaque-day-cell {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 500;
          color: #333;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .almanaque-day-cell:not(.empty):hover {
          background: #f3f4f6;
        }
        .almanaque-day-cell.empty {
          cursor: default;
        }
        .almanaque-day-cell.today {
          background: #cc0000;
          color: white;
          font-weight: 700;
        }

        .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
        .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px; }
        .highlight-link { display: block; text-decoration: none; color: inherit; }
        .highlight-title { font-weight: 600; margin: 6px 0; }
        .highlight-meta { font-size: 12px; color: #6b7280; display: flex; align-items: center; }

        .list { list-style: none; padding: 0; margin: 0; }
        .list li { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee; }
        .list li:last-child { border-bottom: none; }
        .title { font-weight: 500; }
        .link-row { display: flex; align-items: center; justify-content: space-between; width: 100%; text-decoration: none; color: inherit; }
        .pill { font-size: 12px; padding: 2px 8px; border-radius: 9999px; background: #eef2ff; display: flex; align-items: center; }
        .btn-link { font-size: 12px; padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 8px; text-decoration: none; }

        .right-sidebar { background: white; padding: 30px; border-left: 1px solid #e9ecef; overflow-y: auto; display: flex; flex-direction: column; gap: 30px; }
        .sidebar-section { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .section-title { font-weight: 600; }

        .avatar-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .avatar-item { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #111827; }
        .avatar-item img { width: 36px; height: 36px; border-radius: 9999px; object-fit: cover; border: 1px solid #e5e7eb; }
        .avatar-name { font-size: 13px; }
        .empty-msg { font-size: 12px; color: #6b7280; }

        /* Estilos para tarjeta de almuerzo */
        .almuerzo-card {
          text-align: center;
          position: relative;
          overflow: visible;
          padding: 16px !important;
        }
        .almuerzo-icon-container {
          display: flex;
          justify-content: center;
          margin-bottom: 8px;
        }
        .almuerzo-icon {
          color: #cc0000;
        }
        .almuerzo-loading {
          color: #6b7280;
          font-size: 13px;
          padding: 10px;
        }
        .almuerzo-title {
          font-size: 14px;
          font-weight: 600;
          color: #059669;
          margin: 0 0 8px 0;
        }
        .almuerzo-title-no {
          font-size: 14px;
          font-weight: 600;
          color: #dc2626;
          margin: 0 0 8px 0;
        }
        .almuerzo-message {
          font-size: 12px;
          color: #4b5563;
          line-height: 1.4;
          margin: 0 0 12px 0;
        }
        .btn-almuerzo {
          display: inline-block;
          padding: 8px 16px;
          background: #cc0000;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .btn-almuerzo:hover {
          background: #b30000;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(204, 0, 0, 0.3);
        }

        @media (max-width: 1200px) {
          .dashboard-content { grid-template-columns: 300px 1fr 300px; }
        }
        @media (max-width: 992px) {
          .dashboard-content { grid-template-columns: 250px 1fr 250px; }
          .sidebar, .right-sidebar { padding: 20px; }
          .main-content { padding: 20px; }
        }
        .logo-img { height: 60px; width: auto; display: block; }
        .logo-text { color: white; font-size: 14px; opacity: 0.9; }
        @media (max-width: 768px) {
          .dashboard-content { grid-template-columns: 1fr; grid-template-rows: auto auto auto; }
          .sidebar, .right-sidebar { width: 100%; }
          .right-sidebar { border-left: none; border-top: 1px solid #e9ecef; }
          .main-content { order: -1; }
          .welcome-section { flex-direction: column; align-items: flex-start; }
          .almanaque-widget { align-self: center; }
        }

        /* Estilos para notificaciones */
        .notif-container { position: relative; }
        .notif-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: white;
          border-radius: 9999px;
          font-size: 11px;
          min-width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          padding: 0 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .notif-panel {
          position: absolute;
          right: 0;
          top: 60px;
          width: 400px;
          max-height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.15);
          border: 1px solid #e5e7eb;
          z-index: 1200;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .notif-header {
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .notif-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }
        .notif-count {
          font-size: 12px;
          color: #6b7280;
          background: #fee2e2;
          padding: 4px 10px;
          border-radius: 9999px;
          font-weight: 500;
        }
        .notif-list {
          overflow-y: auto;
          max-height: 420px;
        }
        .notif-empty {
          padding: 60px 20px;
          text-align: center;
        }
        .notif-empty-icon {
          color: #d1d5db;
          margin: 0 auto 16px;
        }
        .notif-empty-text {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }
        .notif-item {
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          transition: all 0.2s;
          cursor: pointer;
        }
        .notif-item:hover {
          background: #f9fafb;
        }
        .notif-item:last-child {
          border-bottom: none;
        }
        .notif-item-unread {
          background: linear-gradient(to right, #fef2f2 0%, #fff5f5 100%);
          border-left: 4px solid #ef4444;
          box-shadow: inset 0 0 0 1px rgba(239, 68, 68, 0.1);
        }
        .notif-item-unread:hover {
          background: linear-gradient(to right, #fee2e2 0%, #fef2f2 100%);
        }
        .notif-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .notif-item-title {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }
        .notif-item-unread .notif-item-title {
          color: #991b1b;
          font-weight: 700;
        }
        .notif-item-dot {
          width: 10px;
          height: 10px;
          background: #ef4444;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .notif-item-message {
          font-size: 13px;
          color: #4b5563;
          margin: 0 0 8px 0;
          line-height: 1.5;
        }
        .notif-item-unread .notif-item-message {
          color: #374151;
          font-weight: 500;
        }
        .notif-item-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .notif-item-date {
          font-size: 11px;
          color: #9ca3af;
        }
        .notif-item-type {
          font-size: 11px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 2px 8px;
          border-radius: 9999px;
          font-weight: 500;
        }
        .notif-item-link {
          display: inline-block;
          margin-top: 8px;
          font-size: 12px;
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
        }
        .notif-item-link:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}

export default Dashboard;