import { api } from './axios';
import type { CajaListado, Conciliacion } from '../types/caja';

export async function cerrarCaja(montoFinalDeclarado: number) {
  const { data } = await api.post<Conciliacion>('/cajas/cerrar', { montoFinalDeclarado });
  return data;
}

export async function obtenerConciliacion(cajaId: number) {
  const { data } = await api.get<Conciliacion>(`/cajas/${cajaId}/conciliacion`);
  return data;
}

export async function listarCajas() {
  const { data } = await api.get<CajaListado[]>('/cajas');
  return data;
}