import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./styles/centro.css";

import Login from './pages/Principales/Login';
import Dashboard from './pages/Principales/Dashboard';

import CrearEmpleado from './pages/Empleado/CrearEmpleado';
import Empleados from './pages/Empleado/Empleados';
import EditarEmpleado from './pages/Empleado/EditarEmpleado';

import CrearUsuario from './pages/Usuario/CrearUsuario';
import Usuarios from './pages/Usuario/Usuarios';
import EditarUsuario from './pages/Usuario/EditarUsuario';

import ListaNoticias from './pages/Noticias/Noticias';
import CrearNoticia from './pages/Noticias/CrearNoticia';
import EditarNoticia from './pages/Noticias/EditarNoticia';
import ComentariosNoticia from './pages/Noticias/ComentarioNoticia';
import DetalleNoticia from './pages/Noticias/VerNoticia';

import MiPerfil from './pages/Principales/MiPerfil';

import Solicitudes from './pages/Vacaciones/Solicitudes';
import CrearVacacion from './pages/Vacaciones/Crear';
import Historial from './pages/Vacaciones/Historial';
import AprobarVacaciones from './pages/Vacaciones/Aprobar';

import SolicitudIndex from './pages/Requerimientos/Index';
import CrearCarta from './pages/Requerimientos/CrearCarta';
import CrearBoleta from './pages/Requerimientos/CrearBoleta';
import CrearSalida from './pages/Requerimientos/CrearSalida';
import CrearAlmuerzo from './pages/Requerimientos/CrearAlmuerzo';
import MisSolicitudes from './pages/Requerimientos/MisSolicitudes';
import Pendientes from './pages/Requerimientos/Pendientes';
import DetalleSolicitud from './pages/Requerimientos/DetalleSolicitud';
import AlmuerzoListaPrint from './pages/Requerimientos/AlmuerzoListaPrint';
import AlmuerzoLista from './pages/Requerimientos/AlmuerzoLista';

import DirectorioLista from "./pages/Directorio/DirectorioLista";
import DirectorioDetalle from "./pages/Directorio/DirectorioDetalle";

import Calendario from './pages/Calendario/Calendario';
import GuiaIntranet from "./pages/Informacion/GuiaIntranet";
import Informacion from "./pages/Informacion/info";
import Galeria from "./pages/Galeria/Galeria";
import ArchivosCorporativos  from './pages/ArchivosCorporativos/ArchivosCorporativos';
import Encuestas from './pages/Encuestas/Encuestas';
import ReporteVacaciones from './pages/Vacaciones/Reporte';
import Mantenimiento from './pages/Mantenimiento/Mantenimiento';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Login fuera del layout */}
        <Route path="/" element={<Login />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="requerimientos/almuerzo-lista-Print" element={<AlmuerzoListaPrint />} />

          {/* Todo lo demás se muestra DENTRO del Dashboard (layout + Outlet) */}
          <Route path="/" element={<Dashboard />}>
          {/* Home del dashboard (el padre ya pinta el contenido cuando la ruta es /dashboard) */}
          <Route path="dashboard" element={<div />} />

          {/* Usuario / Perfil */}
          <Route path="mi-perfil" element={<MiPerfil />} />

          {/* Empleados */}
          <Route path="crear-empleado" element={<CrearEmpleado />} />
          <Route path="empleados" element={<Empleados />} />
          <Route path="editar-empleado/:id" element={<EditarEmpleado />} />

          {/* Usuarios */}
          <Route path="crear-usuario" element={<CrearUsuario />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="editar-usuario/:id" element={<EditarUsuario />} />

          {/* Noticias */}
          <Route path="noticias" element={<ListaNoticias />} />
          <Route path="noticias/nueva" element={<CrearNoticia />} />
          <Route path="noticias/editar/:id" element={<EditarNoticia />} />
          <Route path="noticias/:id/comentarios" element={<ComentariosNoticia />} />
          <Route path="noticias/:id" element={<DetalleNoticia />} />

          {/* Vacaciones */}
          <Route path="vacaciones" element={<Solicitudes />} />
          <Route path="vacaciones/solicitudes" element={<Solicitudes />} />
          <Route path="vacaciones/crear" element={<CrearVacacion />} />
          <Route path="vacaciones/historial" element={<Historial />} />
          <Route path="vacaciones/aprobar" element={<AprobarVacaciones />} />
          <Route path="vacaciones/reporte" element={<ReporteVacaciones />} />


          {/* Centro de Requerimientos */}
          <Route path="requerimientos" element={<SolicitudIndex />} />
          <Route path="requerimientos/crear-carta" element={<CrearCarta />} />
          <Route path="requerimientos/crear-boleta" element={<CrearBoleta />} />
          <Route path="requerimientos/crear-salida" element={<CrearSalida />} />
          <Route path="requerimientos/crear-almuerzo" element={<CrearAlmuerzo />} />
          <Route path="requerimientos/mis-solicitudes" element={<MisSolicitudes />} />
          <Route path="requerimientos/pendientes" element={<Pendientes />} />
          <Route path="requerimientos/detalle/:id" element={<DetalleSolicitud />} />
          <Route path="requerimientos/almuerzo-lista" element={<AlmuerzoLista />} />

          {/* Directorio */}
          <Route path="/directorio" element={<DirectorioLista />} />
          <Route path="/directorio/:id" element={<DirectorioDetalle />} />

          {/* Calendario */}
          <Route path="calendario" element={<Calendario />} />

          <Route path="centro" element={<SolicitudIndex />} />
          <Route path="/info/guia" element={<GuiaIntranet />} />
          <Route path="informacion" element={<Informacion />} />
          <Route path="galeria/*" element={<Galeria />} />
          <Route path="archivos" element={<ArchivosCorporativos />} />
          <Route path="encuestas" element={<Encuestas />} />

          {/* Mantenimiento */}
          <Route path="mantenimiento" element={<Mantenimiento />} />

          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App; 
