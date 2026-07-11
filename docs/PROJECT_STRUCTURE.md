# 📊 Mapa Completo de la Arquitectura

## 🎯 Resumen Ejecutivo

Proyecto **Sistema de Control de Gastos e Ingresos** con arquitectura MVC completa:
- ✅ Backend: Node.js + Express (patrón MC)
- ✅ Frontend: React + Vite (patrón MV)
- ✅ Base de Datos: MongoDB
- ✅ Seguridad: JWT + bcrypt + variables .env
- ✅ Deploy: Render (listo para producción)
- ✅ Clean Code: Aplicado en todo el proyecto

---

## 📁 Estructura Completa del Proyecto

```
income_expense_management_system/
│
├── 📁 backend/
│   ├── 📁 src/
│   │   ├── 📁 controllers/          # Lógica de solicitudes HTTP
│   │   │   ├── authController.js           (Login, Register, Logout)
│   │   │   ├── expenseController.js        (CRUD Gastos)
│   │   │   ├── incomeController.js         (CRUD Ingresos)
│   │   │   ├── categoryController.js       (CRUD Categorías)
│   │   │   ├── userController.js           (Perfil usuario)
│   │   │   └── reportController.js         (Reportes)
│   │   │
│   │   ├── 📁 models/               # Esquemas MongoDB
│   │   │   ├── User.js              (Usuario)
│   │   │   ├── Expense.js           (Gasto)
│   │   │   ├── Income.js            (Ingreso)
│   │   │   ├── Category.js          (Categoría)
│   │   │   └── Budget.js            (Presupuesto)
│   │   │
│   │   ├── 📁 routes/               # Definición de rutas
│   │   │   ├── authRoutes.js        (POST /api/auth/*)
│   │   │   ├── userRoutes.js        (GET/PUT /api/users/*)
│   │   │   ├── expenseRoutes.js     (GET/POST/PUT/DELETE /api/expenses/*)
│   │   │   ├── incomeRoutes.js      (GET/POST/PUT/DELETE /api/incomes/*)
│   │   │   ├── categoryRoutes.js    (GET/POST/PUT/DELETE /api/categories/*)
│   │   │   ├── budgetRoutes.js      (GET/POST/PUT/DELETE /api/budgets/*)
│   │   │   └── reportRoutes.js      (GET /api/reports/*)
│   │   │
│   │   ├── 📁 middlewares/          # Procesamiento previo de solicitudes
│   │   │   ├── authMiddleware.js    (Validar JWT)
│   │   │   ├── errorHandler.js      (Manejo de errores)
│   │   │   └── (CORS en config/)
│   │   │
│   │   ├── 📁 services/             # Lógica de negocio reutilizable
│   │   │   ├── authService.js       (Autenticación)
│   │   │   ├── expenseService.js    (Operaciones gastos)
│   │   │   ├── incomeService.js     (Operaciones ingresos)
│   │   │   └── reportService.js     (Generación reportes)
│   │   │
│   │   ├── 📁 validators/           # Validación de entrada
│   │   │   ├── authValidator.js     (Registro, Login)
│   │   │   └── expenseValidator.js  (Gastos)
│   │   │
│   │   ├── 📁 config/               # Configuraciones
│   │   │   ├── corsConfig.js        (CORS)
│   │   │   └── database.js          (MongoDB)
│   │   │
│   │   ├── 📁 constants/            # Valores constantes
│   │   │   └── appConstants.js      (Categorías, códigos HTTP, límites)
│   │   │
│   │   ├── 📁 utils/                # Utilidades
│   │   │   ├── authUtils.js         (JWT, bcrypt)
│   │   │   └── responseFormatter.js (Formato de respuestas)
│   │   │
│   │   └── 📁 errors/               # Errores personalizados
│   │       └── ApplicationError.js  (Clases de error)
│   │
│   ├── server.js                    # Punto de entrada
│   ├── package.json                 # Dependencias
│   ├── .env.example                 # Variables (plantilla)
│   └── .env                         # Variables (GITIGNORED)
│
├── 📁 web/
│   ├── 📁 src/
│   │   ├── 📁 components/           # Componentes reutilizables
│   │   │   ├── Button.jsx           (Botón genérico)
│   │   │   └── (más componentes)
│   │   │
│   │   ├── 📁 pages/                # Páginas principales
│   │   │   ├── Login.jsx            (Login)
│   │   │   ├── Register.jsx         (Registro)
│   │   │   ├── Dashboard.jsx        (Inicio)
│   │   │   ├── Expenses.jsx         (Gestionar gastos)
│   │   │   └── Reports.jsx          (Reportes)
│   │   │
│   │   ├── 📁 models/               # Clases y lógica de datos
│   │   │   └── index.js             (UserModel, ExpenseModel, IncomeModel)
│   │   │
│   │   ├── 📁 services/             # Comunicación con API
│   │   │   ├── api.js               (Configuración Axios)
│   │   │   ├── authService.js       (Login/Register)
│   │   │   ├── expenseService.js    (CRUD Gastos)
│   │   │   ├── incomeService.js     (CRUD Ingresos)
│   │   │   ├── categoryService.js   (CRUD Categorías)
│   │   │   └── reportService.js     (Obtener reportes)
│   │   │
│   │   ├── 📁 hooks/                # Custom Hooks
│   │   │   ├── useAuth.js           (Autenticación)
│   │   │   ├── useForm.js           (Formularios)
│   │   │   └── useExpenses.js       (Gestión de gastos)
│   │   │
│   │   ├── 📁 utils/                # Utilidades
│   │   │   ├── validators.js        (Validación frontend)
│   │   │   └── formatters.js        (Formato de datos)
│   │   │
│   │   ├── 📁 styles/               # Estilos CSS
│   │   │   ├── index.css            (Globales)
│   │   │   ├── components/          (Por componente)
│   │   │   └── pages/               (Por página)
│   │   │
│   │   ├── 📁 constants/            # Constantes
│   │   │   └── apiEndpoints.js      (URLs de API)
│   │   │
│   │   ├── 📁 assets/               # Imágenes, íconos, etc.
│   │   │
│   │   ├── App.jsx                  # Componente raíz
│   │   └── main.jsx                 # Entry point
│   │
│   ├── 📁 public/
│   │   └── index.html               # HTML principal
│   │
│   ├── vite.config.js               # Configuración Vite
│   ├── package.json                 # Dependencias
│   ├── .env.example                 # Variables (plantilla)
│   └── .env                         # Variables (GITIGNORED)
│
├── 📁 docs/
│   ├── README.md                    # Info general proyecto
│   ├── ARCHITECTURE.md              # Esta guía
│   ├── SETUP.md                     # Instalación y deploy
│   └── API.md                       # Documentación API
│
├── .gitignore                       # Archivos a ignorar
└── README.md                        # Descripción proyecto
```

---

## 🔄 Flujos de Datos (Ejemplos)

### 1️⃣ Registro de Usuario

```
FRONTEND                          BACKEND
┌─────────────┐
│  Register   │ POST /api/auth/register
│   Page      ├────────────────────────────────┐
└─────────────┘                                 │
       │                           authValidator
       │                          ├─ Valida email
       │                          ├─ Valida password
       │                          ├─ Valida nombre
       │                          │
       │                          authController
       │                          ├─ Valida entrada
       ↓                          ├─ Hash password
   Form Data                      ├─ Crea usuario
   Validation                     │
       │                          User.create()
       │                          │
   useAuth.register()             ├─ Guarda en BD
       │◄─────────────────────────┤
       │                          JWT token
       │                          │
    Token en                  generateToken()
    localStorage              │
       │                      └─ Respuesta
       ↓
   Redirige a
   Dashboard
```

### 2️⃣ Crear un Gasto

```
FRONTEND                          BACKEND
┌──────────────┐
│ Expense Form │ POST /api/expenses
│   Component  ├─────────────────────────────────┐
└──────────────┘                                  │
       │                          authMiddleware
       │                          ├─ Valida JWT
   useForm                    │
   useExpenses                │
       │                      expenseValidator
   Validación                 ├─ Valida datos
   Local                  │
       │                      expenseController
   ExpenseModel.toJSON()      ├─ Parsea datos
       │                      │
   axios.post()               expenseService
       │                      ├─ Lógica negocio
       │                      │
       │                      Expense.create()
       │                      ├─ Crea documento
       │◄─────────────────────┤
       │                  MongoDB
   setExpenses()              │
   Actualiza UI           └─ Respuesta JSON
       │
       ↓
   Muestra nuevo
   gasto en tabla
```

---

## 🔐 Capas de Seguridad

```
┌────────────────────────────────────┐
│         FRONTEND (React)            │
│ ├─ Validación de entrada           │
│ ├─ Token en localStorage           │
│ └─ Interceptores Axios             │
└────────────────────────────────────┘
              ↓
    ┌─────────────────────┐
    │   HTTPS / TLS       │ (Render)
    └─────────────────────┘
              ↓
┌────────────────────────────────────┐
│      MIDDLEWARE (Express)           │
│ ├─ CORS Restringido                │
│ ├─ Helmet (Headers)                │
│ └─ Auth Middleware (JWT)           │
└────────────────────────────────────┘
              ↓
┌────────────────────────────────────┐
│    CONTROLADORES (Validación)      │
│ ├─ Validadores                     │
│ ├─ Manejo de errores               │
│ └─ Respuestas formateadas          │
└────────────────────────────────────┘
              ↓
┌────────────────────────────────────┐
│       BASE DE DATOS (MongoDB)      │
│ ├─ Conexión cifrada                │
│ ├─ Contraseñas hasheadas           │
│ └─ Índices para optimización       │
└────────────────────────────────────┘
```

---

## 📝 Principios Clean Code Implementados

| Principio | Implementación |
|-----------|---|
| **Naming** | Variables descriptivas: `totalExpenses`, `getUserExpenses()` |
| **Funciones Pequeñas** | Cada función hace UNA cosa (`validateUser`, `createExpense`) |
| **Comentarios** | JSDoc en funciones importantes |
| **DRY** | Servicios reutilizables, no repetir lógica |
| **Error Handling** | Errores personalizados, manejo centralizado |
| **Modularidad** | Separación clara: Models, Controllers, Services |
| **Validación** | Entrada validada en frontend Y backend |
| **Formato** | Indentación consistente, convenciones seguidas |

---

## 🚀 Checklist de Desarrollo

Para agregar nueva funcionalidad:

- [ ] **Backend**:
  - [ ] Crear modelo en `models/`
  - [ ] Crear controlador en `controllers/`
  - [ ] Crear servicio en `services/` (si es lógica compleja)
  - [ ] Crear validador en `validators/`
  - [ ] Crear rutas en `routes/`
  - [ ] Agregar rutas al `server.js`

- [ ] **Frontend**:
  - [ ] Crear servicio en `services/`
  - [ ] Crear página en `pages/`
  - [ ] Crear componentes en `components/`
  - [ ] Crear hook si es necesario en `hooks/`
  - [ ] Crear estilos en `styles/`
  - [ ] Agregar constantes en `constants/`

- [ ] **Testing**:
  - [ ] Probar flujo completo
  - [ ] Validar permisos
  - [ ] Verificar errores

- [ ] **Documentación**:
  - [ ] Actualizar README
  - [ ] Agregar al API.md
  - [ ] Comentar código importante

---

## 📌 Próximos Pasos Recomendados

1. **Implementar la API Base**
   - Conectar MongoDB
   - Implementar autenticación
   - Crear CRUD para expenses/incomes

2. **Desarrollar Frontend**
   - Formularios de login/registro
   - Dashboard principal
   - Componentes de tabla para gastos

3. **Testing & Validación**
   - Pruebas unitarias
   - Pruebas de integración
   - Validación de seguridad

4. **Deploy en Render**
   - Configurar variables de entorno
   - Conectar repositorio
   - Configurar dominios

---

**Arquitectura completada ✅**  
**Fecha**: 2026  
**Status**: Listo para empezar desarrollo

Para más información, ver:
- 📖 [SETUP.md](./SETUP.md) - Instalación y configuración
- 📚 [API.md](./API.md) - Documentación de endpoints
- 🎯 [README.md](../README.md) - Descripción general
