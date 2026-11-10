import { api } from './axios';
import type { Carrito, Direccion, Orden } from '../types/ordenes';

// ─── Carrito del cliente web (la API devuelve siempre el carrito actualizado) ───
export async function verCarrito() {
  const { data } = await api.get<Carrito>('/carrito');
  return data;
}

export async function agregarItemCarrito(productoId: number, cantidad: number) {
  const { data } = await api.post<Carrito>('/carrito/items', { productoId, cantidad });
  return data;
}

export async function quitarItemCarrito(productoId: number) {
  const { data } = await api.delete<Carrito>(`/carrito/items/${productoId}`);
  return data;
}

// ─── Direcciones ───
export async function listarDirecciones() {
  const { data } = await api.get<Direccion[]>('/clientes/me/direcciones');
  return data;
}

export async function crearDireccion(datos: { calle: string; ciudad: string; referencias?: string }) {
  const { data } = await api.post<Direccion>('/clientes/me/direcciones', datos);
  return data;
}

// ─── Checkout y pedidos ───
export async function confirmarPedido(direccionId: number) {
  const { data } = await api.post<Orden>('/ordenes/checkout', { direccionId });
  return data;
}

export async function obtenerMisPedidos() {
  const { data } = await api.get<Orden[]>('/ordenes/mis-ordenes');
  return data;
}