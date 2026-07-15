# Guia operativa de pruebas de FinanceApp

Esta guia explica que ejecutar. La estrategia, cobertura por riesgo y justificacion del framework propio se desarrolla en [docs/PRUEBAS_MODULOS.md](docs/PRUEBAS_MODULOS.md). Los resultados verificados para la entrega se conservan en [evidencias/RESULTADOS_PRUEBAS.md](evidencias/RESULTADOS_PRUEBAS.md).

## Resumen

| Area | Herramienta | Alcance |
|---|---|---|
| Backend | Vitest, Supertest, MongoMemoryServer, V8 | Servicios, validadores, API, persistencia y cobertura |
| Web unitario | Vitest | Reglas puras de contraseña y montos |
| Web E2E | Cypress | Flujos visibles, regresion e integracion controlada |
| Accesibilidad | Cypress + cypress-axe | Violaciones automatizables WCAG |
| Electron | Playwright | Arranque y render del cliente real |
| Android | Vite, Capacitor, Gradle y emulador | Sincronizacion, APK y smoke funcional manual |
| Orquestacion | `qa/run-tests.mjs` | Perfiles, dependencias, estados y reportes comunes |

## Framework QA propio

El framework no reemplaza los motores de prueba. Los coordina con una interfaz estable:

```powershell
node qa/run-tests.mjs <modulo> --profile <perfil>
```

Modulos: `backend`, `web`, `installer`, `mobile` y `all`.

- `quick`: verificaciones rapidas para desarrollo.
- `full`: suites completas, builds y artefactos para entrega.

```powershell
node qa/run-tests.mjs all --profile quick
node qa/run-tests.mjs backend --profile full
node qa/run-tests.mjs web --profile full
node qa/run-tests.mjs installer --profile quick
node qa/run-tests.mjs mobile --profile full
node qa/run-tests.mjs all --profile full --dry-run
```

Estados:

- `PASS`: la comprobacion se ejecuto y cumplio su criterio.
- `FAIL`: se ejecuto y fallo.
- `SKIPPED`: no se ejecuto por perfil, simulacion o dependencia fallida.
- `PENDING_MANUAL`: necesita una persona y no cuenta como aprobado automatico.

Los reportes Markdown y JSON se generan en `qa/reports/`. La salida `0` significa ausencia de fallos automaticos, `1` indica al menos un fallo obligatorio y `2` argumentos invalidos.

## Backend

Suite completa:

```powershell
cd backend
npm test -- --run
```

Inventario vigente documentado: 16 archivos y 436 casos entre pruebas unitarias e integracion.

```powershell
npm run test:unit
npm run test:coverage
```

La cobertura exige al menos 70% en lineas, funciones, ramas y sentencias. Los artefactos aparecen en `backend/coverage/` y no deben commitearse.

Las pruebas de integracion usan una instancia temporal de MongoDB; no apuntan a la base local ni a datos reales. `vitest.config.js` serializa archivos para evitar competencia de varios procesos MongoDB en la laptop.

## Web

Unitarias y build:

```powershell
cd web
npm run test:unit
npm run build
```

Las unitarias validan reglas puras en `passwordRules.test.js` y `parseAmount.test.js`. El build confirma que Vite produce `web/dist`; no demuestra que los flujos funcionen.

Cypress completo:

```powershell
npm run test:e2e
```

El comando levanta Vite en `127.0.0.1:3000` y ejecuta las 10 especificaciones Cypress. El inventario verificado de la entrega contiene 73 casos.

Smoke y accesibilidad:

```powershell
npm run test:e2e:smoke
npm run test:a11y
```

El smoke usa `regression.cy.js`; accesibilidad usa `accessibility.cy.js` con axe. Una pasada automatica no sustituye pruebas manuales de teclado, foco, zoom o lector de pantalla.

Cypress interactivo, con Vite ya levantado:

```powershell
npm run cypress:open
```

La grabacion de video esta desactivada. Cypress conserva capturas cuando hay fallos; no genera videos como evidencia normal.

Si aparece `Cypress.exe: bad option: --smoke-test`:

```powershell
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
```

## Instalador Electron

```powershell
cd installer
npm run test:smoke
npm run build:dist
```

Playwright inicia el Electron real y comprueba contenido esencial. El `.exe` aparece en `installer/release/`. El build valida empaquetado, no instalacion real.

Control manual obligatorio para una entrega Windows:

1. Instalar el `.exe`.
2. Confirmar acceso directo y menu Inicio.
3. Abrir FinanceApp e iniciar sesion.
4. Navegar por las pantallas principales.
5. Cerrar y volver a abrir.
6. Desinstalar y confirmar que termina correctamente.

Este control se registra como evidencia manual, no como `PASS` automatico.

## Movil Android

```powershell
cd mobile
npm run sync:dev
npm run apk:debug
npm run open:android
```

APK esperado:

```text
mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

Smoke en Android Studio:

1. Iniciar el emulador e instalar la aplicacion.
2. Iniciar sesion contra la API de la laptop.
3. Navegar por dashboard, ingresos y gastos.
4. Crear una operacion desde movil.
5. Confirmar la misma operacion desde web.
6. Crear o editar desde web y actualizar movil.
7. Probar una entrada invalida y una perdida de comunicacion.

Esto demuestra integracion bidireccional. Ver la pantalla inicial o generar un APK no la demuestra.

## Pruebas del framework QA

```powershell
node --test qa/tests/*.test.mjs
```

Validan perfiles, dependencias, comandos, adaptadores, estados y reportes. El resultado verificado vigente es 20 casos aprobados.

## Orden antes de la demostracion

1. `node --test qa/tests/*.test.mjs`
2. `node qa/run-tests.mjs backend --profile full`
3. `node qa/run-tests.mjs web --profile full`
4. `node qa/run-tests.mjs installer --profile quick`
5. `node qa/run-tests.mjs mobile --profile full`
6. Ejecutar controles manuales de NSIS y emulador.
7. Registrar fecha, entorno y resultados en `evidencias/RESULTADOS_PRUEBAS.md`.

## Politica de evidencias

- No subir videos Cypress: estan desactivados.
- Conservar resumen, JSON, cobertura y capturas de fallos relevantes.
- No commitear `coverage`, `dist`, `release`, APK ni reportes temporales.
- Distinguir entre resultado ejecutado, historico y actividad manual pendiente.
- No actualizar cifras sin volver a ejecutar la herramienta correspondiente.

Ultima revision: 14 de julio de 2026.
