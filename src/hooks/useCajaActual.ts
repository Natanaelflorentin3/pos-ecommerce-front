import { useEffect, useState } from 'react';
import { abrirCaja, obtenerCajaActual } from '../api/ventas';
import { cerrarCaja } from '../api/cajas';
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

  // Devuelve la conciliación que calcula la API al cerrar
  const cerrar = async (montoFinalDeclarado: number) => {
    const conciliacion = await cerrarCaja(montoFinalDeclarado);
    setCaja(null);
    return conciliacion;
  };

  return { caja, cargando, error, abrir, cerrar };
}