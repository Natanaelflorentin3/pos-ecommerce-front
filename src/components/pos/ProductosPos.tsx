import { useEffect, useMemo, useState } from 'react';
import { obtenerInventario } from '../../api/catalogo';
import { mensajeError } from '../../api/axios';
import { useCategorias } from '../../hooks/useCategorias';
import { useRevalidacion } from '../../hooks/useRevalidacion';
import { usePosStore } from '../../store/posStore';
import { FiltroCategorias } from '../FiltroCategorias';
import { formatoPrecio } from '../../utils/formato';
import type { ProductoInventario } from '../../types/catalogo';

// recarga: cambia después de cada venta para traer el stock actualizado
export function ProductosPos({ recarga }: { recarga: number }) {
  const agregar = usePosStore((s) => s.agregar);
  const { categorias } = useCategorias();
  const [categoriaId, setCategoriaId] = useState<number>();
  const tick = useRevalidacion();
  const [busqueda, setBusqueda] = useState('');
  const [productos, setProductos] = useState<ProductoInventario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelado = false;
    obtenerInventario(categoriaId)
      .then((datos) => !cancelado && setProductos(datos))
      .catch((e) => !cancelado && setError(mensajeError(e)))
      .finally(() => !cancelado && setCargando(false));
    return () => {
      cancelado = true;
    };
  }, [categoriaId, recarga, tick]);

  // useMemo: el filtro por texto no se recalcula en cada render, solo si cambian productos o búsqueda
  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return productos.filter((p) => p.activo && p.nombre.toLowerCase().includes(texto));
  }, [productos, busqueda]);

  return (
    <section className="space-y-3">
      <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar producto..." className="w-full border rounded-lg p-2 bg-white" />
      <FiltroCategorias categorias={categorias} seleccionada={categoriaId}
        onCambiar={(id) => { setCargando(true); setCategoriaId(id); }} />
      {error && <p className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</p>}

      <div className="grid gap-3 grid-cols-2 xl:grid-cols-3">
        {cargando
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
            ))
          : visibles.map((p) => (
              <button key={p.id} onClick={() => agregar(p)} disabled={p.stock === 0}
                className="bg-white rounded-xl shadow-sm p-3 text-left hover:ring-2 hover:ring-blue-500 disabled:opacity-40 disabled:hover:ring-0">
                <p className="font-medium leading-tight">{p.nombre}</p>
                <p className="font-bold mt-1">{formatoPrecio(p.precioVenta)}</p>
                <p className={`text-xs ${p.stock <= 3 ? 'text-orange-600' : 'text-gray-500'}`}>
                  {p.stock === 0 ? 'Sin stock' : `Stock: ${p.stock}`}
                </p>
              </button>
            ))}
      </div>
      {!cargando && visibles.length === 0 && <p className="text-gray-500 text-sm">No hay productos.</p>}
    </section>
  );
}