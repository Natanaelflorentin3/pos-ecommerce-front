# POS & E-commerce — Frontend

Frontend del sistema híbrido de punto de venta y tienda online. Consume la API propia de POS & E-commerce (NestJS + Prisma + PostgreSQL) desplegada en Render.

- **App en producción:** https://pos-ecommerce-front.vercel.app
- **API (Swagger):** https://pos-ecommerce-api.onrender.com/api/docs
- **Repositorio del backend:** https://github.com/Natanaelflorentin3/pos-ecommerce-api

## Stack
Vite + React + TypeScript · React Router · Zustand · Axios · React Hook Form + Zod · Tailwind CSS

## Usuarios de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | admin@pos.com | admin123 |
| Cajero | ana@pos.com | cajero123 |
| Cliente web | lucia@mail.com | cliente123 |

> La API está en el plan gratuito de Render: el primer pedido después de un rato sin uso puede tardar ~50 segundos.

## Correr en local
```bash
npm install
cp .env.example .env   # en Windows: copy .env.example .env
npm run dev
```
Variable de entorno: `VITE_API_URL` (por defecto apunta a la API en Render).

## Funcionalidades por rol
- **Visitante:** catálogo público (sin costo de adquisición) y registro como cliente.
- **Cliente web:** carrito, direcciones, checkout y seguimiento de pedidos.
- **Cajero:** punto de venta (carrito interno, cobro, comprobante), historial de ventas, cola de órdenes (lectura) e inventario.
- **Administrador:** todo lo anterior + CRUD de productos, alta de cajeros, cambio de estado de órdenes, órdenes manuales y caja con conciliación.

## Decisiones técnicas
- **Sesión en Zustand con `persist`:** el JWT sobrevive al refresh. Un interceptor de Axios agrega el token y cierra la sesión ante un 401.
- **Rutas protegidas por rol** con `RutaProtegida`. La seguridad real la aplica la API (401/403).
- **El costo de adquisición nunca llega a la vitrina:** el endpoint público lo excluye en la API, no se oculta con CSS.
- **Sincronización de stock POS ↔ web:** el hook `useRevalidacion` vuelve a pedir los datos al volver a la pestaña y cada 15 s.
- **Errores de negocio:** se muestra el mensaje exacto de la API (por ejemplo, stock insuficiente o transición de estado inválida).
- **Rendimiento:** code splitting con `React.lazy` + `Suspense` en las páginas del panel y `useMemo` en búsquedas y totales.
- **Error Boundary** global para no dejar la pantalla en blanco.
- **Despliegue:** Vercel con `VITE_API_URL` como variable de entorno y `vercel.json` para que las rutas internas no den 404 al refrescar.

## Estructura
```
src/
├── api/         llamadas a la API por recurso
├── components/  layouts, rutas protegidas y componentes por feature (pos, caja, ordenes, tienda)
├── hooks/       useRevalidacion, useCajaActual, useCategorias
├── pages/       publico/ (tienda, carrito, login) y panel/ (pos, ventas, órdenes, productos, usuarios, caja)
├── store/       authStore (sesión) y posStore (carrito del mostrador)
├── types/       tipos de la API
└── utils/       formato de precios, fechas y token
```