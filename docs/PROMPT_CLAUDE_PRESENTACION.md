# Prompt maestro para crear la presentación de FinanceApp con Claude

Ejecuta Claude desde la raíz de este repositorio y copia íntegramente el bloque
siguiente. No hace falta adjuntar nuevamente las capturas porque sus rutas están
incluidas.

```text
Trabaja en este repositorio:
C:\Users\jcbla\Documents\GitHub\income_expense_management_system

Necesito que construyas una presentación PowerPoint editable, profesional y en
español para una demostración universitaria de 30 minutos sobre FinanceApp. No me
entregues solamente un esquema: crea el archivo .pptx final, conserva editables
los textos y formas, guarda también el código fuente usado para generarlo y
realiza control visual de todas las diapositivas antes de terminar.

COMUNICACIÓN QUE DEBE LOGRAR LA PRESENTACIÓN

Al finalizar, el docente de Pruebas de Software debe poder reconocer que
FinanceApp cumple la rúbrica mediante una aplicación móvil funcional, integración
bidireccional entre web, Android y Electron, nueve de diez observaciones
corregidas con evidencia, manejo de errores y participación técnica de los tres
integrantes.

ANTES DE CREAR DIAPOSITIVAS

Lee completamente, en este orden:

1. docs/PRESENTACION_FINANCEAPP_DESIGN.md
2. docs/GUIA_DEMOSTRACION_RUBRICA.md
3. evidencias/referencias/Rubrica.pdf
4. evidencias/referencias/PracticaLab_Pruebas.pdf
5. evidencias/INDICE_EVIDENCIAS_RUBRICA.md
6. evidencias/INDICE_CAPTURAS_PRESENTACION.md
7. evidencias/RESULTADOS_PRUEBAS.md
8. evidencias/INTEGRACION_TRES_CLIENTES.md
9. docs/PRUEBAS_MODULOS.md
10. docs/ARCHITECTURE.md
11. TESTING.md
12. README.md

Como referencia únicamente visual, inspecciona también:
C:\Users\jcbla\Downloads\Appium Pruebas automatizadas Summer Dent.pdf

Ese PDF pertenece a otro equipo. Úsalo solo para estudiar ritmo, jerarquía,
separación de secciones y relación entre capturas y texto. No copies su marca,
logotipos, textos, integrantes, cifras, bibliografía, pruebas de carga, Appium ni
ninguna afirmación técnica. La palabra Appium no debe presentarse como herramienta
de FinanceApp.

ENTREGABLES

Crea la carpeta presentacion/ si no existe y entrega:

- presentacion/FinanceApp_Pruebas_Software.pptx
- presentacion/generar_presentacion.mjs o el archivo fuente equivalente utilizado
- presentacion/previews/ con una imagen renderizada por diapositiva
- presentacion/vista_general.png con el montaje de todas las diapositivas
- presentacion/VALIDACION_PRESENTACION.md con los controles realizados y cualquier
  limitación real encontrada

No crees videos. No hagas commit, push ni modificaciones al código de la
aplicación. Solo crea los entregables de presentación.

FORMATO Y DIRECCIÓN VISUAL

- PowerPoint 16:9 completamente editable.
- Estilo C aprobado: académico limpio combinado con la identidad de FinanceApp.
- Fondos claros para teoría y marcos oscuros para evidencia visual.
- Paleta orientativa: azul marino #0F172A, violeta #6C63FF, rosa #EC4899,
  lavanda #A5B4FC y fondo claro #F8FAFC.
- Portada mínima. Títulos de al menos 35 pt, título de portada de al menos 50 pt,
  texto de apoyo de al menos 16 pt y llamadas importantes de al menos 24 pt.
- Máximo aproximado de 35 palabras visibles por diapositiva principal. En las
  diapositivas 10 a 18 puede usarse un fragmento corto de la observación más una
  frase de corrección, pero nunca un párrafo para leer.
- No incluyas notas del expositor, tiempos, instrucciones de producción ni este
  prompt dentro de las diapositivas.
- Mantén márgenes constantes, alto contraste y lectura adecuada en proyector.
- Conserva la proporción de todas las capturas. Puedes recortar espacio irrelevante,
  pero no deformar, ocultar el comportamiento demostrado ni cortar la URL cuando
  esta sea parte de la evidencia de web desplegada.
- Usa una composición principal por diapositiva; evita convertir todo en rejillas
  de tarjetas repetitivas.
- Usa títulos que expresen una conclusión, no títulos genéricos como “Resultados”
  o “Arquitectura” cuando pueda comunicarse una idea más concreta.
- Las diapositivas 10 a 18 deben compartir una familia visual coherente, pero variar
  sutilmente encuadre, recorte o llamada para no parecer nueve copias mecánicas.
- No uses animaciones necesarias para comprender el contenido. La presentación debe
  funcionar correctamente al exportarse o abrirse sin transiciones.

PORTADA

Debe incluir:

- Universidad de las Fuerzas Armadas ESPE
- Departamento de Ciencias de la Computación
- Pruebas de Software
- FinanceApp — Sistema de Control de Gastos e Ingresos
- Julio Blacio
- Ricardo Lainez
- Ariel Llumiquinga

No confundas a los integrantes con los autores del informe de evaluación; quienes
aparecen en PracticaLab_Pruebas.pdf son revisores, no integrantes del proyecto.

ESTRUCTURA OBLIGATORIA: 20 DIAPOSITIVAS PRINCIPALES

1. Portada mínima con institución, materia, proyecto e integrantes.
2. “Demostraremos una sola fuente de datos en tres clientes”: móvil funcional,
   integración, correcciones y robustez.
3. “El mismo control financiero debe mantenerse en cualquier dispositivo”:
   problema y objetivo del proyecto.
4. “React se reutiliza; la API y MongoDB concentran el estado”: diagrama simple
   React/Vite -> Web, Electron y Capacitor -> API Express -> MongoDB. No inventes
   microservicios ni comunicación directa entre clientes.
5. “La integración se demuestra escribiendo y leyendo desde clientes distintos”:
   recorrido web crea -> Android consulta y crea -> Electron modifica -> web
   confirma. Usa evidencias/capturas-presentacion/10-integracion-real-web-android-electron.png.
6. “El framework propio coordina herramientas existentes sin reinventarlas”:
   perfiles quick/full, estados PASS/FAIL/PENDING_MANUAL y reportes Markdown/JSON.
7. “Cada riesgo se verifica en la capa adecuada”: Vitest/Supertest para backend,
   Vitest y Cypress para web, Playwright para Electron, build y verificación manual
   para Android.
8. “Los resultados son trazables y separan lo automático de lo manual”: usa
   evidencias/capturas-presentacion/08-resultados-pruebas.png y conserva exactamente
   las cifras verificadas.
9. “La evaluación inicial dejó diez observaciones por corregir”: 20 casos,
   10 aprobados, 10 fallidos y 50% inicial. Anticipa que el estado defendible actual
   es 9/10 corregidas y una pendiente.
10 a 18. Nueve diapositivas individuales de correcciones, detalladas en la sección
   siguiente. No agrupes dos correcciones en una misma diapositiva.
19. “El sistema comunica el fallo y recupera los datos sin bloquearse”: combina
   evidencias/capturas-presentacion/04-error-comunicacion.png y
   evidencias/capturas-presentacion/05-comunicacion-recuperada.png. Cierra con la
   integración compartida y 9/10 = 90%, reconociendo el pendiente.
20. “FinanceApp demuestra consistencia, correcciones verificadas y límites honestos”:
   tres conclusiones breves y apertura a preguntas. No termines con una diapositiva
   genérica que solo diga “Gracias”.

BLOQUE OBLIGATORIO DE NUEVE CORRECCIONES: DIAPOSITIVAS 10 A 18

Cada una debe tener:

- Encabezado “Corrección X/9 · CP-XX”.
- Columna izquierda de aproximadamente 35–40%:
  - etiqueta “Observación original”;
  - fragmento breve y fiel del comentario de PracticaLab_Pruebas.pdf;
  - caso CP y página del PDF;
  - etiqueta “Qué satisface ahora” con una sola frase concreta.
- Zona derecha de aproximadamente 60–65%:
  - captura obligatoria grande y sin deformar;
  - una llamada visual que señale el elemento que demuestra la corrección sin
    cubrir información importante.
- Pie discreto “Verificación repetible” con la prueba asociada.

Usa este mapeo exacto:

Diapositiva 10 — Corrección 1/9 · CP-05
Observación: se permitía registrar un nombre compuesto solo por símbolos.
Qué satisface ahora: el formulario rechaza valores sin letras y explica el requisito.
Página de referencia: 9.
Captura: evidencias/capturas-rubrica/01-nombre-solo-simbolos-rechazado.png
Verificación: web/cypress/e2e/regression.cy.js

Diapositiva 11 — Corrección 2/9 · CP-09
Observación: al editar un ingreso no se recuperaban los datos previos.
Qué satisface ahora: concepto, monto, fecha, categoría y notas aparecen precargados.
Página de referencia: 5.
Captura: evidencias/capturas-rubrica/02-edicion-ingreso-datos-precargados.png
Verificación: web/cypress/e2e/regression.cy.js

Diapositiva 12 — Corrección 3/9 · CP-10
Observación: una fecha podía guardarse o mostrarse como el día anterior.
Qué satisface ahora: la fecha seleccionada conserva exactamente el mismo día.
Páginas de referencia: 3 y 5–6.
Captura: evidencias/capturas-rubrica/03-fecha-ingreso-sin-desfase.png
Verificación: web/cypress/e2e/incomes.cy.js

Diapositiva 13 — Corrección 4/9 · CP-12
Observación: los filtros por categoría y mes no modificaban el resultado.
Qué satisface ahora: los filtros conservan la selección y muestran el registro esperado.
Página de referencia: 6.
Captura: evidencias/capturas-rubrica/04-filtros-categoria-y-mes-aplicados.png
Verificación: web/cypress/e2e/expenses.cy.js

Diapositiva 14 — Corrección 5/9 · CP-13
Observación: marzo no aparecía aunque existieran registros.
Qué satisface ahora: marzo de 2026 aparece con la transacción del 2026-03-10.
Página de referencia: 6.
Captura: evidencias/capturas-rubrica/05-marzo-presente-en-resultados.png
Verificación: web/cypress/e2e/expenses.cy.js

Diapositiva 15 — Corrección 6/9 · CP-14
Observación: Gastos mostraba dos selectores de categoría.
Qué satisface ahora: el formulario contiene exactamente un selector de categoría.
Páginas de referencia: 9–10.
Captura: evidencias/capturas-rubrica/06-selector-categoria-unico.png
Verificación: web/cypress/e2e/regression.cy.js

Diapositiva 16 — Corrección 7/9 · CP-16
Observación: un monto muy alto no se reflejaba en el dashboard ni en reportes.
Qué satisface ahora: el dashboard representa ingresos y gastos de gran magnitud.
Página de referencia: 7.
Captura: evidencias/capturas-rubrica/07-montos-altos-representados.png
Verificación: web/cypress/e2e/dashboard.cy.js

Diapositiva 17 — Corrección 8/9 · CP-17
Observación: los números extensos desbordaban los límites de las tarjetas.
Qué satisface ahora: el texto permanece dentro del ancho disponible sin invadir tarjetas.
Página de referencia: 7.
Captura: evidencias/capturas-rubrica/08-montos-altos-sin-desbordamiento.png
Verificación: comprobación Playwright scrollWidth <= clientWidth.

Diapositiva 18 — Corrección 9/9 · CP-20
Observación: el icono debía copiarse y pegarse manualmente.
Qué satisface ahora: existe un selector visual y una sola opción queda marcada.
Páginas de referencia: 9–10.
Captura: evidencias/capturas-rubrica/10-icono-categoria-seleccionado.png
Verificación: web/cypress/e2e/categories.cy.js

No crees una diapositiva de corrección para CP-18 “Actividad reciente”. Debe aparecer
solamente como la observación pendiente dentro del resumen 9/10 o en respaldo,
marcada “Pendiente / sin evidencia suficiente”. No inventes captura ni resultado.

DIAPOSITIVAS DE RESPALDO DESPUÉS DE LA 20

21. Matriz completa de las diez observaciones: nueve corregidas y CP-18 pendiente.
22. Comandos y herramientas de prueba por módulo.
23. Fuentes documentales y rutas de las evidencias utilizadas.

Estas diapositivas pueden ser más densas que las principales, pero deben continuar
siendo legibles. No las mezcles con la conclusión ni las cuentes como parte de la
exposición principal.

CIFRAS Y AFIRMACIONES PERMITIDAS

- Web unitario: 28/28.
- Cypress completo: 78/78 en 10 specs.
- Gastos: 16/16 dentro de Cypress.
- Instalador/Electron: 14/14 pruebas Node y dos smoke Playwright.
- Backend: 436/436 como última suite completa conservada. El inventario puede ser
  mayor por pruebas CORS posteriores, pero no escribas 438/438.
- Framework QA propio: 20/20 como resultado consolidado anterior.
- Correcciones: 9/10 = 90%.
- Integración: mismo registro y estado en web, Android y Electron mediante la misma
  cuenta, API REST y base de datos.
- Android: funcionamiento e integración demostrados manualmente en Pixel 8 Pro;
  no existen pruebas instrumentadas Android que puedan contarse como automáticas.

AFIRMACIONES PROHIBIDAS

- No afirmar que se realizaron pruebas de carga, estrés o rendimiento.
- No afirmar que Android fue automatizado con Appium.
- No presentar CP-18 Actividad reciente como corregida.
- No afirmar que una captura determinista con API interceptada demuestra por sí sola
  integración real.
- No decir que Electron mantiene un backend local empaquetado; actualmente consume
  la API compartida en producción.
- No inventar métricas, porcentajes, bibliografía, fechas, usuarios o resultados.
- No mostrar contraseñas, tokens, URI de MongoDB, archivos .env ni datos personales.
- No usar los nombres de los revisores como integrantes del proyecto.

USO DE EVIDENCIA

- Las capturas de evidencias/capturas-rubrica/ prueban visualmente correcciones con
  datos controlados y deben etiquetarse como evidencia Playwright.
- La integración real se apoya en
  evidencias/capturas-presentacion/10-integracion-real-web-android-electron.png y en
  evidencias/INTEGRACION_TRES_CLIENTES.md.
- La captura 08-resultados-pruebas.png ya diferencia ejecuciones actuales, resultados
  consolidados anteriores y verificación manual Android; no alteres esa distinción.
- No reutilices la misma captura en varias diapositivas salvo que sea imprescindible.
- Si una captura tiene mucho espacio, usa recorte de enfoque conservando el archivo
  original intacto. No edites ni sobrescribas las evidencias fuente.

CONTROL DE CALIDAD OBLIGATORIO

No declares terminado el trabajo inmediatamente después de exportar el PPTX.

1. Renderiza las 23 diapositivas a PNG.
2. Abre e inspecciona cada diapositiva individualmente a tamaño completo.
3. Genera y revisa una vista general para comprobar ritmo, coherencia y variedad.
4. Corrige todo texto cortado, desbordamiento, superposición no intencional, título
   partido, captura deformada, margen inconsistente o contraste insuficiente.
5. Comprueba que haya exactamente 20 diapositivas principales y 3 de respaldo.
6. Comprueba que las diapositivas 10 a 18 sean nueve correcciones distintas, cada
   una con observación, comentario de satisfacción, captura y verificación.
7. Comprueba que todas las rutas de imágenes existan y que ninguna imagen aparezca
   como marcador vacío.
8. Comprueba que el PPTX abre sin advertencias y que texto y formas siguen editables.
9. Registra los controles y cualquier limitación honesta en
   presentacion/VALIDACION_PRESENTACION.md.

Al finalizar, informa únicamente:

- rutas de los entregables;
- número de diapositivas principales y de respaldo;
- controles visuales ejecutados;
- cualquier limitación real que permanezca.

No hagas commit ni modifiques otros documentos o archivos del proyecto.
```

