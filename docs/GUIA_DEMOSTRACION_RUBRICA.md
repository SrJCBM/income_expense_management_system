# Guía de demostración integrada de FinanceApp

## Preparación previa

- Mantener la asignación durante todo el ensayo: **Integrante 1: Julio Blacio**, **Integrante 2: Ricardo Lainez** e **Integrante 3: Ariel Llumiquinga**.
- Usar una **laptop** para mostrar la aplicación web en el navegador y la aplicación de escritorio en Electron; usar el **emulador abierto en Android Studio** para la aplicación móvil.
- Tener iniciados el backend, la aplicación web y Electron en la laptop, además del emulador Android Studio.
- Iniciar las tres aplicaciones con la misma cuenta demo preparada y la misma base de datos; no usar datos personales reales. La contraseña debe estar autocompletada u oculta antes de proyectar.
- No escribir, abrir ni mostrar durante la exposición la contraseña, el token de autenticación o archivos `.env`. Si la sesión caduca, detener la proyección y restablecerla fuera de pantalla.
- Dejar abierta la evidencia estable `evidencias/RESULTADOS_PRUEBAS.md`; las capturas antes/después son apoyo opcional. Desactivar notificaciones y cerrar ventanas ajenas.
- Preparar una captura o evidencia reproducible del error de comunicación. No apagar, desconectar ni alterar la API compartida durante la demostración.

### Checklist de la víspera

- [ ] En una clonación limpia, instalar primero las dependencias con `npm install` en `backend`, `web`, `mobile` e `installer`; no interpretar una importación fallida por dependencias ausentes como un defecto del producto.
- [ ] Ejecutar las comprobaciones previstas y dejar preparados los reportes; confirmar que las versiones instaladas satisfacen los requisitos del proyecto.
- [ ] Confirmar que web, Electron y Android apuntan a la misma API y a la misma base de datos, sin mostrar valores privados de `.env`.
- [ ] Verificar la cuenta demo compartida en los tres clientes y preparar datos iniciales que no sean personales.
- [ ] Instalar y abrir previamente el APK en el emulador o dispositivo de respaldo.
- [ ] Dejar Electron construido o listo para iniciar y comprobar una sesión completa.
- [ ] Ajustar el zoom del navegador para que formularios, montos y mensajes sean legibles desde el proyector.
- [ ] Desactivar notificaciones del sistema, navegador, mensajería y correo.
- [ ] Preparar cargador, extensión eléctrica y una conexión de respaldo que permita llegar a la API.
- [ ] Abrir y auditar `evidencias/PracticaLab_Pruebas.pdf`, `evidencias/Rubrica.pdf` y `evidencias/RESULTADOS_PRUEBAS.md`; comprobar que corresponden al informe de observaciones, la rúbrica y los resultados verificados usados en esta demostración.

### Checklist de 15 minutos antes

1. Levantar o comprobar backend.
2. Abrir web e iniciar sesión.
3. Abrir Electron e iniciar sesión.
4. Iniciar el emulador y abrir FinanceApp.
5. Confirmar la misma cuenta en los tres clientes.
6. Limpiar únicamente los datos creados en ensayos anteriores.
7. Abrir PDF de observaciones y `evidencias/RESULTADOS_PRUEBAS.md` como evidencia QA principal.
8. Cerrar terminales y ventanas no utilizadas.

## Tabla de tiempos

| Tiempo | Responsable | Objetivo |
|---|---|---|
| 00:00-03:00 | Integrante 1 | Presentación formal y objetivo |
| 03:00-09:00 | Integrante 1 | Flujo inicial en web |
| 09:00-15:00 | Integrante 2 | Sincronización y operación móvil |
| 15:00-20:00 | Integrante 3 | Confirmación y modificación en escritorio |
| 20:00-24:00 | Integrantes 1 y 2 | Correcciones antes/después |
| 24:00-27:00 | Integrante 3 | Robustez, arquitectura y pruebas |
| 27:00-30:00 | Todo el equipo | Conclusiones y preguntas |

## Recorrido minuto a minuto y parlamentos

### 00:00-03:00 — Presentación formal y objetivo

**00:00-01:00 — Integrante 1**

- **Acción:** Mostrar la portada con el nombre del proyecto y los integrantes.
- **Parlamento literal:** “Buenos días. Somos Julio Blacio, Integrante 1; Ricardo Lainez, Integrante 2; y Ariel Llumiquinga, Integrante 3. Presentamos FinanceApp, un sistema de control de ingresos y gastos personales o familiares.”
- **Resultado visible:** Portada de FinanceApp y nombres de los tres integrantes.

**01:00-02:00 — Integrante 1**

- **Acción:** Mostrar una diapositiva breve con problema y objetivo.
- **Parlamento literal:** “El problema que abordamos es la dificultad de mantener un registro financiero consistente cuando una persona usa distintos dispositivos. Nuestro objetivo es permitir registrar, consultar y analizar ingresos, gastos, presupuestos y reportes desde web, móvil y escritorio, conservando una única fuente de información.”
- **Resultado visible:** Problema y objetivo resumidos en pantalla.

**02:00-03:00 — Integrante 1**

- **Acción:** Mostrar el diagrama simple de clientes, API y base de datos.
- **Parlamento literal:** “La solución utiliza React 18 y Vite en la interfaz, Capacitor para Android, Electron para escritorio, y una API REST desarrollada con Node.js y Express que persiste los datos en MongoDB mediante Mongoose. Para demostrar la integración, seguiremos una misma operación financiera a través de las tres plataformas.”
- **Resultado visible:** Los tres clientes conectados con la misma API y MongoDB.

### 03:00-09:00 — Flujo inicial en web

**03:00-04:00 — Integrante 1: iniciar sesión**

- **Acción:** Abrir la aplicación web en la laptop e iniciar sesión con la cuenta demo preparada, usando la contraseña ya autocompletada y oculta.
- **Parlamento literal:** “Comienzo en la versión web con la cuenta demo que utilizaremos en las tres plataformas. La contraseña permanece oculta y no mostraremos contraseñas, tokens ni archivos de entorno. La autenticación identifica al mismo usuario y la API limita las operaciones a sus datos.”
- **Resultado esperado:** Aparece el dashboard de la cuenta, sin errores de autenticación.

**04:00-05:15 — Integrante 1: crear la categoría**

- **Acción:** Ir a **Categorías**, crear la categoría `Demostración ESPE` y guardar.
- **Parlamento literal:** “Creo la categoría ‘Demostración ESPE’. Este nombre reconocible nos permitirá rastrear los datos del recorrido sin confundirlos con información preparada.”
- **Resultado esperado:** `Demostración ESPE` aparece una sola vez en el listado y queda disponible en los formularios de operaciones.

**05:15-06:45 — Integrante 1: registrar el ingreso**

- **Acción:** Ir a **Ingresos**, crear un ingreso por `1000,00`, asociarlo con los datos preparados para la demostración y guardar.
- **Parlamento literal:** “Registro un ingreso de mil dólares. Al guardar, el cliente web envía la operación a la API; no es un valor dibujado únicamente en esta pantalla.”
- **Resultado esperado:** El ingreso de `1000,00` aparece en el listado y el total de ingresos de la historia es `1000,00`.

**06:45-08:15 — Integrante 1: registrar el gasto**

- **Acción:** Ir a **Gastos**, crear un gasto por `125,50`, seleccionar `Demostración ESPE` y guardar.
- **Parlamento literal:** “Ahora registro un gasto de ciento veinticinco dólares con cincuenta centavos en la categoría creada. La operación queda persistida y afecta el balance de la misma cuenta.”
- **Resultado esperado:** El gasto de `125,50` aparece asociado con `Demostración ESPE`.

**08:15-09:00 — Integrante 1: comprobar el primer balance**

- **Acción:** Volver al dashboard y actualizar los datos si fuera necesario.
- **Parlamento literal:** “El balance de esta historia es mil menos ciento veinticinco con cincuenta: debe mostrarse ochocientos setenta y cuatro con cincuenta. Entrego ahora la demostración a Ricardo Lainez, Integrante 2, quien comprobará desde Android que estos datos no dependen del navegador.”
- **Resultado esperado:** Ingresos `1000,00`, gastos `125,50` y balance `874,50`.

### 09:00-15:00 — Sincronización y operación móvil

**09:00-10:30 — Integrante 2: actualizar datos**

- **Acción:** En el emulador abierto en Android Studio, abrir FinanceApp con la misma cuenta demo y ejecutar la actualización de datos o volver a cargar la vista.
- **Parlamento literal:** “Estoy en el cliente Android con la misma cuenta. Actualizo para solicitar a la API el estado persistido después de las operaciones realizadas en web.”
- **Resultado esperado:** La aplicación responde sin pantalla en blanco ni error de comunicación.

**10:30-12:00 — Integrante 2: comprobar los registros web**

- **Acción:** Abrir las vistas de ingresos, gastos y dashboard.
- **Parlamento literal:** “Aquí aparecen el ingreso de mil dólares, el gasto de ciento veinticinco con cincuenta y la categoría ‘Demostración ESPE’. El balance coincide con web: ochocientos setenta y cuatro con cincuenta.”
- **Resultado esperado:** Se ven el ingreso `1000,00`, el gasto `125,50`, la categoría `Demostración ESPE` y el balance `874,50`.

**12:00-13:45 — Integrante 2: crear el gasto móvil**

- **Acción:** Crear desde Android un gasto por `24,50`, asociarlo con `Demostración ESPE` y guardar.
- **Parlamento literal:** “Desde móvil agrego un segundo gasto de veinticuatro dólares con cincuenta centavos. El cliente móvil escribe mediante la misma API y la persistencia no vive dentro del emulador; MongoDB conserva la operación para que los demás clientes puedan recuperarla.”
- **Resultado esperado:** El gasto móvil de `24,50` aparece guardado en el listado.

**13:45-15:00 — Integrante 2: comprobar el nuevo balance**

- **Acción:** Volver al dashboard móvil y actualizar.
- **Parlamento literal:** “Al descontar veinticuatro con cincuenta del balance anterior, el nuevo balance es exactamente ochocientos cincuenta. Ariel Llumiquinga, Integrante 3, abrirá ahora el escritorio y comprobará que esta escritura móvil ya forma parte del estado compartido.”
- **Resultado esperado:** Ingresos `1000,00`, gastos acumulados `150,00` y balance `850,00`.

### 15:00-20:00 — Confirmación y modificación en escritorio

**15:00-16:30 — Integrante 3: actualizar y comprobar**

- **Acción:** En la laptop, abrir o enfocar FinanceApp en Electron con la misma cuenta demo y actualizar los datos.
- **Parlamento literal:** “Esta es la aplicación de escritorio empaquetada con Electron. Actualizo su información y compruebo la operación creada desde Android.”
- **Resultado esperado:** Aparecen los gastos `125,50` y `24,50`; el balance es `850,00`.

**16:30-18:15 — Integrante 3: editar el ingreso**

- **Acción:** Abrir el ingreso de `1000,00`, editar el monto a `1100,00` y guardar.
- **Parlamento literal:** “Editaré el ingreso original de mil a mil cien dólares. Esta acción también viaja por la API y actualiza el registro existente; no crea una copia ni altera los gastos.”
- **Resultado esperado:** El ingreso existente muestra `1100,00`; permanecen los dos gastos por un total de `150,00`.

**18:15-19:15 — Integrante 3: comprobar el balance final**

- **Acción:** Volver al dashboard de escritorio y actualizar.
- **Parlamento literal:** “Con un ingreso de mil cien y gastos acumulados de ciento cincuenta, el balance final esperado es novecientos cincuenta.”
- **Resultado esperado:** Ingresos `1100,00`, gastos `150,00` y balance `950,00`.

**19:15-20:00 — Integrantes 3 y 1: cerrar la evidencia bidireccional**

- **Acción:** Volver brevemente a web, actualizar y abrir el ingreso editado o el dashboard.
- **Integrante 3:** “La modificación nació en escritorio; volvemos a web para verificar que no quedó aislada en Electron.”
- **Integrante 1:** “Web recupera el ingreso actualizado de mil cien y muestra el balance de novecientos cincuenta. Hemos escrito desde web, escrito desde móvil, modificado desde escritorio y confirmado los cambios entre clientes.”
- **Resultado esperado:** Web muestra el ingreso `1100,00`, ambos gastos y el balance `950,00`.

### 20:00-24:00 — Correcciones antes/después

#### Matriz de los diez fallos originales

La columna **Antes** se contrasta con `evidencias/PracticaLab_Pruebas.pdf` dentro del ZIP de entrega. La columna **Después** limita cada afirmación a la evidencia preparada o automatizada disponible; `Actividad reciente` permanece explícitamente pendiente.

| # | Fallo original | Antes | Después | Estado defendible |
|---:|---|---|---|---|
| 1 | Nombre compuesto únicamente por símbolos | El registro aceptaba un nombre sin letras. | La interfaz rechaza el valor y muestra que el nombre debe incluir al menos una letra; está cubierto por `web/cypress/e2e/regression.cy.js`. | Corregido |
| 2 | Edición de ingresos | El formulario no recuperaba correctamente los datos del ingreso. | Concepto, monto, fecha y notas se precargan al editar; está cubierto por `web/cypress/e2e/regression.cy.js`. | Corregido |
| 3 | Desfase de fecha | La fecha visible podía cambiar respecto de la guardada. | La fecha se normaliza como `YYYY-MM-DD` al mostrar y editar; está cubierta por `web/cypress/e2e/incomes.cy.js`. | Corregido |
| 4 | Filtros por categoría y mes | Los filtros no reflejaban correctamente la selección. | Los escenarios de búsqueda y filtros están incluidos en `web/cypress/e2e/expenses.cy.js` y en la evidencia preparada de Cypress. | Corregido |
| 5 | Ausencia de marzo | Marzo no aparecía correctamente en el resultado filtrado. | La evidencia comparativa y el escenario de filtro por mes preparado muestran marzo en el resultado esperado. | Corregido |
| 6 | Selector de categoría duplicado | El formulario de gastos mostraba más de un selector. | Cypress comprueba que el formulario contiene exactamente un selector en `web/cypress/e2e/regression.cy.js`. | Corregido |
| 7 | Monto alto omitido | Un monto alto no se representaba correctamente. | El dashboard recibe `9999999999.99` y conserva visibles las tarjetas en `web/cypress/e2e/dashboard.cy.js`. | Corregido |
| 8 | Desbordamiento visual | El contenido numérico salía de las tarjetas. | La evidencia visual después muestra el monto contenido dentro de las tarjetas; Cypress respalda que estas permanecen visibles con montos altos. | Corregido |
| 9 | Actividad reciente | La sección no mostraba el comportamiento esperado. | No existe evidencia suficiente preparada para defender esta corrección en la exposición. | **No demostrada / restante** |
| 10 | Iconos | La selección de iconos no se conservaba correctamente. | `web/cypress/e2e/categories.cy.js` verifica la selección y conservación del icono de categoría. | Corregido |

**Cálculo defendible:** `9 / 10 × 100 = 90%` de los fallos originales están corregidos. No se presenta `Actividad reciente` como aprobada.

**20:00-22:00 — Integrante 1**

- **Acción:** Mostrar la tabla comparativa del informe original y señalar las observaciones corregidas.
- **Parlamento literal:** “El informe original registró diez casos fallidos de veinte. La afirmación verificable que defendemos es que corregimos nueve de esas diez observaciones, es decir, el noventa por ciento. Aquí vinculamos cada observación con su evidencia antes y después.”
- **Resultado esperado:** Tabla con los diez hallazgos, nueve marcados como corregidos y sus evidencias, sin presentar el pendiente como aprobado.

**22:00-24:00 — Integrante 2**

- **Acción:** Demostrar, en este orden, tres correcciones visuales: (1) rechazo de un nombre compuesto únicamente por símbolos; (2) edición de un ingreso con sus datos y fecha precargados correctamente; y (3) un monto alto contenido dentro de las tarjetas del dashboard.
- **Parlamento literal:** “Mostramos tres correcciones visuales y distintas: el formulario rechaza un nombre hecho solo de símbolos, la edición del ingreso conserva sus datos y fecha, y el dashboard contiene un monto alto dentro de sus tarjetas. Las demás correcciones se respaldan con Cypress y con el PDF comparativo para no repetir funciones ni consumir el tiempo de la exposición.”
- **Resultado esperado:** Cada comportamiento mostrado coincide con su evidencia después; la aplicación sigue respondiendo.

### 24:00-27:00 — Robustez, arquitectura y pruebas

**24:00-25:00 — Integrante 3: entrada inválida**

- **Acción:** Intentar registrar una operación con monto `0` y comprobar que el formulario no se envía; después corregir el valor sin abandonar el recorrido.
- **Parlamento literal:** “Intento registrar un monto cero. El formulario no se envía, no se guarda una operación inconsistente y el mensaje permite corregir el valor sin bloquear la aplicación.”
- **Resultado esperado:** Mensaje de validación visible, ninguna petición de guardado confirmada, ninguna operación nueva y navegación aún funcional.

**25:00-26:00 — Integrante 3: evidencia preparada de fallo de comunicación**

- **Acción:** Mostrar una captura o resultado previamente preparado del comportamiento offline, obtenido con una condición controlada. Mantener la API compartida encendida y sin modificaciones durante el recorrido integrado.
- **Parlamento literal:** “Esta evidencia preparada muestra de forma controlada el comportamiento offline sin apagar la API que usan las tres plataformas. El objetivo es demostrar recuperación y mensajes comprensibles, no provocar una caída impredecible durante la exposición.”
- **Resultado esperado:** La captura evidencia un mensaje de red comprensible, una interfaz no bloqueada y ninguna operación inexistente confirmada; la API compartida continúa funcionando.

**26:00-27:00 — Integrante 3: arquitectura y evidencia de pruebas**

- **Acción:** Mostrar el diagrama de arquitectura y abrir `evidencias/RESULTADOS_PRUEBAS.md` como evidencia principal. Si se solicita detalle, abrir `docs/PRUEBAS_MODULOS.md` en sus secciones **4.1 Estructura y cantidad** y **5.4 Suite E2E completa con Cypress**, sin ejecutar suites largas.
- **Parlamento literal:** “React se reutiliza en web, Electron y Capacitor. Los tres clientes consumen la API REST de Express. Express aplica validaciones y reglas de negocio, y MongoDB conserva la información compartida. Vitest verifica backend, Cypress valida los flujos web y Playwright realiza el smoke de Electron. La evidencia preparada registra `436/436 backend`, `73/73 Cypress` y `20/20 framework QA`.”
- **Resultado esperado:** `evidencias/RESULTADOS_PRUEBAS.md` muestra de forma legible y trazable `436/436 backend`, `73/73 Cypress` y `20/20 framework QA`; no se inicia ninguna suite larga y la prueba móvil manual no figura como aprobación automática.

#### Comandos breves de evidencia

Estos comandos se documentan para una comprobación corta o para responder preguntas; no sustituyen los reportes de las ejecuciones completas ni deben convertirse en una suite larga durante la exposición:

```powershell
node --test qa/tests/*.test.mjs
node qa/run-tests.mjs all --profile full --dry-run
```

Antes de exponer, abrir `evidencias/RESULTADOS_PRUEBAS.md`. Las capturas de una ejecución completa son opcionales; si el docente pide detalle, mostrar la evidencia estable y la documentación trazable en lugar de lanzar Vitest o Cypress completos dentro de los 30 minutos.

### 27:00-30:00 — Conclusiones y preguntas

**27:00-27:20 — Integrante 1**

- **Parlamento literal:** “FinanceApp resuelve el registro financiero multiplataforma mediante una única API y una persistencia compartida. En el recorrido vimos el mismo estado evolucionar desde web hasta móvil y escritorio.”

**27:20-27:40 — Integrante 2**

- **Parlamento literal:** “La integración no se limitó a consultar: web y móvil crearon operaciones, escritorio modificó una de ellas y web confirmó el resultado. El balance final de novecientos cincuenta prueba la consistencia de la historia completa.”

**27:40-28:00 — Integrante 3**

- **Parlamento literal:** “Además de la funcionalidad, mostramos correcciones verificables, respuestas controladas ante errores y pruebas adecuadas para los riesgos de cada plataforma.”

**28:00-30:00 — Todo el equipo: preguntas**

- **Acción:** Mantener visible la pantalla final y dedicar los dos minutos completos a preguntas del evaluador. Responde primero el integrante responsable del tema consultado y los demás complementan solo si es necesario.
- **Parlamento literal:** “Gracias por su atención. Abrimos ahora el espacio de preguntas.”
- **Resultado esperado:** Pantalla final con arquitectura y balance final `950,00`; existe un intervalo efectivo de dos minutos para preguntas.

## Matriz de trazabilidad de la rúbrica

| Criterio | Minuto | Evidencia |
|---|---|---|
| Presentación | 00:00-03:00 | Tema, objetivo y formalidad |
| Funcionamiento móvil | 09:00-15:00 | Consulta y creación sin cierre inesperado |
| Integración | 03:00-20:00 | Escrituras y lecturas cruzadas |
| Correcciones | 20:00-24:00 | `9 / 10` y demostraciones antes/después |
| Robustez | 24:00-26:00 | Validación y recuperación controlada |
| Demostración | 00:00-30:00 | Participación y explicación técnica |

La tabla de tiempos contiene siete bloques continuos: 3 + 6 + 6 + 5 + 4 + 3 + 3 = **30 minutos exactos**, desde 00:00 hasta 30:00.

## Contingencias durante la demostración

En cualquier contingencia se describe primero el estado real. La evidencia preparada complementa lo ocurrido, pero nunca se afirma que una acción terminó si la pantalla no lo confirma.

- **Emulador lento:** indicar que el emulador todavía está iniciando; esperar dentro del margen acordado y, si no responde, mostrar la evidencia móvil preparada. No decir que consultó o guardó datos si no apareció la confirmación.
- **API de Render despertando:** explicar que la primera solicitud puede estar esperando el arranque del servicio; conservar la pantalla y usar el reporte o captura preparada si excede el margen. Reanudar la lectura cruzada solo cuando la API responda.
- **Electron sin conexión:** mostrar el mensaje real, comprobar la conectividad sin cambiar secretos y continuar con web junto con la evidencia de escritorio preparada. No atribuir a Electron una lectura que no ocurrió.
- **Dato que tarda en aparecer:** actualizar una sola vez y esperar la respuesta; si continúa ausente, reconocer que la sincronización no se confirmó en vivo y mostrar la evidencia previa trazable.
- **Cypress tarda demasiado:** detener la intención de ejecución en vivo y abrir `evidencias/RESULTADOS_PRUEBAS.md`, que registra `73/73 Cypress`; aclarar que se está mostrando el resultado histórico verificado, no una ejecución nueva.
- **Pregunta cuya respuesta no se conoce:** responder: “No tengo evidencia suficiente para afirmarlo ahora. Lo registraré y lo verificaré en el código o en una prueba reproducible antes de dar una respuesta definitiva”.

## Preguntas probables y respuestas breves

- **¿Por qué una sola interfaz React?** Porque web es la interfaz compartida: Electron la presenta como escritorio y Capacitor como Android. Esto reduce duplicación, aunque cada plataforma conserva su empaquetado y verificación propios.
- **¿Cómo se sincronizan los clientes?** No se sincronizan directamente entre sí. Todos leen y escriben mediante la misma API REST; al actualizar, recuperan el estado persistido de la cuenta.
- **¿Dónde viven los datos?** En MongoDB, accedido por el backend mediante Mongoose; no viven únicamente en el navegador, Electron o el emulador.
- **¿Cómo se protege la API?** La autenticación usa JWT, las contraseñas se procesan con bcrypt y el backend aplica validación, autorización por usuario y configuración CORS.
- **¿Qué diferencia hay entre prueba unitaria, E2E y smoke?** Una unitaria aísla una pieza de lógica; una E2E recorre un flujo completo desde la interfaz; una smoke comprueba rápidamente que una aplicación empaquetada inicia y ejecuta su recorrido esencial.
- **¿Por qué se afirma 90% de correcciones?** El informe original contiene diez fallos y existe evidencia defendible para nueve: `9 / 10 × 100 = 90%`.
- **¿Qué queda pendiente?** `Actividad reciente` permanece como no demostrada. No se presenta como corregida hasta contar con implementación y evidencia reproducible suficiente.

## Control aritmético del escenario

```text
1000,00 - 125,50 = 874,50
874,50 - 24,50 = 850,00
1100,00 - 125,50 - 24,50 = 950,00
```

Comprobación adicional: `125,50 + 24,50 = 150,00`; por tanto, `1100,00 - 150,00 = 950,00`.

## Lista de control para el ensayo

- [ ] Los nombres reales y su asignación se mantienen: Julio Blacio (Integrante 1), Ricardo Lainez (Integrante 2) y Ariel Llumiquinga (Integrante 3).
- [ ] Cada bloque empieza y termina dentro del intervalo de la tabla; el total es de 30 minutos.
- [ ] Las tres plataformas utilizan la misma cuenta y la misma API.
- [ ] Web y Electron se muestran en la laptop; móvil se muestra en el emulador Android Studio.
- [ ] La cuenta demo tiene la contraseña autocompletada y oculta; no se proyectan contraseña, token ni archivos `.env`.
- [ ] Los montos visibles coinciden con `874,50`, `850,00` y `950,00` en el momento indicado.
- [ ] Cada escritura se confirma desde un cliente diferente.
- [ ] `evidencias/RESULTADOS_PRUEBAS.md` está abierto y legible; las capturas opcionales están disponibles si aportan contexto.
- [ ] La matriz conserva nueve correcciones y deja `Actividad reciente` como no demostrada/restante: `9 / 10 × 100 = 90%`.
- [ ] Las tres correcciones en vivo son nombre con símbolos, edición de ingreso precargada y monto alto contenido; las restantes se muestran con Cypress y el PDF.
- [ ] Los controles manuales pendientes no se presentan como pruebas automatizadas aprobadas.
- [ ] El fallo de comunicación se explica con captura o evidencia preparada reproducible; nadie apaga ni modifica la API compartida.
- [ ] Las cifras `436/436 backend`, `73/73 Cypress` y `20/20 framework QA` se enlazan con `evidencias/RESULTADOS_PRUEBAS.md`, `docs/PRUEBAS_MODULOS.md` y sus comandos, sin ejecutar suites largas.
- [ ] La conclusión termina a los 28:00 y se preservan dos minutos efectivos para preguntas.
