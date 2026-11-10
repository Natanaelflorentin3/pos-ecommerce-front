export type Rol = 'ADMIN' | 'CAJERO' | 'CLIENTE';

export interface UsuarioSesion {
  id: number;
  email: string;
  rol: Rol;
}