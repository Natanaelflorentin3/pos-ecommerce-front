import { useEffect, useState } from 'react';
import { listarCajas, obtenerConciliacion } from '../../api/cajas';
import { mensajeError } from '../../api/axios';
import { useCajaActual } from '../../hooks/useCajaActual';
import { AbrirCajaForm } from '../../components/pos/AbrirCajaForm';
import { CerrarCajaForm } from '../../components/caja/CerrarCajaForm';
import { ConciliacionCard } from '../../components/caja/ConciliacionCard';
import { formatoPrecio } from '../../utils/formato';
import { formatoFechaHora } from '../../utils/fecha';
import type { CajaListado, Conciliacion } from '../../types/caja';

// Pantalla exclusiva del ADMIN (la ruta está protegida con roles={['ADMIN']})
export default function CajaPage() {
  const { caja, cargando, error: errorCaja, abrir, cerrar } = useCajaActual();
  const [parcial, setParcial] = useState<Conciliacion | null>(null);   // caja abierta: cómo viene
  const [resultado, setResultado] = useState<Conciliacion | null>(null); // recién cerrada
  const [cajas, setCajas] = useState<CajaListado[]>([]);
  const [detalle, setDetalle] = useState<Conciliacion | null>(null);
  const [error, setError] = useState('');
  const [recarga, setRecarga] = useState(0);

  // Mientras la caja está abierta, se muestra cuánto efectivo debería haber
  useEffect(() => {
    if (!caja) return;
    obtenerConciliacion(caja.id)
      .then(setParcial)
      .catch((e) => setError(mensajeError(e)));
  }, [caja]);

  useEffect(() => {
    listarCajas()
      .then(setCajas)
      .catch((e) => setError(mensajeError(e)));
  }, [recarga, caja]);

  const onCerrar = async (monto: number) => {
    const conciliacion = await cerrar(monto);
    setResultado(conciliacion);
    setParcial(null);
    setRecarga((n) => n + 1);
  };

  const verDetalle = async (id: number) => {
    setError('');
    try {
      setDetalle(await obtenerConciliacion(id));
    } catch (e) {
      setError(mensajeError(e));
    }
  };

  if (cargando) return <div className="h-40 bg-gray-200 rounded-xl animate-pulse" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Caja y conciliación</h1>
      {(errorCaja || error) && <p className="bg-red-100 text-red-700 p-3 rounded">{errorCaja || error}</p>}

      {resultado && (
        <div className="space-y-2">
          <p className="bg-green-100 text-green-700 p-3 rounded">Caja #{resultado.cajaId} cerrada. Este es el resultado:</p>
          <ConciliacionCard c={resultado} />
        </div>
      )}

      {caja ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {parcial ? <ConciliacionCard c={parcial} /> : <div className="h-60 bg-gray-200 rounded-xl animate-pulse" />}
          <CerrarCajaForm onCerrar={onCerrar} />
        </div>
      ) : (
        !resultado && <AbrirCajaForm onAbrir={abrir} />
      )}
      {!caja && resultado && (
        <button onClick={() => setResultado(null)} className="text-blue-600 hover:underline">Abrir una caja nueva</button>
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-bold">Historial de cajas</h2>
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Cajero</th>
                <th className="p-3">Apertura</th>
                <th className="p-3">Cierre</th>
                <th className="p-3 text-right">Fondo</th>
                <th className="p-3 text-right">Declarado</th>
                <th className="p-3">Estado</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {cajas.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.id}</td>
                  <td className="p-3">{c.usuario.nombre} {c.usuario.apellido}</td>
                  <td className="p-3">{formatoFechaHora(c.abiertaEn)}</td>
                  <td className="p-3">{c.cerradaEn ? formatoFechaHora(c.cerradaEn) : '—'}</td>
                  <td className="p-3 text-right">{formatoPrecio(c.montoInicial)}</td>
                  <td className="p-3 text-right">{c.montoFinalDeclarado !== null ? formatoPrecio(c.montoFinalDeclarado) : '—'}</td>
                  <td className="p-3">{c.estado === 'ABIERTA' ? 'Abierta' : 'Cerrada'}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => verDetalle(c.id)} className="text-blue-600 hover:underline">Conciliación</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {detalle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setDetalle(null)}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-2" onClick={(e) => e.stopPropagation()}>
            <ConciliacionCard c={detalle} />
            <button onClick={() => setDetalle(null)} className="w-full bg-white rounded-lg py-2 shadow">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}