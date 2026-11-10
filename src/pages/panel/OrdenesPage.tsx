import { useEffect, useState } from 'react';
import { cambiarEstadoOrden, listarOrdenes } from '../../api/ordenes';
import { mensajeError } from '../../api/axios';
import { useRevalidacion } from '../../hooks/useRevalidacion';
import { useAuthStore } from '../../store/authStore';
import { OrdenCard } from '../../components/ordenes/OrdenCard';
import { OrdenManualModal } from '../../components/ordenes/OrdenManualModal';
import { ACCIONES_POR_ESTADO, ESTADOS_ORDEN, type EstadoOrden, type Orden } from '../../types/ordenes';

const FILTROS = Object.keys(ESTADOS_ORDEN) as EstadoOrden[];

export default function OrdenesPage() {
  const esAdmin = useAuthStore((s) => s.usuario?.rol === 'ADMIN');
  const tick = useRevalidacion(); // los pedidos nuevos de la web aparecen solos
  const [estado, setEstado] = useState<EstadoOrden>();
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [cambiando, setCambiando] = useState<number | null>(null);
  const [recarga, setRecarga] = useState(0);
  const [modalManual, setModalManual] = useState(false);

  useEffect(() => {
    let cancelado = false;
    listarOrdenes(estado)
      .then((o) => !cancelado && setOrdenes(o))
      .catch((e) => !cancelado && setError(mensajeError(e)))
      .finally(() => !cancelado && setCargando(false));
    return () => {
      cancelado = true;
    };
  }, [estado, recarga, tick]);

  const filtrar = (nuevo?: EstadoOrden) => {
    setCargando(true);
    setEstado(nuevo);
  };

  const cambiar = async (orden: Orden, destino: EstadoOrden) => {
    if (destino === 'CANCELADO' && !confirm(`¿Cancelar la orden #${orden.id}? El stock vuelve al inventario.`)) return;
    setCambiando(orden.id);
    setError('');
    setAviso('');
    try {
      await cambiarEstadoOrden(orden.id, destino);
      setAviso(`Orden #${orden.id}: ${ESTADOS_ORDEN[orden.estado].texto} → ${ESTADOS_ORDEN[destino].texto}`);
      setRecarga((n) => n + 1);
    } catch (e) {
      setError(mensajeError(e)); // ej: "No se puede pasar de PENDIENTE a ENTREGADO"
    } finally {
      setCambiando(null);
    }
  };

  const chip = (activo: boolean) =>
    `px-3 py-1 rounded-full text-sm border ${activo ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-100'}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cola de órdenes</h1>
        {esAdmin && (
          <button onClick={() => setModalManual(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            + Orden manual
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => filtrar(undefined)} className={chip(estado === undefined)}>Todas</button>
        {FILTROS.map((e) => (
          <button key={e} onClick={() => filtrar(e)} className={chip(estado === e)}>
            {ESTADOS_ORDEN[e].texto}
          </button>
        ))}
      </div>

      {aviso && <p className="bg-green-100 text-green-700 p-3 rounded">{aviso}</p>}
      {error && <p className="bg-red-100 text-red-700 p-3 rounded">{error}</p>}

      {cargando ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : ordenes.length === 0 ? (
        <p className="text-gray-500">No hay órdenes {estado ? `en estado ${ESTADOS_ORDEN[estado].texto.toLowerCase()}` : ''}.</p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">{ordenes.length} orden(es) · de la más antigua a la más nueva</p>
          {ordenes.map((o) => (
            <OrdenCard
              key={o.id}
              orden={o}
              vistaStaff
              acciones={
                esAdmin && ACCIONES_POR_ESTADO[o.estado].length > 0 && (
                  <div className="flex gap-2 border-t pt-3">
                    {ACCIONES_POR_ESTADO[o.estado].map((a) => (
                      <button key={a.destino} disabled={cambiando === o.id} onClick={() => cambiar(o, a.destino)}
                        className={`px-3 py-1.5 rounded-lg text-sm disabled:opacity-50 ${
                          a.destino === 'CANCELADO' ? 'border border-red-300 text-red-600' : 'bg-blue-600 text-white'
                        }`}>
                        {cambiando === o.id ? '...' : a.texto}
                      </button>
                    ))}
                  </div>
                )
              }
            />
          ))}
        </div>
      )}

      {modalManual && (
        <OrdenManualModal
          onCerrar={() => setModalManual(false)}
          onCreada={(id) => {
            setModalManual(false);
            setAviso(`Orden manual #${id} registrada como pendiente`);
            setRecarga((n) => n + 1);
          }}
        />
      )}
    </div>
  );
}