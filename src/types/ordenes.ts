export type EstadoOrden = 'PENDIENTE' | 'PAGADO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';

export const ESTADOS_ORDEN: Record<EstadoOrden, { texto: string; color: string }> = {
  PENDIENTE: { texto: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  PAGADO: { texto: 'Pagado', color: 'bg-blue-100 text-blue-800' },
  EN_CAMINO: { texto: 'En camino', color: 'bg-purple-100 text-purple-800' },
  ENTREGADO: { texto: 'Entregado', color: 'bg-green-100 text-green-800' },
  CANCELADO: { texto: 'Cancelado', color: 'bg-gray-200 text-gray-700' },
};

// Solo para decidir qué botones mostrar. La regla real la valida la API:
// si se intenta un salto inválido, responde 400 con el motivo.
export const ACCIONES_POR_ESTADO: Record<EstadoOrden, { destino: EstadoOrden; texto: string }[]> = {
  PENDIENTE: [{ destino: 'PAGADO', texto: 'Marcar pagado' }, { destino: 'CANCELADO', texto: 'Cancelar' }],
  PAGADO: [{ destino: 'EN_CAMINO', texto: 'Enviar' }, { destino: 'CANCELADO', texto: 'Cancelar' }],
  EN_CAMINO: [{ destino: 'ENTREGADO', texto: 'Marcar entregado' }, { destino: 'CANCELADO', texto: 'Cancelar' }],
  ENTREGADO: [],
  CANCELADO: [],
};

export interface DetalleOrden {
  id: number;
  productoId: number;
  cantidad: number;
  precioUnitario: string;
  producto: { id: number; nombre: string };
}

export interface Orden {
  id: number;
  clienteId: number | null; // null = orden manual (venta por redes)
  nombreContacto: string;
  telefonoContacto: string;
  direccionEnvio: string;
  referencias: string | null;
  total: string; // solo productos: no hay costo de envío
  estado: EstadoOrden;
  fecha: string;
  detalles: DetalleOrden[];
}

export interface Direccion {
  id: number;
  calle: string;
  ciudad: string;
  referencias: string | null;
}

export interface ItemCarrito {
  id: number;
  productoId: number;
  cantidad: number;
  producto: { id: number; nombre: string; precioVenta: string; stock: number };
}

export interface Carrito {
  id: number;
  items: ItemCarrito[];
  total: string;
}

export interface OrdenManualInput {
  nombreContacto: string;
  telefonoContacto: string;
  direccionEnvio: string;
  referencias?: string;
  items: { productoId: number; cantidad: number }[];
}