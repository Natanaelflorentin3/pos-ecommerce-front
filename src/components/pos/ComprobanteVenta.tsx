import { formatoPrecio } from '../../utils/formato';
import { formatoFechaHora } from '../../utils/fecha';
import { METODOS_PAGO, type Venta } from '../../types/ventas';

export function ComprobanteVenta({ venta, onCerrar }: { venta: Venta; onCerrar: () => void }) {
  const metodo = METODOS_PAGO.find((m) => m.valor === venta.metodoPago)?.texto ?? '-';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl">✓</div>
          <h2 className="text-xl font-bold mt-2">Venta registrada</h2>
          <p className="text-sm text-gray-500">
            Comprobante #{venta.id} · {formatoFechaHora(venta.fecha)}
          </p>
          <p className="text-sm text-gray-500">Cajero: {venta.cajero.nombre} {venta.cajero.apellido}</p>
        </div>

        <table className="w-full text-sm">
          <tbody>
            {venta.detalles.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="py-1">{d.cantidad} × {d.producto.nombre}</td>
                <td className="py-1 text-right">{formatoPrecio(Number(d.precioUnitario) * d.cantidad)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t pt-2 space-y-1">
          <div className="flex justify-between font-bold text-lg">
            <span>Total cobrado</span>
            <span>{formatoPrecio(venta.total)}</span>
          </div>
          <p className="text-sm text-gray-600">Pago: {metodo}</p>
        </div>

        <button onClick={onCerrar} autoFocus className="w-full bg-blue-600 text-white rounded-lg py-2">
          Nueva venta
        </button>
      </div>
    </div>
  );
}