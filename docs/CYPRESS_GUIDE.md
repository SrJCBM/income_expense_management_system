# Cypress Guide

Guia para instalar, actualizar y ejecutar Cypress en el frontend despues de hacer pull del repositorio.

## Version usada

El proyecto usa Cypress `15.16.0`.

La version esta declarada en `frontend/package.json`:

```json
"cypress": "^15.16.0"
```

## Instalacion despues de pull

Desde la raiz del proyecto:

```bash
cd frontend
npm install
```

Si Cypress no abre o parece estar corrupto, reinstala el binario local:

```bash
cd frontend
npx cypress cache clear
npx cypress install
```

## Abrir Cypress UI

Primero levanta el frontend:

```bash
cd frontend
npm run dev
```

En otra terminal:

```bash
cd frontend
npm run cypress
```

Tambien funciona:

```bash
npm run cypress:open
```

En la pantalla de Cypress:

1. Selecciona `E2E Testing`.
2. Elige `Chrome`.
3. Presiona `Start E2E Testing in Chrome`.
4. Ejecuta los specs disponibles.

## Ejecutar pruebas en consola

Con el frontend levantado en `http://localhost:3000`:

```bash
cd frontend
npm run cypress:run
```

Tambien puedes usar:

```bash
npm run test:e2e
npm run test:a11y
```

Si `localhost` da problemas en Windows, usa `127.0.0.1` explicitamente:

```bash
npx cypress run --config baseUrl=http://127.0.0.1:3000 --browser chrome
```

Resultado esperado actual:

```text
29 passing
0 failing
```

## Problema conocido: ELECTRON_RUN_AS_NODE

Si aparece un error como:

```text
Cypress.exe: bad option: --smoke-test
Cypress.exe: bad option: --ping=...
```

o:

```text
Invalid or incompatible cached data (cachedDataRejected)
```

revisa si tienes activa la variable `ELECTRON_RUN_AS_NODE`.

En PowerShell:

```powershell
Get-ChildItem Env:ELECTRON*
```

Si aparece:

```text
ELECTRON_RUN_AS_NODE  1
```

quitala solo para la terminal actual antes de abrir Cypress:

```powershell
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
npm run cypress
```

Para correr en consola:

```powershell
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
npx cypress run --config baseUrl=http://127.0.0.1:3000 --browser chrome
```

No es recomendable dejar `ELECTRON_RUN_AS_NODE=1` activo globalmente cuando se usa Cypress, porque Cypress ejecuta Electron internamente.

## Backend real vs mocks

Los specs actuales de Cypress usan mocks para endpoints protegidos. Esto evita que las pruebas fallen por:

- token vencido o inexistente,
- backend apagado,
- base de datos sin datos,
- redirecciones a login por `401`.

Los helpers estan en:

```text
frontend/cypress/support/commands.js
```

Helpers importantes:

- `cy.mockProtectedApi()`
- `cy.visitWithSession(path)`
- `cy.getByDataTest(testId)`
- `cy.auditA11y()`

Como la app usa `HashRouter`, las rutas reales en navegador son:

```text
/#/login
/#/register
/#/expenses
/#/reports
/#/categories
```

Usa `cy.visitWithSession('/expenses')` para rutas privadas; el helper convierte la ruta al formato hash y siembra la sesion.

## Specs actuales

```text
frontend/cypress/e2e/accessibility.cy.js
frontend/cypress/e2e/auth.cy.js
frontend/cypress/e2e/expenses.cy.js
```

## Recomendaciones para nuevos tests

- Usa `data-testid` para seleccionar elementos.
- No dependas del backend real si el objetivo es probar UI.
- Mockea endpoints con `cy.intercept`.
- Para rutas privadas usa `cy.visitWithSession`.
- Para accesibilidad usa `cy.auditA11y`.
- Si agregas una ruta nueva con `HashRouter`, recuerda que en navegador se vera como `/#/ruta`.

## Comandos rapidos

```bash
cd frontend
npm install
npm run dev
npm run cypress
```

```powershell
cd frontend
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
npx cypress run --config baseUrl=http://127.0.0.1:3000 --browser chrome
```
