# Guía de Arquitectura - Sistema de Control de Gastos e Ingresos

## 📐 Arquitectura MVC Adaptada

### Backend: Model-Controller (MC)

El backend implementa **Model-Controller** sin vista porque es una API REST:

```
REQUEST → MIDDLEWARE → ROUTES → CONTROLLER → MODEL → DATABASE
         ↓
       AUTH
       VALIDATION
       ERROR HANDLING
```

**Componentes**:

1. **Models** (`src/models/`)
   - Esquemas MongoDB con Mongoose
   - Validaciones de esquema
   - Índices para optimización
   - Métodos de instancia cuando es necesario

2. **Controllers** (`src/controllers/`)
   - Lógica de solicitud HTTP
   - Procesamiento de parámetros
   - Llamada a services
   - Respuestas formateadas

3. **Services** (`src/services/`)
   - Lógica de negocio reutilizable
   - Operaciones complejas
   - Llamadas a modelos

4. **Routes** (`src/routes/`)
   - Definición de endpoints
   - Middleware por ruta
   - Validación de entrada

5. **Middlewares** (`src/middlewares/`)
   - Autenticación (JWT)
   - Validación de datos
   - Manejo de errores
   - CORS

### Frontend: Model-View (MV)

El frontend implementa **Model-View** (sin Controller porque React ya maneja la lógica):

```
USER INTERACTION → HOOKS → SERVICES → API → MODELS → COMPONENTS → VIEW
                   ↓        ↓(MV)
                VALIDATION UI STATE
```

**Componentes**:

1. **Models** (`src/models/`)
   - Clases de datos (ExpenseModel, IncomeModel, etc.)
   - Validación de datos
   - Métodos de conversión (toJSON)

2. **Views/Components** (`src/components/`)
   - Componentes reutilizables
   - Presentación
   - Sin lógica de negocio

3. **Pages** (`src/pages/`)
   - Páginas principales
   - Composición de componentes
   - Estado de página

4. **Services** (`src/services/`)
   - Comunicación con API
   - Gestión de autenticación
   - Lógica de datos

5. **Hooks** (`src/hooks/`)
   - useAuth - Autenticación
   - useForm - Formularios
   - Custom hooks personalizados

---

## 🔐 Seguridad Implementada

### 1. Frontend
- Tokens JWT almacenados en localStorage
- Interceptores de Axios para agregar token
- Manejo automático de expiración
- Validación de entrada antes de enviar

### 2. Backend
- Helmet para headers de seguridad
- CORS restringido a dominios permitidos
- Validación con express-validator
- Errores personalizados sin exponer detalles
- Rutas protegidas con middleware de autenticación

### 3. Base de Datos
- Contraseñas hasheadas (bcrypt)
- Conexión cifrada (MongoDB Atlas)
- Índices para optimización
- Campos requeridos validados

### 4. Variables de Entorno
```
# Backend
JWT_SECRET=clave_muy_segura_cambiar_en_produccion
MONGODB_URI=mongodb+srv://user:pass@cluster
FRONTEND_URL=https://tu-app.onrender.com

# Frontend
VITE_API_URL=https://api-tu-app.onrender.com/api
```

---

## 📊 Flujo de Datos

### Crear un Gasto (Ejemplo Completo)

```
1. FRONTEND
   ├─ Usuario ingresa datos en formulario
   ├─ useForm valida localmente
   ├─ ExpenseModel prepara datos
   └─ expenseService.createExpense(data)

2. COMUNICACIÓN
   ├─ Axios agrega JWT token
   ├─ POST /api/expenses
   └─ Backend recibe con CORS

3. BACKEND
   ├─ authMiddleware valida JWT
   ├─ validateExpenseInput valida entrada
   ├─ expenseController.createExpense
   ├─ expenseService procesa lógica
   ├─ Expense.create() guarda en BD
   └─ Respuesta formateada

4. RESPUESTA
   ├─ Axios interceptor maneja respuesta
   ├─ Frontend actualiza estado
   └─ UI se refresca
```

---

## 🎨 Clean Code en Práctica

### Naming
```javascript
// ❌ Incorrecto
const x = getD();
const tmp = x.filter(a => a.amt > 0);

// ✅ Correcto
const expenses = getExpenses();
const significantExpenses = expenses.filter(exp => exp.amount > 0);
```

### Funciones Pequeñas
```javascript
// ❌ Incorrecto
const processData = async (data) => {
  const valid = validateData(data); // 100 líneas aquí
  const result = transformData(valid); // 100 líneas aquí
  return saveData(result); // 100 líneas aquí
};

// ✅ Correcto
const processData = async (data) => {
  const validated = validateData(data);
  const transformed = transformData(validated);
  return saveToDatabase(transformed);
};
```

### Comentarios Útiles
```javascript
// ✅ Bien - JSDoc
/**
 * Calcula el porcentaje de gasto por categoría
 * @param {Array} expenses - Array de gastos
 * @returns {Object} Objeto con porcentajes por categoría
 */
const calculateCategoryPercentage = (expenses) => {
  // implementación
};

// ❌ Malo - Comentario obvio
const total = amount + tax; // Suma cantidad y tax
```

---

## 📋 Checklist de Desarrollo

Cuando desarrolles nuevas características sigue:

- [ ] Crear modelo en backend si es nueva entidad
- [ ] Crear ruta en backend
- [ ] Crear controlador con lógica
- [ ] Crear servicio si es lógica compleja
- [ ] Crear validador de entrada
- [ ] Crear modelo en frontend
- [ ] Crear servicio de API en frontend
- [ ] Crear componentes reutilizables
- [ ] Crear página/componente contenedor
- [ ] Crear hook personalizado si es necesario
- [ ] Agregar estilos CSS
- [ ] Probar flujo completo
- [ ] Documentar en README

---

## 🚀 Próximos Pasos

1. **Implementar modelos MongoDB**:
   - User, Expense, Income, Category, Budget

2. **Crear controladores y rutas**:
   - Auth, Users, Expenses, Incomes, etc.

3. **Desarrollar frontend**:
   - Componentes, páginas, hooks

4. **Testing**:
   - Pruebas unitarias y de integración

5. **Deploy**:
   - Configurar en Render
   - Configurar dominio
   - SSL/HTTPS

---

**Última actualización**: 2026
**Responsable**: Proyecto de Pruebas de Software
