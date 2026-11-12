// Se muestra mientras se descarga el código de una página cargada con React.lazy
export function CargandoPagina() {
  return (
    <div className="flex items-center justify-center py-20">
      <span className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}