import { useRef, useState } from 'react';
import { mensajeError } from '../../api/axios';
import { procesarVenta } from '../../api/ventas';
import { useCajaActual } from '../../hooks/useCajaActual';
import { usePosStore } from '../../store/posStore';
import { AbrirCajaForm } from '../../components/pos/AbrirCajaForm';
import { ProductosPos } from '../../components/pos/ProductosPos';
import { CarritoPos } from '../../components/pos/CarritoPos';
import { ComprobanteVenta } from '../../components/pos/ComprobanteVenta';
import { formatoPrecio } from '../../utils/formato';
import type { Venta } from '../../types/ventas';

export default function PosPage() {
  const { caja, cargando, error: errorCaja, abrir } = useCajaActual();
  const { items, metodoPago, vaciar } = usePosStore();
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [comprobante, setComprobante] = useState<Venta | null>(null);
  const [recarga, setRecarga] = useState(0);
  // Candado extra contra el doble clic: el ref cambia al instante, el estado recién en el próximo render
  const enviando = useRef(false);

  const confirmar = async () => {
    if (enviando.current || items.length === 0) return;
    enviando.current = true;
    setProcesando(true);
    setError('');
    try {
      const venta = await procesarVenta(items, metodoPago);
      setComprobante(venta);
      vaciar(); // carrito limpio para la siguiente venta
    } catch (e) {
      // El carrito NO se vacía: el cajero ve qué falló y corrige la cantidad
      setError(mensajeError(e));
    } finally {
      enviando.current = false;
      setProcesando(false);
      setRecarga((n) => n + 1); // stock actualizado en la grilla
    }
  };

  if (cargando) return <div className="h-40 bg-gray-200 rounded-xl animate-pulse" />;
  if (errorCaja) return <p className="bg-red-100 text-red-700 p-3 rounded">{errorCaja}</p>;
  if (!caja) return <AbrirCajaForm onAbrir={abrir} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Punto de venta</h1>
        <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
          Caja #{caja.id} abierta · fondo {formatoPrecio(caja.montoInicial)}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <ProductosPos recarga={recarga} />
        <CarritoPos procesando={procesando} error={error} onConfirmar={confirmar} />
      </div>

      {comprobante && <ComprobanteVenta venta={comprobante} onCerrar={() => setComprobante(null)} />}
    </div>
  );
}