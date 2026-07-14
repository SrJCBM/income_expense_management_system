# Resultados verificados de pruebas de FinanceApp

- Fecha de consolidacion: 2026-07-14
- Alcance: evidencia estable para la demostracion de la rubrica.
- Fuente incluida en la entrega: historial de resultados consolidado en `docs/PRUEBAS_MODULOS.md`, archivos de prueba del repositorio y comandos reproducibles indicados en este documento.

Este documento consolida resultados ya verificados durante la implementacion y la preparacion de la demostracion. No representa una nueva ejecucion de las suites en la fecha de consolidacion.

## Resultados

| Modulo | Comando reproducible | Resultado verificado | Alcance |
|---|---|---:|---|
| Backend | `npm --prefix backend run test:coverage` | **436/436 aprobadas** | 16 archivos de prueba ejecutados en serie con Vitest y cobertura V8; los cuatro umbrales globales superaron 70%. |
| Web E2E | `npm --prefix web run test:e2e` | **73/73 aprobadas** | Suite Cypress completa de autenticacion, dashboard, gastos, ingresos, categorias, presupuestos, perfil, reportes, regresiones y accesibilidad. |
| Framework QA | `node --test qa/tests/*.test.mjs` | **20/20 aprobadas** | Nucleo, adaptadores y CLI del framework; normalizacion de estados, comandos Windows, artefactos, reportes y `--dry-run`. |

## Condiciones de reproduccion

En una clonacion limpia se debe ejecutar primero `npm install` en `backend`, `web`, `mobile` e `installer`. La ausencia de lockfiles en alguno de esos modulos se considera una observacion menor no bloqueante para esta entrega; `npm install` sigue siendo el procedimiento documentado.

Las pruebas E2E levantan Vite mediante el script del proyecto. El backend usa MongoDB temporal y ejecucion serial. En la preparacion historica, un primer intento del framework QA no pudo importar las dependencias porque el worktree no tenia `backend/node_modules`; despues de disponer de las dependencias, el mismo comando verifico `20/20`. Esta nota conserva el contexto real y no presenta esa repeticion como una ejecucion nueva de esta entrega.

## Limites de la evidencia

- Los controles manuales de instalacion NSIS y smoke funcional Android no forman parte de los tres conteos anteriores y permanecen manuales.
- Una captura puede complementar esta evidencia durante la exposicion, pero no sustituye el resultado trazable ni convierte una comprobacion pendiente en aprobada.
- No se incluyen tokens, contrasenas, cadenas de conexion ni valores de archivos `.env`.
