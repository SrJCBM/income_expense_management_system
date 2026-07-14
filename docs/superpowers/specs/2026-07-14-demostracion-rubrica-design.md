# Diseño de la demostración de FinanceApp

## Objetivo

Diseñar una demostración de 30 minutos que evidencie los seis criterios de la rúbrica: presentación, funcionamiento móvil, integración, correcciones aplicadas, robustez y dominio técnico. La demostración debe utilizar una laptop para web y escritorio, además de un emulador abierto en Android Studio para móvil.

## Enfoque aprobado

La exposición seguirá una historia financiera integrada. En lugar de presentar cada cliente de forma aislada, los integrantes crearán, consultarán y modificarán la misma información desde web, móvil y escritorio. Esto evidenciará que los tres clientes se comunican mediante la API y conservan información consistente.

## Distribución del tiempo

- 00:00-03:00: presentación del equipo, problema y objetivo.
- 03:00-20:00: recorrido funcional integrado web, móvil y escritorio.
- 20:00-24:00: comparación de las observaciones originales con las correcciones.
- 24:00-27:00: robustez, arquitectura y pruebas automatizadas.
- 27:00-30:00: conclusiones y preguntas.

## Historia funcional

1. Iniciar sesión desde web con una cuenta preparada.
2. Crear una categoría reconocible para la demostración.
3. Registrar un ingreso y un gasto desde web.
4. Abrir móvil, actualizar los datos y comprobar que aparecen los mismos registros y balance.
5. Crear o modificar un registro desde móvil.
6. Abrir escritorio, actualizar y demostrar que el cambio móvil permanece.
7. Modificar o eliminar un registro desde escritorio.
8. Volver a web o móvil y confirmar el resultado final.
9. Mostrar reportes y presupuesto con los datos de la historia.

El recorrido será bidireccional: cada cliente no solo consulta, sino que al menos dos clientes escriben información y otro confirma el cambio.

## Correcciones aplicadas

La evidencia base será `PracticaLab_Pruebas.pdf`, que registró 10 casos fallidos de 20. Se presentará una tabla antes/después y se demostrarán correcciones representativas: validación de nombres con símbolos, edición de ingresos, conservación de fechas, filtros de gastos, eliminación del selector duplicado, montos altos sin desbordamiento y selector de iconos. La afirmación defendible será 9 de 10 observaciones corregidas, equivalente al 90% exigido para excelente.

## Robustez y pruebas

La demostración incluirá dos fallos controlados en la interfaz: una entrada inválida y una condición de comunicación sin respuesta. Se explicará que el sistema valida sin bloquearse y conserva mensajes comprensibles. Como evidencia automatizada se mostrarán resultados previamente preparados de 436 pruebas backend, 73 pruebas Cypress y el smoke de Electron. No se ejecutará toda la suite durante la exposición; se ejecutará una comprobación breve y se enseñarán los reportes completos para evitar consumir el tiempo disponible.

## Participación

Los tres integrantes tendrán tiempos similares y una responsabilidad técnica explícita:

- Integrante 1: introducción, web y modelo funcional.
- Integrante 2: móvil, sincronización e integración mediante API.
- Integrante 3: escritorio, correcciones, robustez y pruebas.

Las transiciones deberán mencionar al siguiente integrante y conectar la acción anterior con la siguiente plataforma.

## Preparación y contingencias

- Tener backend, web, Electron y emulador iniciados antes de comenzar.
- Usar una única cuenta y una base de datos compartida.
- Preparar datos iniciales y nombres fáciles de reconocer.
- Desactivar notificaciones y cerrar ventanas ajenas a la demostración.
- Conservar capturas y resultados de pruebas como respaldo.
- Tener el APK instalado y el instalador disponible localmente.
- Si falla la red, mostrar evidencia grabada o capturas y explicar la causa sin fingir una ejecución correcta.

## Criterio de éxito

Al finalizar, el evaluador habrá visto al menos una escritura y una lectura cruzada entre los tres clientes, una corrección comparada con el informe original, una respuesta controlada ante error y evidencia verificable de las pruebas automatizadas. Cada integrante habrá explicado una decisión técnica y participado en una transición entre sistemas.
