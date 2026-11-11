import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { mensajeError } from '../../api/axios';

const esquema = z.object({
  montoFinalDeclarado: z.number({ error: 'Ingresá el efectivo contado' }).min(0, 'No puede ser negativo'),
});
type Datos = z.infer<typeof esquema>;

export function CerrarCajaForm({ onCerrar }: { onCerrar: (monto: number) => Promise<void> }) {
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<Datos>({ resolver: zodResolver(esquema) });

  const onSubmit = async ({ montoFinalDeclarado }: Datos) => {
    if (!confirm('¿Cerrar la caja? Después no se pueden registrar más ventas en ella.')) return;
    setError('');
    try {
      await onCerrar(montoFinalDeclarado);
    } catch (e) {
      setError(mensajeError(e)); // ej: "Hay 1 venta(s) sin cobrar ni cancelar en esta caja"
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm p-5 space-y-3">
      <h2 className="text-lg font-bold">Cerrar caja</h2>
      <p className="text-sm text-gray-600">Contá el efectivo físico del cajón e ingresalo. El sistema lo compara con lo esperado.</p>
      <input type="number" step="0.01" placeholder="Efectivo contado"
        {...register('montoFinalDeclarado', { valueAsNumber: true })}
        className="w-full border rounded-lg p-2" />
      {errors.montoFinalDeclarado && <p className="text-red-600 text-sm">{errors.montoFinalDeclarado.message}</p>}
      {error && <p className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</p>}
      <button disabled={isSubmitting} className="w-full bg-red-600 text-white rounded-lg p-2 disabled:opacity-50">
        {isSubmitting ? 'Cerrando...' : 'Cerrar caja y conciliar'}
      </button>
    </form>
  );
}