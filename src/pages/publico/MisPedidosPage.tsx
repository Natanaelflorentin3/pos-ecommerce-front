import { useEffect, useState } from 'react';
import { obtenerMisPedidos } from '../../api/tienda';
import { mensajeError } from '../../api/axios';
import { useRevalidacion } from '../../hooks/useRevalidacion';
import { OrdenCard } from '../../components/ordenes/OrdenCard';
import type { Orden } from '../../types/ordenes';

export default function MisPedidosPage() {
  const tick = useRevalidacion(); // si el staff cambia el estado, el cliente lo ve sin recargar
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerMisPedidos()
      .then(setOrdenes)
      .catch((e) => setError(mensajeError(e)))
      .finally(() => setCargando(false));
  }, [tick]);

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Mis pedidos</h1>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded">{error}</p>}
      {cargando ? (
        <div className="h-40 bg-gray-200 rounded-xl animate-pulse" />
      ) : ordenes.length === 0 ? (
        <p className="text-gray-500">Todavía no hiciste pedidos.</p>
      ) : (
        ordenes.map((o) => <OrdenCard key={o.id} orden={o} />)
      )}
    </div>
  );
}