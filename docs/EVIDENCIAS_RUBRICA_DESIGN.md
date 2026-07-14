# Diseño de evidencias comparativas para la rúbrica

## Objetivo

Construir un paquete de evidencias que permita comparar las observaciones registradas en la práctica de laboratorio con el comportamiento actual de FinanceApp, dando prioridad a las correcciones visibles y reproducibles.

## Fuentes oficiales

Los archivos originales se copiarán sin modificaciones a:

- `evidencias/referencias/Rubrica.pdf`
- `evidencias/referencias/PracticaLab_Pruebas.pdf`

La práctica de laboratorio será la fuente del estado **Antes**. La rúbrica definirá qué criterios deben demostrarse y cómo deben explicarse.

## Evidencia visual

Las capturas **Después** se generarán con Playwright y se guardarán en `evidencias/capturas-rubrica/`. Cada imagen tendrá un nombre estable con número de observación y descripción breve.

Las correcciones de interfaz y robustez usarán datos controlados para que la captura pueda repetirse sin depender de información personal ni del estado de una cuenta. Las evidencias de integración usarán la API y la cuenta de demostración cuando el entorno compartido esté disponible.

La prioridad será cubrir las observaciones documentadas:

1. Rechazo de nombres compuestos solo por símbolos.
2. Precarga correcta al editar ingresos.
3. Fecha estable al guardar y editar.
4. Filtros de gastos aplicados correctamente.
5. Presencia de marzo en resultados filtrados.
6. Un solo selector de categoría en gastos.
7. Montos altos representados correctamente.
8. Contenido numérico sin desbordamiento visual.
9. Actividad reciente, solo si existe evidencia verificable.
10. Selección y conservación de iconos de categoría.

No se fabricará una captura para una observación que el producto no pueda demostrar. Esa observación quedará marcada como pendiente.

## Índice comparativo

`evidencias/INDICE_EVIDENCIAS_RUBRICA.md` relacionará:

- número y texto de la observación;
- referencia al PDF original;
- captura actual;
- pasos de reproducción;
- resultado esperado y observado;
- prueba automatizada relacionada;
- estado: corregido, pendiente o no demostrable.

El índice explicará que una captura apoya la evidencia visual, mientras Cypress o Playwright aportan repetibilidad. No presentará un build como prueba funcional.

## Higiene del repositorio

Se agregarán al `.gitignore` las carpetas locales `.agents/`, `.claude/`, `.codex/` y `.superpowers/`. `.git/` y `.github/` no se ignorarán. `.idea/` y `.worktrees/` ya tienen reglas.

Los archivos rastreados `.claude/settings.json` y `.codex/hooks.json` se retirarán del índice con `git rm --cached`, conservándolos en la computadora. Después de un commit y push desaparecerán de la versión actual de GitHub, aunque permanecerán en el historial anterior.

## Validación

- Verificar que las copias PDF coincidan byte a byte con los originales.
- Ejecutar cada escenario Playwright y comprobar que produce su imagen.
- Inspeccionar visualmente todas las capturas para asegurar legibilidad y ausencia de datos sensibles.
- Confirmar que cada archivo citado por el índice existe.
- Ejecutar `git diff --check` y revisar que no se versionen configuraciones locales ni artefactos temporales.

## Fuera de alcance

- Reescribir el historial Git, salvo que se descubran secretos reales.
- Grabar videos.
- Presentar como aprobada la observación de actividad reciente sin evidencia.
- Automatizar Android con pruebas instrumentadas en esta entrega.
