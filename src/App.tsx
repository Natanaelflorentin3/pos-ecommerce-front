import { Routes, Route, Navigate } from 'react-router-dom';
import { RutaProtegida } from './components/RutaProtegida';
import LoginPage from './pages/publico/LoginPage';
import RegistroPage from './pages/publico/RegistroPage';
import { useAuthStore } from './store/authStore';

function TiendaProvisoria() {
  const { usuario, cerrarSesion } = useAuthStore();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Tienda</h1>
      <p>{usuario ? `Hola ${usuario.email} (${usuario.rol})` : 'Visitante'}</p>
      {usuario && <button onClick={cerrarSesion} className="mt-2 underline">Cerrar sesión</button>}
    </div>
  );
}

function PanelProvisorio() {
  const { usuario, cerrarSesion } = useAuthStore();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Panel operativo</h1>
      <p>{usuario?.email} ({usuario?.rol})</p>
      <button onClick={cerrarSesion} className="mt-2 underline">Cerrar sesión</button>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Público */}
      <Route path="/" element={<TiendaProvisoria />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />

      {/* Staff */}
      <Route element={<RutaProtegida roles={['ADMIN', 'CAJERO']} />}>
        <Route path="/panel" element={<PanelProvisorio />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}