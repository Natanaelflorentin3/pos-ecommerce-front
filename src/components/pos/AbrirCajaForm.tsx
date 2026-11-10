import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { mensajeError } from '../../api/axios';

const esquema = z.object({
  montoInicial: z.number({ error: 'Ingresá el monto' }).min(0, 'No puede ser negativo'),
});
type Datos = z.infer<typeof esquema>;

export function AbrirCajaForm({ onAbrir }: { onAbrir: (monto: number) => Promise<void> }) {
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<Datos>({ resolver: zodResolver(esquema) });

  const onSubmit = async ({ montoInicial }: Datos) => {
    setError('');
    try {
      await onAbrir(montoInicial);
    } catch (e) {
      setError(mensajeError(e));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm p-6 max-w-sm space-y-3">
      <h2 className="text-lg font-bold">Abrir caja</h2>
      <p className="text-sm text-gray-600">
        Para vender necesitás una caja abierta. Ingresá el efectivo con el que arranca el cajón (fondo para dar vuelto).
      </p>
      <input type="number" step="0.01" placeholder="Ej: 5000"
        {...register('montoInicial', { valueAsNumber: true })}
        className="w-full border rounded-lg p-2" />
      {errors.montoInicial && <p className="text-red-600 text-sm">{errors.montoInicial.message}</p>}
      {error && <p className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</p>}
      <button disabled={isSubmitting} className="w-full bg-blue-600 text-white rounded-lg p-2 disabled:opacity-50">
        {isSubmitting ? 'Abriendo...' : 'Abrir caja'}
      </button>
    </form>
  );
}