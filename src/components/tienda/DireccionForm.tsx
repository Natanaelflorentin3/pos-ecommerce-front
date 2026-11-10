import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { crearDireccion } from '../../api/tienda';
import { mensajeError } from '../../api/axios';
import type { Direccion } from '../../types/ordenes';

const esquema = z.object({
  calle: z.string().trim().min(3, 'Ingresá calle y número'),
  ciudad: z.string().trim().min(2, 'Ingresá la ciudad'),
  referencias: z.string().optional(),
});
type Datos = z.infer<typeof esquema>;

interface Props {
  onCreada: (direccion: Direccion) => void;
  onCancelar?: () => void;
}

export function DireccionForm({ onCreada, onCancelar }: Props) {
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<Datos>({ resolver: zodResolver(esquema) });

  const onSubmit = async (d: Datos) => {
    setError('');
    try {
      const nueva = await crearDireccion({ ...d, referencias: d.referencias?.trim() || undefined });
      onCreada(nueva);
    } catch (e) {
      setError(mensajeError(e));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border rounded-lg p-3 space-y-2 bg-gray-50">
      <input {...register('calle')} placeholder="Calle y número" className="w-full border rounded-lg p-2 bg-white" />
      {errors.calle && <p className="text-red-600 text-sm">{errors.calle.message}</p>}
      <input {...register('ciudad')} placeholder="Ciudad" className="w-full border rounded-lg p-2 bg-white" />
      {errors.ciudad && <p className="text-red-600 text-sm">{errors.ciudad.message}</p>}
      <input {...register('referencias')} placeholder="Referencias (ej: portón negro, timbre 2B)" className="w-full border rounded-lg p-2 bg-white" />
      {error && <p className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</p>}
      <div className="flex gap-2">
        <button disabled={isSubmitting} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50">
          {isSubmitting ? 'Guardando...' : 'Guardar dirección'}
        </button>
        {onCancelar && (
          <button type="button" onClick={onCancelar} className="px-3 py-1.5 rounded-lg text-sm border bg-white">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}