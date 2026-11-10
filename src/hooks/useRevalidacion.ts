import { useEffect, useState } from 'react';

// Devuelve un número que aumenta cada vez que conviene volver a pedir los datos:
// - cuando el usuario vuelve a la pestaña o a la ventana (focus / visibilitychange)
// - cada `intervaloMs` mientras la pestaña está visible
// Se agrega a las dependencias de un useEffect para revalidar sin recargar la página.
export function useRevalidacion(intervaloMs = 15000) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const revalidar = () => {
      if (document.visibilityState === 'visible') setTick((t) => t + 1);
    };
    const id = setInterval(revalidar, intervaloMs);
    window.addEventListener('focus', revalidar);
    document.addEventListener('visibilitychange', revalidar);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', revalidar);
      document.removeEventListener('visibilitychange', revalidar);
    };
  }, [intervaloMs]);

  return tick;
}