import { calcularTotal, usePosStore } from '../../store/posStore';
import { formatoPrecio } from '../../utils/formato';
import { METODOS_PAGO } from '../../types/ventas';

interface Props {
  procesando: boolean;
  error: string;
  onConfirmar: () => void;
}

export function CarritoPos({ procesando, error, onConfirmar }: Props) {
  const { items, metodoPago, cambiarCantidad, quitar, setMetodoPago, vaciar } = usePosStore();
  const total = calcularTotal(items);

  return (
    <aside className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3 h-fit lg:sticky lg:top-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Venta actual</h2>
        {items.length > 0 && !procesando && (
          <button onClick={vaciar} className="text-sm text-gray-500 hover:underline">Vaciar</button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm py-6 text-center">Tocá un producto para agregarlo.</p>
      ) : (
        <ul className="divide-y">
          {items.map((i) => (
            <li key={i.productoId} className="py-2 flex items-center gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium">{i.nombre}</p>
                <p className="text-xs text-gray-500">{formatoPrecio(i.precio)} c/u · stock {i.stock}</p>
              </div>
              <button disabled={procesando} onClick={() => cambiarCantidad(i.productoId, i.cantidad - 1)}
                className="w-7 h-7 rounded border">−</button>
              <input type="number" min={1} value={i.cantidad} disabled={procesando}
                onChange={(e) => e.target.value !== '' && cambiarCantidad(i.productoId, Number(e.target.value))}
                className="w-14 border rounded text-center" />
              <button disabled={procesando} onClick={() => cambiarCantidad(i.productoId, i.cantidad + 1)}
                className="w-7 h-7 rounded border">+</button>
              <span className="w-24 text-right text-sm font-semibold">{formatoPrecio(i.precio * i.cantidad)}</span>
              <button disabled={procesando} onClick={() => quitar(i.productoId)} className="text-red-500 px-1">✕</button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-between text-xl font-bold border-t pt-3">
        <span>Total</span>
        <span>{formatoPrecio(total)}</span>
      </div>

      <div>
        <p className="text-sm mb-1">Método de pago</p>
        <div className="grid grid-cols-3 gap-2">
          {METODOS_PAGO.map((m) => (
            <button key={m.valor} disabled={procesando} onClick={() => setMetodoPago(m.valor)}
              className={`text-sm rounded-lg border p-2 ${metodoPago === m.valor ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}>
              {m.texto}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="bg-red-100 text-red-700 p-3 rounded text-sm">{error}</p>}

      <button onClick={onConfirmar} disabled={items.length === 0 || procesando}
        className="bg-green-600 text-white rounded-lg py-3 font-semibold disabled:bg-gray-300 flex items-center justify-center gap-2">
        {procesando && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {procesando ? 'Procesando venta...' : `Cobrar ${formatoPrecio(total)}`}
      </button>
    </aside>
  );
}