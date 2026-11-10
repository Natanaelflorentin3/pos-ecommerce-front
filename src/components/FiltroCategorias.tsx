import type { Categoria } from '../types/catalogo';

interface Props {
  categorias: Categoria[];
  seleccionada?: number;
  onCambiar: (id?: number) => void;
}

export function FiltroCategorias({ categorias, seleccionada, onCambiar }: Props) {
  const clase = (activa: boolean) =>
    `px-3 py-1 rounded-full text-sm border ${
      activa ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-100'
    }`;

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => onCambiar(undefined)} className={clase(seleccionada === undefined)}>
        Todas
      </button>
      {categorias.map((c) => (
        <button key={c.id} onClick={() => onCambiar(c.id)} className={clase(seleccionada === c.id)}>
          {c.nombre}
        </button>
      ))}
    </div>
  );
}