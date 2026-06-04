# Sistema de Control de Gastos e Ingresos

Aplicacion full-stack para registrar, consultar y analizar ingresos y gastos personales o familiares. Permite gestionar categorias, visualizar reportes, exportar informacion y empaquetar una version de escritorio con Electron.

## Caracteristicas

- Registro y edicion de ingresos.
- Registro y edicion de gastos.
- Categorias para ingresos y gastos.
- Dashboard con resumen financiero.
- Reportes con graficos y desglose por categoria.
- Exportacion a PDF y Excel.
- Autenticacion con JWT.
- Interfaz responsive.
- Pruebas E2E con Cypress.
- Build de escritorio con Electron.

## Inicio Rapido

Requisitos:

- Node.js 18 o superior.
- npm.
- MongoDB local o MongoDB Atlas.

Terminal 1:

```bash
cd backend
npm install
npm run dev
```

Terminal 2:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:5000/api
```

## Documentacion

| Documento | Descripcion |
| --- | --- |
| [INICIO_RAPIDO.md](INICIO_RAPIDO.md) | Guia corta de instalacion y arranque. |
| [ERRORES_COMUNES.md](ERRORES_COMUNES.md) | Problemas frecuentes y soluciones. |
| [docs/SETUP.md](docs/SETUP.md) | Configuracion detallada del entorno. |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitectura general del sistema. |
| [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) | Estructura completa de carpetas. |
| [docs/API.md](docs/API.md) | Endpoints y contratos REST. |
| [docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md) | Flujo de desarrollo. |
| [docs/CYPRESS_GUIDE.md](docs/CYPRESS_GUIDE.md) | Uso, actualizacion y troubleshooting de Cypress. |
| [TESTING.md](TESTING.md) | Resumen de pruebas del proyecto. |

La documentacion de despliegue y configuraciones de hosting debe mantenerse en las guias tecnicas, no en este README general.

## Stack Tecnologico

Backend:

- Node.js.
- Express.
- MongoDB con Mongoose.
- JWT y bcrypt.
- express-validator.
- Helmet y CORS.
- Vitest, Supertest y mongodb-memory-server.

Frontend:

- React 18.
- Vite.
- React Router.
- Axios.
- Recharts.
- jsPDF, jspdf-autotable y XLSX.
- Cypress 15.16.0 y cypress-axe.
- Electron y electron-builder.

## Estructura Base

```text
income_expense_management_system/
  backend/
    server.js
    package.json
    vitest.config.js
    src/
      config/
      constants/
      controllers/
      errors/
      middlewares/
      models/
      routes/
      services/
      utils/
      validators/
    tests/
      unit/
      integration/
      helpers/
      fixtures/

  frontend/
    package.json
    vite.config.js
    cypress.config.js
    electron/
    scripts/
    src/
      components/
      constants/
      hooks/
      models/
      pages/
      services/
      styles/
      utils/
    cypress/
      e2e/
      support/
      fixtures/

  docs/
```

## Variables de Entorno

Backend (`backend/.env`):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
DB_NAME=income_expense_db
JWT_SECRET=change_this_secret
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
BCRYPT_ROUNDS=10
```

Frontend (`frontend/.env`):

```env
VITE_API_URL=http://localhost:5000/api
VITE_API_TIMEOUT=10000
VITE_AUTH_MODE=mock
VITE_APP_NAME=Income & Expense Manager
VITE_APP_VERSION=1.1.0
```

No subir archivos `.env` al repositorio.

## Testing

Backend:

```bash
cd backend
npm test
npm run test:coverage
```

Frontend E2E:

```bash
cd frontend
npm run cypress:run
```

Frontend accessibility smoke:

```bash
cd frontend
npm run test:a11y
```

Abrir Cypress en modo visual:

```bash
cd frontend
npm run dev
npm run cypress
```

En Windows, si Cypress muestra `Cypress.exe: bad option: --smoke-test`, ejecutar antes:

```powershell
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
```

Ver [docs/CYPRESS_GUIDE.md](docs/CYPRESS_GUIDE.md) para el flujo completo.

## Build Desktop

Version actual del instalador:

```text
1.1.0
```

Generar instalador:

```bash
cd frontend
npm run build:dist
```

Salida local:

```text
frontend/release/Income Expense Manager Setup 1.1.0.exe
```

La carpeta `frontend/release/` esta ignorada por Git porque contiene artefactos pesados. No debe subirse al repositorio.

## Estado del Proyecto

| Modulo | Estado |
| --- | --- |
| Autenticacion | Completo |
| Gastos | Completo |
| Ingresos | Completo |
| Categorias | Completo |
| Reportes | Completo |
| Presupuestos | En desarrollo |
| Perfil de usuario | En desarrollo |

## Soporte

- Issues: abrir un issue en GitHub.
- Documentacion: revisar [ERRORES_COMUNES.md](ERRORES_COMUNES.md).
- Cypress: revisar [docs/CYPRESS_GUIDE.md](docs/CYPRESS_GUIDE.md).

## Licencia

MIT

---

Version: 1.1.0  
Ultima actualizacion: Junio 2026  
Estado: Produccion
