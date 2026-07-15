# API REST de FinanceApp

## Base y autenticacion

Desarrollo local:

```text
http://localhost:5000/api
```

Salvo registro, login, refresh, logout y health check, los endpoints requieren:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

La API identifica al usuario desde el JWT. El cliente no debe enviar `userId` para decidir la propiedad de un recurso.

## Formato de respuesta

Respuesta exitosa comun:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operacion exitosa",
  "data": {}
}
```

Listas paginadas pueden incluir:

```json
{
  "success": true,
  "message": "Datos obtenidos",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "pages": 0
  }
}
```

Error de validacion:

```json
{
  "success": false,
  "message": "Errores de validacion",
  "errors": []
}
```

Estados habituales: `200` consulta/actualizacion, `201` creacion, `400` entrada invalida, `401` token ausente o invalido, `404` recurso inexistente, `409` conflicto y `500` error no controlado.

## Health check

| Metodo | Ruta | Autenticacion | Funcion |
|---|---|---|---|
| GET | `/health` | No | Estado y fecha del servidor |

## Autenticacion

| Metodo | Ruta | Autenticacion | Funcion |
|---|---|---|---|
| POST | `/auth/register` | No | Registrar usuario |
| POST | `/auth/login` | No | Iniciar sesion |
| GET | `/auth/me` | Si | Obtener usuario del token |
| POST | `/auth/logout` | No | Finalizar sesion del cliente |
| POST | `/auth/refresh` | No | Renovar token valido |

Registro:

```json
{
  "name": "Usuario Demo",
  "email": "demo@example.com",
  "password": "Password123"
}
```

El nombre debe contener al menos una letra; el email debe ser valido y la contraseña debe tener al menos 8 caracteres. Login recibe `email` y `password`.

## Gastos

| Metodo | Ruta | Funcion |
|---|---|---|
| GET | `/expenses` | Listar gastos del usuario |
| GET | `/expenses/:id` | Obtener un gasto |
| POST | `/expenses` | Crear un gasto |
| PUT | `/expenses/:id` | Actualizar un gasto |
| DELETE | `/expenses/:id` | Eliminar un gasto |

Cuerpo de creacion o actualizacion:

```json
{
  "description": "Supermercado",
  "amount": 45.5,
  "category": "<categoryId>",
  "date": "2026-07-14",
  "notes": "Compra semanal",
  "isRecurring": false,
  "clientRequestId": "<id-unico-opcional>"
}
```

También se aceptan los alias `concept` por `description` y `categoryId` por `category`. `amount` debe ser mayor a cero y `date` ISO 8601. `clientRequestId` permite reintentos offline sin duplicar una creacion.

## Ingresos

| Metodo | Ruta | Funcion |
|---|---|---|
| GET | `/incomes` | Listar ingresos del usuario |
| GET | `/incomes/:id` | Obtener un ingreso |
| POST | `/incomes` | Crear un ingreso |
| PUT | `/incomes/:id` | Actualizar un ingreso |
| DELETE | `/incomes/:id` | Eliminar un ingreso |

El cuerpo usa `description`, `amount`, `category`, `date`, `notes` y el `clientRequestId` opcional. También acepta `concept` y `categoryId` como alias. Las reglas de monto, fecha e idempotencia equivalen a las de gastos.

Las listas de gastos e ingresos aceptan parametros de paginacion y filtros procesados por sus servicios, incluidos `page`, `limit`, fechas y categoria cuando corresponda. Los clientes deben conservar los parametros desconocidos fuera de la URL.

## Categorias

| Metodo | Ruta | Funcion |
|---|---|---|
| GET | `/categories` | Listar categorias; acepta `type=expense` o `type=income` |
| GET | `/categories/:id` | Obtener una categoria |
| POST | `/categories` | Crear una categoria |
| PUT | `/categories/:id` | Actualizar una categoria |
| DELETE | `/categories/:id` | Eliminar una categoria |

Campos principales:

```json
{
  "name": "Alimentacion",
  "type": "expense",
  "color": "#16a34a",
  "icon": "🛒",
  "description": "Compras de comida"
}
```

`type` solo admite `expense` o `income`.

## Presupuestos

Los presupuestos estan activos y protegidos por JWT.

| Metodo | Ruta | Funcion |
|---|---|---|
| GET | `/budgets` | Listar presupuestos y su consumo |
| GET | `/budgets/alerts` | Consultar limites cercanos o excedidos |
| POST | `/budgets` | Crear presupuesto mensual |
| PUT | `/budgets/:id` | Actualizar presupuesto |
| DELETE | `/budgets/:id` | Eliminar presupuesto |

```json
{
  "category": "<categoryId>",
  "limitAmount": 300,
  "month": 7,
  "year": 2026,
  "alertThreshold": 80
}
```

`limitAmount` debe ser positivo, `month` estar entre 1 y 12, `year` entre 2020 y 2100 y `alertThreshold` entre 0 y 100. Se acepta `categoryId` como alias de `category`.

## Perfil de usuario

El perfil esta activo y protegido por JWT.

| Metodo | Ruta | Funcion |
|---|---|---|
| GET | `/users/profile` | Consultar perfil |
| PUT | `/users/profile` | Cambiar nombre o moneda |
| PUT | `/users/profile/password` | Cambiar contraseña |
| DELETE | `/users/data` | Borrar datos financieros del usuario |

Actualizacion de perfil:

```json
{
  "name": "Nuevo nombre",
  "currency": "USD"
}
```

Monedas admitidas: `USD`, `EUR`, `MXN`, `PEN`, `COP`, `ARS` y `CLP`.

Cambio de contraseña:

```json
{
  "currentPassword": "Password123",
  "newPassword": "NuevaPassword456"
}
```

`DELETE /users/data` restablece los datos financieros; no elimina necesariamente la cuenta. La interfaz debe pedir confirmacion explicita antes de invocarlo.

## Reportes

| Metodo | Ruta | Funcion |
|---|---|---|
| GET | `/reports/filters` | Valores disponibles para filtros |
| GET | `/reports/summary` | Totales y balance del periodo |
| GET | `/reports/monthly` | Reporte mensual |
| GET | `/reports/yearly` | Tendencia anual |
| GET | `/reports/category-breakdown` | Desglose por categoria |

Los reportes usan, según el endpoint, `month`, `year`, `startDate` y `endDate`. Las fechas deben ser ISO 8601 y el inicio no puede quedar después del final.

Ejemplo:

```http
GET /api/reports/summary?startDate=2026-07-01&endDate=2026-07-31
Authorization: Bearer <token>
```

## Comprobacion rapida

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

Las pruebas de contrato e integracion se ejecutan con:

```powershell
node qa/run-tests.mjs backend --profile full
```

Fuente de verdad tecnica: `backend/server.js`, `backend/src/routes/` y `backend/src/validators/`. Ultima revision: 14 de julio de 2026.
