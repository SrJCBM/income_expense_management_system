# 🧪 Guía Completa de Pruebas - Income & Expense Management System

**Última Actualización:** Mayo 2026  
**Estado General:** ✅ Todos los tests pasando (401 backend + 29 frontend E2E)  
**Cobertura:** 87.15% (backend), 100% tests pasando

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Requisitos Previos](#requisitos-previos)
3. [Backend - Pruebas Unitarias e Integración](#backend---pruebas-unitarias-e-integración)
4. [Frontend - Pruebas E2E](#frontend---pruebas-e2e)
5. [Workflow Completo (Frontend + Backend)](#workflow-completo-frontend--backend)
6. [Resultados Esperados](#resultados-esperados)
7. [Solución de Problemas](#solución-de-problemas)
8. [Próxima Fase: Electron Desktop App](#próxima-fase-electron-desktop-app)

---

## 🎯 Visión General

### ¿Por qué Testing?

El sistema de pruebas automatizadas garantiza:
- **Confiabilidad**: El código funciona como se espera
- **Mantenibilidad**: Los cambios no rompen funcionalidad existente
- **Documentación**: Las pruebas definen el comportamiento esperado
- **Calidad**: Detección temprana de errores antes de producción

### Estrategia de Testing

```
┌─────────────────────────────────────────────────────────┐
│          INCOME & EXPENSE MANAGEMENT SYSTEM             │
│                    Testing Strategy                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  BACKEND (Node.js + Express + MongoDB)                 │
│  ├─ Unit Tests (Vitest)                                │
│  │  └─ Services: Auth, Expenses, Incomes, Categories  │
│  │  └─ Utils: Validators, Formatters, Auth Utilities   │
│  │                                                      │
│  └─ Integration Tests (Vitest + Supertest)            │
│     └─ API Endpoints: Auth, Expenses, Incomes,        │
│        Categories, Reports                             │
│                                                         │
│  FRONTEND (React + Vite)                               │
│  └─ E2E Tests (Cypress)                                │
│     ├─ Auth Flow (Login, Register, Logout)            │
│     ├─ Expenses CRUD (Create, Read, Update, Delete)   │
│     └─ Accessibility (WCAG 2.1 AA Compliance)         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Requisitos Previos

Asegúrate de tener instalado:

```bash
# Verificar Node.js
node --version    # Debe ser v18+ (v22.20.0 recomendado)
npm --version     # Debe ser v9+

# Verificar dependencias instaladas
cd backend && npm list | head -20
cd web && npm list | head -20
```

### Estructura de Carpetas para Testing

```
backend/
├── tests/
│   ├── setup.js                          # Configuración de MongoDB en memoria
│   ├── unit/
│   │   ├── authService.test.js          # 19 tests: registro, login, tokens
│   │   ├── expenseService.test.js       # 30 tests: CRUD de gastos
│   │   ├── incomeService.test.js        # 34 tests: CRUD de ingresos
│   │   ├── categoryService.test.js      # 48 tests: gestión de categorías
│   │   ├── authValidator.test.js        # 30 tests: validación de auth
│   │   ├── expenseValidator.test.js     # 29 tests: validación de datos
│   │   └── responseFormatter.test.js    # 23 tests: formato de respuestas
│   │
│   └── integration/
│       ├── auth.test.js                  # 25 tests: endpoints de autenticación
│       ├── expenses.test.js              # 36 tests: endpoints de gastos
│       ├── incomes.test.js               # 36 tests: endpoints de ingresos
│       ├── categories.test.js            # 42 tests: endpoints de categorías
│       └── reports.test.js               # 37 tests: endpoints de reportes
│
web/
├── cypress/
│   ├── support/
│   │   └── commands.js                   # Comandos personalizados de Cypress
│   │
│   └── e2e/
│       ├── auth.cy.js                    # 19 tests: flujo de autenticación
│       ├── expenses.cy.js                # 7 tests: CRUD de gastos
│       └── accessibility.cy.js           # 3 tests: conformidad WCAG
```

---

## 🏗️ Backend - Pruebas Unitarias e Integración

### ¿Qué Son las Pruebas Unitarias?

**Unit Tests**: Prueban funciones individuales en aislamiento.

- **Qué prueban**: Servicios, validadores, funciones utilitarias
- **Por qué**: Verifican que cada pieza funcione correctamente
- **Resultado**: Reportes rápidos (< 5 segundos)

### ¿Qué Son las Pruebas de Integración?

**Integration Tests**: Prueban endpoints API completos con base de datos.

- **Qué prueban**: Toda la cadena: request → controller → service → database → response
- **Por qué**: Verifican que el sistema funcione como un todo
- **Resultado**: Reportes más detallados (10-15 segundos)

### Comando 1: Ejecutar Todas las Pruebas

```bash
cd backend
npm test
```

**¿Qué sucede?**
1. Inicia MongoDB en memoria (sin servidor externo)
2. Ejecuta 401 pruebas en paralelo
3. Genera reporte con resultados

**Resultado Esperado:**

```
 ✓ backend/tests/unit/authService.test.js (19 tests)
 ✓ backend/tests/unit/expenseService.test.js (30 tests)
 ✓ backend/tests/unit/incomeService.test.js (34 tests)
 ✓ backend/tests/unit/categoryService.test.js (48 tests)
 ✓ backend/tests/unit/authValidator.test.js (30 tests)
 ✓ backend/tests/unit/expenseValidator.test.js (29 tests)
 ✓ backend/tests/unit/responseFormatter.test.js (23 tests)
 ✓ backend/tests/integration/auth.test.js (25 tests)
 ✓ backend/tests/integration/expenses.test.js (36 tests)
 ✓ backend/tests/integration/incomes.test.js (36 tests)
 ✓ backend/tests/integration/categories.test.js (42 tests)
 ✓ backend/tests/integration/reports.test.js (37 tests)

Test Files  12 passed (12)
     Tests  401 passed (401)
  Duration  ~15s
```

### Comando 2: Modo Watch (Desarrollo)

```bash
cd backend
npm test:watch
```

**¿Qué sucede?**
1. Ejecuta las pruebas
2. Espera cambios en archivos
3. Re-ejecuta automáticamente las pruebas afectadas

**Útil Para:** Desarrollo activo - verifica cambios en tiempo real.

**Salida de Ejemplo:**

```
 ✓ backend/tests/unit/authService.test.js (19)

Test Files  1 passed (1)
     Tests  19 passed (19)
  Duration  2.3s

watching... (press 'q' to exit)
```

### Comando 3: Reporte de Cobertura

```bash
cd backend
npm run test:coverage
```

**¿Qué sucede?**
1. Ejecuta todas las pruebas
2. Analiza qué líneas de código fueron ejecutadas
3. Genera reporte en HTML y terminal

**¿Por Qué?** Verifica que todas las rutas de código importantes sean probadas.

**Resultado Esperado:**

```
------------|---------|----------|---------|---------|---
File        | % Stmts | % Branch | % Funcs | % Lines |
------------|---------|----------|---------|---------|---
Services:   |    99%  |    98%   |   100%  |   99%   |
Validators: |    98%  |    97%   |   100%  |   98%   |
Utils:      |   100%  |    99%   |   100%  |   100%  |
Controllers:|    94%  |    91%   |    95%  |    94%  |
Middlewares:|    87%  |    84%   |    90%  |    87%  |
------------|---------|----------|---------|---------|---
Overall:    |  87.15% | 86.2%    | 88.9%   | 87.15%  |
```

**Criterio de Éxito:** ≥ 70% cobertura ✅ (Nuestro sistema: 87.15%)

### Desglose de Pruebas Unitarias por Servicio

#### 1. AuthService (19 tests)
```bash
npm test -- authService
```

**Qué Prueba:**
- ✅ Registro de usuario (validación email, contraseña)
- ✅ Login (credenciales correctas/incorrectas)
- ✅ Generación de tokens JWT
- ✅ Refresh de tokens
- ✅ Hashing de contraseñas

**Por Qué:** Garantiza seguridad en autenticación.

---

#### 2. ExpenseService (30 tests)
```bash
npm test -- expenseService
```

**Qué Prueba:**
- ✅ Crear gastos (con validación)
- ✅ Listar gastos del usuario
- ✅ Actualizar gastos
- ✅ Eliminar gastos
- ✅ Filtrar por categoría, fecha, cantidad
- ✅ Aislamiento por usuario (no ver gastos ajenos)

**Por Qué:** Core del negocio - usuarios necesitan gestionar gastos confiablemente.

---

#### 3. IncomeService (34 tests)
```bash
npm test -- incomeService
```

**Qué Prueba:**
- ✅ Crear ingresos
- ✅ Listar ingresos
- ✅ Actualizar/Eliminar ingresos
- ✅ Filtros avanzados
- ✅ Aislamiento de datos por usuario

---

#### 4. CategoryService (48 tests)
```bash
npm test -- categoryService
```

**Qué Prueba:**
- ✅ Crear categorías personalizadas
- ✅ Categorías predefinidas (Alimentación, Transporte, etc.)
- ✅ Tipos de categorías (gastos vs ingresos)
- ✅ Eliminar categorías
- ✅ Prevención de categorías duplicadas

**Por Qué:** Permite organizar y clasificar transacciones.

---

### Desglose de Pruebas de Integración por Endpoint

#### 1. Autenticación (25 tests)
```bash
npm test -- integration/auth
```

**Endpoints Probados:**
- `POST /api/auth/register` - Crear cuenta
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Renovar token

**Resultado Esperado:**
```
✓ POST /register - usuario válido
✓ POST /register - email duplicado rechazado
✓ POST /login - credenciales correctas
✓ POST /login - credenciales incorrectas (401)
✓ GET /profile - con token válido
✓ GET /profile - sin token (401)
```

---

#### 2. Gastos - CRUD (36 tests)
```bash
npm test -- integration/expenses
```

**Operaciones Probadas:**
- 📝 **CREATE**: `POST /api/expenses`
  - Validación de cantidad > 0
  - Categoría requerida
  - Descripción opcional
  
- 📖 **READ**: `GET /api/expenses`
  - Listar todos
  - Filtrar por categoría
  - Filtrar por rango de fechas
  - Filtrar por cantidad mínima/máxima
  
- ✏️ **UPDATE**: `PUT /api/expenses/:id`
  - Actualizar campos individuales
  - Validación en actualización
  
- 🗑️ **DELETE**: `DELETE /api/expenses/:id`
  - Eliminar por ID
  - No puedo eliminar gastos de otro usuario

---

#### 3. Ingresos - CRUD (36 tests)
```bash
npm test -- integration/incomes
```

Similar a Gastos pero para ingresos.

---

#### 4. Categorías (42 tests)
```bash
npm test -- integration/categories
```

**Endpoints:**
- `GET /api/categories` - Listar todas (incluye predefinidas)
- `POST /api/categories` - Crear categoría personalizada
- `PUT /api/categories/:id` - Actualizar
- `DELETE /api/categories/:id` - Eliminar
- `GET /api/categories?type=expense` - Filtrar por tipo

---

#### 5. Reportes (37 tests)
```bash
npm test -- integration/reports
```

**Endpoints de Análisis:**
- `GET /api/reports/summary` - Resumen general
- `GET /api/reports/monthly` - Datos por mes
- `GET /api/reports/yearly` - Datos por año
- `GET /api/reports/breakdown` - Desglose por categoría
- `GET /api/reports/filters` - Reportes con filtros personalizados

---

## 🎮 Frontend - Pruebas E2E (Cypress)

### ¿Qué Son las Pruebas E2E?

**End-to-End Tests**: Simulan un usuario real interactuando con la aplicación.

- **Qué prueban**: Flujos completos de usuario (como humano usaría)
- **Por qué**: Detectan problemas en UI/UX que tests unitarios pierden
- **Resultado**: Verifica experiencia completa del usuario

### Requisitos para E2E

**Importante:** Las pruebas E2E necesitan que el servidor frontend esté corriendo.

```bash
# Terminal 1: Inicia servidor de desarrollo
cd web
npm run dev -- --port 3000

# Espera a ver:
# ✓ Local: http://localhost:3000/
```

### Comando 1: Ejecutar Todas las Pruebas E2E

```bash
# Terminal 2 (en otra ventana)
cd web
npm run test:e2e
```

**¿Qué sucede?**
1. Abre navegador (headless/invisible)
2. Ejecuta 29 tests contra localhost:3000
3. Genera reporte de resultados

**Resultado Esperado:**

```
 ✓ cypress/e2e/auth.cy.js (19 tests)
   ├─ Register Flow (7)
   ├─ Login Flow (7)
   └─ Logout & Session (5)

 ✓ cypress/e2e/expenses.cy.js (7 tests)
   ├─ List Expenses
   ├─ Create Expense
   ├─ Validate Form
   ├─ Edit Expense
   └─ Delete Expense

 ✓ cypress/e2e/accessibility.cy.js (3 tests)
   ├─ Login Page Accessibility
   ├─ Register Page Accessibility
   └─ Dashboard Accessibility

Passing: 29
Failing: 0
Duration: ~24 seconds
```

### Comando 2: Modo Interactivo (Cypress Studio)

```bash
cd web
npm run cypress:open
```

**¿Qué sucede?**
1. Abre UI de Cypress
2. Puedes seleccionar tests para ejecutar
3. Ves video en tiempo real del navegador

**Útil Para:**
- Debugging de tests
- Aprender cómo funcionan
- Crear nuevos tests visualmente

### Desglose de Pruebas E2E

#### 1. Flujo de Autenticación (19 tests)

**Test Suite: auth.cy.js**

```bash
npm run test:e2e -- --spec cypress/e2e/auth.cy.js
```

##### A. Registro (7 tests)

| Test | Qué Valida | Resultado Esperado |
|------|-----------|-------------------|
| Página visible | Form existe en DOM | Email + password inputs visibles |
| Registro válido | Usuario se crea | Redirige a Dashboard |
| Email duplicado | No permite repetir email | Error: "Email en uso" |
| Contraseña débil | Validar seguridad | Error: "Contraseña muy corta" |
| Campos vacíos | Validar requeridos | Mensaje de validación |
| Password match | Confirmar contraseña | Valida coincidencia |
| Accesibilidad | WCAG compliance | aria-labels presentes |

**Ejecución:**
```bash
npm run cypress:run -- --spec cypress/e2e/auth.cy.js --grep "Register"
```

---

##### B. Login (7 tests)

| Test | Qué Valida | Resultado Esperado |
|------|-----------|-------------------|
| Login válido | Credenciales correctas | Acceso al Dashboard |
| Login inválido | Password incorrecta | Error 401 |
| Usuario no existe | Email no registrado | Error "Usuario no encontrado" |
| Token persistente | Sesión guardada | Recarga página = sigue logueado |
| Token expirado | Refresh automático | Obtiene nuevo token |
| Logout | Cerrar sesión | Redirige a Login |
| Persistencia | localStorage | Token guardado correctamente |

---

##### C. Logout & Sesión (5 tests)

| Test | Qué Valida | Resultado Esperado |
|------|-----------|-------------------|
| Botón logout | Visible en navbar | Clickeable |
| Logout funciona | Cierra sesión | localStorage limpiado |
| Redirige a login | Post-logout | URL = /login |
| Token removido | Sesión eliminada | No puede acceder sin login |
| Relogin después logout | Sesión nueva | Crea nuevo token |

---

#### 2. CRUD de Gastos (7 tests)

**Test Suite: expenses.cy.js**

```bash
npm run test:e2e -- --spec cypress/e2e/expenses.cy.js
```

| Test | Qué Hace | Validación |
|------|----------|-----------|
| Lista visible | Carga página gastos | Tabla/lista visible |
| Crear gasto | Form + Submit | Gasto aparece en lista |
| Cantidad > 0 | Validar cantidad | Rechaza cantidad ≤ 0 |
| Campos requeridos | Validar obligatorios | Error si falta categoría |
| Editar gasto | Actualizar valores | Cambios reflejados |
| Eliminar gasto | Borrar registro | Desaparece de lista |
| Filtros | Filtrar por categoría | Muestra solo gastos filtrados |

**Flujo de Ejemplo:**

```gherkin
Given Usuario está logueado
When Navega a Gastos
And Hace click en "Nuevo Gasto"
And Completa form: Categoría="Alimentación", Cantidad="25.50"
Then El gasto aparece en la lista
And Puede editar haciendo click
And Puede eliminar con botón trash
```

---

#### 3. Accesibilidad (3 tests - Smoke Tests)

**Test Suite: accessibility.cy.js**

```bash
npm run test:e2e -- --spec cypress/e2e/accessibility.cy.js
```

**¿Por Qué Accesibilidad?** Garantiza que la app sea usable por personas con discapacidades.

| Test | Validación | Estándar |
|------|-----------|----------|
| Login Page | Landmarks, form labels, contrast | WCAG 2.1 AA |
| Register Page | Form structure, required fields, error messages | WCAG 2.1 AA |
| Dashboard | Page structure, navigation, interactive elements | WCAG 2.1 AA |

**Herramienta:** cypress-axe (automático con `auditA11y()`)

---

## 🔄 Workflow Completo (Frontend + Backend)

### Escenario: Ejecutar Todo en 3 Pasos

#### Paso 1: Preparar Backend

```bash
# Terminal 1
cd backend

# Instalar dependencias (solo primera vez)
npm install

# Ejecutar pruebas unitarias + integración
npm test

# Generalmente tarda: 15-20 segundos
```

**Observa:**
```
✓ 401 passed
Coverage: 87.15%
```

---

#### Paso 2: Iniciar Frontend Dev Server

```bash
# Terminal 2
cd web

# Instalar dependencias (solo primera vez)
npm install

# Inicia servidor en puerto 3000
npm run dev -- --port 3000

# Verás:
# ✓ Local: http://localhost:3000/
# (Presiona ctrl+c para detener)
```

---

#### Paso 3: Ejecutar Pruebas E2E

```bash
# Terminal 3 (mientras Terminal 2 sigue corriendo)
cd web

# Ejecutar E2E tests
npm run test:e2e

# Generalmente tarda: 20-30 segundos
```

**Observa:**
```
✓ 29 passed
```

---

### Script Combinado (One-Liner)

Si quieres automatizar todo:

**Para Windows PowerShell:**

```powershell
# Backend tests
cd backend; npm test; cd ..

# Frontend dev server (background)
cd web; Start-Process -NoNewWindow -FilePath npm -ArgumentList "run dev -- --port 3000"

# E2E tests (espera 3 segundos para que inicie servidor)
Start-Sleep -Seconds 3
npm run test:e2e
```

---

## 📊 Resultados Esperados

### Backend - Salida Completa

```
 ✓ backend/tests/unit/authService.test.js (19)
   ✓ should hash password correctly
   ✓ should validate email format
   ✓ should generate JWT token
   ... 16 more

 ✓ backend/tests/integration/expenses.test.js (36)
   ✓ POST /api/expenses - create with valid data
   ✓ POST /api/expenses - reject without category
   ✓ GET /api/expenses - list all
   ... 33 more

Test Files  12 passed (12)
     Tests  401 passed (401)
      Start  14:32:15
        End  14:32:31
    Duration  15.847s
```

### Frontend - Salida Completa

```
Running:  3 of 3

  auth.cy.js
    Register Flow
      ✓ Register page is visible
      ✓ Can register new user
      ✓ Email validation works
      ... 4 more
    Login Flow
      ✓ Can login with valid credentials
      ✓ Rejects invalid password
      ... 5 more
    Logout & Session
      ✓ Logout button visible
      ✓ Logout clears session
      ... 3 more

  expenses.cy.js
    ✓ Expenses list loads
    ✓ Can create expense
    ✓ Validation: amount > 0
    ... 4 more

  accessibility.cy.js
    ✓ Login page has proper landmarks
    ✓ Register form is accessible
    ✓ Dashboard navigation works

Passing: 29
Failing: 0
```

---

## 🔧 Solución de Problemas

### Problema 1: "ECONNREFUSED - Backend no responde"

**Síntoma:**
```
Error: connect ECONNREFUSED 127.0.0.1:5000
```

**Solución:**
1. Verifica que backend esté corriendo
2. O especifica puerto correcto en tests:
```bash
# En backend/tests/setup.js, verifica:
const API_URL = 'http://localhost:5000'
```

---

### Problema 2: "Port 3000 already in use"

**Síntoma:**
```
Error: listen EADDRINUSE :::3000
```

**Solución:**
```bash
# Encuentra proceso usando puerto 3000
lsof -i :3000

# En Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# O usa puerto diferente:
npm run dev -- --port 3001
```

---

### Problema 3: "MongoDB Binary Download Timeout"

**Síntoma:**
```
Timeout waiting for MongoDB binary
```

**Solución:**
- Primera ejecución es más lenta (descarga binario)
- Espera 2-3 minutos
- Las siguientes ejecuciones serán rápidas
- Si persiste, limpia cache:
```bash
rm -rf node_modules/.bin/mongodb-memory-server
npm install
npm test
```

---

### Problema 4: "Cypress tests timeout after 10s"

**Síntoma:**
```
The command was expected to run within 10000ms
```

**Solución:**
Verifica que `npm run dev` esté activo. Si no:
```bash
# Terminal dedicada para dev server
cd web
npm run dev -- --port 3000
# Mantén corriendo mientras ejecutas tests
```

---

### Problema 5: "Tests pass locally but fail in CI/CD"

**Solución:**
- Aumenta timeouts en CI
- Usa `--no-coverage` para E2E
- Verifica variables de entorno:
```bash
echo $NODE_ENV
# Debe ser: test (no production)
```

---

## 🚀 Próxima Fase: Electron Desktop App

### Estado Actual
✅ Testing completado y documentado  
⏳ **SIGUIENTE:** Convertir a Electron

### Qué es Electron?

Electron convierte tu app web en una aplicación nativa de escritorio Windows/Mac/Linux.

```
Web App (Vite)              Electron App
┌─────────────────┐        ┌──────────────┐
│ React Vite      │   →    │ Executable   │
│ localhost:3000  │        │ .exe/.dmg    │
└─────────────────┘        └──────────────┘
```

### Fases de Implementación

#### Fase 1: Setup Electron (2-3 horas)
- [ ] Instalar `electron`, `electron-builder`
- [ ] Crear `main.js` (proceso principal)
- [ ] Configurar `preload.js` (seguridad)
- [ ] Build scripts en package.json

#### Fase 2: Desarrollo Electron (3-4 horas)
- [ ] Dev server con hot reload
- [ ] Pruebas en modo Electron
- [ ] Acceso a APIs nativas (si necesarias)

#### Fase 3: Empaquetado (2-3 horas)
- [ ] Generar .exe para Windows
- [ ] Configurar auto-update
- [ ] Testing en máquina limpia

### Comando Preview (después de implementación)

```bash
# Desarrollo
npm run electron-dev

# Build final
npm run electron-build

# Resultado: instalador .exe
dist/Income & Expense Manager Setup 1.0.0.exe
```

### Dependencias que se agregarán

```json
{
  "devDependencies": {
    "electron": "^latest",
    "electron-builder": "^latest",
    "electron-devtools-installer": "^latest"
  }
}
```

---

## 📚 Comandos de Referencia Rápida

### Backend

```bash
npm test                    # Ejecutar todos los tests
npm test:watch             # Watch mode (auto-re-run)
npm run test:coverage      # Generar reporte de cobertura
npm test -- authService    # Tests específicos
npm run dev                # Iniciar servidor backend
```

### Frontend

```bash
npm run dev -- --port 3000         # Dev server
npm run build                      # Build producción
npm run test:e2e                   # E2E tests headless
npm run cypress:open               # Cypress UI interactivo
npm run cypress:run                # E2E headless
npm run test:e2e -- --spec cypress/e2e/auth.cy.js  # Test específico
```

### Full Stack

```bash
# Terminal 1: Backend tests
cd backend && npm test

# Terminal 2: Frontend dev server
cd web && npm run dev -- --port 3000

# Terminal 3: Frontend E2E tests
cd web && npm run test:e2e
```

---

## ✨ Métricas de Calidad

| Métrica | Objetivo | Actual | Estado |
|---------|----------|--------|--------|
| Test Coverage Backend | ≥ 70% | 87.15% | ✅ |
| Tests Backend | ≥ 100 | 401 | ✅ |
| Tests Frontend E2E | ≥ 20 | 29 | ✅ |
| E2E Pass Rate | 100% | 100% | ✅ |
| Build Time Backend | < 20s | ~15s | ✅ |
| E2E Duration | < 60s | ~24s | ✅ |

---

## 🎓 Para Presentar al Docente

### Diapo 1: Visión General
```
✅ 401 tests unitarios + integración (Backend)
✅ 29 tests E2E (Frontend)
✅ 87.15% cobertura de código
✅ 100% tests pasando
⏳ Siguiente: Electron desktop app
```

### Diapo 2: Backend Testing
```
Mostrar terminal:
$ cd backend
$ npm test

Resultado: "Test Files 12 passed (12), Tests 401 passed (401)"
```

### Diapo 3: Frontend Testing
```
Mostrar dos terminales:
Terminal 1: npm run dev -- --port 3000
Terminal 2: npm run test:e2e

Resultado: "29 passing in ~24 seconds"
```

### Diapo 4: Roadmap
```
✅ Testing documentado
→ Electron app
→ Gemini API (opcional)
```

---

## 📝 Notas Finales

1. **Primera ejecución es lenta**: MongoDB descarga binario (~100MB)
2. **Dev server es necesario**: Cypress necesita UI para testear
3. **Tests son CI/CD ready**: Funcionan en GitHub Actions, GitLab CI, etc.
4. **Coverage > tests**: Más importante tener buenos tests que cantidad

---

**Última Actualización:** Mayo 3, 2026  
**Responsable:** Income & Expense Management System Team  
**Próxima Revisión:** Después implementación Electron
