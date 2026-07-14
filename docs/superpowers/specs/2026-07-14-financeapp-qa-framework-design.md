# Diseño del framework unificado de pruebas de FinanceApp

## 1. Objetivo

Diseñar una capa propia de organización, ejecución y reporte de pruebas para los módulos web, instalador de escritorio y móvil de FinanceApp. El framework no reemplazará los motores de pruebas existentes: los coordinará mediante una interfaz común, criterios de aprobación consistentes y reportes comprensibles.

La primera implementación se concentrará en automatizar el módulo web y el instalador Electron. El módulo Android quedará documentado y conectado al modelo del framework mediante comprobaciones de build y pasos manuales, sin introducir Espresso, Appium ni nuevas pruebas instrumentadas en esta fase.

React Doctor queda fuera del alcance del framework y de la documentación funcional solicitada.

## 2. Alcance

### Incluido en esta fase

- Un directorio raíz `qa/` con el orquestador y la configuración compartida.
- Ejecución por módulo: `web`, `installer`, `mobile` o `all`.
- Perfiles `quick` y `full` para diferenciar validaciones rápidas de recorridos completos.
- Integración de Vitest para las pruebas unitarias del frontend.
- Integración de Cypress para pruebas E2E y accesibilidad del frontend.
- Validación del build de producción de Vite.
- Integración de Playwright con Electron para pruebas de arranque y navegación básica.
- Validación del build de distribución del instalador.
- Validación del build web móvil, sincronización de Capacitor y generación del APK cuando se ejecute el perfil completo.
- Registro explícito de comprobaciones móviles que todavía requieren emulador y participación manual.
- Reportes normalizados en Markdown y JSON.
- Un documento detallado en `docs/PRUEBAS_MODULOS.md` para uso técnico y defensa del proyecto.

### Fuera de alcance

- Cambios en contratos del backend o en la lógica funcional de la aplicación.
- Migración o rediseño de las pruebas del backend.
- React Doctor.
- Appium, Espresso y automatización de interfaz Android.
- Automatización del instalador gráfico NSIS de principio a fin.
- Firma de ejecutables, publicación de artefactos o despliegue continuo.
- Sustitución de Cypress por Playwright en el módulo web.

## 3. Enfoque

El framework será una capa de orquestación propia basada en Node.js. Esta decisión permite ejecutarlo en el mismo entorno que ya utiliza el monorepo, evita depender exclusivamente de PowerShell y facilita añadir adaptadores futuros.

La estructura prevista es:

```text
qa/
  README.md
  test.config.json
  run-tests.mjs
  checks/
    web.mjs
    installer.mjs
    mobile.mjs
  lib/
    command-runner.mjs
    report-writer.mjs
  reports/
    .gitkeep

docs/
  PRUEBAS_MODULOS.md
```

El framework será propio en los aspectos que aportan valor al proyecto: selección de módulos, perfiles, orden de ejecución, estados, criterios de aprobación y formato de evidencias. Vitest, Cypress, Playwright, Vite, Electron Builder, Capacitor y Gradle seguirán siendo los motores especializados.

## 4. Interfaz de ejecución

La interfaz principal será:

```powershell
node qa/run-tests.mjs <modulo> --profile <perfil>
```

Ejemplos:

```powershell
node qa/run-tests.mjs web --profile quick
node qa/run-tests.mjs installer --profile quick
node qa/run-tests.mjs mobile --profile full
node qa/run-tests.mjs all --profile full
```

Valores admitidos:

- Módulos: `web`, `installer`, `mobile`, `all`.
- Perfiles: `quick`, `full`.
- Perfil predeterminado: `quick`.

Una entrada inválida terminará antes de ejecutar procesos y mostrará los valores aceptados. El orquestador devolverá código `0` únicamente cuando todas las comprobaciones obligatorias ejecutadas terminen correctamente. Una prueba fallida devolverá un código distinto de cero. Los pasos manuales pendientes se registrarán, pero no se interpretarán como aprobados ni provocarán por sí solos un fallo del proceso automatizado.

## 5. Estados normalizados

Cada comprobación tendrá uno de estos estados:

- `PASS`: la comprobación se ejecutó y cumplió su criterio.
- `FAIL`: la comprobación se ejecutó y no cumplió su criterio.
- `SKIPPED`: no correspondía al perfil elegido o no podía ejecutarse por una condición previamente declarada.
- `PENDING_MANUAL`: requiere una validación humana que todavía no fue registrada.

`SKIPPED` deberá incluir una razón. `PENDING_MANUAL` deberá incluir instrucciones concretas y el resultado esperado. El framework no convertirá automáticamente ninguno de estos estados en `PASS`.

## 6. Pruebas del módulo web

### Perfil rápido

1. **Pruebas unitarias con Vitest**
   - Ejecutará las pruebas de utilidades del frontend.
   - Incorporará al flujo normal los archivos existentes `passwordRules.test.js` y `parseAmount.test.js`.
   - Verificará reglas de contraseña, cálculo de fortaleza y conversión de importes.

2. **Build de Vite**
   - Ejecutará el build de producción.
   - Confirmará que imports, JSX, configuración y empaquetado básico son válidos.
   - No se presentará como prueba funcional de la interfaz.

3. **Smoke E2E**
   - Ejecutará un subconjunto corto de Cypress, preferiblemente el flujo de autenticación o regresión básica ya existente.
   - Confirmará que el frontend levanta, carga y permite completar el recorrido mínimo elegido.

### Perfil completo

Incluye el perfil rápido y añade:

- Suite Cypress completa.
- Pruebas de autenticación.
- Dashboard.
- Gastos e ingresos.
- Categorías y presupuestos.
- Perfil.
- Reportes y exportaciones.
- Regresión transversal.
- Accesibilidad con `cypress-axe`.

El script existente `web/scripts/run-cypress.cjs` seguirá siendo el punto de ejecución de Cypress para conservar su preparación de entorno y evitar duplicar lógica.

## 7. Pruebas del instalador Electron

### Perfil rápido

1. **Build web requerido por Electron**
   - Confirmará que los recursos de la interfaz pueden generarse para el escritorio.

2. **Smoke test con Playwright para Electron**
   - Lanzará Electron usando el punto de entrada real del instalador.
   - Confirmará que se crea al menos una ventana.
   - Esperará a que la ventana termine su carga inicial.
   - Comprobará que la aplicación presenta su interfaz principal o pantalla de autenticación.
   - Verificará una navegación básica que no modifique datos reales.
   - Cerrará la aplicación de forma controlada incluso cuando falle una aserción.

El smoke test no sustituirá las pruebas Cypress de reglas de negocio; su propósito será detectar errores específicos del contenedor Electron, rutas `file://`, preload, creación de ventanas y carga de recursos.

### Perfil completo

Incluye el perfil rápido y añade:

- Ejecución de `npm run build:dist` en `installer/`.
- Confirmación de que Electron Builder finaliza correctamente.
- Confirmación de que existe el artefacto esperado dentro de `installer/release/`.
- Registro del nombre, tamaño y fecha del artefacto como evidencia, sin modificar ni versionar el contenido de `installer/release/`.

La instalación gráfica del paquete NSIS, la creación de accesos directos y la desinstalación permanecerán como checklist manual, porque automatizarlas de forma estable excede esta fase.

## 8. Comprobaciones del módulo móvil

Android se integrará en el esquema de ejecución, pero no recibirá un framework de automatización de interfaz en esta fase.

### Perfil rápido

- Build de React en modo móvil mediante los scripts existentes.
- Sincronización de los recursos con Capacitor.
- Confirmación de que la sincronización termina sin errores.

### Perfil completo

Incluye el perfil rápido y añade:

- Compilación del APK debug mediante Gradle.
- Confirmación de que existe el APK esperado.
- Registro de metadatos básicos del artefacto.
- Estado `PENDING_MANUAL` para el smoke test en emulador.

El checklist manual móvil exigirá como mínimo:

1. Instalar y abrir el APK en un emulador o dispositivo.
2. Confirmar que la WebView carga sin pantalla en blanco.
3. Iniciar sesión contra el backend configurado.
4. Navegar por las vistas principales.
5. Crear una operación de prueba.
6. Confirmar que la operación aparece después de recargar o volver a la lista.

La compilación del APK no se documentará como evidencia suficiente de funcionamiento funcional.

## 9. Configuración

`qa/test.config.json` describirá comandos, directorios de trabajo, obligatoriedad y perfiles. No contendrá secretos, URL privadas ni valores tomados de archivos `.env` reales.

El orquestador heredará el entorno del proceso y respetará la configuración ya establecida por cada módulo. No leerá ni imprimirá variables secretas. Los requisitos previos se validarán mediante presencia de ejecutables o archivos necesarios, sin mostrar credenciales.

## 10. Reportes y evidencias

Cada ejecución generará dos archivos con la misma marca temporal:

```text
qa/reports/qa-report-AAAA-MM-DD-HHMMSS.md
qa/reports/qa-report-AAAA-MM-DD-HHMMSS.json
```

El reporte incluirá:

- Fecha y duración total.
- Perfil y módulos solicitados.
- Comando ejecutado para cada comprobación, sin valores secretos.
- Estado, duración y descripción.
- Motivo de fallos u omisiones.
- Ruta de evidencias generadas por Cypress, Playwright o los builds.
- Lista de validaciones manuales pendientes.
- Resumen final por módulo.

El JSON permitirá una futura integración con CI. El Markdown servirá como evidencia legible durante la defensa y para revisiones del equipo.

No se almacenará toda la salida de consola dentro del reporte. Se conservará un resumen y las últimas líneas relevantes de los procesos fallidos para evitar archivos excesivamente grandes.

## 11. Manejo de errores

- Un fallo en una comprobación no ocultará el resultado de las comprobaciones independientes restantes del mismo recorrido.
- Si una dependencia impide continuar, las comprobaciones dependientes se marcarán `SKIPPED` con una causa explícita.
- Un build web fallido impedirá los smoke tests que necesitan sus artefactos.
- El cierre de Electron se ejecutará en una fase de limpieza garantizada.
- La falta de emulador no se presentará como fallo del APK; se registrará como prueba manual pendiente.
- El proceso finalizará con error cuando exista al menos un `FAIL` obligatorio.

## 12. Criterios de aceptación

La primera versión estará completa cuando:

1. Los cuatro selectores de módulo funcionen.
2. Los perfiles `quick` y `full` ejecuten conjuntos distintos y documentados.
3. Vitest ejecute las pruebas unitarias existentes del frontend mediante un script de `web/package.json`.
4. Cypress continúe ejecutándose mediante su script actual.
5. Playwright abra y cierre correctamente la aplicación Electron en el smoke test.
6. El perfil completo valide el build de distribución sin alterar artefactos existentes intencionalmente.
7. Móvil ejecute sus builds disponibles y deje el smoke test funcional como `PENDING_MANUAL`.
8. Cada recorrido genere reportes Markdown y JSON.
9. Los códigos de salida reflejen correctamente éxito o fallo.
10. `docs/PRUEBAS_MODULOS.md` diferencie pruebas automatizadas, builds, smoke tests, pruebas manuales y cobertura pendiente.

## 13. Estrategia de implementación

La implementación se dividirá en lotes verificables:

1. Activar Vitest y normalizar las pruebas unitarias existentes.
2. Crear el núcleo del orquestador y los reportes.
3. Integrar web sin cambiar la lógica actual de Cypress.
4. Añadir el smoke test de Electron con Playwright.
5. Integrar builds y checklist móvil.
6. Escribir la documentación detallada y el guion de defensa.
7. Ejecutar perfiles rápidos por módulo y después un recorrido completo.

Cada lote conservará contratos y comportamiento visible. Los cambios locales existentes se revisarán y no se sobrescribirán ni incorporarán accidentalmente al trabajo del framework.

## 14. Presentación académica

El framework se defenderá como una arquitectura de calidad propia, no como un motor de pruebas inventado. Los puntos centrales serán:

- Una interfaz única para tres plataformas.
- Herramientas especializadas detrás de adaptadores comunes.
- Perfiles que equilibran velocidad y cobertura.
- Estados honestos que no confunden build con funcionamiento.
- Evidencias reproducibles en formatos humano y procesable.
- Capacidad de incorporar automatización Android posteriormente sin rediseñar el núcleo.

## 15. Ampliación aprobada: backend y suite Cypress completa

El backend se incorpora como cuarto selector del framework: `backend`. El perfil `quick` ejecutará las pruebas unitarias y el perfil `full` ejecutará la suite completa con cobertura V8 y umbral del 70%. El selector `all` incluirá backend, web, instalador y móvil.

La documentación deberá reflejar los 16 archivos y 436 casos del backend, distinguiendo unitarias e integración. Los errores de infraestructura de `mongodb-memory-server` se tratarán como fallos reales del entorno de pruebas, no como pruebas aprobadas ni como reglas de negocio fallidas.

El perfil web `full` ejecutará las 73 pruebas Cypress exactamente una vez. El smoke de 3 casos se conserva únicamente en `quick`; accesibilidad permanece dentro de la suite completa y no se repite como una segunda ejecución.

