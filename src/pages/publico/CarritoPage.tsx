import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { agregarItemCarrito, confirmarPedido, listarDirecciones, quitarItemCarrito, verCarrito } from '../../api/tienda';
import { mensajeError } from '../../api/axios';
import { useRevalidacion } from '../../hooks/useRevalidacion';
import { DireccionForm } from '../../components/tienda/DireccionForm';
import { OrdenCard } from '../../components/ordenes/OrdenCard';
import { formatoPrecio } from '../../utils/formato';
import type { Carrito, Direccion, Orden } from '../../types/ordenes';

export default function CarritoPage() {
  const tick = useRevalidacion();
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [direccionId, setDireccionId] = useState<number>();
  const [nuevaDireccion, setNuevaDireccion] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [ordenCreada, setOrdenCreada] = useState<Orden | null>(null);
  const enviando = useRef(false);

  // El carrito se revalida: si el stock cambió (venta en el POS), se ve acá
  useEffect(() => {
    let cancelado = false;
    verCarrito()
      .then((c) => !cancelado && setCarrito(c))
      .catch((e) => !cancelado && setError(mensajeError(e)))
      .finally(() => !cancelado && setCargando(false));
    return () => {
      cancelado = true;
    };
  }, [tick]);

  useEffect(() => {
    listarDirecciones()
      .then((d) => {
        setDirecciones(d);
        if (d.length > 0) setDireccionId((actual) => actual ?? d[0].id);
      })
      .catch((e) => setError(mensajeError(e)));
  }, []);

  // Cada acción devuelve el carrito actualizado desde la API
  const ejecutar = async (accion: () => Promise<Carrito>) => {
    setError('');
    try {
      setCarrito(await accion());
    } catch (e) {
      setError(mensajeError(e));
    }
  };

  const restar = (productoId: number, cantidad: number) =>
    ejecutar(async () => {
      const sinItem = await quitarItemCarrito(productoId);
      return cantidad > 1 ? agregarItemCarrito(productoId, cantidad - 1) : sinItem;
    });

  const items = carrito?.items ?? [];
  // La interfaz no miente: si el stock actual no alcanza, se avisa y no se deja confirmar
  const hayProblemaDeStock = items.some((i) => i.cantidad > i.producto.stock);

  const confirmar = async () => {
    if (!direccionId || enviando.current) return;
    enviando.current = true;
    setProcesando(true);
    setError('');
    try {
      const orden = await confirmarPedido(direccionId);
      setOrdenCreada(orden);
      setCarrito(await verCarrito()); // queda vacío
    } catch (e) {
      setError(mensajeError(e));
      verCarrito().then(setCarrito).catch(() => undefined); // stock actualizado
    } finally {
      enviando.current = false;
      setProcesando(false);
    }
  };

  if (ordenCreada) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl">✓</p>
          <h1 className="text-xl font-bold">¡Pedido confirmado!</h1>
          <p className="text-sm text-gray-600">Te avisamos cuando cambie de estado.</p>
        </div>
        <OrdenCard orden={ordenCreada} />
        <div className="flex gap-3 justify-center">
          <Link to="/mis-pedidos" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Ver mis pedidos</Link>
          <Link to="/" className="px-4 py-2 rounded-lg border bg-white">Seguir comprando</Link>
        </div>
      </div>
    );
  }

  if (cargando) return <div className="h-60 bg-gray-200 rounded-xl animate-pulse" />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="bg-white rounded-xl shadow-sm p-4">
        <h1 className="text-2xl font-bold mb-3">Mi carrito</h1>
        {items.length === 0 ? (
          <p className="text-gray-500">
            Tu carrito está vacío. <Link to="/" className="text-blue-600">Ver catálogo</Link>
          </p>
        ) : (
          <ul className="divide-y">
            {items.map((i) => {
              const excede = i.cantidad > i.producto.stock;
              return (
                <li key={i.id} className="py-3 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium">{i.producto.nombre}</p>
                    <p className="text-sm text-gray-500">{formatoPrecio(i.producto.precioVenta)} c/u</p>
                    {excede && (
                      <p className="text-sm text-red-600">
                        {i.producto.stock === 0 ? 'Se agotó' : `Solo quedan ${i.producto.stock} disponibles`}
                      </p>
                    )}
                  </div>
                  <button disabled={procesando} onClick={() => restar(i.productoId, i.cantidad)} className="w-8 h-8 rounded border">−</button>
                  <span className="w-6 text-center">{i.cantidad}</span>
                  <button disabled={procesando || i.cantidad >= i.producto.stock}
                    onClick={() => ejecutar(() => agregarItemCarrito(i.productoId, 1))}
                    className="w-8 h-8 rounded border disabled:opacity-40">+</button>
                  <span className="w-24 text-right font-semibold">
                    {formatoPrecio(Number(i.producto.precioVenta) * i.cantidad)}
                  </span>
                  <button disabled={procesando} onClick={() => ejecutar(() => quitarItemCarrito(i.productoId))} className="text-red-500 px-1">✕</button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <aside className="bg-white rounded-xl shadow-sm p-4 space-y-4 h-fit">
        <div>
          <h2 className="font-bold mb-2">Dirección de entrega</h2>
          {direcciones.length > 0 && (
            <div className="space-y-2">
              {direcciones.map((d) => (
                <label key={d.id} className={`flex gap-2 border rounded-lg p-2 cursor-pointer ${direccionId === d.id ? 'border-blue-600 bg-blue-50' : ''}`}>
                  <input type="radio" checked={direccionId === d.id} onChange={() => setDireccionId(d.id)} />
                  <span className="text-sm">
                    {d.calle}, {d.ciudad}
                    {d.referencias && <span className="block text-gray-500">{d.referencias}</span>}
                  </span>
                </label>
              ))}
            </div>
          )}
          {nuevaDireccion || direcciones.length === 0 ? (
            <div className="mt-2">
              <DireccionForm
                onCreada={(d) => {
                  setDirecciones((prev) => [...prev, d]);
                  setDireccionId(d.id);
                  setNuevaDireccion(false);
                }}
                onCancelar={direcciones.length > 0 ? () => setNuevaDireccion(false) : undefined}
              />
            </div>
          ) : (
            <button onClick={() => setNuevaDireccion(true)} className="text-sm text-blue-600 mt-2">+ Agregar otra dirección</button>
          )}
        </div>

        <div className="flex justify-between text-xl font-bold border-t pt-3">
          <span>Total</span>
          <span>{formatoPrecio(carrito?.total ?? 0)}</span>
        </div>

        {error && <p className="bg-red-100 text-red-700 p-3 rounded text-sm">{error}</p>}
        {hayProblemaDeStock && (
          <p className="text-sm text-red-600">Ajustá las cantidades marcadas en rojo para poder confirmar.</p>
        )}

        <button onClick={confirmar}
          disabled={items.length === 0 || !direccionId || hayProblemaDeStock || procesando}
          className="w-full bg-green-600 text-white rounded-lg py-3 font-semibold disabled:bg-gray-300 flex items-center justify-center gap-2">
          {procesando && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {procesando ? 'Confirmando...' : 'Confirmar pedido'}
        </button>
      </aside>
    </div>
  );
}