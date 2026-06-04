# agents.md

Guia rapida para agentes que trabajen en este repositorio.

## Proyecto

Sistema de control de gastos e ingresos personales/familiares. Es una aplicacion full-stack con:

- Backend REST en Node.js, Express y MongoDB/Mongoose.
- Frontend en React 18 con Vite.
- Empaquetado de escritorio con Electron y electron-builder.
- Pruebas unitarias/integracion en backend con Vitest.
- Pruebas end-to-end y accesibilidad en frontend con Cypress.

La documentacion principal esta en `README.md`, `INICIO_RAPIDO.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/PROJECT_STRUCTURE.md` y `docs/DEVELOPMENT_GUIDE.md`.

## Requisitos

- Node.js 18 o superior.
- npm.
- MongoDB local o MongoDB Atlas.
- PowerShell para scripts de build de escritorio en Windows.

## Configuracion

Backend:

- Archivo de ejemplo: `backend/.env.example`.
- Archivo local esperado: `backend/.env`.
- Variables principales:
  - `PORT=5000`
  - `NODE_ENV=development`
  - `MONGODB_URI=...`
  - `DB_NAME=income_expense_db`
  - `JWT_SECRET=...`
  - `JWT_EXPIRE=7d`
  - `FRONTEND_URL=http://localhost:3000`
  - `BCRYPT_ROUNDS=10`

Frontend:

- Archivo de ejemplo: `frontend/.env.example`.
- Archivo local esperado: `frontend/.env`.
- Variables principales:
  - `VITE_API_URL=http://localhost:5000/api`
  - `VITE_API_TIMEOUT=10000`
  - `VITE_AUTH_MODE=mock`
  - `VITE_APP_NAME=Income & Expense Manager`
  - `VITE_APP_VERSION=1.0.0`

No leer, imprimir ni modificar valores secretos reales de `.env` salvo que el usuario lo pida de forma explicita.

## Comandos

Instalar dependencias:

```bash
cd backend && npm install
cd ../frontend && npm install
```

Desarrollo web:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

El backend escucha normalmente en `http://localhost:5000` y expone health check en `/api/health`. El frontend usa Vite en `http://localhost:3000`.

Electron en desarrollo:

```bash
cd frontend && npm run electron-dev
```

Build web:

```bash
cd frontend && npm run build
```

Build de distribucion Electron:

```bash
cd frontend && npm run build:dist
```

## Pruebas

Backend:

```bash
cd backend && npm test
cd backend && npm run test:coverage
```

Frontend E2E:

```bash
cd frontend && npm run cypress:run
cd frontend && npm run test:a11y
```

Cypress espera el frontend en `http://localhost:3000`; para pruebas E2E normalmente hay que tener frontend y backend levantados.

## Estructura base

```text
income_expense_management_system/
  backend/
    server.js                 Punto de entrada Express
    vitest.config.js          Configuracion de pruebas backend
    src/
      config/                 Conexion MongoDB y CORS
      constants/              Constantes de aplicacion
      controllers/            Capa HTTP
      errors/                 Errores personalizados
      middlewares/            Auth y manejo de errores
      models/                 Esquemas Mongoose
      routes/                 Rutas REST
      services/               Logica de negocio
      utils/                  Utilidades
      validators/             Validacion de entrada
    tests/
      unit/                   Pruebas unitarias
      integration/            Pruebas de API/integracion
      helpers/                Utilidades de test
      fixtures/               Datos de prueba

  frontend/
    index.html
    vite.config.js
    cypress.config.js
    electron/
      main.cjs                Proceso principal Electron
      preload.cjs             Preload Electron
    src/
      App.jsx
      main.jsx
      components/             Componentes reutilizables
      constants/              Endpoints y categorias
      hooks/                  Hooks de estado/logica
      models/                 Modelos de datos del frontend
      pages/                  Vistas principales
      services/               Cliente API y exportaciones
      styles/                 CSS global, paginas y componentes
      utils/                  Validadores y formateadores
    cypress/
      e2e/                    Pruebas E2E
      fixtures/               Datos de prueba Cypress
      support/                Configuracion Cypress
    scripts/                  Scripts de build
    release/                  Artefactos generados por Electron

  docs/                       Documentacion tecnica y funcional
```

## Arquitectura y convenciones

- Backend: flujo `routes -> controllers -> services -> models`.
- Los controladores deben encargarse de HTTP, parseo basico y respuestas.
- Los servicios concentran reglas de negocio y operaciones contra modelos.
- Los validadores viven en `backend/src/validators`.
- Las respuestas comunes se formatean desde `backend/src/utils/responseFormatter.js`.
- La autenticacion usa JWT y bcrypt; revisar `authMiddleware.js`, `authService.js` y `authUtils.js`.
- Frontend: paginas en `src/pages`, componentes reutilizables en `src/components`, llamadas HTTP en `src/services` y logica reutilizable en `src/hooks`.
- Mantener estilos en CSS existente bajo `frontend/src/styles`; evitar introducir otro sistema de estilos sin necesidad.
- La app usa React Router y rutas privadas mediante `PrivateRoute.jsx`.
- Los reportes usan `recharts`; exportaciones usan `jspdf`, `jspdf-autotable` y `xlsx`.

## API principal

Prefijo backend: `/api`.

- `GET /api/health`
- `/api/auth`
- `/api/expenses`
- `/api/incomes`
- `/api/categories`
- `/api/reports`

Hay archivos de rutas para `budgets` y `users`, pero algunas capacidades figuran como en desarrollo o desactivadas. Ver `docs/API.md` antes de cambiar contratos.

## Notas para agentes

- No modificar `frontend/release/` salvo que el usuario pida trabajar sobre artefactos de distribucion.
- No commitear ni exponer `.env`.
- Revisar `git status --short` antes de editar: este repositorio puede tener cambios locales del usuario.
- Preferir cambios pequenos y alineados con la estructura existente.
- Si se toca backend compartido, ejecutar pruebas relevantes de Vitest.
- Si se toca UI o flujos criticos, ejecutar build de frontend y, cuando aplique, Cypress.
- Mantener documentacion en espanol para consistencia con el proyecto.
