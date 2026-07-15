# Diseño de la presentación de FinanceApp

## Objetivo

Crear una presentación PowerPoint editable que apoye una demostración en vivo de 30 minutos y permita al docente identificar claramente el cumplimiento de la rúbrica. La presentación debe explicar la arquitectura, integración, estrategia de pruebas, correcciones aplicadas y robustez sin sustituir la ejecución real de web, Android y Electron.

## Entregables esperados

- Archivo `.pptx` editable en formato 16:9.
- Código fuente utilizado para generar el PowerPoint.
- Veinte diapositivas principales.
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
8. Resultados: 436 backend, 78 Cypress, 20 QA, 28 web unitarias, 14 pruebas Node y dos smoke Electron, además de las capturas Playwright.
9. Punto de partida: 20 casos, 10 aprobados, 10 fallidos y 50% inicial.
10. Corrección 1/9 — CP-05: rechazo de nombres formados solo por símbolos.
11. Corrección 2/9 — CP-09: recuperación de los datos al editar un ingreso.
12. Corrección 3/9 — CP-10: conservación exacta de la fecha seleccionada.
13. Corrección 4/9 — CP-12: aplicación efectiva de filtros por categoría y mes.
14. Corrección 5/9 — CP-13: marzo aparece y devuelve sus registros.
15. Corrección 6/9 — CP-14: un único selector de categoría en Gastos.
16. Corrección 7/9 — CP-16: los montos altos se reflejan en el dashboard.
17. Corrección 8/9 — CP-17: los montos permanecen dentro de las tarjetas.
18. Corrección 9/9 — CP-20: selector visual de iconos sin copiar y pegar.
19. Robustez e integración: entradas inválidas, comunicación, recuperación, estado compartido y resultado 9/10 = 90%.
20. Conclusiones y preguntas.

## Bloque obligatorio de nueve correcciones

Las diapositivas 10 a 18 deben dedicar una lámina completa a cada observación
corregida. No se deben agrupar dos observaciones en una misma diapositiva.

Cada lámina debe conservar la misma lógica visual:

1. **Observación original:** incluir un fragmento breve y fiel del comentario
   registrado en `PracticaLab_Pruebas.pdf`, identificado con su caso `CP` y la
   página correspondiente. No presentar el comentario como una opinión nueva.
2. **Qué se corrigió:** explicar en una frase concreta qué comportamiento actual
   satisface el resultado esperado de la práctica.
3. **Evidencia:** mostrar en tamaño dominante la captura Playwright numerada que
   permite comprobar visualmente la corrección.
4. **Verificación repetible:** añadir un pie discreto con la prueba Cypress,
   Playwright o la comprobación geométrica que respalda la captura.

Distribución recomendada: comentario original y explicación en el 35–40% izquierdo;
captura sin deformar en el 60–65% derecho. La captura debe señalar el elemento que
resuelve la observación mediante un recuadro o llamada breve, sin tapar la interfaz.

| Diapositiva | Observación de la práctica | Comentario de satisfacción | Captura obligatoria | Verificación |
|---:|---|---|---|---|
| 10 | CP-05: se permitía registrar un nombre compuesto solo por símbolos. | El formulario rechaza valores sin letras y explica el requisito. | `capturas-rubrica/01-nombre-solo-simbolos-rechazado.png` | `regression.cy.js` |
| 11 | CP-09: el formulario de edición aparecía sin recuperar los datos previos. | Concepto, monto, fecha, categoría y notas aparecen precargados. | `capturas-rubrica/02-edicion-ingreso-datos-precargados.png` | `regression.cy.js` |
| 12 | CP-10: una fecha podía guardarse o mostrarse como el día anterior. | La fecha seleccionada conserva exactamente el mismo día al editar. | `capturas-rubrica/03-fecha-ingreso-sin-desfase.png` | `incomes.cy.js` |
| 13 | CP-12: los filtros por categoría y mes no modificaban el resultado. | Los controles conservan la selección y la tabla devuelve el registro correspondiente. | `capturas-rubrica/04-filtros-categoria-y-mes-aplicados.png` | `expenses.cy.js` |
| 14 | CP-13: marzo no aparecía aunque existieran registros. | Marzo de 2026 aparece y muestra la transacción del `2026-03-10`. | `capturas-rubrica/05-marzo-presente-en-resultados.png` | `expenses.cy.js` |
| 15 | CP-14: Gastos mostraba dos selectores de categoría. | El formulario contiene exactamente un selector de categoría. | `capturas-rubrica/06-selector-categoria-unico.png` | `regression.cy.js` |
| 16 | CP-16: un monto muy alto no se reflejaba en dashboard ni reportes. | El dashboard representa correctamente ingresos y gastos de gran magnitud. | `capturas-rubrica/07-montos-altos-representados.png` | `dashboard.cy.js` |
| 17 | CP-17: los números extensos desbordaban los límites de las tarjetas. | El texto se adapta sin invadir otras tarjetas ni superar el ancho disponible. | `capturas-rubrica/08-montos-altos-sin-desbordamiento.png` | `scrollWidth <= clientWidth` |
| 18 | CP-20: el icono debía copiarse y pegarse manualmente. | El usuario dispone de un selector visual y una sola opción queda marcada. | `capturas-rubrica/10-icono-categoria-seleccionado.png` | `categories.cy.js` |

La observación CP-18 sobre `Actividad reciente` debe aparecer únicamente en el
resumen 9/10 o en la matriz de respaldo, marcada como **pendiente y sin captura**.
No debe ocupar una de estas nueve diapositivas ni presentarse como corregida.

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
- Las diapositivas 10 a 18 deben ser el bloque visual más fuerte y mantener una
  composición consistente sin parecer nueve copias mecánicas.
- La presentación debe complementar la demostración, no intentar contenerla completamente.
- El PowerPoint debe abrir sin advertencias y conservar todos los elementos editables posibles.
