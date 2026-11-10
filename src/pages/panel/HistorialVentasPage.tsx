import { Fragment, useEffect, useMemo, useState } from 'react';
import { obtenerHistorial } from '../../api/ventas';
import { mensajeError } from '../../api/axios';
import { formatoPrecio } from '../../utils/formato';
import { formatoHora, hoy } from '../../utils/fecha';
import { METODOS_PAGO, type HistorialDia } from '../../types/ventas';

export default function HistorialVentasPage() {
  const [fecha, setFecha] = useState(hoy());
  const [datos, setDatos] = useState<HistorialDia | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [abierta, setAbierta] = useState<number | null>(null);

  useEffect(() => {
    let cancelado = false;
    obtenerHistorial(fecha)
      .then((d) => {
        if (!cancelado) {
          setDatos(d);
          setError('');
        }
      })
      .catch((e) => !cancelado && setError(mensajeError(e)))
      .finally(() => !cancelado && setCargando(false));
    return () => {
      cancelado = true;
    };
  }, [fecha]);

  const cambiarFecha = (nueva: string) => {
    if (!nueva) return;
    setCargando(true);
    setAbierta(null);
    setFecha(nueva);
  };

  // Resumen por método de pago, memorizado: solo se recalcula si cambian las ventas
  const porMetodo = useMemo(
    () =>
      METODOS_PAGO.map((m) => {
        const ventas = datos?.ventas.filter((v) => v.metodoPago === m.valor) ?? [];
        return { ...m, cantidad: ventas.length, total: ventas.reduce((a, v) => a + Number(v.total), 0) };
      }),
    [datos],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Historial de ventas</h1>
        <input type="date" value={fecha} max={hoy()} onChange={(e) => cambiarFecha(e.target.value)}
          className="border rounded-lg p-2 bg-white" />
      </div>

      {error && <p className="bg-red-100 text-red-700 p-3 rounded">{error}</p>}

      {cargando ? (
        <div className="h-60 bg-gray-200 rounded-xl animate-pulse" />
      ) : datos && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-500">Ventas</p>
              <p className="text-2xl font-bold">{datos.cantidadVentas}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-500">Total del día</p>
              <p className="text-2xl font-bold">{formatoPrecio(datos.totalDelDia)}</p>
            </div>
            {porMetodo.map((m) => (
              <div key={m.valor} className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-sm text-gray-500">{m.texto} ({m.cantidad})</p>
                <p className="text-lg font-semibold">{formatoPrecio(m.total)}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Hora</th>
                  <th className="p-3">Cajero</th>
                  <th className="p-3">Pago</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {datos.ventas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">No hay ventas ese día.</td>
                  </tr>
                ) : (
                  datos.ventas.map((v) => (
                    <Fragment key={v.id}>
                      <tr className="border-t">
                        <td className="p-3">{v.id}</td>
                        <td className="p-3">{formatoHora(v.fecha)}</td>
                        <td className="p-3">{v.cajero.nombre} {v.cajero.apellido}</td>
                        <td className="p-3">{METODOS_PAGO.find((m) => m.valor === v.metodoPago)?.texto}</td>
                        <td className="p-3 text-right font-semibold">{formatoPrecio(v.total)}</td>
                        <td className="p-3 text-right">
                          <button onClick={() => setAbierta(abierta === v.id ? null : v.id)} className="text-blue-600 hover:underline">
                            {abierta === v.id ? 'Ocultar' : 'Ver detalle'}
                          </button>
                        </td>
                      </tr>
                      {abierta === v.id && (
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="p-3">
                            <ul className="space-y-1">
                              {v.detalles.map((d) => (
                                <li key={d.id} className="flex justify-between">
                                  <span>{d.cantidad} × {d.producto.nombre} ({formatoPrecio(d.precioUnitario)} c/u)</span>
                                  <span>{formatoPrecio(Number(d.precioUnitario) * d.cantidad)}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}