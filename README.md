# FinanceApp

Aplicacion financiera full-stack para registrar, consultar y analizar ingresos, gastos, presupuestos y reportes personales o familiares. FinanceApp incluye API REST, version web, escritorio Electron y aplicacion Android con Capacitor. Las tres interfaces consumen la misma API para mantener los datos sincronizados.

## Caracteristicas

- Registro y edicion de ingresos.
- Registro y edicion de gastos.
- Creacion offline de ingresos y gastos con cola local persistente en IndexedDB.
- Sincronizacion manual de pendientes con proteccion contra duplicados mediante `clientRequestId`.
- Categorias para ingresos y gastos con selector de emojis por secciones.
- Presupuestos mensuales con progreso y alertas.
- Dashboard con resumen financiero, tendencias y alertas.
- Actualizacion manual y automatica de datos cada 30 segundos, al recuperar
  foco, volver a una pestana visible o restablecer la conexion.
- Reportes con graficos, tendencia anual y desglose por categoria.
- Exportacion a PDF y Excel.
- Perfil de usuario con moneda configurable y restablecimiento de datos.
- Idioma configurable entre espanol e ingles.
- Autenticacion con JWT.
- Interfaz responsive con mejoras para uso movil.
- Pruebas E2E con Cypress.
- Build de escritorio con Electron y electron-builder.
- Aplicacion Android con Capacitor 6 que reutiliza el build React.
- Framework QA propio para coordinar pruebas de backend, web, instalador y movil.

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
cd web
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
| [evidencias/INTEGRACION_TRES_CLIENTES.md](evidencias/INTEGRACION_TRES_CLIENTES.md) | Evidencia del mismo registro en web, Android y Electron. |

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
- Cypress 15.18.1 y cypress-axe.

Distribucion y calidad:

- Electron, electron-builder y NSIS.
- Capacitor 6 y Gradle para Android.
- Playwright para los smoke tests de Electron en QA y en el release.
- Framework QA propio en `qa/`.

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

  web/
    package.json
    vite.config.js
    cypress.config.js
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

  installer/
    package.json
    electron/
    scripts/

  mobile/
    android/
    capacitor.config.json
    package.json

  qa/
    checks/
    lib/
    tests/
    run-tests.mjs
    test.config.json

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

Frontend (`web/.env`):

```env
VITE_API_URL=http://localhost:5000/api
VITE_API_TIMEOUT=10000
VITE_AUTH_MODE=mock
VITE_APP_NAME=FinanceApp
VITE_APP_VERSION=1.2.0
```

No subir archivos `.env` al repositorio.

## Testing

Ejecucion centralizada recomendada:

```powershell
node qa/run-tests.mjs all --profile quick
node qa/run-tests.mjs all --profile full
```

El perfil `quick` prioriza retroalimentacion rapida. El perfil `full` agrega suites, builds y comprobacion de artefactos. Los controles manuales se reportan como `PENDING_MANUAL`, nunca como aprobados automaticos.

Backend:

```bash
cd backend
npm test
npm run test:coverage
```

Frontend unitario:

```bash
cd web
npm run test:unit
```

Resultado verificado actual: **28/28** en tres archivos, incluidos 11 casos de
actualizacion automatica y manual en `useDataRefresh.test.js`.

Frontend E2E:

```bash
cd web
npm run test:e2e
```

Resultado verificado actual: **78/78** en 10 specs. `expenses.cy.js` incluye
cinco escenarios para el boton `Actualizar`, su traduccion, el ciclo de 30 segundos y
la conservacion de filtros.

Pruebas E2E focalizadas usadas para validar los flujos tocados con offline, categorias y formularios:

```bash
cd web
npm run cypress:run -- --spec "cypress/e2e/expenses.cy.js,cypress/e2e/incomes.cy.js,cypress/e2e/categories.cy.js"
```

Frontend accessibility smoke:

```bash
cd web
npm run test:a11y
```

Abrir Cypress en modo visual:

```bash
cd web
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
FinanceApp 1.2.0
```

Generar instalador:

```bash
cd installer
npm run build:dist
```

Pruebas del cliente de escritorio:

```bash
cd installer
node --test tests/app-protocol.test.mjs tests/production-api-config.test.mjs tests/presentation-evidence-support.test.mjs
npm run test:smoke
npm run test:smoke:production
```

El release utiliza `app://financeapp/` y la API compartida. No empaqueta ni
inicia un backend en el puerto 5000.

Salida local:

```text
installer/release/FinanceApp Setup 1.2.0.exe
```

El nombre del instalador se calcula desde `installer/package.json`, usando `build.productName` y `version`. La carpeta `installer/release/` esta ignorada por Git porque contiene artefactos pesados. No debe subirse al repositorio.

## Estado del Proyecto

| Modulo | Estado |
| --- | --- |
| Autenticacion | Completo |
| Gastos | Completo |
| Ingresos | Completo |
| Categorias | Completo |
| Reportes | Completo |
| Presupuestos | Completo |
| Perfil de usuario | Completo |
| Offline create/sync | Completo para ingresos y gastos |
| Electron desktop | Completo |
| Android con Capacitor | Completo para build y ejecucion; integración manual documentada en Pixel 8 Pro |
| Framework QA | Completo |

## Soporte

- Issues: abrir un issue en GitHub.
- Documentacion: revisar [ERRORES_COMUNES.md](ERRORES_COMUNES.md).
- Cypress: revisar [docs/CYPRESS_GUIDE.md](docs/CYPRESS_GUIDE.md).

## Licencia

MIT

---

Version: 1.2.0
Ultima actualizacion: Julio 2026
Estado: Produccion
