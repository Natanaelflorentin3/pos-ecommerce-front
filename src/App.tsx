import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RutaProtegida } from './components/RutaProtegida';
import { CargandoPagina } from './components/CargandoPagina';
import TiendaLayout from './components/TiendaLayout';
import PanelLayout from './components/PanelLayout';
import LoginPage from './pages/publico/LoginPage';
import RegistroPage from './pages/publico/RegistroPage';
import TiendaPage from './pages/publico/TiendaPage';

// Code splitting: estas páginas se descargan recién cuando alguien entra.
// Un visitante de la tienda nunca baja el código del panel, la caja o los usuarios.
const CarritoPage = lazy(() => import('./pages/publico/CarritoPage'));
const MisPedidosPage = lazy(() => import('./pages/publico/MisPedidosPage'));
const PosPage = lazy(() => import('./pages/panel/PosPage'));
const HistorialVentasPage = lazy(() => import('./pages/panel/HistorialVentasPage'));
const OrdenesPage = lazy(() => import('./pages/panel/OrdenesPage'));
const ProductosPage = lazy(() => import('./pages/panel/ProductosPage'));
const UsuariosPage = lazy(() => import('./pages/panel/UsuariosPage'));
const CajaPage = lazy(() => import('./pages/panel/CajaPage'));

export default function App() {
  return (
    <Suspense fallback={<CargandoPagina />}>
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
    </Suspense>
  );
}