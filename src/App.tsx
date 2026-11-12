import { Routes, Route, Navigate } from 'react-router-dom';
import { RutaProtegida } from './components/RutaProtegida';
import TiendaLayout from './components/TiendaLayout';
import PanelLayout from './components/PanelLayout';
import LoginPage from './pages/publico/LoginPage';
import RegistroPage from './pages/publico/RegistroPage';
import TiendaPage from './pages/publico/TiendaPage';
import CarritoPage from './pages/publico/CarritoPage';
import MisPedidosPage from './pages/publico/MisPedidosPage';
import ProductosPage from './pages/panel/ProductosPage';
import UsuariosPage from './pages/panel/UsuariosPage';
import PosPage from './pages/panel/PosPage';
import HistorialVentasPage from './pages/panel/HistorialVentasPage';
import OrdenesPage from './pages/panel/OrdenesPage';
import CajaPage from './pages/panel/CajaPage';

export default function App() {
  return (
    <Routes>
      {/* Tienda: visitantes y clientes */}
      <Route element={<TiendaLayout />}>
        <Route path="/" element={<TiendaPage />} />

        {/* Solo CLIENTE */}
        <Route element={<RutaProtegida roles={['CLIENTE']} />}>
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/mis-pedidos" element={<MisPedidosPage />} />
        </Route>
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />

      {/* Staff: ADMIN y CAJERO */}
      <Route element={<RutaProtegida roles={['ADMIN', 'CAJERO']} />}>
        <Route path="/panel" element={<PanelLayout />}>
          <Route index element={<Navigate to="pos" replace />} />
          <Route path="pos" element={<PosPage />} />
          <Route path="ventas" element={<HistorialVentasPage />} />
          <Route path="ordenes" element={<OrdenesPage />} />
          <Route path="productos" element={<ProductosPage />} />

          {/* Solo ADMIN */}
          <Route element={<RutaProtegida roles={['ADMIN']} />}>
            <Route path="usuarios" element={<UsuariosPage />} />
                        <Route path="caja" element={<CajaPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}