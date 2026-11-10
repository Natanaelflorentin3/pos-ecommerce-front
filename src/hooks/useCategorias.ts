import { useEffect, useState } from 'react';
import { obtenerCategorias } from '../api/catalogo';
import { mensajeError } from '../api/axios';
import type { Categoria } from '../types/catalogo';

// Custom hook: lo usan la vitrina, el inventario y el formulario de productos
export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerCategorias()
      .then(setCategorias)
      .catch((e) => setError(mensajeError(e)));
  }, []);

  return { categorias, error };
}