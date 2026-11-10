import { ESTADOS_ORDEN, type EstadoOrden } from '../types/ordenes';

export function EstadoBadge({ estado }: { estado: EstadoOrden }) {
  const { texto, color } = ESTADOS_ORDEN[estado];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{texto}</span>;
}