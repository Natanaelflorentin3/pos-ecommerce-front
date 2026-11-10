// Los Decimal de la API llegan como texto ("3000.00")
export const formatoPrecio = (valor: string | number) =>
  Number(valor).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });