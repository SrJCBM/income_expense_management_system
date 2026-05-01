# Diagrama de Clases - Sistema de Control de Gastos e Ingresos

## Objetivo
Este documento define el diagrama de clases de referencia para el proyecto, alineado con la arquitectura:
- Backend: Model-Controller-Service (API REST con Express y Mongoose)
- Frontend: Model-View con Hooks y Services (React)

El diagrama prioriza relaciones reales del codigo actual y relaciones objetivo para la siguiente fase de backend.

## Diagrama (Mermaid)
```mermaid
classDiagram

%% =========================
%% BACKEND - MODELS
%% =========================
class User {
  +ObjectId _id
  +string name
  +string email
  +string password
  +string role
  +boolean isActive
  +Date lastLoginAt
  +Date createdAt
  +Date updatedAt
}

class Expense {
  +ObjectId _id
  +ObjectId userId
  +string description
  +number amount
  +ObjectId category
  +Date date
  +string notes
  +string[] tags
  +Date createdAt
  +Date updatedAt
}

class Income {
  +ObjectId _id
  +ObjectId userId
  +string description
  +number amount
  +ObjectId category
  +Date date
  +string notes
  +Date createdAt
  +Date updatedAt
}

class Category {
  +ObjectId _id
  +ObjectId userId
  +string name
  +string type
  +string color
  +string icon
  +string description
  +Date createdAt
  +Date updatedAt
}

class Budget {
  +ObjectId _id
  +ObjectId userId
  +ObjectId category
  +number limitAmount
  +number month
  +number year
  +number alertThreshold
  +Date createdAt
  +Date updatedAt
}

%% =========================
%% BACKEND - SERVICES
%% =========================
class AuthService {
  +registerUser(input)
  +loginUser(input)
  +refreshUserToken(token)
}

class ExpenseService {
  +getUserExpenses(userId, filters)
  +createExpense(userId, expenseData)
  +updateExpense(expenseId, userId, expenseData)
  +deleteExpense(expenseId, userId)
}

%% =========================
%% BACKEND - CONTROLLERS
%% =========================
class AuthController {
  +register(req, res)
  +login(req, res)
  +logout(req, res)
  +refreshToken(req, res)
}

class ExpenseController {
  +getExpenses(req, res)
  +createExpense(req, res)
  +updateExpense(req, res)
  +deleteExpense(req, res)
}

%% =========================
%% BACKEND - ROUTES
%% =========================
class AuthRoutes {
  +POST /api/auth/register
  +POST /api/auth/login
  +POST /api/auth/logout
  +POST /api/auth/refresh
}

class ExpenseRoutes {
  +GET /api/expenses
  +POST /api/expenses
  +PUT /api/expenses/:id
  +DELETE /api/expenses/:id
}

%% =========================
%% BACKEND - MIDDLEWARE/UTILS
%% =========================
class AuthMiddleware {
  +authenticate(req, res, next)
  +authorize(...roles)
}

class ErrorHandler {
  +errorHandler(err, req, res, next)
  +asyncHandler(fn)
}

class AuthUtils {
  +generateToken(userId, email, role)
  +verifyToken(token)
  +hashPassword(password)
  +comparePasswords(plain, hashed)
}

class ResponseFormatter {
  +successResponse(data, message, status)
  +errorResponse(message, status, error)
  +paginatedResponse(data, page, limit, total, message)
}

class DatabaseConfig {
  +connectDB()
  +disconnectDB()
  +getDb()
  +initializeDatabaseSchema()
}

class ApplicationError {
  +message
  +statusCode
}

%% =========================
%% FRONTEND - MODELS
%% =========================
class UserModel {
  +string userId
  +string email
  +string name
  +string role
  +getBasicInfo()
  +isAdmin()
  +isResourceOwner(resourceUserId)
}

class ExpenseModel {
  +string id
  +string description
  +number amount
  +string category
  +Date date
  +string notes
  +string[] tags
  +validate()
  +toJSON()
}

class IncomeModel {
  +string id
  +string description
  +number amount
  +string category
  +Date date
  +string notes
  +validate()
  +toJSON()
}

%% =========================
%% FRONTEND - SERVICES/HOOKS
%% =========================
class ApiClient {
  +request(config)
  +requestInterceptor()
  +responseInterceptor()
}

class FrontAuthService {
  +register(userData)
  +login(credentials)
  +logout()
  +getToken()
  +getUser()
  +isAuthenticated()
}

class FrontExpenseService {
  +getExpenses(filters)
  +createExpense(expenseData)
  +updateExpense(id, expenseData)
  +deleteExpense(id)
}

class useAuth {
  +user
  +isLoading
  +error
  +login(email, password)
  +register(userData)
  +logout()
}

class useExpenses {
  +expenses
  +isLoading
  +error
  +fetchExpenses(filters)
  +addExpense(expenseData)
  +updateExpense(id, expenseData)
  +removeExpense(id)
}

%% =========================
%% RELACIONES BACKEND
%% =========================
AuthRoutes --> AuthController : delega
ExpenseRoutes --> ExpenseController : delega

AuthController --> AuthService : usa
ExpenseController --> ExpenseService : usa

AuthController --> ResponseFormatter : responde
ExpenseController --> ResponseFormatter : responde
AuthController --> ErrorHandler : asyncHandler
ExpenseController --> ErrorHandler : asyncHandler

ExpenseRoutes --> AuthMiddleware : protege
ExpenseRoutes --> ErrorHandler : valida errores
AuthRoutes --> ErrorHandler : valida errores

AuthService --> User : CRUD
AuthService --> AuthUtils : token/hash
ExpenseService --> Expense : CRUD
ExpenseService --> Category : referencia

Expense --> User : userId
Income --> User : userId
Category --> User : userId
Budget --> User : userId
Budget --> Category : category
Expense --> Category : category
Income --> Category : category

DatabaseConfig --> User : valida/crea coleccion
DatabaseConfig --> Expense : valida/crea coleccion
DatabaseConfig --> Income : valida/crea coleccion
DatabaseConfig --> Category : valida/crea coleccion
DatabaseConfig --> Budget : valida/crea coleccion

ApplicationError <|-- AuthService : lanza errores
ApplicationError <|-- ExpenseService : lanza errores

%% =========================
%% RELACIONES FRONTEND
%% =========================
FrontAuthService --> ApiClient : usa
FrontExpenseService --> ApiClient : usa

useAuth --> FrontAuthService : usa
useExpenses --> FrontExpenseService : usa

FrontAuthService --> UserModel : mapea
FrontExpenseService --> ExpenseModel : mapea
```

## Notas de Diseno
- Auth y Expenses estan modelados como el primer vertical slice funcional end-to-end.
- Incomes, Categories, Budgets y Reports ya estan representados en el dominio para escalar sin romper contrato.
- Se mantiene separacion de responsabilidades: Route -> Controller -> Service -> Model.
- El frontend desacopla UI y acceso a datos via Hooks y Services.

## Convenciones recomendadas
- Mantener DTOs de respuesta consistentes con successResponse/errorResponse.
- Evitar logica de negocio en controllers.
- Mantener validaciones duales: frontend (UX) + backend (seguridad y consistencia).
- Usar relaciones por ObjectId para todas las entidades de dominio financiero.
