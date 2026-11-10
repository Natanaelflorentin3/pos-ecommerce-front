import { Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function TiendaLayout() {
  const { usuario, cerrarSesion } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <Link to="/" className="text-xl font-bold text-blue-600">
            Mi Tienda
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            {!usuario && (
              <>
                <Link to="/login" className="hover:underline">Ingresar</Link>
                <Link to="/registro" className="bg-blue-600 text-white px-3 py-1 rounded">
                  Crear cuenta
                </Link>
              </>
            )}
            {usuario && usuario.rol !== 'CLIENTE' && (
              <Link to="/panel" className="hover:underline">Ir al panel</Link>
            )}
            {usuario && (
              <>
                <span className="text-gray-500 hidden sm:inline">{usuario.email}</span>
                <button onClick={cerrarSesion} className="hover:underline">Salir</button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}