# Estructura actual del proyecto

Este mapa describe las carpetas mantenidas del repositorio. No enumera dependencias instaladas, artefactos generados ni archivos temporales.

```text
income_expense_management_system/
  backend/                    API REST
    server.js                 Entrada Express
    package.json
    vitest.config.js
    .env.example
    src/
      config/                 MongoDB y CORS
      constants/              Constantes compartidas
      controllers/            Adaptacion HTTP
      errors/                 Errores de aplicacion
      middlewares/            JWT y manejo de errores
      models/                 Esquemas Mongoose
      routes/                 Endpoints Express
      services/               Reglas de negocio
      utils/                  JWT y respuestas
      validators/             Validacion de entrada
    tests/
      unit/
      integration/
      helpers/
      fixtures/

  web/                        Cliente React compartido
    index.html
    package.json
    vite.config.js
    cypress.config.js
    .env.example
    scripts/                  Lanzador de Cypress
    src/
      main.jsx
      App.jsx
      components/             Componentes reutilizables
      constants/              Endpoints del cliente
      context/                Idioma y preferencias
      hooks/                  Estado y logica reutilizable
      locales/                Español e ingles
      pages/                  Pantallas del producto
      services/               API, exportacion y offline
      styles/                 CSS global y por pagina
      utils/                  Formato, fechas y validaciones puras
    cypress/
      e2e/                    Especificaciones E2E y accesibilidad
      fixtures/               Datos reutilizables
      support/                Comandos y configuracion

  installer/                  Cliente Windows
    package.json
    electron/
      main.cjs                Proceso principal
      preload.cjs             Puente seguro
    scripts/
      build-dist.ps1          Build y empaquetado
    tests/                    Smoke Playwright
    release/                  Artefactos locales ignorados

  mobile/                     Cliente Android Capacitor
    package.json
    capacitor.config.json
    README.md
    android/                  Proyecto Gradle/Android Studio

  qa/                         Framework coordinador de pruebas
    run-tests.mjs             CLI
    test.config.json          Catalogo de verificaciones
    checks/                   Seleccion por modulo
    lib/                      Procesos, estados y reportes
    tests/                    Pruebas del framework
    reports/                  Resultados locales ignorados

  docs/                       Documentacion tecnica y de demostracion
  evidencias/                 Resultados verificables de pruebas
  README.md                   Entrada general
  INICIO_RAPIDO.md            Puesta en marcha
  TESTING.md                  Guia operativa de pruebas
```

## Backend

El backend sigue el flujo `routes -> controllers -> services -> models`. Los validadores y middlewares cruzan ese flujo antes del controlador. Los modelos activos son:

- `User.js`
- `Category.js`
- `Expense.js`
- `Income.js`
- `Budget.js`

Las rutas activas son `auth`, `expenses`, `incomes`, `categories`, `budgets`, `users` y `reports`. Consultar [API.md](API.md) para el inventario completo.

## Web

Las paginas activas son Login, Register, Dashboard, Expenses, Incomes, Categories, Budgets, Reports y Profile. La logica HTTP vive en servicios, no directamente en las paginas. Las reglas reutilizables viven en hooks o utilidades.

No existen actualmente `src/components/Button.jsx`, `src/models/index.js`, `src/constants/categories.js` ni `src/utils/validators.js`; fueron eliminados porque no eran alcanzables desde ningun punto de entrada.

## Relacion entre web, installer y mobile

`web/` es la unica implementacion de interfaz:

- Electron copia o construye esa interfaz dentro de `installer/dist`.
- Capacitor usa `web/dist` mediante `webDir: "../web/dist"`.
- Los tres clientes llaman a la misma API.

Por esto, un cambio visual debe verificarse como minimo en navegador y, si afecta integracion de contenedor o red, también en Electron y Android.

## Archivos generados que no deben versionarse

- `node_modules/`
- archivos `.env`
- `web/dist/`
- `installer/dist/`
- `installer/release/`
- `mobile/android/app/build/`
- `backend/coverage/`
- `web/cypress/screenshots/`
- `web/cypress/videos/`
- `qa/reports/`
- `graphify-out/`

## Donde agregar cambios

| Cambio | Ubicacion principal |
|---|---|
| Nuevo endpoint | `backend/src/routes`, `controllers`, `services`, `validators` y tests |
| Nueva entidad persistente | `backend/src/models` y capas relacionadas |
| Nueva pantalla | `web/src/pages` y estilos existentes |
| Logica de interfaz reutilizable | `web/src/hooks` o `web/src/utils` |
| Llamada HTTP | `web/src/services` y `constants/apiEndpoints.js` |
| Comportamiento Electron | `installer/electron` |
| Configuracion Android | `mobile/` o `mobile/android/` |
| Nueva comprobacion transversal | `qa/test.config.json` y `qa/checks` |

Ultima revision: 14 de julio de 2026.
