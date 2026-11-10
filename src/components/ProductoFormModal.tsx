import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { actualizarProducto, crearProducto } from '../api/catalogo';
import { mensajeError } from '../api/axios';
import type { Categoria, ProductoInventario } from '../types/catalogo';

const esquema = z
  .object({
    nombre: z.string().trim().min(2, 'Mínimo 2 caracteres'),
    descripcion: z.string().optional(),
    categoriaId: z.number({ error: 'Elegí una categoría' }).int().positive('Elegí una categoría'),
    costo: z.number({ error: 'Ingresá el costo' }).positive('Debe ser mayor a 0'),
    precioVenta: z.number({ error: 'Ingresá el precio' }).positive('Debe ser mayor a 0'),
    stock: z.number({ error: 'Ingresá el stock' }).int('Debe ser un número entero').min(0, 'No puede ser negativo'),
  })
  .refine((d) => d.precioVenta >= d.costo, {
    message: 'El precio de venta no puede ser menor al costo',
    path: ['precioVenta'],
  });

type Datos = z.infer<typeof esquema>;

interface Props {
  producto: ProductoInventario | null; // null = crear, con datos = editar
  categorias: Categoria[];
  onCerrar: () => void;
  onGuardado: () => void;
}

export function ProductoFormModal({ producto, categorias, onCerrar, onGuardado }: Props) {
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Datos>({
    resolver: zodResolver(esquema),
    defaultValues: producto
      ? {
          nombre: producto.nombre,
          descripcion: producto.descripcion ?? '',
          categoriaId: producto.categoriaId,
          costo: Number(producto.costo),
          precioVenta: Number(producto.precioVenta),
          stock: producto.stock,
        }
      : { nombre: '', descripcion: '', stock: 0 },
  });

  const onSubmit = async (d: Datos) => {
    setError('');
    const datos = { ...d, descripcion: d.descripcion?.trim() || undefined };
    try {
      if (producto) await actualizarProducto(producto.id, datos);
      else await crearProducto(datos);
      onGuardado();
    } catch (e) {
      setError(mensajeError(e));
    }
  };

  const input = 'w-full border rounded-lg p-2';
  const msg = (texto?: string) => texto && <p className="text-red-600 text-sm">{texto}</p>;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
        <h2 className="text-xl font-bold">{producto ? 'Editar producto' : 'Nuevo producto'}</h2>

        <div>
          <label className="text-sm">Nombre</label>
          <input {...register('nombre')} className={input} />
          {msg(errors.nombre?.message)}
        </div>

        <div>
          <label className="text-sm">Descripción (opcional)</label>
          <textarea {...register('descripcion')} className={input} rows={2} />
        </div>

        <div>
          <label className="text-sm">Categoría</label>
          <select {...register('categoriaId', { valueAsNumber: true })} className={input}>
            <option value="">Elegí una categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          {msg(errors.categoriaId?.message)}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-sm">Costo</label>
            <input type="number" step="0.01" {...register('costo', { valueAsNumber: true })} className={input} />
            {msg(errors.costo?.message)}
          </div>
          <div>
            <label className="text-sm">Precio venta</label>
            <input type="number" step="0.01" {...register('precioVenta', { valueAsNumber: true })} className={input} />
            {msg(errors.precioVenta?.message)}
          </div>
          <div>
            <label className="text-sm">Stock</label>
            <input type="number" {...register('stock', { valueAsNumber: true })} className={input} />
            {msg(errors.stock?.message)}
          </div>
        </div>

        {error && <p className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCerrar} className="px-4 py-2 rounded-lg border">
            Cancelar
          </button>
          <button disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50">
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}