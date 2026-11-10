import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { crearOrdenManual } from '../../api/ordenes';
import { obtenerInventario } from '../../api/catalogo';
import { mensajeError } from '../../api/axios';
import { formatoPrecio } from '../../utils/formato';
import type { ProductoInventario } from '../../types/catalogo';

const esquema = z.object({
  nombreContacto: z.string().trim().min(2, 'Ingresá el nombre'),
  telefonoContacto: z.string().trim().min(6, 'Teléfono inválido'),
  direccionEnvio: z.string().trim().min(5, 'Ingresá la dirección'),
  referencias: z.string().optional(),
  items: z
    .array(
      z.object({
        productoId: z.number({ error: 'Elegí un producto' }).int().positive('Elegí un producto'),
        cantidad: z.number({ error: 'Cantidad' }).int().positive('Mínimo 1'),
      }),
    )
    .min(1, 'Agregá al menos un producto'),
});
type Datos = z.infer<typeof esquema>;

interface Props {
  onCerrar: () => void;
  onCreada: (id: number) => void;
}

// Venta cerrada por redes sociales: entra a la misma cola que las de la web
export function OrdenManualModal({ onCerrar, onCreada }: Props) {
  const [productos, setProductos] = useState<ProductoInventario[]>([]);
  const [error, setError] = useState('');
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<Datos>({
    resolver: zodResolver(esquema),
    defaultValues: { nombreContacto: '', telefonoContacto: '', direccionEnvio: '', referencias: '', items: [{ cantidad: 1 } as Datos['items'][number]] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    obtenerInventario()
      .then((p) => setProductos(p.filter((x) => x.activo && x.stock > 0)))
      .catch((e) => setError(mensajeError(e)));
  }, []);

  const onSubmit = async (d: Datos) => {
    setError('');
    try {
      const orden = await crearOrdenManual({ ...d, referencias: d.referencias?.trim() || undefined });
      onCreada(orden.id);
    } catch (e) {
      setError(mensajeError(e)); // ej: "Stock insuficiente para ..."
    }
  };

  const input = 'w-full border rounded-lg p-2';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl p-6 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold">Orden manual (venta por redes)</h2>

        <div className="grid sm:grid-cols-2 gap-2">
          <div>
            <input {...register('nombreContacto')} placeholder="Nombre del cliente" className={input} />
            {errors.nombreContacto && <p className="text-red-600 text-sm">{errors.nombreContacto.message}</p>}
          </div>
          <div>
            <input {...register('telefonoContacto')} placeholder="Teléfono" className={input} />
            {errors.telefonoContacto && <p className="text-red-600 text-sm">{errors.telefonoContacto.message}</p>}
          </div>
        </div>
        <input {...register('direccionEnvio')} placeholder="Dirección de entrega" className={input} />
        {errors.direccionEnvio && <p className="text-red-600 text-sm">{errors.direccionEnvio.message}</p>}
        <input {...register('referencias')} placeholder="Referencias (opcional)" className={input} />

        <div className="space-y-2">
          <p className="text-sm font-medium">Productos</p>
          {fields.map((f, idx) => (
            <div key={f.id} className="flex gap-2">
              <select {...register(`items.${idx}.productoId`, { valueAsNumber: true })} className="flex-1 border rounded-lg p-2">
                <option value="">Elegí un producto</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} · {formatoPrecio(p.precioVenta)} (stock {p.stock})
                  </option>
                ))}
              </select>
              <input type="number" min={1} {...register(`items.${idx}.cantidad`, { valueAsNumber: true })} className="w-20 border rounded-lg p-2" />
              <button type="button" onClick={() => remove(idx)} disabled={fields.length === 1} className="text-red-500 px-2 disabled:opacity-30">✕</button>
            </div>
          ))}
          {errors.items?.message && <p className="text-red-600 text-sm">{errors.items.message}</p>}
          {Array.isArray(errors.items) && errors.items.some(Boolean) && (
            <p className="text-red-600 text-sm">Revisá producto y cantidad de cada fila.</p>
          )}
          <button type="button" onClick={() => append({ cantidad: 1 } as Datos['items'][number])} className="text-sm text-blue-600">
            + Agregar producto
          </button>
        </div>

        {error && <p className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCerrar} className="px-4 py-2 rounded-lg border">Cancelar</button>
          <button disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50">
            {isSubmitting ? 'Registrando...' : 'Registrar orden'}
          </button>
        </div>
      </form>
    </div>
  );
}