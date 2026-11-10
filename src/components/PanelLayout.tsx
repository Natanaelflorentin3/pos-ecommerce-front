import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { Rol } from '../types/auth';

const enlaces: { to: string; texto: string; roles: Rol[] }[] = [
  { to: '/panel/productos', texto: 'Productos', roles: ['ADMIN', 'CAJERO'] },
  { to: '/panel/usuarios', texto: 'Usuarios', roles: ['ADMIN'] },
];

export default function PanelLayout() {
  const { usuario, cerrarSesion } = useAuthStore();

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900">
      <aside className="w-56 shrink-0 bg-gray-900 text-white flex flex-col p-4 gap-1">
        <h2 className="text-lg font-bold mb-4">Panel POS</h2>

        {enlaces
          .filter((e) => usuario && e.roles.includes(usuario.rol))
          .map((e) => (
            <NavLink
              key={e.to}
              to={e.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
              }
            >
              {e.texto}
            </NavLink>
          ))}

        <NavLink to="/" className="px-3 py-2 rounded hover:bg-gray-700">
          Ver tienda
        </NavLink>

        <div className="mt-auto text-sm">
          <p className="truncate">{usuario?.email}</p>
          <p className="text-gray-400 mb-2">{usuario?.rol}</p>
          <button onClick={cerrarSesion} className="w-full bg-gray-700 hover:bg-gray-600 rounded py-1">
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}