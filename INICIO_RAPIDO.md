# Inicio rapido de FinanceApp

Esta guia permite levantar la API y la interfaz web, abrir la version de escritorio, preparar Android y ejecutar las verificaciones comunes.

## Requisitos

- Node.js 18 o superior y npm.
- MongoDB local o una conexion MongoDB Atlas.
- PowerShell en Windows.
- Android Studio y un JDK compatible solo para el modulo movil.

## 1. Preparar variables de entorno

Desde la raiz del repositorio:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item web/.env.example web/.env
```

Configura como minimo `MONGODB_URI` y `JWT_SECRET` en `backend/.env`. Para desarrollo local, `web/.env` debe apuntar a:

```env
VITE_API_URL=http://localhost:5000/api
```

No publiques los archivos `.env` ni sus secretos.

## 2. Levantar backend y web

Terminal 1:

```powershell
cd backend
npm install
npm run dev
```

El backend queda en `http://localhost:5000`. Comprueba su estado en `http://localhost:5000/api/health`. El servidor no abre un navegador automaticamente.

Terminal 2:

```powershell
cd web
npm install
npm run dev
```

Abre `http://localhost:3000`. La interfaz usa la API configurada en `VITE_API_URL`.

## 3. Ejecutar Electron

Primero deja el backend disponible. Luego instala y abre el cliente de escritorio:

```powershell
cd installer
npm install
npm run electron-dev
```

Para producir el instalador de Windows:

```powershell
npm run build:dist
```

El artefacto se genera en `installer/release/`. Esa carpeta es local y no se versiona.

## 4. Preparar Android

La aplicacion movil reutiliza el build React de `web/`. Para sincronizarlo con Capacitor:

```powershell
cd mobile
npm install
npm run sync:dev
npm run open:android
```

Android Studio abre el proyecto `mobile/android`. Para el emulador, la API debe ser accesible desde Android; no uses `localhost` si el backend corre en la laptop. Configura la URL correspondiente al host y la red de prueba antes de construir el frontend movil.

Para crear un APK debug:

```powershell
npm run apk:debug
```

Salida esperada: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`.

## 5. Ejecutar pruebas

El framework QA coordina las herramientas de cada modulo:

```powershell
node qa/run-tests.mjs all --profile quick
node qa/run-tests.mjs all --profile full
```

También puede ejecutarse por modulo:

```powershell
node qa/run-tests.mjs backend --profile full
node qa/run-tests.mjs web --profile full
node qa/run-tests.mjs installer --profile quick
node qa/run-tests.mjs mobile --profile full
```

`PASS` significa que una comprobacion automatica termino bien. `PENDING_MANUAL` indica una actividad humana pendiente y no equivale a un aprobado.

## Direcciones locales

| Servicio | Direccion |
|---|---|
| Web | `http://localhost:3000` |
| API | `http://localhost:5000/api` |
| Health check | `http://localhost:5000/api/health` |

## Siguiente lectura

- [Configuracion detallada](docs/SETUP.md)
- [Arquitectura](docs/ARCHITECTURE.md)
- [API REST](docs/API.md)
- [Estrategia de pruebas](docs/PRUEBAS_MODULOS.md)
- [Errores comunes](ERRORES_COMUNES.md)
