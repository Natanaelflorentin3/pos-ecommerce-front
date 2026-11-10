import { create } from 'zustand';
import type { MetodoPago } from '../types/ventas';

export interface ItemPos {
  productoId: number;
  nombre: string;
  precio: number;
  stock: number;
  cantidad: number;
}

interface ProductoParaAgregar {
  id: number;
  nombre: string;
  precioVenta: string;
  stock: number;
}

interface PosState {
  items: ItemPos[];
  metodoPago: MetodoPago;
  agregar: (producto: ProductoParaAgregar) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  quitar: (productoId: number) => void;
  setMetodoPago: (metodo: MetodoPago) => void;
  vaciar: () => void;
}

// Carrito interno del mostrador: estado global para que sobreviva
// aunque el cajero vaya al historial y vuelva
export const usePosStore = create<PosState>()((set) => ({
  items: [],
  metodoPago: 'EFECTIVO',

  agregar: (p) =>
    set((s) => {
      const existe = s.items.some((i) => i.productoId === p.id);
      if (existe) {
        return {
          items: s.items.map((i) =>
            i.productoId === p.id ? { ...i, cantidad: i.cantidad + 1 } : i,
          ),
        };
      }
      return {
        items: [
          ...s.items,
          { productoId: p.id, nombre: p.nombre, precio: Number(p.precioVenta), stock: p.stock, cantidad: 1 },
        ],
      };
    }),

  cambiarCantidad: (productoId, cantidad) =>
    set((s) => ({
      items:
        cantidad <= 0
          ? s.items.filter((i) => i.productoId !== productoId)
          : s.items.map((i) => (i.productoId === productoId ? { ...i, cantidad } : i)),
    })),

  quitar: (productoId) =>
    set((s) => ({ items: s.items.filter((i) => i.productoId !== productoId) })),

  setMetodoPago: (metodoPago) => set({ metodoPago }),

  vaciar: () => set({ items: [], metodoPago: 'EFECTIVO' }),
}));

// Total que ve el cajero mientras arma la venta.
// El total oficial lo calcula la API (con Decimal) y viene en el comprobante.
export const calcularTotal = (items: ItemPos[]) =>
  items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);