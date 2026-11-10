import type { ReactNode } from 'react';
import { EstadoBadge } from '../EstadoBadge';
import { formatoPrecio } from '../../utils/formato';
import { formatoFechaHora } from '../../utils/fecha';
import type { Orden } from '../../types/ordenes';

// Misma orden, distintas vistas: el cliente la ve sin acciones,
// el staff ve además el contacto y los botones (por `acciones`)
export function OrdenCard({ orden, vistaStaff = false, acciones }: { orden: Orden; vistaStaff?: boolean; acciones?: ReactNode }) {
  return (
    <article className="bg-white rounded-xl shadow-sm p-4 space-y-3">
      <header className="flex flex-wrap items-center gap-2">
        <h3 className="font-bold">Orden #{orden.id}</h3>
        <EstadoBadge estado={orden.estado} />
        {vistaStaff && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
            {orden.clienteId ? 'Tienda web' : 'Manual (redes)'}
          </span>
        )}
        <span className="ml-auto text-sm text-gray-500">{formatoFechaHora(orden.fecha)}</span>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 text-sm">
        <div>
          <p className="text-gray-500 text-xs uppercase">Envío a</p>
          {vistaStaff && <p className="font-medium">{orden.nombreContacto} · {orden.telefonoContacto}</p>}
          <p>{orden.direccionEnvio}</p>
          {orden.referencias && <p className="text-gray-600">Ref.: {orden.referencias}</p>}
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase">Productos</p>
          <ul>
            {orden.detalles.map((d) => (
              <li key={d.id} className="flex justify-between">
                <span>{d.cantidad} × {d.producto.nombre}</span>
                <span>{formatoPrecio(Number(d.precioUnitario) * d.cantidad)}</span>
              </li>
            ))}
          </ul>
          <p className="flex justify-between font-bold border-t mt-1 pt-1">
            <span>Total</span>
            <span>{formatoPrecio(orden.total)}</span>
          </p>
        </div>
      </div>

      {acciones}
    </article>
  );
}