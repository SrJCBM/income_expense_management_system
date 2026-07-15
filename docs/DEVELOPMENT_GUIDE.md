# Guia de desarrollo de FinanceApp

## Alcance actual

El repositorio mantiene cinco piezas relacionadas:

- `backend`: API REST y persistencia.
- `web`: interfaz React compartida.
- `installer`: contenedor Electron y paquete NSIS.
- `mobile`: contenedor Capacitor para Android.
- `qa`: orquestador comun de verificaciones.

Antes de modificar un modulo, revisa [ARCHITECTURE.md](ARCHITECTURE.md), [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) y el estado de Git.

## Preparacion local

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item web/.env.example web/.env
npm --prefix backend install
npm --prefix web install
npm --prefix installer install
npm --prefix mobile install
```

Configura `MONGODB_URI`, `JWT_SECRET` y `FRONTEND_URL` sin publicar secretos. Para desarrollo web, `VITE_API_URL` suele ser `http://localhost:5000/api`.

Arranque:

```powershell
npm --prefix backend run dev
npm --prefix web run dev
```

## Convenciones del backend

Mantener el flujo:

```text
route -> validator/middleware -> controller -> service -> model
```

- La ruta declara verbo, URL y middlewares.
- El validador comprueba formato y campos obligatorios.
- El controlador se limita a HTTP, parametros y respuesta.
- El servicio contiene reglas, consultas y errores de negocio.
- El modelo define persistencia e indices.
- Las respuestas comunes usan `responseFormatter.js`.
- Toda consulta privada filtra por el usuario autenticado.

Para un endpoint nuevo, actualizar en el mismo cambio la ruta, controlador, servicio, validacion, pruebas y [API.md](API.md). No introducir contratos visibles solo en el frontend.

## Convenciones del frontend

- Pantallas completas en `web/src/pages`.
- Componentes compartidos en `web/src/components`.
- Estado y efectos reutilizables en `web/src/hooks`.
- HTTP en `web/src/services` y rutas en `constants/apiEndpoints.js`.
- Funciones puras en `web/src/utils`, acompañadas de Vitest cuando sea apropiado.
- Estilos en el CSS existente bajo `web/src/styles`.
- Textos visibles sincronizados en `locales/es.js` y `locales/en.js`.

No hacer llamadas Axios directamente desde varias paginas. No duplicar reglas de contraseña, formato monetario ni mensajes de red.

Cuando una creacion de gasto o ingreso funcione offline, debe conservar `clientRequestId`, persistir la cola y tolerar reintentos. Los cambios en ese flujo requieren revisar las pruebas Cypress de ambos tipos de movimiento.

## Electron

Electron reutiliza la salida web. Los cambios normales de interfaz pertenecen a `web`, no a una copia dentro de `installer`.

```powershell
npm --prefix installer run electron-dev
npm --prefix installer run test:smoke
npm --prefix installer run build:dist
```

Modificar `electron/main.cjs` o `preload.cjs` solo para comportamiento del contenedor: ventana, ciclo de vida, seguridad o APIs expuestas. No habilitar `nodeIntegration` en el renderer ni desactivar `contextIsolation` sin una justificacion de seguridad.

`installer/release/` contiene salidas generadas y no debe commitearse.

## Android y Capacitor

La fuente de interfaz sigue siendo `web/src`. El flujo es:

```powershell
npm --prefix mobile run sync:dev
npm --prefix mobile run open:android
```

Para una entrega:

```powershell
npm --prefix mobile run sync:prod
npm --prefix mobile run apk:debug
```

No editar manualmente archivos web copiados dentro de Android: se reemplazan en el siguiente `cap sync`. Los cambios nativos se hacen en `mobile/android`; la configuracion general vive en `mobile/capacitor.config.json`.

En emulador, `localhost` apunta al propio Android. La URL de API debe resolverse hacia la laptop antes del build movil. Verificar login, navegacion, una escritura y lectura desde web para demostrar integracion real.

## Pruebas durante el desarrollo

Comprobacion centralizada rapida:

```powershell
node qa/run-tests.mjs all --profile quick
```

Antes de una entrega:

```powershell
node qa/run-tests.mjs all --profile full
```

Comandos directos utiles:

```powershell
npm --prefix backend run test:unit
npm --prefix backend run test:coverage
npm --prefix web run test:unit
npm --prefix web run build
npm --prefix web run test:e2e
npm --prefix web run test:a11y
npm --prefix installer run test:smoke
```

Un build aprobado solo confirma compilacion o empaquetado. No reemplaza Cypress, Playwright ni el smoke manual de Android. `PENDING_MANUAL` no debe reportarse como `PASS`.

## Flujo recomendado para un cambio

1. Revisar `git status --short` y preservar cambios ajenos.
2. Identificar el modulo dueño de la conducta.
3. Agregar o actualizar la prueba mas cercana al riesgo.
4. Implementar el cambio sin duplicar responsabilidades.
5. Ejecutar pruebas focalizadas.
6. Ejecutar build o perfil QA correspondiente.
7. Actualizar documentación si cambia un contrato, comando o flujo.
8. Revisar el diff y evitar artefactos generados.

## Diagnostico en Windows

Puertos ocupados:

```powershell
Get-NetTCPConnection -LocalPort 3000,5000 -ErrorAction SilentlyContinue
```

Health check:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

Si Cypress hereda una variable de Electron incompatible:

```powershell
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
```

Si Android no alcanza la API, confirmar la URL incorporada al build, el puerto 5000, firewall y que laptop/emulador compartan una ruta de red válida.

## Criterio de terminado

Un cambio esta listo cuando:

- el comportamiento solicitado funciona;
- las pruebas relacionadas pasan;
- el build afectado termina correctamente;
- no se agregaron secretos ni artefactos;
- la documentación coincide con el codigo;
- los controles manuales pendientes quedan declarados.

Ultima revision: 14 de julio de 2026.
