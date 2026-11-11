import type { MetodoPago } from './ventas';

export type ResultadoCaja = 'CUADRA' | 'SOBRANTE' | 'FALTANTE' | 'CAJA ABIERTA';

// Lo que devuelve GET /cajas/:id/conciliacion y POST /cajas/cerrar
export interface Conciliacion {
  cajaId: number;
  estado: 'ABIERTA' | 'CERRADA';
  cajero: { id: number; nombre: string; apellido: string };
  abiertaEn: string;
  cerradaEn: string | null;
  montoInicial: string;
  ventasPorMetodo: { metodoPago: MetodoPago; cantidad: number; total: string | null }[];
  totalVentas: string;
  efectivoEsperado: string;
  montoFinalDeclarado: string | null;
  diferencia: string | null;
  resultado: ResultadoCaja;
}

// Lo que devuelve GET /cajas (historial de cajas)
export interface CajaListado {
  id: number;
  estado: 'ABIERTA' | 'CERRADA';
  montoInicial: string;
  montoFinalDeclarado: string | null;
  abiertaEn: string;
  cerradaEn: string | null;
  usuario: { id: number; nombre: string; apellido: string };
}