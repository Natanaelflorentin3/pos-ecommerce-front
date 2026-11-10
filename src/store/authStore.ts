import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UsuarioSesion } from '../types/auth';
import { decodificarToken } from '../utils/token';

interface AuthState {
  token: string | null;
  usuario: UsuarioSesion | null;
  iniciarSesion: (token: string) => void;
  cerrarSesion: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      iniciarSesion: (token) => set({ token, usuario: decodificarToken(token) }),
      cerrarSesion: () => set({ token: null, usuario: null }),
    }),
    {
      name: 'pos-auth',
      // Al recargar la página, si el token venció, la sesión se descarta
      onRehydrateStorage: () => (state) => {
        if (state?.token && !decodificarToken(state.token)) state.cerrarSesion();
      },
    },
  ),
);