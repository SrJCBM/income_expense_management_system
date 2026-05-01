# 🎯 Guía de Desarrollo - Próximos Pasos

## ✅ Arquitectura Base Completada

La estructura está lista. Ahora necesitas implementar la funcionalidad.

---

## 📋 Orden Recomendado de Desarrollo

### Fase 1: Backend Base (Semana 1)

#### 1.1 Configuración Inicial
- [x] Instalar dependencias: `npm install` en backend/
- [x] Crear `.env` con valores reales
- [x] Conectar MongoDB (local o Atlas)
- [x] Probar conexión a BD

#### 1.2 Autenticación (Lo primero)
- [x] `backend/src/controllers/authController.js` - Implementado
  - [x] `register()` - Crear usuario con password hasheado
  - [x] `login()` - Validar credenciales, generar JWT

- [x] `backend/src/services/authService.js` - Implementado
  - [x] Validar usuario existente
  - [x] Comparar contraseñas
  - [x] Generar token

- [x] `backend/src/routes/authRoutes.js` - Conectado al server.js

#### 1.3 CRUD de Gastos
- [x] Implementar `expenseController.js` - ✅ Completado
- [x] Implementar `expenseService.js` - ✅ Completado
- [x] Conectar `expenseRoutes.js` al server - ✅ Completado
- [x] Endpoints: GET, POST, PUT, DELETE funcionales

#### 1.4 CRUD de Ingresos
- [x] `incomeController.js` - ✅ Completado
- [x] `incomeService.js` - ✅ Completado
- [x] Endpoints: GET, POST, PUT, DELETE funcionales

#### 1.5 CRUD de Categorías
- [x] `categoryController.js` - ✅ Completado
- [x] `categoryService.js` - ✅ Completado
- [x] Default categories seeding on user registration

#### 1.6 Reportes
- [x] `reportController.js` - ✅ Completado
- [x] Endpoints: summary, monthly, yearly, category-breakdown, filters

**Resultado esperado**: API funcional con todos los endpoints

---

### Fase 2: Frontend Base (Semana 2)

#### 2.1 Setup Inicial
- [ ] `npm install` en frontend/
- [ ] Crear `.env` con `VITE_API_URL`
- [ ] `npm run dev` - debe abrir en localhost:3000

#### 2.2 Autenticación (Login/Register)
**Archivos a editar**:
- `frontend/src/pages/Login.jsx` 
  - Formulario de login
  - Usar `useAuth()` hook
  - Guardar token

- `frontend/src/components/LoginForm.jsx` (nuevo)
  - Componente del formulario
  - Validar email/password
  - Mostrar errores

- `frontend/src/services/authService.js` - Implementar métodos

**Resultado**: Poder registrarse e iniciar sesión

#### 2.3 Páginas Principales
- [ ] `Dashboard.jsx` - Página de inicio
- [ ] `Expenses.jsx` - Lista de gastos
- [ ] `Reports.jsx` - Visualización de reportes

#### 2.4 Componentes Reutilizables
- [ ] `ExpenseForm.jsx` - Formulario para crear gasto
- [ ] `ExpenseTable.jsx` - Tabla de gastos
- [ ] `ExpenseItem.jsx` - Fila de gastos
- [ ] `Modal.jsx` - Para diálogos
- [ ] `Alert.jsx` - Para mensajes

#### 2.5 Enrutamiento
- [ ] Configurar React Router
- [ ] Rutas públicas (login, register)
- [ ] Rutas privadas (dashboard, expenses, etc)
- [ ] Proteger rutas no autenticadas

**Resultado esperado**: App funcional con UI

---

### Fase 3: Integración Completa (Semana 3)

#### 3.1 Conectar Servicios
- [ ] Hacer que frontend consume API real
- [ ] Solucionar errores CORS si los hay
- [ ] Probar flujos completos

#### 3.2 Features Avanzadas
- [ ] Gráficos de reportes (Chart.js o Recharts)
- [ ] Exportar a PDF
- [ ] Filtros avanzados
- [ ] Paginación

#### 3.3 Testing
- [ ] Pruebas de API (Postman/Thunder Client)
- [ ] Pruebas unitarias
- [ ] Testing de integración

---

## 📝 Convenciones a Seguir

### Backend

#### Estructura de Controlador
```javascript
// ✅ CORRECTO
export const createExpense = asyncHandler(async (req, res) => {
  // 1. Validar entrada
  const { amount, category } = req.body;
  
  // 2. Llamar servicio
  const expense = await expenseService.createExpense(
    req.user.userId,
    { amount, category }
  );
  
  // 3. Respuesta formateada
  res.status(201).json(
    successResponse(expense, 'Gasto creado')
  );
});

// ❌ INCORRECTO - No usar así
export const createExpense = (req, res) => {
  // Falta validación
  // Falta try-catch
  // Respuesta sin formato
};
```

#### Estructura de Servicio
```javascript
// ✅ CORRECTO
class ExpenseService {
  async createExpense(userId, data) {
    // 1. Validar datos
    if (!data.amount || data.amount <= 0) {
      throw new ValidationError('Monto inválido');
    }
    
    // 2. Lógica de negocio
    const expense = await Expense.create({
      userId,
      ...data,
    });
    
    return expense;
  }
}

// ❌ INCORRECTO
async function createExpense(data) {
  // No separa lógica
  // Acceso directo a BD
}
```

### Frontend

#### Estructura de Hook
```javascript
// ✅ CORRECTO
export const useExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const data = await expenseService.getExpenses();
      setExpenses(data);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return { expenses, isLoading, fetchExpenses };
};

// ❌ INCORRECTO
export const fetchData = async () => {
  // No usa estados
  // Lógica directa
};
```

---

## 🐛 Debugging Tips

### Backend No Inicia
```bash
# Ver logs detallados
npm run dev

# Problema común: Puerto en uso
lsof -i :5000
kill -9 <PID>
```

### Frontend No Conecta
```javascript
// En console (DevTools) verificar:
console.log(import.meta.env.VITE_API_URL);

// Probar petición manual
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(console.log)
```

### Errores de CORS
```javascript
// Backend: Verificar corsConfig.js
// Frontend: Verificar VITE_API_URL en .env
// Común: URL con trailing slash diferente
```

---

## 🧪 Testeo Manual

### 1. Test de Registro
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123",
    "name":"Test User"
  }'
```

### 2. Test de Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123"
  }'
```

### 3. Test de API Protegida
```bash
# Reemplazar TOKEN con el obtenido en login
curl -X GET http://localhost:5000/api/expenses \
  -H "Authorization: Bearer TOKEN"
```

---

## 📊 Checklist Diario

Cada vez que desarrolles:

- [ ] Los cambios siguen Clean Code
- [ ] Las funciones son pequeñas (< 20 líneas)
- [ ] Los nombres son descriptivos
- [ ] Hay validación de entrada
- [ ] Hay manejo de errores
- [ ] Está documentado (comentarios JSDoc)
- [ ] Funciona en local
- [ ] Sin logs de debug
- [ ] Sin código comentado muerto

---

## 🚀 Cuando Termines

1. **Hacer commit**
```bash
git add .
git commit -m "feat: agregar autenticación"
```

2. **Verificar en Git**
```bash
git log --oneline
```

3. **Preparar para deploy**
```bash
# Backend
npm run build

# Frontend
npm run build
```

4. **Deploy en Render**
- Push a GitHub
- Render detectará cambios automáticamente

---

## ❓ Preguntas Frecuentes

**P: ¿Dónde agrego la lógica de validación?**
A: En `validators/` (backend) y `utils/validators.js` (frontend)

**P: ¿Cómo agrego una nueva tabla?**
A: 
1. Crear modelo en `backend/src/models/`
2. Crear controlador y servicio
3. Crear rutas
4. Conectar en `server.js`

**P: ¿Cómo manejo errores en frontend?**
A: En hooks, usar try-catch y guardar en estado `error`

**P: ¿Necesito tests unitarios?**
A: Según requerimientos, agregar Jest + Testing Library

---

## 📞 Contacto & Soporte

Si algo no funciona:
1. Revisar logs (`npm run dev`)
2. Consultar `/docs/` del proyecto
3. Verificar `.env` está creado
4. Reiniciar terminal si es necesario

---

**¡Ahora a codificar! 🚀**  
La arquitectura está lista. El siguiente paso es la implementación.

Para ver la estructura completa: `docs/PROJECT_STRUCTURE.md`
