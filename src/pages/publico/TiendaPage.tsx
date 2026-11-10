import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agregarAlCarrito, obtenerCatalogo } from '../../api/catalogo';
import { mensajeError } from '../../api/axios';
import { useCategorias } from '../../hooks/useCategorias';
import { useAuthStore } from '../../store/authStore';
import { FiltroCategorias } from '../../components/FiltroCategorias';
import { formatoPrecio } from '../../utils/formato';
import type { ProductoPublico } from '../../types/catalogo';

export default function TiendaPage() {
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);
  const { categorias } = useCategorias();
  const [categoriaId, setCategoriaId] = useState<number>();
  const [productos, setProductos] = useState<ProductoPublico[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    let cancelado = false;
    obtenerCatalogo(categoriaId)
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
  }, [categoriaId]);

  const cambiarCategoria = (id?: number) => {
    setCargando(true);
    setCategoriaId(id);
  };

  const agregar = async (producto: ProductoPublico) => {
    if (!usuario) {
      navigate('/login');
      return;
    }
    if (usuario.rol !== 'CLIENTE') {
      setAviso('Solo los clientes pueden comprar en la tienda');
      return;
    }
    try {
      await agregarAlCarrito(producto.id);
      setAviso(`"${producto.nombre}" se agregó al carrito`);
    } catch (e) {
      setAviso(mensajeError(e)); // ej: "Stock insuficiente" viene de la API
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Catálogo</h1>
      <FiltroCategorias categorias={categorias} seleccionada={categoriaId} onCambiar={cambiarCategoria} />

      {aviso && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded flex justify-between">
          <span>{aviso}</span>
          <button onClick={() => setAviso('')}>✕</button>
        </div>
      )}
      {error && <p className="bg-red-100 text-red-700 p-3 rounded">{error}</p>}

      {cargando ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : productos.length === 0 ? (
        <p className="text-gray-500">No hay productos disponibles en esta categoría.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {productos.map((p) => {
            const sinStock = p.stock <= 0;
            return (
              <article key={p.id} className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
                <span className="text-xs text-gray-500">{p.categoria.nombre}</span>
                <h2 className="font-semibold">{p.nombre}</h2>
                {p.descripcion && <p className="text-sm text-gray-600 mt-1">{p.descripcion}</p>}
                <p className="text-lg font-bold mt-auto pt-3">{formatoPrecio(p.precioVenta)}</p>
                <p className={`text-xs ${p.stock <= 3 ? 'text-orange-600' : 'text-gray-500'}`}>
                  {sinStock ? 'Sin stock' : p.stock <= 3 ? `¡Quedan ${p.stock}!` : `Stock: ${p.stock}`}
                </p>
                <button
                  onClick={() => agregar(p)}
                  disabled={sinStock}
                  className="mt-3 bg-blue-600 text-white rounded-lg py-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {sinStock ? 'Agotado' : 'Agregar al carrito'}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}