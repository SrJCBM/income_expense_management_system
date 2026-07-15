# Arquitectura de FinanceApp

## Vision general

FinanceApp es un sistema cliente-servidor. Una sola API REST concentra autenticacion, reglas de negocio y persistencia; tres clientes presentan esas capacidades en navegador, escritorio y Android.

```text
Navegador web ---------+
Electron --------------+--> API REST Express --> Servicios --> Mongoose --> MongoDB
Android/Capacitor ------+
```

Los clientes no comparten una base local como fuente principal. Web, Electron y Android consumen los mismos endpoints `/api`, por lo que un cambio confirmado en el backend puede consultarse desde las otras plataformas. La cola offline de web y movil solo conserva temporalmente creaciones de ingresos y gastos hasta recuperar conectividad.

## Modulos ejecutables

### Backend

Tecnologias: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Helmet y CORS.

El flujo normal es:

```text
route -> validator/middleware -> controller -> service -> model -> MongoDB
```

- `server.js` configura Express, seguridad, parseo, rutas, health check y errores.
- `routes/` declara URLs y aplica autenticacion o validacion.
- `controllers/` traduce HTTP a llamadas de negocio y construye respuestas.
- `services/` implementa reglas de negocio y acceso coordinado a modelos.
- `models/` define User, Category, Expense, Income y Budget.
- `validators/` rechaza entradas invalidas antes de llegar a los servicios.
- `middlewares/` autentica JWT y centraliza errores.
- `utils/responseFormatter.js` normaliza respuestas simples y paginadas.

Todas las rutas de datos son privadas. El middleware obtiene el usuario del JWT y las consultas se limitan por `userId`.

### Web

Tecnologias: React 18, Vite, React Router, Axios, Recharts, jsPDF y XLSX.

```text
main.jsx -> App.jsx -> rutas/paginas -> hooks -> services -> Axios -> API
                         |              |
                         +-> componentes +-> estado y reglas reutilizables
```

- `pages/` contiene las vistas de autenticacion, dashboard, movimientos, categorias, presupuestos, reportes y perfil.
- `components/` contiene piezas reutilizables y la estructura de navegacion.
- `hooks/` coordina estado, carga, formularios, red y cola offline.
- `services/` encapsula llamadas HTTP, exportaciones y persistencia offline.
- `context/` mantiene idioma y configuraciones visibles.
- `locales/` contiene textos en español e ingles.
- `styles/` contiene el CSS existente del proyecto.

`PrivateRoute.jsx` protege rutas del navegador. `api.js` centraliza Axios, la URL base, el timeout y el encabezado de autenticacion.

### Instalador Electron

Electron reutiliza el build Vite, no mantiene un segundo frontend.

```text
web/src -> Vite build -> installer/dist -> Electron main/preload -> NSIS .exe
```

- `electron/main.cjs` administra el proceso principal y la ventana.
- `electron/preload.cjs` define el puente seguro permitido al renderer.
- `scripts/build-dist.ps1` prepara recursos y ejecuta electron-builder.
- `release/` recibe artefactos locales y permanece fuera de Git.

El smoke test abre el Electron real con Playwright. El build de NSIS demuestra que puede empaquetarse; la instalacion y desinstalacion siguen siendo controles manuales.

### Movil Android

Capacitor empaqueta el mismo frontend React dentro de una WebView Android.

```text
web/src -> Vite modo mobile -> web/dist -> cap sync -> mobile/android -> APK
```

- `capacitor.config.json` define `appId`, nombre y `webDir`.
- `npm run sync:dev` construye web en modo movil y sincroniza Android.
- `npm run open:android` abre el proyecto nativo en Android Studio.
- `npm run apk:debug` genera el APK de depuracion con Gradle.

Android y web comparten pantallas, servicios y cola offline. La diferencia principal es el contenedor y la direccion desde la que se alcanza la API.

## Sincronizacion e integracion

La comunicacion entre plataformas es bidireccional a traves del backend:

1. Un cliente envia una operacion autenticada.
2. El backend valida y persiste en MongoDB.
3. La API devuelve el recurso confirmado.
4. Los otros clientes consultan nuevamente y reciben el mismo estado.

Para creaciones offline, el cliente guarda la solicitud en IndexedDB con `clientRequestId`. Al volver la red, la cola reintenta la operacion. Los indices unicos de Expense e Income por usuario y `clientRequestId` evitan duplicados causados por reintentos.

## Seguridad

- Contraseñas almacenadas con bcrypt.
- JWT para rutas privadas.
- Helmet para encabezados HTTP.
- CORS limitado mediante configuracion de entorno.
- Validacion en backend, aun cuando el frontend tambien valide.
- Separacion de datos por `userId`.
- Secretos locales solo en `.env`, nunca en Git.

Guardar el token en almacenamiento del cliente implica un riesgo conocido frente a scripts inyectados. Una migracion a cookies HttpOnly requeriria cambios coordinados de backend, clientes, CORS y pruebas; no debe hacerse como limpieza aislada.

## Estrategia de calidad

- Backend: Vitest, Supertest y MongoMemoryServer.
- Web: Vitest, Cypress y cypress-axe.
- Electron: Playwright y build electron-builder/NSIS.
- Android: build Vite, sincronizacion Capacitor, Gradle y smoke manual en emulador.
- Coordinacion: framework propio `qa/run-tests.mjs` con perfiles `quick` y `full`.

Los detalles y resultados se mantienen en [PRUEBAS_MODULOS.md](PRUEBAS_MODULOS.md) y `evidencias/RESULTADOS_PRUEBAS.md`.

## Decisiones vigentes

- La API es la fuente compartida de verdad.
- Electron y Android reutilizan el frontend React.
- No se duplica logica de negocio del backend en los clientes.
- El build no se presenta como equivalente a una prueba funcional.
- Los controles humanos pendientes se identifican como `PENDING_MANUAL`.

Ultima revision: 14 de julio de 2026.
