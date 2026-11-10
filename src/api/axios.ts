import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Agrega el token a cada pedido
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si la API responde 401 (token vencido o inválido), se cierra la sesión
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401 && useAuthStore.getState().token) {
      useAuthStore.getState().cerrarSesion();
    }
    return Promise.reject(error);
  },
);

// Nest devuelve message como string o como array (errores de validación)
export function mensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (Array.isArray(msg)) return msg.join('. ');
    if (typeof msg === 'string') return msg;
    if (!error.response) return 'No se pudo conectar con el servidor (puede estar despertando, probá en 30 segundos)';
  }
  return 'Ocurrió un error inesperado';
}