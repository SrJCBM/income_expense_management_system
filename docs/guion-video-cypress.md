# Guion e instrucciones para video de Cypress

## Titulo sugerido

**Pruebas dinamicas con Cypress en un sistema de gestion de ingresos y gastos**

## Objetivo del video

Explicar que hace el software desarrollado por el grupo y demostrar como se usan pruebas dinamicas con Cypress para validar funcionalidades reales del sistema.

La idea recomendada es grabar **un solo video** de aproximadamente **8 a 12 minutos**, dividido entre los tres integrantes:

- **Ricardo:** presentacion del sistema y contexto.
- **Julio:** justificacion del tipo de pruebas y que se va a evaluar.
- **Ariel:** explicacion del codigo Cypress y ejecucion de pruebas.

Durante todo el video deben aparecer los tres integrantes en pantalla, aunque cada uno tenga una parte principal. Pueden grabar con Zoom, Meet, OBS o cualquier herramienta que permita mostrar camara, pantalla y terminal.

## Resumen del software

El proyecto es un sistema de control de ingresos y gastos personales o familiares. Su objetivo es ayudar al usuario a registrar movimientos financieros, organizarlos por categorias y revisar informacion resumida para tomar mejores decisiones.

El sistema incluye:

- Registro e inicio de sesion de usuarios.
- Panel principal o dashboard.
- Gestion de gastos.
- Gestion de ingresos.
- Gestion de categorias.
- Reportes financieros.
- Validaciones para evitar datos incorrectos.

La aplicacion esta construida con:

- **Frontend:** React 18 con Vite.
- **Backend:** Node.js, Express y MongoDB/Mongoose.
- **Pruebas E2E y accesibilidad:** Cypress.
- **Empaquetado de escritorio:** Electron.

## Que haremos con Cypress

Con Cypress se realizaran pruebas dinamicas sobre la interfaz del sistema. Esto significa que Cypress abrira la aplicacion como si fuera un usuario real y ejecutara acciones como entrar a una pantalla, presionar botones, llenar formularios, enviar datos y comprobar que el resultado sea correcto.

En el video se recomienda demostrar principalmente el archivo:

```text
frontend/cypress/e2e/expenses.cy.js
```

Este archivo es ideal para la demostracion porque prueba un flujo completo de gastos:

- Mostrar la lista de gastos.
- Calcular y mostrar el total.
- Abrir el formulario de nuevo gasto.
- Crear un gasto con datos validos.
- Validar que el concepto sea obligatorio.
- Validar que el monto sea mayor a cero.
- Editar un gasto existente.
- Eliminar un gasto confirmando el dialogo del navegador.

Tambien pueden mencionar que el proyecto tiene otras pruebas Cypress:

```text
frontend/cypress/e2e/auth.cy.js
frontend/cypress/e2e/categories.cy.js
frontend/cypress/e2e/dashboard.cy.js
frontend/cypress/e2e/incomes.cy.js
frontend/cypress/e2e/reports.cy.js
frontend/cypress/e2e/regression.cy.js
frontend/cypress/e2e/accessibility.cy.js
```

## Por que elegimos estas pruebas

Se eligieron pruebas E2E, de validacion, regresion y accesibilidad porque son coherentes con las funcionalidades reales del sistema y permiten evaluar los flujos mas importantes desde la perspectiva del usuario.

### Pruebas E2E

Las pruebas E2E permiten validar el funcionamiento completo de una funcionalidad desde la interfaz. En este proyecto son importantes porque el usuario interactua directamente con formularios, listas, botones y reportes.

Se evaluan acciones como:

- Navegar a la pantalla de gastos.
- Visualizar informacion.
- Crear registros.
- Editar datos existentes.
- Eliminar registros.

### Pruebas CRUD

El sistema depende de operaciones CRUD para gastos, ingresos y categorias. Por eso es importante verificar que se pueda crear, consultar, actualizar y eliminar informacion correctamente.

En el caso del archivo `expenses.cy.js`, se evalua el CRUD de gastos.

### Pruebas de validacion

Estas pruebas verifican que el sistema no acepte informacion invalida.

Ejemplos:

- No permitir un gasto sin concepto.
- No permitir un monto negativo o menor/igual a cero.
- Mostrar mensajes de error cuando corresponde.

Estas pruebas son importantes porque protegen la calidad de la informacion financiera.

### Pruebas de regresion

Las pruebas de regresion ayudan a comprobar que una funcionalidad que ya fue corregida o implementada no vuelva a fallar despues de nuevos cambios.

En el proyecto hay un archivo llamado:

```text
frontend/cypress/e2e/regression.cy.js
```

Ese archivo revisa casos especificos como validaciones de registro, manejo correcto de fechas y que no aparezcan selectores duplicados en formularios.

### Pruebas de accesibilidad

Las pruebas de accesibilidad revisan que la interfaz tenga una estructura adecuada para distintos usuarios y herramientas de asistencia.

En el proyecto se usa:

```text
frontend/cypress/e2e/accessibility.cy.js
```

Estas pruebas validan aspectos basicos como estructura de formularios, existencia de regiones principales y posibles problemas detectados con `cypress-axe`.

## Preparacion antes de grabar

### 1. Verificar dependencias

Desde la carpeta `frontend`, revisar que Cypress este instalado:

```bash
cd frontend
npm list cypress
```

Si las dependencias no estan instaladas:

```bash
cd frontend
npm install
```

### 2. Revisar configuracion de Cypress

Mostrar brevemente el archivo:

```text
frontend/cypress.config.js
```

Puntos importantes para explicar:

- `baseUrl: 'http://localhost:3000'`: Cypress prueba el frontend levantado con Vite.
- `specPattern`: define donde estan los archivos `.cy.js`.
- `supportFile`: carga comandos personalizados y configuracion global.
- `screenshotsFolder`: carpeta para capturas cuando falla una prueba.
- `videosFolder`: carpeta donde Cypress puede guardar videos.
- `viewportWidth` y `viewportHeight`: tamano de pantalla usado durante la prueba.

El proyecto queda configurado para guardar videos cuando las pruebas se ejecutan por terminal:

```js
video: true
```

Importante: Cypress **no guarda videos en `cypress open`**. El modo `open` sirve para depurar de forma interactiva. Para generar archivos de video hay que ejecutar las pruebas con `cypress run`.

Despues de ejecutar pruebas con `cypress run`, los videos se guardan en:

```text
frontend/cypress/videos
```

Si van a grabar con OBS, Zoom o Meet, tambien pueden usar `cypress open`; pero esa grabacion la guarda la herramienta externa, no Cypress.

### 3. Levantar el frontend

En una terminal:

```bash
cd frontend
npm run dev
```

La aplicacion deberia abrirse en:

```text
http://localhost:3000
```

### 4. Ejecutar Cypress

Para abrir Cypress en modo interactivo:

```bash
cd frontend
npm run cypress:open
```

Para ejecutar todas las pruebas en modo terminal:

```bash
cd frontend
npm run cypress:run
```

Nota tecnica: los scripts de Cypress del proyecto usan `frontend/scripts/run-cypress.cjs` para limpiar la variable `ELECTRON_RUN_AS_NODE` antes de abrir Cypress. Esto evita un error de arranque en Windows donde Cypress puede fallar con `bad option: --smoke-test`.

Para ejecutar solo la prueba de gastos:

```bash
cd frontend
npm run cypress:run -- --spec "cypress/e2e/expenses.cy.js"
```

Para ejecutar la prueba de gastos guardando video:

```bash
cd frontend
npm run cypress:video:expenses
```

Para ejecutar solo accesibilidad:

```bash
cd frontend
npm run test:a11y
```

## Estructura sugerida del video

### Minuto 0:00 a 0:45 - Introduccion general

Responsable principal: **Ricardo**

Guion sugerido:

> Buenas, somos Ricardo, Julio y Ariel. En este video vamos a presentar nuestro sistema de gestion de ingresos y gastos, y vamos a demostrar como realizamos pruebas dinamicas utilizando Cypress. El objetivo es comprobar que las funcionalidades principales del sistema se comporten correctamente desde la perspectiva del usuario.

Mostrar en pantalla:

- Proyecto abierto en VS Code.
- Carpeta general del repositorio.
- Integrantes con camara encendida.

### Minuto 0:45 a 2:00 - Que hace el software

Responsable principal: **Ricardo**

Guion sugerido:

> Nuestro software permite llevar el control de ingresos y gastos personales o familiares. El usuario puede registrar movimientos, clasificarlos por categorias, revisar su informacion desde un panel principal y consultar reportes. La aplicacion esta construida con React en el frontend, Node.js y Express en el backend, y MongoDB para la persistencia de datos.

> En este caso, nos vamos a enfocar en las pruebas del frontend con Cypress, porque queremos validar que los flujos visibles para el usuario funcionen correctamente.

Mostrar en pantalla:

- La aplicacion abierta en el navegador.
- Dashboard o pantalla principal.
- Menu con gastos, ingresos, categorias y reportes.

### Minuto 2:00 a 3:30 - Que es Cypress y que se va a probar

Responsable principal: **Julio**

Guion sugerido:

> Cypress es una herramienta para automatizar pruebas sobre aplicaciones web. Nos permite abrir la aplicacion en un navegador real, interactuar con botones, formularios y rutas, y verificar automaticamente si el resultado esperado se cumple.

> En este proyecto lo usamos para pruebas dinamicas, porque la aplicacion se ejecuta y Cypress simula acciones de un usuario. No solo revisamos el codigo de forma estatica, sino que comprobamos el comportamiento del sistema mientras esta funcionando.

> Para la demostracion principal elegimos el flujo de gastos, porque es una funcionalidad central del sistema. Si el usuario no puede registrar, editar o eliminar gastos correctamente, el sistema pierde una parte importante de su proposito.

Mostrar en pantalla:

- Carpeta `frontend/cypress/e2e`.
- Archivo `expenses.cy.js`.
- Otros archivos de prueba existentes.

### Minuto 3:30 a 5:00 - Por que elegimos estos tipos de pruebas

Responsable principal: **Julio**

Guion sugerido:

> Elegimos pruebas E2E porque permiten validar la experiencia completa del usuario. Tambien elegimos pruebas CRUD porque gastos, ingresos y categorias son el nucleo funcional del sistema. Ademas, agregamos pruebas de validacion para evitar datos incorrectos, pruebas de regresion para confirmar que errores anteriores no vuelvan a aparecer y pruebas de accesibilidad para revisar condiciones basicas de uso de la interfaz.

> En resumen, vamos a evaluar que el sistema muestre informacion correctamente, que permita crear, editar y eliminar datos, que bloquee entradas invalidas y que mantenga una estructura accesible en pantallas importantes.

Mostrar en pantalla:

- `expenses.cy.js`.
- `regression.cy.js`.
- `accessibility.cy.js`.

### Minuto 5:00 a 8:30 - Explicacion del codigo Cypress

Responsable principal: **Ariel**

Guion sugerido:

> Ahora vamos a explicar la estructura de la prueba de gastos. Primero se definen datos de prueba como un usuario, una categoria y un gasto de ejemplo. Luego, dentro de `beforeEach`, usamos `cy.intercept` para simular respuestas del backend. Esto nos permite probar la interfaz sin depender de una base de datos real durante la ejecucion.

Puntos que Ariel debe explicar:

- `describe('CRUD de Gastos (E2E)', ...)`: agrupa las pruebas del flujo de gastos.
- `before`: carga datos desde fixtures.
- `beforeEach`: prepara cada prueba con interceptores y sesion simulada.
- `cy.intercept`: controla respuestas de la API.
- `cy.visitWithSession`: entra a la ruta con un usuario autenticado.
- `cy.get('[data-testid="..."]')`: selecciona elementos estables de la interfaz.
- `.should(...)`: valida resultados esperados.
- `cy.wait('@alias')`: espera una llamada HTTP interceptada.

Guion sugerido para explicar una prueba:

> En esta prueba se presiona el boton de nuevo gasto, se llena el formulario con concepto, monto, categoria, fecha y descripcion. Luego se envia el formulario y Cypress espera la peticion `POST` interceptada. Finalmente valida que el estado sea 201, que aparezca el mensaje de exito y que el gasto creado se muestre en la lista.

Mostrar en pantalla:

- Prueba `Debe crear un gasto con datos validos`.
- Prueba `Debe validar que el concepto sea obligatorio`.
- Prueba `Debe validar que el monto sea mayor a 0`.
- Prueba `Debe editar un gasto desde la lista`.
- Prueba `Debe eliminar un gasto confirmando el dialogo del navegador`.

### Minuto 8:30 a 10:30 - Ejecucion de pruebas

Responsable principal: **Ariel**

Comando recomendado:

```bash
cd frontend
npm run cypress:video:expenses
```

Guion sugerido:

> Ahora vamos a ejecutar la prueba de gastos. Cypress abre la aplicacion, entra a la pantalla de gastos con una sesion simulada, carga datos controlados con `cy.intercept` y ejecuta cada caso definido en el archivo.

Mientras corre la prueba, explicar:

- Si una prueba pasa, significa que el comportamiento esperado se cumplio.
- Si una prueba falla, Cypress muestra el paso exacto donde ocurrio el error.
- Las capturas o videos sirven como evidencia de la ejecucion.

Al finalizar:

> Como se observa, Cypress muestra el resultado de cada prueba. Esto nos permite evidenciar que el flujo de gastos fue evaluado de forma automatizada y que las validaciones principales funcionan segun lo esperado.

Si quieren mostrar todas las pruebas:

```bash
cd frontend
npm run cypress:run
```

Si quieren mostrar accesibilidad:

```bash
cd frontend
npm run test:a11y
```

### Minuto 10:30 a 11:30 - Cierre

Responsables: **Ricardo, Julio y Ariel**

Guion sugerido:

**Ricardo:**

> Con este video mostramos el contexto general de la aplicacion y su proposito como sistema de control financiero.

**Julio:**

> Tambien justificamos por que las pruebas elegidas son coherentes con las funcionalidades reales del sistema: CRUD, validaciones, regresion y accesibilidad.

**Ariel:**

> Finalmente, ejecutamos Cypress y revisamos evidencia funcional de que el flujo de gastos se puede probar automaticamente.

Cierre final:

> En conclusion, Cypress nos ayuda a validar el sistema desde la experiencia del usuario, detectar errores rapidamente y aumentar la confianza en las funcionalidades principales del proyecto.

## Distribucion del trabajo por integrante

### Ricardo

Responsabilidades:

- Presentar el proyecto.
- Explicar que problema resuelve el software.
- Mostrar la aplicacion funcionando.
- Introducir la arquitectura general.

Debe preparar:

- Una explicacion breve del sistema.
- Navegacion por las pantallas principales.
- Introduccion del video.

### Julio

Responsabilidades:

- Explicar que es Cypress.
- Justificar los tipos de pruebas seleccionados.
- Relacionar las pruebas con funcionalidades reales.
- Explicar que se evaluara.

Debe preparar:

- Definicion breve de prueba dinamica.
- Justificacion de E2E, CRUD, validacion, regresion y accesibilidad.
- Relacion con la rubrica.

### Ariel

Responsabilidades:

- Explicar el codigo de `expenses.cy.js`.
- Mostrar comandos, selectores, interceptores y assertions.
- Ejecutar Cypress en vivo.
- Analizar resultados.

Debe preparar:

- Terminal lista en la carpeta `frontend`.
- Frontend levantado en `http://localhost:3000`.
- Cypress listo para ejecutar.
- Archivo `expenses.cy.js` abierto.

## Mapa contra la rubrica

### Instalacion

Evidencia que deben mostrar:

- `package.json` con Cypress en `devDependencies`.
- `cypress.config.js` con configuracion E2E.
- Ejecucion de `npm run cypress:open` para depurar o `npm run cypress:video:expenses` para generar evidencia en video.

Frase sugerida:

> La instalacion y configuracion se evidencia en el archivo `package.json`, donde Cypress aparece como dependencia de desarrollo, y en `cypress.config.js`, donde se define la URL base, el patron de pruebas, carpetas de capturas y configuracion de ejecucion.

### Explicacion

Evidencia que deben mostrar:

- Que hace la aplicacion.
- Arquitectura general.
- Funcionalidades principales.
- Contexto del sistema probado.

Frase sugerida:

> El sistema permite registrar y analizar ingresos y gastos. Por eso las pruebas se enfocan en validar flujos financieros esenciales, especialmente el CRUD de gastos.

### Diseno

Evidencia que deben mostrar:

- Por que las pruebas elegidas son coherentes.
- Que casos reales representan.
- Que funcionalidad protege cada prueba.

Frase sugerida:

> Los casos de prueba fueron disenados a partir de acciones reales del usuario: consultar gastos, crear un gasto, validar campos, editar informacion y eliminar registros.

### Implementacion

Evidencia que deben mostrar:

- Uso de comandos Cypress.
- Uso de selectores `data-testid`.
- Uso de `cy.intercept`.
- Uso de assertions con `should`.
- Estructura `describe`, `before`, `beforeEach` e `it`.

Frase sugerida:

> La implementacion usa comandos propios de Cypress y selectores estables para interactuar con la interfaz. Tambien se interceptan peticiones HTTP para controlar los datos de prueba y obtener resultados repetibles.

### Ejecucion

Evidencia que deben mostrar:

- Terminal con pruebas ejecutadas.
- Resultado de pruebas aprobadas o analisis si alguna falla.
- Capturas o videos generados.

Frase sugerida:

> Durante la ejecucion, Cypress muestra cada caso de prueba y su resultado. Esto permite identificar rapidamente si una funcionalidad cumple o no con el comportamiento esperado.

### Calidad tecnica

Evidencia que deben mostrar:

- Presentacion ordenada.
- Participacion de los tres integrantes.
- Relacion clara entre pruebas y software.
- Explicacion del por que y el como.

Frase sugerida:

> La seleccion de pruebas responde a funcionalidades reales del sistema y la implementacion usa buenas practicas como selectores dedicados, datos controlados e interceptores de API.

## Checklist antes de grabar

- Los tres integrantes tienen camara y microfono funcionando.
- El proyecto abre correctamente en VS Code.
- La aplicacion frontend inicia en `http://localhost:3000`.
- El archivo `frontend/cypress/e2e/expenses.cy.js` esta abierto.
- El archivo `frontend/cypress.config.js` esta ubicado para mostrar la configuracion.
- La terminal esta lista en la carpeta `frontend`.
- Se probo previamente el comando:

```bash
npm run cypress:video:expenses
```

- Para video automatico de Cypress, usar `cypress run`; `cypress open` no genera archivos en `cypress/videos`.
- No se muestran archivos `.env` ni secretos reales en pantalla.
- Se tiene claro quien habla en cada parte.
- Se subira el video a YouTube antes de la fecha limite indicada por la actividad.

## Recomendaciones para que el video se vea mejor

- Usar zoom del editor entre 120% y 140%.
- Aumentar el tamano de fuente de la terminal.
- Cerrar pestanas innecesarias.
- No mostrar archivos `.env`.
- Ensayar una vez antes de grabar.
- Evitar leer todo literalmente; usar el guion como apoyo.
- Mostrar codigo y ejecucion real, no solo diapositivas.
- Si una prueba falla durante la grabacion, explicar el error y volver a ejecutarla despues de corregir o preparar el entorno.

## Frases utiles para explicar codigo

### Sobre `cy.intercept`

> Usamos `cy.intercept` para controlar las respuestas del backend durante la prueba. Esto permite que la prueba sea estable, porque no depende de datos cambiantes en la base de datos.

### Sobre `data-testid`

> Los selectores `data-testid` ayudan a seleccionar elementos de forma estable. Asi la prueba no depende de clases CSS o textos que pueden cambiar por razones visuales.

### Sobre assertions

> Las assertions con `should` verifican que el resultado esperado realmente aparezca en pantalla o que la respuesta HTTP tenga el estado correcto.

### Sobre validaciones

> Estas pruebas comprueban que el sistema no acepte datos incorrectos, por ejemplo un gasto sin concepto o con monto negativo.

### Sobre pruebas E2E

> Una prueba E2E evalua el flujo completo desde la perspectiva del usuario, desde que entra a una pantalla hasta que obtiene una respuesta visible del sistema.

## Plan alternativo si quieren hacer dos videos

Aunque se recomienda un solo video, tambien podrian dividirlo asi:

- **Video 1:** que hace el software, arquitectura y que se hara con Cypress.
- **Video 2:** justificacion de pruebas, explicacion del codigo y ejecucion.

Sin embargo, para la rubrica conviene mas un solo video porque permite presentar el proceso completo de forma continua: instalacion, explicacion, diseno, implementacion, ejecucion y cierre.
