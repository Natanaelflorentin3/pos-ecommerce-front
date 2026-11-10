import { Routes, Route, Navigate } from 'react-router-dom';
import { RutaProtegida } from './components/RutaProtegida';
import TiendaLayout from './components/TiendaLayout';
import PanelLayout from './components/PanelLayout';
import LoginPage from './pages/publico/LoginPage';
import RegistroPage from './pages/publico/RegistroPage';
import TiendaPage from './pages/publico/TiendaPage';
import ProductosPage from './pages/panel/ProductosPage';
import UsuariosPage from './pages/panel/UsuariosPage';

export default function App() {
  return (
    <Routes>
      {/* Público: tienda (visitantes y clientes) */}
      <Route element={<TiendaLayout />}>
        <Route path="/" element={<TiendaPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />

      {/* Staff: ADMIN y CAJERO */}
      <Route element={<RutaProtegida roles={['ADMIN', 'CAJERO']} />}>
        <Route path="/panel" element={<PanelLayout />}>
          <Route index element={<Navigate to="productos" replace />} />
          <Route path="productos" element={<ProductosPage />} />

          {/* Solo ADMIN */}
          <Route element={<RutaProtegida roles={['ADMIN']} />}>
            <Route path="usuarios" element={<UsuariosPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}