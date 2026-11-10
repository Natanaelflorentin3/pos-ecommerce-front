export type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA_QR';

export const METODOS_PAGO: { valor: MetodoPago; texto: string }[] = [
  { valor: 'EFECTIVO', texto: 'Efectivo' },
  { valor: 'TARJETA', texto: 'Tarjeta' },
  { valor: 'TRANSFERENCIA_QR', texto: 'Transferencia / QR' },
];

export interface Caja {
  id: number;
  estado: 'ABIERTA' | 'CERRADA';
  montoInicial: string;
  abiertaEn: string;
}

export interface DetalleVenta {
  id: number;
  productoId: number;
  cantidad: number;
  precioUnitario: string; // precio congelado al momento de la venta
  producto: { id: number; nombre: string };
}

// Lo que devuelve la API como "comprobante"
export interface Venta {
  id: number;
  fecha: string;
  estado: 'ABIERTA' | 'COMPLETADA' | 'CANCELADA';
  metodoPago: MetodoPago | null;
  total: string;
  totalCalculado: string;
  cajero: { id: number; nombre: string; apellido: string };
  detalles: DetalleVenta[];
}

export interface HistorialDia {
  fecha: string;
  cantidadVentas: number;
  totalDelDia: string;
  ventas: Venta[];
}