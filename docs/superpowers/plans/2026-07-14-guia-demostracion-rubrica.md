# Rubric-Focused Demonstration Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear una guía ensayable de 30 minutos que permita a tres integrantes demostrar funcionamiento móvil, integración entre web, móvil y escritorio, correcciones, robustez y dominio técnico de FinanceApp.

**Architecture:** La guía será un documento Markdown único orientado a ejecución en vivo. Organizará el recorrido como una historia financiera compartida entre tres clientes, con parlamentos, acciones, evidencias esperadas, transiciones, contingencias y una matriz final que conecte cada momento con la rúbrica.

**Tech Stack:** Markdown, FinanceApp React/Vite, API Express/MongoDB, Electron, Capacitor/Android Studio, Vitest, Cypress y Playwright.

## Global Constraints

- Duración total exacta: 30 minutos.
- Participantes: tres integrantes con intervención técnica visible.
- Dispositivos: una laptop para web y escritorio y un emulador Android Studio para móvil.
- Los tres clientes deben usar la misma API y la misma cuenta de demostración.
- La integración debe incluir escrituras y lecturas cruzadas, no solo abrir las tres interfaces.
- La afirmación de correcciones será 9 de 10 observaciones, equivalente al 90%.
- No se ejecutará la suite completa durante la exposición; se mostrará evidencia completa y se ejecutará una comprobación breve.
- La guía no incluirá contraseñas, tokens, URI de MongoDB ni otros secretos.

---

### Task 1: Redactar el recorrido minuto a minuto y los parlamentos

**Files:**
- Create: `docs/GUIA_DEMOSTRACION_RUBRICA.md`
- Reference: `docs/superpowers/specs/2026-07-14-demostracion-rubrica-design.md`
- Reference: `docs/PRUEBAS_MODULOS.md`

**Interfaces:**
- Consumes: diseño aprobado, aplicaciones web/móvil/escritorio y cuenta compartida.
- Produces: guion cronológico de 30 minutos con acciones y frases asignadas a Integrante 1, Integrante 2 e Integrante 3.

- [ ] **Step 1: Crear el encabezado y la tabla de tiempos**

Escribir una tabla con estos bloques exactos:

```markdown
| Tiempo | Responsable | Objetivo |
|---|---|---|
| 00:00-03:00 | Integrante 1 | Presentación formal y objetivo |
| 03:00-09:00 | Integrante 1 | Flujo inicial en web |
| 09:00-15:00 | Integrante 2 | Sincronización y operación móvil |
| 15:00-20:00 | Integrante 3 | Confirmación y modificación en escritorio |
| 20:00-24:00 | Integrantes 1 y 2 | Correcciones antes/después |
| 24:00-27:00 | Integrante 3 | Robustez, arquitectura y pruebas |
| 27:00-30:00 | Todo el equipo | Conclusiones y preguntas |
```

- [ ] **Step 2: Escribir la presentación formal**

Incluir parlamentos literales que indiquen nombres del equipo, tema, problema, objetivo y tecnologías. La introducción debe terminar anunciando que se seguirá una misma operación a través de las tres plataformas.

- [ ] **Step 3: Escribir el flujo web**

Detallar acciones exactas: iniciar sesión, crear la categoría `Demostración ESPE`, registrar un ingreso de `1000,00`, registrar un gasto de `125,50` y comprobar el balance `874,50`. Indicar qué debe decir el expositor y qué resultado debe aparecer después de cada acción.

- [ ] **Step 4: Escribir el flujo móvil**

Indicar actualización de datos, comprobación de los registros web, creación de un gasto móvil de `24,50` y balance esperado `850,00`. Añadir una frase explícita que explique que el cliente móvil escribe mediante la misma API y que la persistencia no vive dentro del emulador.

- [ ] **Step 5: Escribir el flujo de escritorio**

Indicar actualización, comprobación del gasto móvil, edición del ingreso de `1000,00` a `1100,00` y balance final esperado `950,00`. Volver brevemente a web para confirmar el cambio y cerrar la evidencia bidireccional.

- [ ] **Step 6: Revisar la aritmética del escenario**

Comprobar manualmente:

```text
1000,00 - 125,50 = 874,50
874,50 - 24,50 = 850,00
1100,00 - 125,50 - 24,50 = 950,00
```

- [ ] **Step 7: Commit del recorrido**

```powershell
git add docs/GUIA_DEMOSTRACION_RUBRICA.md
git commit -m "docs: add integrated demonstration walkthrough"
```

### Task 2: Incorporar correcciones, robustez y evidencia técnica

**Files:**
- Modify: `docs/GUIA_DEMOSTRACION_RUBRICA.md`
- Reference: `evidencias/referencias/PracticaLab_Pruebas.pdf` dentro del ZIP de entrega
- Reference: `web/cypress/e2e/regression.cy.js`
- Reference: `web/cypress/e2e/dashboard.cy.js`
- Reference: `backend/vitest.config.js`

**Interfaces:**
- Consumes: flujo cronológico producido en Task 1 y resultados verificados de pruebas.
- Produces: segmento defendible de correcciones, robustez y arquitectura sin afirmaciones superiores a la evidencia.

- [ ] **Step 1: Añadir la matriz antes/después**

Crear una tabla con los 10 fallos originales: nombre con símbolos, edición de ingresos, desfase de fecha, filtros por categoría/mes, ausencia de marzo, selector duplicado, monto alto omitido, desbordamiento visual, actividad reciente e iconos. Marcar nueve como corregidos y `Actividad reciente` como no demostrada/restante. Mostrar el cálculo `9 / 10 × 100 = 90%`.

- [ ] **Step 2: Seleccionar tres correcciones para demostrar en vivo**

Usar estas tres por su claridad visual:

```text
1. Rechazo de nombre compuesto únicamente por símbolos.
2. Edición de ingreso con datos y fecha precargados correctamente.
3. Monto alto contenido dentro de las tarjetas del dashboard.
```

Indicar que las demás se respaldan con Cypress y el PDF comparativo para no repetir funciones durante la exposición.

- [ ] **Step 3: Añadir dos pruebas de robustez controladas**

Describir exactamente:

```text
Entrada inválida: intentar registrar un monto 0 y comprobar que el formulario no se envía.
Comunicación: mostrar una captura o resultado preparado del comportamiento offline; no apagar el backend durante el recorrido integrado.
```

Explicar que el objetivo es demostrar recuperación y mensajes comprensibles, no provocar una caída impredecible.

- [ ] **Step 4: Añadir arquitectura y pruebas**

Incluir esta explicación breve:

```text
React se reutiliza en web, Electron y Capacitor. Los tres clientes consumen la API REST de Express. Express aplica validaciones y reglas de negocio, y MongoDB conserva la información compartida. Vitest verifica backend, Cypress valida los flujos web y Playwright realiza el smoke de Electron.
```

Registrar las cifras verificadas: `436/436 backend`, `73/73 Cypress` y `20/20 framework QA`.

- [ ] **Step 5: Añadir comandos de evidencia breve**

Documentar sin ejecutar la suite larga durante la exposición:

```powershell
node --test qa/tests/*.test.mjs
node qa/run-tests.mjs all --profile full --dry-run
```

Se deben abrir previamente `qa/reports/` o capturas de la ejecución completa para contestar si el docente pide evidencia detallada.

- [ ] **Step 6: Commit de evidencia técnica**

```powershell
git add docs/GUIA_DEMOSTRACION_RUBRICA.md
git commit -m "docs: add correction and robustness evidence"
```

### Task 3: Añadir preparación, contingencias y rúbrica verificable

**Files:**
- Modify: `docs/GUIA_DEMOSTRACION_RUBRICA.md`
- Modify artifact: `FinanceApp-entrega-completa.zip`

**Interfaces:**
- Consumes: guía funcional y técnica de Tasks 1-2.
- Produces: documento listo para ensayo, lista de preparación y ZIP actualizado con la guía.

- [ ] **Step 1: Añadir checklist de la víspera**

Incluir comprobaciones de dependencias, misma API/base de datos, cuenta compartida, datos iniciales, APK instalado, Electron preparado, zoom del navegador, notificaciones desactivadas, cargador y conexión de respaldo.

- [ ] **Step 2: Añadir checklist de 15 minutos antes**

Orden exacto:

```text
1. Levantar o comprobar backend.
2. Abrir web e iniciar sesión.
3. Abrir Electron e iniciar sesión.
4. Iniciar el emulador y abrir FinanceApp.
5. Confirmar la misma cuenta en los tres clientes.
6. Limpiar únicamente los datos creados en ensayos anteriores.
7. Abrir PDF de observaciones y reporte QA.
8. Cerrar terminales y ventanas no utilizadas.
```

- [ ] **Step 3: Añadir contingencias**

Crear respuestas para: emulador lento, API de Render despertando, Electron sin conexión, dato que tarda en aparecer, Cypress que tarda demasiado y pregunta cuya respuesta no se conoce. En todos los casos se debe reconocer el estado real y usar evidencia preparada, nunca afirmar que algo pasó si no ocurrió.

- [ ] **Step 4: Añadir matriz de trazabilidad de la rúbrica**

Vincular cada criterio con minuto y evidencia:

```markdown
| Criterio | Minuto | Evidencia |
| Presentación | 00:00-03:00 | Tema, objetivo y formalidad |
| Funcionamiento móvil | 09:00-15:00 | Consulta y creación sin cierre inesperado |
| Integración | 03:00-20:00 | Escrituras y lecturas cruzadas |
| Correcciones | 20:00-24:00 | 9/10 y demostraciones antes/después |
| Robustez | 24:00-25:30 | Validación y recuperación controlada |
| Demostración | 00:00-30:00 | Participación y explicación técnica |
```

- [ ] **Step 5: Añadir preguntas probables y respuestas breves**

Cubrir al menos: por qué una sola interfaz React, cómo se sincronizan los clientes, dónde viven los datos, cómo se protege la API, diferencia entre prueba unitaria/E2E/smoke, por qué 90% de correcciones y qué queda pendiente.

- [ ] **Step 6: Verificar estructura y duración**

Ejecutar:

```powershell
rg -n "00:00|03:00|09:00|15:00|20:00|24:00|27:00|30:00|9 / 10|436/436|73/73" docs/GUIA_DEMOSTRACION_RUBRICA.md
```

Esperado: todos los hitos, cifras y tiempos aparecen al menos una vez. Leer el documento completo y confirmar que la suma de bloques sea exactamente 30 minutos.

- [ ] **Step 7: Regenerar y auditar el ZIP**

Regenerar `FinanceApp-entrega-completa.zip` con backend, web, mobile, installer, qa, docs y evidencias. Excluir `node_modules`, builds, cachés, `.env` privados, `local.properties`, videos y reportes temporales. Confirmar que `docs/GUIA_DEMOSTRACION_RUBRICA.md` esté presente y que `ZipFile.testzip()` devuelva `None`.

- [ ] **Step 8: Commit final de la guía**

```powershell
git add docs/GUIA_DEMOSTRACION_RUBRICA.md
git commit -m "docs: finalize rubric demonstration guide"
```
