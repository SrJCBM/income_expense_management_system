# Estrategia y framework de pruebas de FinanceApp

## 1. Propósito

Este documento describe cómo se comprueba el funcionamiento de los tres módulos distribuibles de FinanceApp:

- **Web:** aplicación React ejecutada en un navegador.
- **Instalador:** aplicación de escritorio para Windows construida con Electron y NSIS.
- **Móvil:** aplicación Android construida con Capacitor que reutiliza el frontend React.

La estrategia diferencia cuatro conceptos que no deben confundirse:

1. Una **prueba automatizada** ejecuta el producto y compara el resultado con una expectativa.
2. Un **build** confirma que el código puede compilarse o empaquetarse, pero no demuestra por sí solo que todos los flujos funcionen.
3. Un **smoke test** recorre las funciones mínimas necesarias para detectar si una aplicación está inutilizable.
4. Una **prueba manual** exige una interacción humana que todavía no se automatiza de manera estable.

## 2. FinanceApp QA Framework

El proyecto incorpora una capa de pruebas propia en `qa/`. No pretende reemplazar herramientas maduras; las coordina bajo una interfaz, perfiles, estados, criterios y reportes comunes.

```text
qa/
  run-tests.mjs          CLI principal
  test.config.json       Catálogo de comprobaciones
  checks/                Adaptadores de web, instalador y móvil
  lib/                   Ejecución de procesos y reportes
  tests/                 Pruebas del propio framework
  reports/               Resultados Markdown y JSON ignorados por Git
```

### Comandos

```powershell
node qa/run-tests.mjs web --profile quick
node qa/run-tests.mjs installer --profile quick
node qa/run-tests.mjs mobile --profile full
node qa/run-tests.mjs all --profile full
```

Si no se indica un perfil, se utiliza `quick`. `--dry-run` permite revisar qué se ejecutaría sin iniciar herramientas externas.

### Perfiles

| Perfil | Objetivo | Uso recomendado |
|---|---|---|
| `quick` | Retroalimentación rápida mediante unitarias, builds básicos y smoke tests | Durante el desarrollo y antes de cada commit |
| `full` | Cobertura amplia, builds costosos y validación de artefactos | Antes de una entrega o demostración |

### Estados

| Estado | Significado |
|---|---|
| `PASS` | La comprobación se ejecutó y cumplió su criterio |
| `FAIL` | Se ejecutó y encontró un problema |
| `SKIPPED` | No se ejecutó por simulación o porque falló una dependencia |
| `PENDING_MANUAL` | Requiere una persona; no cuenta como aprobado automático |

Los códigos de salida son `0` sin fallos, `1` con al menos un fallo obligatorio y `2` para argumentos inválidos.

## 3. Matriz general de cobertura

| Módulo | Nivel | Herramienta | Automatización actual | Evidencia principal |
|---|---|---|---|---|
| Web | Unitarias | Vitest | Sí | Resumen de 17 aserciones |
| Web | Compilación | Vite | Sí | `web/dist/` y salida del build |
| Web | E2E smoke | Cypress | Sí | Resultado de `regression.cy.js`; screenshot solo al fallar |
| Web | E2E completo | Cypress | Sí | Resumen por spec y screenshots de fallos |
| Web | Accesibilidad | Cypress + cypress-axe | Sí | Resultado del spec y `a11y-violations.json` |
| Instalador | Arranque | Playwright + Electron | Sí | Resultado JSON de Playwright |
| Instalador | Distribución | electron-builder/NSIS | Sí | Archivo `.exe`, tamaño y fecha |
| Instalador | Instalación real | Windows/NSIS | Manual | Checklist firmado o capturas |
| Móvil | Build web/sync | Vite + Capacitor | Sí | Salida de `cap sync android` |
| Móvil | APK debug | Gradle | Sí | `app-debug.apk`, tamaño y fecha |
| Móvil | Flujo funcional | Emulador/dispositivo | Manual en esta fase | Checklist de login y operación |

## 4. Pruebas del módulo web

### 4.1 Pruebas unitarias con Vitest

Comando:

```powershell
npm --prefix web run test:unit
```

Actualmente se ejecutan dos archivos y 17 casos:

- `src/utils/passwordRules.test.js`: comprueba longitud mínima, mayúsculas, minúsculas, números, caracteres especiales, contraseña fuerte, nivel y etiqueta de fortaleza.
- `src/utils/parseAmount.test.js`: comprueba decimales con punto o coma, enteros, espacios, números ya convertidos y entradas inválidas.

Estas pruebas son rápidas y aisladas. Detectan errores en reglas puras sin abrir un navegador, pero no demuestran que los formularios rendericen ni que la API responda.

### 4.2 Build de Vite

Comando:

```powershell
npm --prefix web run build
```

Comprueba imports, sintaxis JSX, resolución de dependencias y generación de recursos optimizados. El criterio es código de salida `0` y existencia de `web/dist/`. Una advertencia de tamaño de bundle se registra, pero no equivale a un fallo funcional.

### 4.3 Smoke test E2E

Comando directo:

```powershell
npm --prefix web run test:e2e:smoke
```

El script levanta y cierra Vite automáticamente. Ejecuta `regression.cy.js` y valida:

1. Rechazo de nombres compuestos solo por símbolos.
2. Recuperación correcta de datos al editar un ingreso, incluida la fecha.
3. Ausencia de selectores de categoría duplicados en gastos.

Estos tres casos representan regresiones concretas y ofrecen una señal rápida antes de ejecutar toda la suite.

### 4.4 Suite E2E completa con Cypress

Comando:

```powershell
npm --prefix web run test:e2e
```

Cobertura por archivo:

| Spec | Funcionalidad comprobada |
|---|---|
| `auth.cy.js` | Registro, login, errores, persistencia, logout y rutas privadas |
| `dashboard.cy.js` | Totales, balance y montos altos |
| `expenses.cy.js` | CRUD, validaciones, búsqueda, filtros, orden y limpieza |
| `incomes.cy.js` | CRUD, obligatorios, montos, fechas y eliminación |
| `categories.cy.js` | Listado, creación, edición, eliminación, cancelación y nombres inválidos |
| `budgets.cy.js` | Progreso, excedidos, accesibilidad, CRUD y estado vacío |
| `profile.cy.js` | Datos, nombre, moneda, contraseña, errores y propagación de moneda |
| `reports.cy.js` | Resumen mensual, cambio de periodo y exportaciones PDF/Excel |
| `regression.cy.js` | Regresiones críticas de registro, fechas y formulario de gastos |
| `accessibility.cy.js` | Formularios, landmarks, botones y análisis axe |

La mayoría de pruebas intercepta peticiones HTTP con respuestas controladas. Esto las hace reproducibles y evita modificar información real, aunque no sustituye una prueba de integración contra un backend desplegado.

### 4.5 Accesibilidad

Comando:

```powershell
npm --prefix web run test:a11y
```

Comprueba la estructura de login y registro, además de landmarks y botones del dashboard. `cypress-axe` analiza problemas detectables automáticamente. Una auditoría automática no reemplaza pruebas humanas con teclado y lector de pantalla.

### 4.6 Evidencias web

- Cypress conserva screenshots cuando una prueba falla.
- Las exportaciones descargadas pueden comprobarse en `web/cypress/downloads/`.
- `web/cypress/a11y-violations.json` registra hallazgos de accesibilidad.
- La grabación de video está desactivada porque duplicaba evidencia, consumía espacio y no aportaba valor suficiente al diagnóstico habitual.

## 5. Pruebas del instalador Electron

### 5.1 Smoke test automatizado con Playwright

Comando:

```powershell
npm --prefix installer run test:smoke
```

Playwright inicia un servidor Vite temporal y lanza el punto de entrada real `installer/electron/main.cjs` en modo QA. El modo QA evita depender de MongoDB durante este smoke, pero utiliza la creación real de `BrowserWindow` y el preload real.

El caso comprueba que:

1. Electron crea una ventana antes del timeout.
2. El contenedor React `#root` es visible.
3. La URL cargada corresponde a `127.0.0.1:3000`.
4. El preload expone `window.desktop.isElectron === true`.
5. La aplicación y el servidor temporal se cierran incluso ante un fallo.

Impacto: detecta pantalla en blanco, entrada incorrecta, fallo de preload, ausencia de ventana y problemas de integración entre React y Electron. No prueba la instalación de NSIS ni las operaciones financieras completas, porque estas ya pertenecen a Cypress.

### 5.2 Build de distribución

Comando:

```powershell
npm --prefix installer run build:dist
```

El proceso compila web, prepara los recursos del backend y ejecuta Electron Builder para Windows x64. El framework busca un `.exe` bajo `installer/release/` y registra su ruta, tamaño y fecha sin modificarlo.

Un build correcto demuestra que el paquete puede generarse; no demuestra que el asistente gráfico se instale correctamente en todas las versiones de Windows.

### 5.3 Checklist manual NSIS

Estado: `PENDING_MANUAL` hasta registrar evidencia.

1. Ejecutar el instalador en Windows.
2. Elegir una carpeta de instalación.
3. Confirmar acceso directo en escritorio y menú Inicio.
4. Abrir FinanceApp desde el acceso directo.
5. Confirmar que no aparece una pantalla en blanco ni un error de recursos.
6. Cerrar la aplicación.
7. Desinstalarla desde Windows.
8. Confirmar que los accesos directos se retiraron.

## 6. Pruebas del módulo móvil

### 6.1 Arquitectura comprobada

Android no contiene una segunda interfaz: Capacitor empaqueta el build de `web/`. Por eso las pruebas Vitest y Cypress también protegen gran parte de su lógica visual y funcional. Aun así, la WebView, permisos, red, SDK y empaquetado requieren verificaciones específicas.

### 6.2 Sincronización Capacitor

Comando:

```powershell
npm --prefix mobile run sync:dev
```

Ejecuta el build web en modo móvil y `cap sync android`. Usa la URL de desarrollo preparada para el emulador (`10.0.2.2`). El criterio es salida `0` y recursos sincronizados dentro del proyecto Android.

### 6.3 Build del APK

Comando:

```powershell
npm --prefix mobile run apk:debug
```

Requiere JDK 17, Android SDK y `mobile/android/local.properties`. El APK esperado es:

```text
mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

El framework registra ruta, tamaño y fecha. La existencia del APK no prueba que la WebView cargue ni que la conexión al backend funcione.

### 6.4 Smoke test manual Android

La automatización de interfaz Android queda fuera de esta fase. El control mínimo es:

1. Instalar con `adb install -r mobile/android/app/build/outputs/apk/debug/app-debug.apk`.
2. Abrir FinanceApp y comprobar que no haya pantalla en blanco.
3. Levantar el backend accesible desde el emulador.
4. Iniciar sesión.
5. Navegar por dashboard, gastos e ingresos.
6. Crear una operación de prueba.
7. Recargar o volver al listado y confirmar persistencia.
8. Registrar dispositivo/AVD, versión Android, fecha y resultado.

## 7. Pruebas del propio framework

Comando:

```powershell
node --test qa/tests/*.test.mjs
```

Estas pruebas comprueban:

- Normalización de `PASS`, `FAIL`, `SKIPPED` y `PENDING_MANUAL`.
- Captura acotada de salida y códigos de proceso.
- Compatibilidad de comandos npm en Windows.
- Validación no destructiva de artefactos.
- Generación consistente de Markdown y JSON.
- Selección de checks por módulo y perfil.
- Rechazo de argumentos inválidos.
- Comportamiento de `--dry-run`.
- Conservación de controles manuales como pendientes.

## 8. Cómo interpretar un reporte

Cada ejecución escribe dos archivos en `qa/reports/`:

```text
qa-report-AAAA-MM-DD-HHMMSS.md
qa-report-AAAA-MM-DD-HHMMSS.json
```

Markdown es la evidencia para personas; JSON permite integrar CI posteriormente. Para aprobar una entrega no debe existir ningún `FAIL`. Los `PENDING_MANUAL` deben ejecutarse y registrarse antes de afirmar que la plataforma correspondiente fue verificada por completo.

## 9. Cobertura pendiente y mejoras futuras

| Pendiente | Riesgo cubierto | Prioridad sugerida |
|---|---|---|
| Automatizar instalación NSIS en una VM limpia | Permisos, accesos directos y desinstalación | Media |
| Añadir pruebas Android instrumentadas | WebView, lifecycle y navegación nativa | Media cuando continúe Android |
| Ejecutar E2E contra un backend de pruebas | Contratos y persistencia reales | Alta antes de producción |
| Añadir CI para perfiles quick | Regresiones en pull requests | Alta |
| Pruebas manuales con teclado/lector de pantalla | Barreras no detectadas por axe | Media |

## 10. Guion breve para defender el proyecto

> FinanceApp tiene tres formas de distribución que comparten lógica, pero presentan riesgos diferentes. Por eso construimos un framework de calidad propio que ofrece un comando, perfiles, estados y reportes comunes. No reinventamos motores de prueba: Vitest valida funciones puras, Cypress prueba los flujos web, Playwright abre el Electron real, y Capacitor/Gradle validan el paquete Android.
>
> Nuestro perfil rápido sirve durante el desarrollo y el completo antes de una entrega. Además, el framework es honesto: compilar no significa que una función opere correctamente, y una comprobación manual pendiente nunca aparece como aprobada. Los resultados se guardan en Markdown para la revisión humana y en JSON para una futura integración continua.
>
> Actualmente web y Electron tienen ejecución automatizada real. Android reutiliza la cobertura web y valida su build, mientras su smoke funcional sigue documentado como manual hasta incorporar pruebas instrumentadas en una fase posterior.

## 11. Evidencia verificada durante la implementación

- Vitest: 2 archivos, 17 pruebas aprobadas.
- Build Vite: completado correctamente.
- Cypress smoke: 3 pruebas aprobadas.
- Playwright Electron: 1 smoke test aprobado.
- Framework QA: pruebas de núcleo, adaptadores y CLI aprobadas.
- Android: prueba Gradle inicial bloqueada antes de sincronizar Capacitor; se mantiene como cobertura pendiente conforme al alcance aprobado.

