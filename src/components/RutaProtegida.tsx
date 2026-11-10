import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { Rol } from '../types/auth';

export function RutaProtegida({ roles }: { roles: Rol[] }) {
  const usuario = useAuthStore((s) => s.usuario);

  if (!usuario) return <Navigate to="/login" replace />;
  if (!roles.includes(usuario.rol)) {
    return <Navigate to={usuario.rol === 'CLIENTE' ? '/' : '/panel'} replace />;
  }
  return <Outlet />;
}