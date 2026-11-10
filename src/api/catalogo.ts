import { api } from './axios';
import type {
  Categoria,
  ProductoInput,
  ProductoInventario,
  ProductoPublico,
} from '../types/catalogo';

const filtro = (categoriaId?: number) => (categoriaId ? { categoriaId } : {});

export async function obtenerCategorias() {
  const { data } = await api.get<Categoria[]>('/categorias');
  return data;
}

// Público: la API ya excluye el costo, los inactivos y los de stock 0
export async function obtenerCatalogo(categoriaId?: number) {
  const { data } = await api.get<ProductoPublico[]>('/productos', { params: filtro(categoriaId) });
  return data;
}

// Staff: incluye inactivos; el costo solo llega si sos ADMIN
export async function obtenerInventario(categoriaId?: number) {
  const { data } = await api.get<ProductoInventario[]>('/productos/inventario', {
    params: filtro(categoriaId),
  });
  return data;
}

export async function crearProducto(datos: ProductoInput) {
  const { data } = await api.post('/productos', datos);
  return data;
}

export async function actualizarProducto(id: number, datos: Partial<ProductoInput>) {
  const { data } = await api.patch(`/productos/${id}`, datos);
  return data;
}

export async function desactivarProducto(id: number) {
  const { data } = await api.delete(`/productos/${id}`);
  return data;
}

export async function agregarAlCarrito(productoId: number, cantidad = 1) {
  const { data } = await api.post('/carrito/items', { productoId, cantidad });
  return data;
}