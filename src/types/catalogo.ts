import type { Rol } from './auth';

export interface Categoria {
  id: number;
  nombre: string;
}

// Lo que devuelve GET /productos (vitrina pública): NO trae costo
export interface ProductoPublico {
  id: number;
  nombre: string;
  descripcion: string | null;
  precioVenta: string; // Decimal: llega como texto
  stock: number;
  categoria: Categoria;
}

// Lo que devuelve GET /productos/inventario (staff)
export interface ProductoInventario extends ProductoPublico {
  categoriaId: number;
  activo: boolean;
  costo?: string; // solo viene si el usuario es ADMIN
}

// Lo que se manda al crear o editar
export interface ProductoInput {
  nombre: string;
  descripcion?: string;
  costo: number;
  precioVenta: number;
  stock: number;
  categoriaId: number;
}

export interface UsuarioSistema {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: Rol;
  activo: boolean;
}

export interface UsuarioInput {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: 'ADMIN' | 'CAJERO';
}