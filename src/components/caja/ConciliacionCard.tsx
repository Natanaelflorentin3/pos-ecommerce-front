import { formatoPrecio } from '../../utils/formato';
import { formatoFechaHora } from '../../utils/fecha';
import { METODOS_PAGO } from '../../types/ventas';
import type { Conciliacion } from '../../types/caja';

const ESTILO_RESULTADO = {
  CUADRA: 'bg-green-100 text-green-800 border-green-300',
  SOBRANTE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  FALTANTE: 'bg-red-100 text-red-800 border-red-300',
  'CAJA ABIERTA': 'bg-gray-100 text-gray-700 border-gray-300',
};

// Muestra los números que llevan al resultado, no solo "cuadra / no cuadra"
export function ConciliacionCard({ c }: { c: Conciliacion }) {
  const efectivo = c.ventasPorMetodo.find((v) => v.metodoPago === 'EFECTIVO');
  const diferencia = c.diferencia !== null ? Number(c.diferencia) : null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
      <div className="flex flex-wrap justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">Caja #{c.cajaId} · {c.cajero.nombre} {c.cajero.apellido}</h2>
          <p className="text-sm text-gray-500">
            Abierta {formatoFechaHora(c.abiertaEn)}
            {c.cerradaEn && ` · Cerrada ${formatoFechaHora(c.cerradaEn)}`}
          </p>
        </div>
        <span className={`self-start border px-3 py-1 rounded-full font-bold ${ESTILO_RESULTADO[c.resultado]}`}>
          {c.resultado}
        </span>
      </div>

      <div>
        <p className="text-sm font-medium mb-1">Ventas del POS en esta caja</p>
        <table className="w-full text-sm">
          <tbody>
            {METODOS_PAGO.map((m) => {
              const fila = c.ventasPorMetodo.find((v) => v.metodoPago === m.valor);
              return (
                <tr key={m.valor} className="border-t">
                  <td className="py-1">{m.texto}</td>
                  <td className="py-1 text-gray-500">{fila?.cantidad ?? 0} venta(s)</td>
                  <td className="py-1 text-right">{formatoPrecio(fila?.total ?? 0)}</td>
                </tr>
              );
            })}
            <tr className="border-t font-semibold">
              <td className="py-1">Total vendido</td>
              <td></td>
              <td className="py-1 text-right">{formatoPrecio(c.totalVentas)}</td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs text-gray-500 mt-1">Tarjeta y Transferencia/QR no entran al cajón: no suman al efectivo esperado.</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
        <p className="flex justify-between"><span>Fondo inicial</span><span>{formatoPrecio(c.montoInicial)}</span></p>
        <p className="flex justify-between"><span>+ Ventas en efectivo</span><span>{formatoPrecio(efectivo?.total ?? 0)}</span></p>
        <p className="flex justify-between font-semibold border-t pt-1"><span>= Efectivo esperado</span><span>{formatoPrecio(c.efectivoEsperado)}</span></p>
        <p className="flex justify-between"><span>Efectivo contado (declarado)</span>
          <span>{c.montoFinalDeclarado !== null ? formatoPrecio(c.montoFinalDeclarado) : '—'}</span></p>
      </div>

      {diferencia !== null && (
        <div className={`border rounded-lg p-4 text-center ${ESTILO_RESULTADO[c.resultado]}`}>
          <p className="text-sm">Diferencia (contado − esperado)</p>
          <p className="text-3xl font-bold">
            {diferencia > 0 ? '+' : ''}{formatoPrecio(diferencia)}
          </p>
          <p className="text-sm">
            {diferencia === 0 && 'La caja cuadra exacto.'}
            {diferencia > 0 && 'Hay más efectivo del que debería.'}
            {diferencia < 0 && 'Falta efectivo en el cajón.'}
          </p>
        </div>
      )}
    </div>
  );
}