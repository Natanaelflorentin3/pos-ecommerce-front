import axios from 'axios';
import { api } from './axios';
import type { ItemPos } from '../store/posStore';
import type { Caja, HistorialDia, MetodoPago, Venta } from '../types/ventas';

// Devuelve null si el cajero no tiene caja abierta (la API responde 404)
export async function obtenerCajaActual(): Promise<Caja | null> {
  try {
    const { data } = await api.get<Caja>('/cajas/actual');
    return data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) return null;
    throw e;
  }
}

export async function abrirCaja(montoInicial: number) {
  const { data } = await api.post<Caja>('/cajas/abrir', { montoInicial });
  return data;
}

// Venta completa: abrir → agregar items → cobrar.
// Si algo falla (ej: stock insuficiente), se cancela la venta en la API
// para que no quede ABIERTA y bloquee el cierre de caja.
export async function procesarVenta(items: ItemPos[], metodoPago: MetodoPago) {
  const { data: venta } = await api.post<Venta>('/ventas');
  try {
    for (const item of items) {
      await api.post(`/ventas/${venta.id}/items`, {
        productoId: item.productoId,
        cantidad: item.cantidad,
      });
    }
    const { data } = await api.post<Venta>(`/ventas/${venta.id}/cobrar`, { metodoPago });
    return data;
  } catch (error) {
    await api.post(`/ventas/${venta.id}/cancelar`).catch(() => undefined);
    throw error; // el mensaje original de la API llega a la pantalla
  }
}

export async function obtenerHistorial(fecha: string) {
  const { data } = await api.get<HistorialDia>('/ventas', { params: { fecha } });
  return data;
}