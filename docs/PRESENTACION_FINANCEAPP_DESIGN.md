# Diseño de la presentación de FinanceApp

## Objetivo

Crear una presentación PowerPoint editable que apoye una demostración en vivo de 30 minutos y permita al docente identificar claramente el cumplimiento de la rúbrica. La presentación debe explicar la arquitectura, integración, estrategia de pruebas, correcciones aplicadas y robustez sin sustituir la ejecución real de web, Android y Electron.

## Entregables esperados

- Archivo `.pptx` editable en formato 16:9.
- Código fuente utilizado para generar el PowerPoint.
- Quince diapositivas principales.
- Dos o tres diapositivas de respaldo después de la sección de preguntas.
- Sin notas del expositor y sin párrafos diseñados para ser leídos literalmente.

## Dirección visual

Usar un estilo híbrido académico + FinanceApp:

- Diapositivas teóricas con fondo claro, tipografía oscura y composición académica limpia.
- Acentos violeta, rosa y azul tomados de la interfaz de FinanceApp.
- Diapositivas de evidencia con marcos oscuros que integren naturalmente las capturas Playwright.
- Comparaciones con el estado **Antes** a la izquierda y **Después** a la derecha.
- Poco texto, alto contraste, títulos grandes y cifras visibles desde un proyector.
- No copiar logotipos, contenido ni afirmaciones técnicas de SummerDent; su PDF es únicamente referencia de ritmo visual y organización.

## Estructura principal

1. Portada: FinanceApp, materia e integrantes Julio Blacio, Ricardo Lainez y Ariel Llumiquinga.
2. Qué vamos a demostrar: tres clientes, una API, datos consistentes, correcciones y robustez.
3. Problema y objetivo: control financiero consistente desde web, móvil y escritorio.
4. Arquitectura multiplataforma: React/Vite, Electron, Capacitor, Express y MongoDB.
5. Recorrido de demostración: web crea, Android consulta y crea, Electron modifica, web confirma.
6. Framework QA propio: perfiles, estados y reportes comunes.
7. Estrategia de pruebas: unitarias, integración, E2E, accesibilidad, smoke, build y controles manuales.
8. Resultados: 436 backend, 73 Cypress, 20 QA, 17 web unitarias, smoke Electron y nueve capturas Playwright.
9. Punto de partida: 20 casos, 10 aprobados, 10 fallidos y 50% inicial.
10. Antes/después: validación de nombre, edición de ingreso y fecha estable.
11. Antes/después: filtros, marzo visible y selector de categoría único.
12. Antes/después: representación y contención de montos altos.
13. Antes/después: selector visual de iconos, actividad reciente pendiente y resultado 9/10 = 90%.
14. Robustez e integración: entradas inválidas, comunicación, recuperación y estado compartido.
15. Conclusiones y preguntas.

## Diapositivas de respaldo

- Matriz completa de las diez observaciones.
- Comandos y herramientas de prueba por módulo.
- Referencias documentales y ubicación de evidencias.

## Fuentes obligatorias del repositorio

- `evidencias/referencias/Rubrica.pdf`
- `evidencias/referencias/PracticaLab_Pruebas.pdf`
- `evidencias/INDICE_EVIDENCIAS_RUBRICA.md`
- `evidencias/RESULTADOS_PRUEBAS.md`
- `evidencias/capturas-rubrica/`
- `docs/GUIA_DEMOSTRACION_RUBRICA.md`
- `docs/PRUEBAS_MODULOS.md`
- `docs/ARCHITECTURE.md`
- `TESTING.md`
- `README.md`

## Uso del ejemplo visual externo

El material visual del equipo de referencia sirve únicamente para observar:

- separación clara por secciones;
- títulos grandes;
- combinación de capturas con explicaciones breves;
- diapositivas de arquitectura, métricas y conclusiones.

No se deben trasladar a FinanceApp pruebas de carga, estrés, cifras, bibliografía ni resultados ajenos. FinanceApp debe presentar solamente evidencia ejecutada y documentada en su propio repositorio.

## Reglas de evidencia

- La práctica de laboratorio es la fuente del **Antes**.
- Las capturas Playwright son la fuente visual del **Después**.
- Cypress, Vitest y Playwright aportan repetibilidad; una captura por sí sola no sustituye la prueba.
- No presentar `Actividad reciente` como corregida.
- Mantener el resultado defendible de nueve observaciones corregidas sobre diez: 90%.
- No afirmar que Android tiene pruebas instrumentadas automáticas.
- No afirmar que se realizaron pruebas de carga.
- No mostrar contraseñas, tokens, archivos `.env` ni datos personales.

## Criterios de calidad

- Cada diapositiva debe comunicar una sola idea principal.
- Máximo aproximado de 35 palabras visibles por diapositiva, excepto tablas de respaldo.
- Ningún texto menor a un tamaño legible en proyector.
- Las capturas deben conservar proporción, no deformarse y llevar un pie breve.
- Las diapositivas 10 a 13 deben ser el bloque visual más fuerte.
- La presentación debe complementar la demostración, no intentar contenerla completamente.
- El PowerPoint debe abrir sin advertencias y conservar todos los elementos editables posibles.
