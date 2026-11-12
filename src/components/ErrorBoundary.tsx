import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// Si un componente explota al renderizar, se muestra este mensaje
// en vez de dejar la pantalla en blanco
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error en la interfaz:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
          <div className="bg-white rounded-xl shadow p-8 max-w-md text-center space-y-3">
            <p className="text-4xl">⚠️</p>
            <h1 className="text-xl font-bold">Algo salió mal</h1>
            <p className="text-gray-600 text-sm">Ocurrió un error inesperado en la pantalla. Probá volver al inicio.</p>
            <button
              onClick={() => {
                this.setState({ error: null });
                window.location.href = '/';
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}