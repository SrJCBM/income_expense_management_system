# Resultados verificados de pruebas de FinanceApp

- Fecha de actualización: 2026-07-14.
- Alcance: evidencia estable para la demostración de la rúbrica.
- Regla de lectura: se distingue entre ejecuciones actuales, resultados
  consolidados anteriores y controles manuales.

## Ejecuciones realizadas el 14/07/2026

| Módulo | Comando reproducible | Resultado | Alcance |
|---|---|---:|---|
| Web unitario | `npm --prefix web run test:unit` | **28/28** | Tres archivos. Incluye 11 casos de `useDataRefresh`: intervalo de 30 segundos, foco, visibilidad, reconexión, deduplicación, refresco manual, desactivación, limpieza y recuperación tras errores. |
| Web E2E | `npm --prefix web run test:e2e` | **78/78** | Diez specs Cypress. `expenses.cy.js` aprobó 16/16, incluidos cinco escenarios del botón `Actualizar`, su traducción y el polling. Videos desactivados y cero screenshots de fallo. |
| Instalador — Node | `node --test installer/tests/app-protocol.test.mjs installer/tests/production-api-config.test.mjs installer/tests/presentation-evidence-support.test.mjs` | **14/14** | Protocolo `app://financeapp`, build sin backend local, API compartida, seguridad de rutas, cierre de procesos y validación de evidencias. |
| Electron QA | `npm --prefix installer run test:smoke` | **1/1** | Abre Electron, renderiza React y comprueba el bridge seguro del preload. |
| Electron release | `npm --prefix installer run test:smoke:production` | **1/1** | Abre el ejecutable generado y confirma que carga `app://financeapp/`. |

## Resultados consolidados anteriores

| Módulo | Comando reproducible | Último resultado completo conservado | Alcance |
|---|---|---:|---|
| Backend | `npm --prefix backend run test:coverage` | **436/436** | Ejecución completa previa de 16 archivos con Vitest, Supertest, MongoDB temporal y cobertura V8; los cuatro umbrales globales superaron 70%. Después se añadieron dos casos CORS para Electron, verificados de forma focalizada, pero todavía no se presenta una nueva ejecución completa como 438/438. |
| Framework QA | `node --test qa/tests/*.test.mjs` | **20/20** | Núcleo, adaptadores y CLI: estados, comandos Windows, artefactos, reportes y `--dry-run`. |

## Evidencia manual de integración

Las capturas reales de web, Android y Electron muestran el registro
`DEMO INTEGRACION`, fecha `2026-07-15`, categoría `Transporte` y monto `$14,07`
mediante la misma cuenta y API. La ficha completa está en
[INTEGRACION_TRES_CLIENTES.md](./INTEGRACION_TRES_CLIENTES.md).

Este control demuestra el estado compartido en tres clientes, pero no se suma a
los conteos automatizados. La navegación Android continúa siendo una prueba
manual en el emulador Pixel 8 Pro.

## Condiciones de reproducción

En una clonación limpia se debe ejecutar `npm install` en `backend`, `web`,
`mobile` e `installer`. Cypress levanta Vite automáticamente. El backend usa
MongoDB temporal y ejecución serial. El smoke de producción requiere construir
primero `installer/release/win-unpacked/FinanceApp.exe`.

## Límites de la evidencia

- Un build confirma empaquetado; no sustituye una prueba funcional.
- Una captura complementa los resultados, pero no convierte un control manual
  en una prueba automatizada.
- El total completo de backend permanece en 436/436 hasta volver a ejecutar la
  suite completa después de los dos casos CORS añadidos.
- No se incluyen tokens, contraseñas, cadenas de conexión ni archivos `.env`.
