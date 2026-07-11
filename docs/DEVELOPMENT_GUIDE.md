## 🧭 Memoria de Proyecto

La aplicación nació como un sistema web de control de gastos e ingresos y luego evolucionó hasta convertirse en una versión de escritorio con Electron. El desarrollo se planteó de forma incremental para mantener control sobre la arquitectura, validar cada módulo de manera independiente y llegar a una entrega estable y empaquetable.

## 📋 Pasos Seguidos en el Desarrollo

### 1. Concepción del proyecto y primera estructura
En la primera etapa se definió el objetivo general del sistema: registrar ingresos y gastos, organizar categorías, consultar reportes y facilitar el control financiero desde una interfaz simple. Antes de programar funcionalidades, se decidió separar el proyecto en dos bloques principales: un backend para la lógica de negocio y el acceso a datos, y un frontend para la interacción del usuario.
### 2. Implementación del backend base

Una vez definida la base, se implementó primero el backend porque allí residía la lógica crítica del sistema. Se trabajó la autenticación de usuarios, la conexión con MongoDB, el manejo de variables de entorno y la base de los endpoints REST.
### 3. Construcción del frontend

Con el backend ya funcional, se construyó la interfaz visual en React. Primero se resolvió el login y el registro, luego se desarrollaron las pantallas principales del sistema: dashboard, ingresos, gastos y reportes.
### 4. Integración y corrección de flujos reales

Una vez que ambas capas estaban montadas, se conectaron entre sí y se probaron los flujos completos de la aplicación. Aquí aparecieron los problemas más importantes de uso real: rutas que no cargaban en producción, empaquetado incompleto del backend, categorías enviadas con valores inválidos y reportes que todavía no consumían datos reales.
### 5. Testing y validación

Con la implementación ya estable se ejecutaron pruebas unitarias, de integración y end-to-end. El objetivo fue comprobar que la aplicación no solo compilara, sino que realmente funcionara con datos reales, autenticación, navegación y persistencia.
### 6. Exportación como aplicación de escritorio

La etapa final fue convertir la solución web en una aplicación de escritorio para Windows. Para eso se ajustó el build de Vite, se empaquetó el backend como recurso externo, se configuró Electron para iniciar backend y frontend de forma coordinada y se generó un instalador NSIS.
# 🎯 Guía de Desarrollo - Próximos Pasos

## 🧭 Memoria de Proyecto

La aplicación nació como un sistema web de control de gastos e ingresos y luego evolucionó hasta convertirse en una versión de escritorio con Electron. El desarrollo se planteó de forma incremental para mantener control sobre la arquitectura, validar cada módulo de manera independiente y llegar a una entrega estable y empaquetable.

### 1. Concepción del proyecto y primera estructura

El proyecto se planteó para administrar finanzas personales o familiares con una interfaz clara, funcional y orientada al seguimiento de ingresos, gastos, categorías y reportes. Desde el inicio se definió que la solución debía ser mantenible, por lo que se separaron las responsabilidades principales en dos capas bien delimitadas: backend para la lógica de negocio y persistencia, y frontend para la interacción visual.

En esta etapa se organizó la estructura inicial del repositorio, se agruparon los archivos por dominio funcional y se estableció un patrón de trabajo basado en módulos. El objetivo fue evitar una base monolítica y construir una arquitectura donde cada carpeta respondiera a una responsabilidad concreta: controladores, servicios, modelos, validadores, rutas, hooks, componentes y páginas.

La primera estructura también sirvió para definir el flujo general de la aplicación. Antes de escribir la lógica completa se dejaron claros los puntos de entrada, los módulos de autenticación, los espacios para formularios reutilizables y la base para futuros reportes y exportaciones.

### 2. Implementación del backend base

Una vez definida la base, se implementó primero el backend porque allí residía la lógica crítica del sistema. Se trabajó la autenticación de usuarios, la conexión con MongoDB, el manejo de variables de entorno y la base de los endpoints REST.

Durante esta fase se desarrollaron los módulos de ingresos, gastos, categorías y reportes. Cada entidad se estructuró con un patrón claro: modelo para persistencia, servicio para reglas de negocio, controlador para respuesta HTTP y validador para proteger la entrada de datos.

### 3. Construcción del frontend

Con el backend ya funcional, se construyó la interfaz visual en React. Primero se resolvió el login y el registro, luego se desarrollaron las pantallas principales del sistema: dashboard, ingresos, gastos y reportes.

En esta etapa también se crearon hooks personalizados para centralizar el consumo de la API y el manejo de formularios. Esto permitió mantener los componentes más limpios y reutilizar lógica entre pantallas similares.

Durante esta fase se ajustaron detalles clave para que la aplicación no dependiera solo de datos de prueba. Se conectaron los formularios a la API real, se validaron categorías y montos, y se incorporaron vistas con información dinámica en lugar de valores estáticos.

### 4. Integración y corrección de flujos reales

Una vez que ambas capas estaban montadas, se conectaron entre sí y se probaron los flujos completos de la aplicación. Aquí aparecieron los problemas más importantes de uso real: rutas que no cargaban en producción, empaquetado incompleto del backend, categorías enviadas con valores inválidos y reportes que todavía no consumían datos reales.

Se corrigieron también detalles de comportamiento en la interfaz: formularios que no mostraban bien los errores, filtros que no coincidían con la API y un dashboard que todavía mostraba valores estáticos. Cada corrección se fue validando con pruebas y builds para evitar romper lo ya implementado.

### 5. Testing y validación

Con la implementación ya estable se ejecutaron pruebas unitarias, de integración y end-to-end. El objetivo fue comprobar que la aplicación no solo compilara, sino que realmente funcionara con datos reales, autenticación, navegación y persistencia.

El testing sirvió para detectar y corregir fallos concretos que no eran visibles en una ejecución simple de desarrollo. Entre los problemas resueltos estuvieron la carga incorrecta del frontend en producción, la ubicación del backend empaquetado, la resolución de módulos dentro de Electron, el envío de categorías inválidas en gastos y el dashboard que aún no consumía datos reales.

Cada corrección se volvió a validar con build y con una nueva ejecución de la app para confirmar que el cambio no introdujera regresiones. Ese ciclo permitió pasar de un prototipo funcional a una versión consistente y demostrable.

### 6. Exportación como aplicación de escritorio

La última etapa consistió en preparar la exportación como aplicación de escritorio para Windows. Para ello se ajustó el proceso de build con Vite, se empaquetó el backend como recurso externo, se configuró Electron para iniciar backend y frontend de forma coordinada y se generó un instalador NSIS listo para distribución.

El resultado final es una aplicación que se abre como programa nativo, carga la interfaz React desde archivos locales y conecta con el backend en modo producción sin requerir que el usuario abra varias terminales. Esa transformación es la diferencia principal entre una app web en construcción y una entrega final instalable.

**Resultado esperado**: una aplicación de escritorio estable, con arquitectura clara, pruebas aplicadas en puntos críticos y un instalador listo para demostración o distribución.

---
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
- [ ] `npm install` en web/
- [ ] Crear `.env` con `VITE_API_URL`
- [ ] `npm run dev` - debe abrir en localhost:3000

#### 2.2 Autenticación (Login/Register)
**Archivos a editar**:
- `web/src/pages/Login.jsx` 
  - Formulario de login
  - Usar `useAuth()` hook
  - Guardar token

- `web/src/components/LoginForm.jsx` (nuevo)
  - Componente del formulario
  - Validar email/password
  - Mostrar errores

- `web/src/services/authService.js` - Implementar métodos

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
