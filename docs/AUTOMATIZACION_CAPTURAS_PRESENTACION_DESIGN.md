# Diseño de automatización de capturas para la presentación

## Objetivo

Ampliar la evidencia visual de FinanceApp con capturas reproducibles para la presentación, manteniendo una separación explícita entre correcciones verificadas con datos controlados e integración demostrada con la API real.

## Clasificación de evidencia

### Evidencia determinista

Playwright intercepta llamadas de API con datos conocidos para reproducir estados concretos de interfaz. Sirve para demostrar validaciones, representación visual, filtros, errores y recuperación de forma repetible. No se presenta como prueba de persistencia real entre plataformas.

### Evidencia de integración real

Web, Electron y Android utilizan la misma cuenta, API y base de datos. Las capturas deben mostrar un registro identificable compartido entre los tres clientes. No se interceptan endpoints para esta evidencia.

### Evidencia semiautomática Android

`adb screencap` captura el estado visible del emulador. El integrante abre previamente FinanceApp y navega al registro correcto; el script verifica que exista un dispositivo conectado y guarda la imagen. Esto automatiza la captura, no la navegación.

## Capturas deterministas adicionales

1. Recorte del campo de fecha mostrando `15/03/2026` durante la edición.
2. Recorte del filtro de marzo y la fila fechada `2026-03-10`.
3. Recorte de las tarjetas de montos altos y sus límites visuales.
4. Estado de error de comunicación con mensaje comprensible.
5. Estado recuperado después de restaurar la respuesta de la API.
6. Vista web con el conjunto de datos preparado para la composición multiplataforma.
7. Vista Electron con el mismo conjunto de datos preparado.

## Resultados automatizados

Un ejecutor debe lanzar y conservar la salida de:

- `node --test qa/tests/*.test.mjs`;
- `npm --prefix installer run test:smoke`;
- `npx playwright test tests/rubric-evidence.spec.mjs` desde `installer`;
- simulación `node qa/run-tests.mjs all --profile full --dry-run`.

Los logs se guardarán como texto. A partir de esos resultados se generará una lámina HTML local y Playwright la capturará como imagen. La lámina debe distinguir pruebas ejecutadas de comprobaciones omitidas o manuales.

No se volverá a ejecutar automáticamente la suite completa de 436 backend y 78 Cypress solo para tomar una captura si ya existe evidencia vigente en `evidencias/RESULTADOS_PRUEBAS.md`. Si se muestran esas cifras, deben etiquetarse con la fecha de su ejecución documentada.

## Captura Android

El script PowerShell debe:

1. localizar `adb.exe` en el Android SDK local;
2. comprobar que exista exactamente un dispositivo o emulador autorizado;
3. ejecutar `adb exec-out screencap -p`;
4. guardar un PNG válido en `evidencias/capturas-presentacion/`;
5. informar claramente si el emulador no está disponible.

No enviará toques ni coordenadas mediante `adb input`; el estado debe prepararse manualmente para evitar una automatización frágil.

## Composición de integración

Cuando existan las tres capturas reales, un script generará una composición 16:9 con:

- Web a la izquierda.
- Android al centro dentro de un marco vertical.
- Electron a la derecha.
- El nombre del mismo registro y una leyenda: `Una API · Una cuenta · Un estado compartido`.

La composición solo se marcará como integración real cuando las tres imágenes provengan del entorno compartido. Mientras falte Android se conservarán las imágenes separadas y no se generará una composición que pueda inducir a error.

## Artefactos distribuibles

Se comprobará la existencia de:

- `installer/release/FinanceApp Setup 1.2.0.exe`;
- `mobile/android/app/build/outputs/apk/debug/app-debug.apk`.

Si existen, una lámina mostrará nombre, tamaño, fecha y hash SHA-256. Si falta alguno, se reportará como ausente sin crear una evidencia simulada.

## Ubicaciones

- Automatización Playwright: `installer/tests/presentation-evidence.spec.mjs`.
- Ejecutor de resultados: `evidencias/scripts/capturar-resultados-presentacion.ps1`.
- Captura Android: `evidencias/scripts/capturar-android.ps1`.
- Salidas finales: `evidencias/capturas-presentacion/`.
- Índice: `evidencias/INDICE_CAPTURAS_PRESENTACION.md`.

## Reglas

- No generar videos.
- No mostrar contraseñas, tokens, `.env` ni datos personales.
- No afirmar que se ejecutaron pruebas de carga.
- Mantener nombres y fechas visibles en tamaño legible para un proyector.
- Conservar logs reales junto a las imágenes derivadas.
- Inspeccionar visualmente cada PNG antes de usarlo en el PowerPoint.

## Criterios de terminado

- Las capturas deterministas se regeneran con un comando.
- Los recortes muestran claramente el elemento que se pretende demostrar.
- Error y recuperación aparecen como dos estados diferentes.
- Los resultados se derivan de salidas reales y verificables.
- El script Android falla de forma clara mientras no exista emulador.
- Ninguna composición se presenta como integración real sin las tres fuentes reales.
