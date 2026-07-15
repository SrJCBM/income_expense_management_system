# Índice de capturas para la presentación

## Propósito

Este índice identifica qué demuestra cada imagen, de dónde proviene y qué límite debe explicarse durante la exposición. Las capturas con datos controlados sirven para reproducir estados concretos de la interfaz; no sustituyen la demostración de integración con la API real.

## Capturas generadas

| Archivo | Tipo de evidencia | Qué demuestra | Límite que debe mencionarse | Diapositiva sugerida |
|---|---|---|---|---:|
| `01-fecha-edicion-recorte.png` | Determinista, Playwright web | El campo de edición conserva exactamente `2026-03-15`. | La API está interceptada con datos conocidos; verifica la corrección visual y funcional del cliente. | 10 |
| `02-filtro-marzo-resultado-recorte.png` | Determinista, Playwright web | El filtro de marzo de 2026 y el resultado `2026-03-10` aparecen juntos. | No demuestra persistencia entre plataformas. | 11 |
| `03-montos-altos-limites.png` | Determinista, Playwright web | Los montos altos permanecen dentro de las tarjetas del dashboard. | El monto fue preparado para reproducir el caso límite. | 12 |
| `04-error-comunicacion.png` | Determinista, Playwright web | Una interrupción de la API produce un mensaje comprensible. | Es un fallo controlado de comunicación, no una caída real del servidor de producción. | 8 o respaldo |
| `05-comunicacion-recuperada.png` | Determinista, Playwright web | La vista vuelve a mostrar los datos después de restablecer la respuesta. | Demuestra recuperación del cliente con datos controlados. | 8 o respaldo |
| `06-web-datos-deterministas.png` | Determinista, Playwright web | La versión web presenta el registro identificable de demostración. | No debe etiquetarse como integración real. | Respaldo |
| `07-electron-datos-deterministas.png` | Determinista, Playwright + Electron | El cliente de escritorio presenta el mismo conjunto controlado. | Comparte los datos interceptados, no la base real. | Respaldo |
| `08-resultados-pruebas.png` | Derivada de logs reales y resultado consolidado | Distingue lo ejecutado ahora, el `dry-run` y las cifras consolidadas `436/436` y `73/73` del 14/07/2026. | Backend y Cypress no se volvieron a ejecutar solo para crear la imagen. | 7 |
| `09-artefactos-distribuibles.png` | Derivada del sistema de archivos | Existencia, tamaño, fecha y SHA-256 del instalador Windows y el APK debug. | No sustituye la instalación manual ni el smoke en emulador. | 5 o respaldo |
| `android-emulador.png` | Semiautomática, ADB + Pixel 8 Pro | FinanceApp ejecuta la pantalla de Gastos y muestra registros en el emulador de Android Studio. | El script automatiza la captura, no la navegación ni confirma por sí solo la sincronización con los otros clientes. | 4 o 6 |
| `android-studio-pixel-8-pro-gastos.png` | Captura visual de Android Studio | Presenta la pantalla de Gastos dentro del marco completo del Pixel 8 Pro, incluyendo el recorte de cámara y los límites físicos del dispositivo. | Es la versión recomendada para las diapositivas; conserva el mismo estado funcional que la captura ADB. | 4 |
| `integracion-web-real.png` | Fuente de integración real, web desplegada | El gasto `DEMO INTEGRACION` aparece con fecha `2026-07-15`, categoría `Transporte` y monto `$14,07`. | Captura fuente para la composición; conserva el contexto visible del navegador. | Respaldo |
| `integracion-android-real.png` | Fuente de integración real, Pixel 8 Pro | El gasto creado aparece inmediatamente en Android junto al mensaje de creación exitosa. | En el ancho móvil se ven fecha, concepto y categoría; el monto se contrasta en web y Electron. | Respaldo |
| `integracion-electron-real.png` | Fuente de integración real, Electron | El mismo gasto aparece en el cliente de escritorio con fecha, categoría y monto coincidentes. | Captura fuente para la composición; incluye el marco de la aplicación de escritorio. | Respaldo |
| `10-integracion-real-web-android-electron.png` | Integración real confirmada | El mismo registro en web, Android y Electron mediante una cuenta, API y base compartidas. | Solo se genera cuando existe `integracion-real.json` confirmado y tres PNG reales válidos. | 6 |

## Estado actual

- Las imágenes `01` a `09` se generaron y validaron como PNG.
- La captura Android se generó en el AVD `Pixel_8_Pro`, se validó como PNG y se revisó para evitar datos personales visibles. También se conserva una versión enmarcada de Android Studio para la presentación.
- La composición `10` se generó con tres capturas reales del gasto `DEMO INTEGRACION`: `2026-07-15`, `Transporte`, `$14,07`.
- Las fuentes confirman que el mismo estado aparece en web, Android y Electron mediante la cuenta y API compartidas.

## Resultados conservados

Los logs del último lote se guardan en `evidencias/capturas-presentacion/logs/`:

- `01-framework-qa.txt`: 20 pruebas aprobadas.
- `02-electron-smoke.txt`: una prueba aprobada.
- `03-rubrica-playwright.txt`: una prueba aprobada y nueve capturas de correcciones regeneradas.
- `04-qa-full-dry-run.txt`: 10 comprobaciones omitidas y dos controles manuales, sin presentarlos como aprobados.
- `05-capturas-presentacion.txt`: una prueba aprobada y capturas `01` a `10` regeneradas.

## Reproducción

Desde la raíz del proyecto:

```powershell
powershell -ExecutionPolicy Bypass -File evidencias/scripts/capturar-resultados-presentacion.ps1
```

Este comando ejecuta las pruebas QA pequeñas, el smoke Electron, la evidencia de rúbrica, el perfil QA en modo `dry-run` y finalmente las capturas de presentación. No ejecuta las suites completas de backend y Cypress.

Para capturar Android, abrir primero el emulador en Android Studio, iniciar FinanceApp y navegar manualmente al registro correcto:

```powershell
powershell -ExecutionPolicy Bypass -File evidencias/scripts/capturar-android.ps1
```

Para regenerar únicamente las imágenes Playwright:

```powershell
cd installer
npx playwright test tests/presentation-evidence.spec.mjs
```

## Composición de integración real

1. Preparar la misma cuenta y el mismo registro identificable en el backend real.
2. Guardar capturas reales como `integracion-web-real.png`, `integracion-android-real.png` e `integracion-electron-real.png` dentro de `evidencias/capturas-presentacion/`.
3. Copiar `evidencias/integracion-real.example.json` a `evidencias/integracion-real.json`.
4. Cambiar `recordLabel` por el texto exacto del registro mostrado y comprobar manualmente que las tres imágenes corresponden a ese registro.
5. Ejecutar nuevamente `npx playwright test tests/presentation-evidence.spec.mjs` desde `installer`.

`evidencias/integracion-real.json` está ignorado por Git porque funciona como una confirmación local de la demostración. Ningún token, contraseña ni valor de `.env` debe incluirse en ese archivo o en las imágenes.
