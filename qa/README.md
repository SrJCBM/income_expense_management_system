# FinanceApp QA Framework

Orquestador común para validar los módulos web, instalador Electron y móvil.

## Uso

```powershell
node qa/run-tests.mjs web
node qa/run-tests.mjs installer --profile quick
node qa/run-tests.mjs mobile --profile full
node qa/run-tests.mjs all --profile full
```

`quick` ejecuta las comprobaciones rápidas; `full` añade suites y builds costosos. `--dry-run` permite revisar la selección sin iniciar herramientas externas.

## Estados

- `PASS`: comprobación ejecutada correctamente.
- `FAIL`: comprobación ejecutada con error.
- `SKIPPED`: omitida por perfil, dependencia o simulación.
- `PENDING_MANUAL`: requiere verificación humana y nunca equivale a éxito.

Los reportes Markdown y JSON se escriben en `qa/reports/`. La CLI devuelve `0` sin fallos, `1` si falla una comprobación obligatoria y `2` ante argumentos inválidos.

Las pruebas E2E necesitan el entorno requerido por Cypress. El smoke Electron administra su servidor Vite mediante Playwright. Android conserva comprobaciones de build y controles manuales en esta fase.
