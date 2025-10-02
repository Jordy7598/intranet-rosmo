import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Interceptor para agregar el token automáticamente
api.interceptors.request.use((config) => {
  const t = localStorage.getItem('token');
  if (t) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      // Solo para 401 (no autenticado) limpiar y redirigir
      localStorage.removeItem('token');
      localStorage.removeItem('usuario_nombre');
      localStorage.removeItem('usuario_rol');
      window.location.href = '/';
    }
    // Para 403 (sin permisos) no redirigir, dejar que el componente maneje el error
    return Promise.reject(error);
  }
);

export default api;
// 8.33333 
// (meses trabajados / 12 meses) * 15 días