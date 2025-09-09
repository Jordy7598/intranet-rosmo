
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Principales/Login';
import Dashboard from './pages/Principales/Dashboard';
import CrearEmpleado from './pages/Empleado/CrearEmpleado';
import Empleados from './pages/Empleado/Empleados';
import CrearUsuario from './pages/Usuario/CrearUsuario';
import Usuarios from './pages/Usuario/Usuarios';
import EditarEmpleado from './pages/Empleado/EditarEmpleado';
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






function App() {
  /*const [mensaje, setMensaje] = useState('Cargando...');

  useEffect(() => {
    api.get('/ping')
      .then(res => setMensaje(res.data.message))
      .catch(() => setMensaje('Error al conectar con backend'));
  }, []);*/

  return (
    <Router>
  <div>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/crear-empleado" element={<CrearEmpleado />} />
      <Route path="/empleados" element={<Empleados />} />
      <Route path="/crear-usuario" element={<CrearUsuario />} />
      <Route path="/usuarios" element={<Usuarios />} />
      <Route path="/editar-usuario/:id" element={<EditarUsuario />} />
      <Route path="/editar-empleado/:id" element={<EditarEmpleado />} />
      <Route path="/noticias" element={<ListaNoticias />} />
      <Route path="/noticias/nueva" element={<CrearNoticia />} />
      <Route path="/noticias/editar/:id" element={<EditarNoticia />} /> 
      <Route path="/noticias/:id/comentarios" element={<ComentariosNoticia />} />
      <Route path="/noticias/:id" element={<DetalleNoticia />} />
      <Route path="/mi-perfil" element={<MiPerfil />} />
      <Route path="/vacaciones" element={<Solicitudes />} />
      <Route path="/vacaciones/solicitudes" element={<Solicitudes />} />
      <Route path="/vacaciones/crear" element={<CrearVacacion />} />
      <Route path="/vacaciones/historial" element={<Historial />} />
      <Route path="/vacaciones/aprobar" element={<AprobarVacaciones />} />


    </Routes>
  </div>
</Router>

  );
}

export default App;
