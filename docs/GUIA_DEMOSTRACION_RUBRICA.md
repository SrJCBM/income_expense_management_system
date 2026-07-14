# Guía de demostración integrada de FinanceApp

## Preparación previa

- Mantener la asignación durante todo el ensayo: **Integrante 1: Julio Blacio**, **Integrante 2: Ricardo Lainez** e **Integrante 3: Ariel Llumiquinga**.
- Usar una **laptop** para mostrar la aplicación web en el navegador y la aplicación de escritorio en Electron; usar el **emulador abierto en Android Studio** para la aplicación móvil.
- Tener iniciados el backend, la aplicación web y Electron en la laptop, además del emulador Android Studio.
- Iniciar las tres aplicaciones con la misma cuenta demo preparada y la misma base de datos; no usar datos personales reales. La contraseña debe estar autocompletada u oculta antes de proyectar.
- No escribir, abrir ni mostrar durante la exposición la contraseña, el token de autenticación o archivos `.env`. Si la sesión caduca, detener la proyección y restablecerla fuera de pantalla.
- Dejar abiertas las evidencias antes/después y los reportes de pruebas. Desactivar notificaciones y cerrar ventanas ajenas.
- Preparar una captura o evidencia reproducible del error de comunicación. No apagar, desconectar ni alterar la API compartida durante la demostración.

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

**20:00-22:00 — Integrante 1**

- **Acción:** Mostrar la tabla comparativa del informe original y señalar las observaciones corregidas.
- **Parlamento literal:** “El informe original registró diez casos fallidos de veinte. La afirmación verificable que defendemos es que corregimos nueve de esas diez observaciones, es decir, el noventa por ciento. Aquí vinculamos cada observación con su evidencia antes y después.”
- **Resultado esperado:** Tabla con los diez hallazgos, nueve marcados como corregidos y sus evidencias, sin presentar el pendiente como aprobado.

**22:00-24:00 — Integrante 2**

- **Acción:** Demostrar de forma breve las correcciones representativas preparadas: rechazo de nombres compuestos solo por símbolos, recuperación de datos y fecha al editar un ingreso, y ausencia del selector duplicado en gastos. Señalar además la evidencia de filtros, montos altos e iconos.
- **Parlamento literal:** “Estas correcciones atacan el comportamiento observado: el formulario rechaza un nombre hecho solo de símbolos, la edición conserva los datos y la fecha, y gastos presenta un único selector de categoría. Las evidencias preparadas cubren también filtros, montos altos sin desbordamiento y selección de iconos.”
- **Resultado esperado:** Cada comportamiento mostrado coincide con su evidencia después; la aplicación sigue respondiendo.

### 24:00-27:00 — Robustez, arquitectura y pruebas

**24:00-25:00 — Integrante 3: entrada inválida**

- **Acción:** Enviar el formulario preparado con una entrada inválida y luego corregirla.
- **Parlamento literal:** “Ante una entrada inválida, el sistema no se bloquea ni guarda datos inconsistentes: conserva el formulario y presenta un mensaje comprensible para corregir el valor.”
- **Resultado esperado:** Mensaje de validación visible, ninguna operación nueva y navegación aún funcional.

**25:00-26:00 — Integrante 3: evidencia preparada de fallo de comunicación**

- **Acción:** Mostrar una captura o evidencia previamente preparada y reproducible de una respuesta de red fallida, obtenida con una interceptación controlada en pruebas. Mantener la API compartida encendida y sin modificaciones.
- **Parlamento literal:** “Esta evidencia preparada reproduce de forma controlada una respuesta de red fallida sin interrumpir la API que usan las tres plataformas. El cliente informa el problema sin fingir que la operación fue guardada y permite reintentar cuando existe comunicación.”
- **Resultado esperado:** La captura evidencia un mensaje de red comprensible, una interfaz no bloqueada y ninguna operación inexistente confirmada; la API compartida continúa funcionando.

**26:00-27:00 — Integrante 3: arquitectura y evidencia de pruebas**

- **Acción:** Mostrar el diagrama de arquitectura y abrir `docs/PRUEBAS_MODULOS.md` en sus secciones **4.1 Estructura y cantidad** y **5.4 Suite E2E completa con Cypress**. Enseñar los reportes preparados, sin ejecutar las suites largas durante la exposición.
- **Parlamento literal:** “Los clientes React se comunican con la API Express; el backend aplica el flujo rutas, controladores, servicios y modelos, y MongoDB concentra la persistencia. Los 436 casos backend están documentados en la sección 4.1 de `docs/PRUEBAS_MODULOS.md` y se obtienen con `node qa/run-tests.mjs backend --profile full`; su cobertura queda en `backend/coverage/`. Los 73 casos Cypress están desglosados en la sección 5.4 y se ejecutan con `npm --prefix web run test:e2e`; sus screenshots de fallos quedan en `web/cypress/screenshots/`. Mostramos evidencia ya preparada porque ejecutar ambas suites largas consumiría el tiempo de la demostración. El smoke de Electron y el control manual Android se identifican por separado.”
- **Resultado esperado:** Documento y evidencias legibles y trazables de 436 casos backend y 73 Cypress, junto con el smoke de Electron; no se inicia ninguna suite larga y la prueba móvil manual no figura como aprobación automática.

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
- [ ] Las evidencias de correcciones y pruebas están abiertas y son legibles.
- [ ] Los controles manuales pendientes no se presentan como pruebas automatizadas aprobadas.
- [ ] El fallo de comunicación se explica con captura o evidencia preparada reproducible; nadie apaga ni modifica la API compartida.
- [ ] Las cifras 436 y 73 se enlazan con `docs/PRUEBAS_MODULOS.md`, los comandos y las rutas de evidencia, sin ejecutar suites largas.
- [ ] La conclusión termina a los 28:00 y se preservan dos minutos efectivos para preguntas.
