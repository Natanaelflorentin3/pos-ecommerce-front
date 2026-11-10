import { useEffect, useState } from 'react';
import { abrirCaja, obtenerCajaActual } from '../api/ventas';
import { mensajeError } from '../api/axios';
import type { Caja } from '../types/ventas';

export function useCajaActual() {
  const [caja, setCaja] = useState<Caja | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerCajaActual()
      .then(setCaja)
      .catch((e) => setError(mensajeError(e)))
      .finally(() => setCargando(false));
  }, []);

  const abrir = async (montoInicial: number) => {
    const nueva = await abrirCaja(montoInicial);
    setCaja(nueva);
  };

  return { caja, cargando, error, abrir };
}