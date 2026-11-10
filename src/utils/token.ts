import type { Rol, UsuarioSesion } from '../types/auth';

interface PayloadJwt {
  sub: number;
  email: string;
  rol: Rol;
  exp: number;
}

export function decodificarToken(token: string): UsuarioSesion | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64)) as PayloadJwt;
    if (payload.exp * 1000 < Date.now()) return null; // vencido
    return { id: Number(payload.sub), email: payload.email, rol: payload.rol };
  } catch {
    return null;
  }
}