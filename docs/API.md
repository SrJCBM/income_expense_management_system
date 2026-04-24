# Documentación de API REST

## 🔐 Autenticación

Todos los endpoints (excepto login y register) requieren:

```
Header: Authorization: Bearer <JWT_TOKEN>
```

---

## 👤 Usuarios

### Registrar Usuario
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "Juan Pérez"
}

Response 201:
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "token": "eyJhbGc..."
  }
}
```

### Iniciar Sesión
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response 200:
{
  "success": true,
  "message": "Sesión iniciada",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "token": "eyJhbGc..."
  }
}
```

### Obtener Perfil
```
GET /api/users/profile
Authorization: Bearer <TOKEN>

Response 200:
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "Juan Pérez",
    "createdAt": "2026-04-24"
  }
}
```

---

## 💰 Gastos

### Listar Gastos
```
GET /api/expenses
Authorization: Bearer <TOKEN>
Query Params: ?month=4&year=2026&category=507f1f77bcf86cd799439011

Response 200:
{
  "success": true,
  "message": "Gastos obtenidos",
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "description": "Compras en supermercado",
      "amount": 125.50,
      "category": "507f1f77bcf86cd799439013",
      "date": "2026-04-24",
      "notes": "Productos frescos",
      "tags": ["compras", "comida"],
      "createdAt": "2026-04-24T10:30:00"
    }
  ]
}
```

### Crear Gasto
```
POST /api/expenses
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "description": "Compras en supermercado",
  "amount": 125.50,
  "category": "507f1f77bcf86cd799439013",
  "date": "2026-04-24",
  "notes": "Productos frescos",
  "tags": ["compras", "comida"]
}

Response 201:
{
  "success": true,
  "message": "Gasto creado",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    ...
  }
}
```

### Actualizar Gasto
```
PUT /api/expenses/:id
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "description": "Compras actualizadas",
  "amount": 150.00,
  ...
}

Response 200:
{
  "success": true,
  "message": "Gasto actualizado",
  "data": { ... }
}
```

### Eliminar Gasto
```
DELETE /api/expenses/:id
Authorization: Bearer <TOKEN>

Response 200:
{
  "success": true,
  "message": "Gasto eliminado"
}
```

---

## 📊 Ingresos

### Listar Ingresos
```
GET /api/incomes
Authorization: Bearer <TOKEN>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439014",
      "description": "Salario mensual",
      "amount": 3000.00,
      "category": "Salario",
      "date": "2026-04-01"
    }
  ]
}
```

### Crear Ingreso
```
POST /api/incomes
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "description": "Salario mensual",
  "amount": 3000.00,
  "category": "Salario",
  "date": "2026-04-01",
  "notes": "Salario de marzo"
}

Response 201: { ... }
```

---

## 🏷️ Categorías

### Listar Categorías
```
GET /api/categories
Authorization: Bearer <TOKEN>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439013",
      "name": "Alimentación",
      "type": "expense",
      "color": "#FF6B6B",
      "icon": "🍔"
    }
  ]
}
```

### Crear Categoría
```
POST /api/categories
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "Entretenimiento",
  "type": "expense",
  "color": "#4ECDC4",
  "icon": "🎬"
}

Response 201: { ... }
```

---

## 💾 Presupuestos

### Listar Presupuestos
```
GET /api/budgets
Authorization: Bearer <TOKEN>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439015",
      "category": "507f1f77bcf86cd799439013",
      "limitAmount": 500.00,
      "currentSpent": 325.50,
      "month": 4,
      "year": 2026
    }
  ]
}
```

### Crear Presupuesto
```
POST /api/budgets
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "category": "507f1f77bcf86cd799439013",
  "limitAmount": 500.00,
  "month": 4,
  "year": 2026
}

Response 201: { ... }
```

---

## 📈 Reportes

### Resumen General
```
GET /api/reports/summary
Authorization: Bearer <TOKEN>

Response 200:
{
  "success": true,
  "data": {
    "totalIncome": 3000.00,
    "totalExpense": 1250.75,
    "balance": 1749.25,
    "month": 4,
    "year": 2026
  }
}
```

### Reporte Mensual
```
GET /api/reports/monthly?month=4&year=2026
Authorization: Bearer <TOKEN>

Response 200:
{
  "success": true,
  "data": {
    "month": 4,
    "year": 2026,
    "expenses": [
      { "category": "Alimentación", "total": 450.00, "count": 15 },
      { "category": "Transporte", "total": 200.00, "count": 8 }
    ],
    "incomes": 3000.00,
    "balance": 1749.25
  }
}
```

### Desglose por Categoría
```
GET /api/reports/category-breakdown
Authorization: Bearer <TOKEN>

Response 200:
{
  "success": true,
  "data": [
    {
      "category": "Alimentación",
      "percentage": 35.8,
      "amount": 450.00
    },
    {
      "category": "Transporte",
      "percentage": 16.0,
      "amount": 200.00
    }
  ]
}
```

---

## ❌ Códigos de Error

| Código | Mensaje | Causa |
|--------|---------|-------|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Recurso creado |
| 400 | Bad Request | Datos inválidos |
| 401 | Unauthorized | Token ausente o inválido |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Duplicado |
| 500 | Internal Error | Error del servidor |

### Formato de Error
```json
{
  "success": false,
  "message": "Descripción del error",
  "statusCode": 400,
  "errors": [
    {
      "field": "email",
      "message": "Email no válido"
    }
  ]
}
```

---

**Última actualización**: 2026
**Versión API**: 1.0
