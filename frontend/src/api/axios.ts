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
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      window.location.href = '/dashboard';
    }
    return Promise.reject(error);
  }
);

export default api;
