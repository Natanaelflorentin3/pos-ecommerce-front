import type { Rol } from '../types/auth';

export const destinoPorRol = (rol: Rol) => (rol === 'CLIENTE' ? '/' : '/panel');