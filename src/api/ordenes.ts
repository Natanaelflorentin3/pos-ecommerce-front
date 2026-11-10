import { api } from './axios';
import type { EstadoOrden, Orden, OrdenManualInput } from '../types/ordenes';

export async function listarOrdenes(estado?: EstadoOrden) {
  const { data } = await api.get<Orden[]>('/ordenes', { params: estado ? { estado } : {} });
  return data;
}

export async function cambiarEstadoOrden(id: number, estado: EstadoOrden) {
  const { data } = await api.patch<Orden>(`/ordenes/${id}/estado`, { estado });
  return data;
}

export async function crearOrdenManual(datos: OrdenManualInput) {
  const { data } = await api.post<Orden>('/ordenes/manual', datos);
  return data;
}