import { useEffect, useState } from 'react';
import { desactivarProducto, obtenerInventario } from '../../api/catalogo';
import { mensajeError } from '../../api/axios';
import { useCategorias } from '../../hooks/useCategorias';
import { useRevalidacion } from '../../hooks/useRevalidacion';
import { useAuthStore } from '../../store/authStore';
import { FiltroCategorias } from '../../components/FiltroCategorias';
import { ProductoFormModal } from '../../components/ProductoFormModal';
import { formatoPrecio } from '../../utils/formato';
import type { ProductoInventario } from '../../types/catalogo';

export default function ProductosPage() {
  const esAdmin = useAuthStore((s) => s.usuario?.rol === 'ADMIN');
  const { categorias } = useCategorias();
  const [categoriaId, setCategoriaId] = useState<number>();
  const tick = useRevalidacion();
  const [productos, setProductos] = useState<ProductoInventario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [recarga, setRecarga] = useState(0);
  // undefined = modal cerrado, null = crear, producto = editar
  const [enEdicion, setEnEdicion] = useState<ProductoInventario | null>();

  useEffect(() => {
    let cancelado = false;
    obtenerInventario(categoriaId)
      .then((datos) => {
        if (!cancelado) {
          setProductos(datos);
          setError('');
        }
      })
      .catch((e) => !cancelado && setError(mensajeError(e)))
      .finally(() => !cancelado && setCargando(false));
    return () => {
      cancelado = true;
    };
  }, [categoriaId, recarga, tick]);

  const recargar = () => {
    setCargando(true);
    setRecarga((n) => n + 1);
  };

  const cambiarCategoria = (id?: number) => {
    setCargando(true);
    setCategoriaId(id);
  };

  const desactivar = async (p: ProductoInventario) => {
    if (!confirm(`¿Desactivar "${p.nombre}"? Dejará de verse en la tienda.`)) return;
    try {
      await desactivarProducto(p.id);
      recargar();
    } catch (e) {
      setError(mensajeError(e));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        {esAdmin && (
          <button onClick={() => setEnEdicion(null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            + Nuevo producto
          </button>
        )}
      </div>

      <FiltroCategorias categorias={categorias} seleccionada={categoriaId} onCambiar={cambiarCategoria} />
      {error && <p className="bg-red-100 text-red-700 p-3 rounded">{error}</p>}

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Producto</th>
              <th className="p-3">Categoría</th>
              {esAdmin && <th className="p-3">Costo</th>}
              <th className="p-3">Precio</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Estado</th>
              {esAdmin && <th className="p-3">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="p-3">
                    <div className="h-5 bg-gray-200 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : productos.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">No hay productos.</td>
              </tr>
            ) : (
              productos.map((p) => (
                <tr key={p.id} className={`border-t ${!p.activo ? 'opacity-50' : ''}`}>
                  <td className="p-3 font-medium">{p.nombre}</td>
                  <td className="p-3">{p.categoria.nombre}</td>
                  {esAdmin && <td className="p-3">{p.costo ? formatoPrecio(p.costo) : '-'}</td>}
                  <td className="p-3">{formatoPrecio(p.precioVenta)}</td>
                  <td className={`p-3 ${p.stock === 0 ? 'text-red-600 font-semibold' : ''}`}>{p.stock}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${p.activo ? 'bg-green-100 text-green-700' : 'bg-gray-200'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  {esAdmin && (
                    <td className="p-3 space-x-3 whitespace-nowrap">
                      <button onClick={() => setEnEdicion(p)} className="text-blue-600 hover:underline">Editar</button>
                      {p.activo && (
                        <button onClick={() => desactivar(p)} className="text-red-600 hover:underline">Desactivar</button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {enEdicion !== undefined && (
        <ProductoFormModal
          producto={enEdicion}
          categorias={categorias}
          onCerrar={() => setEnEdicion(undefined)}
          onGuardado={() => {
            setEnEdicion(undefined);
            recargar();
          }}
        />
      )}
    </div>
  );
}