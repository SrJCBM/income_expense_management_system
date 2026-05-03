# Tests de Integración - Autenticación

Guía completa de tests de integración para los endpoints de autenticación usando **Vitest** y **Supertest**.

## 📋 Resumen

- **Archivo**: `tests/integration/auth.test.js`
- **Total de Tests**: 25 tests
- **Estado**: ✅ Todos los tests pasan
- **Cobertura**: POST /register, POST /login, GET /me, POST /logout

## 🏗️ Estructura

### 1. Configuración Global

```javascript
beforeAll()   // Inicia MongoDB Memory Server
afterEach()   // Limpia la BD después de cada test
afterAll()    // Desconecta MongoDB
```

### 2. Datos de Prueba

Los tests utilizan:
- Emails aleatorios generados con `generateRandomEmail()` del fixture
- Contraseñas válidas e inválidas
- Usuarios de prueba creados con `insertTestUser()`

## 🧪 Tests Incluidos

### POST /api/auth/register (6 tests)

```javascript
✓ Debe registrar un usuario nuevo y retornar 201
✓ Debe retornar 409 si el email ya existe
✓ Debe retornar 400 si la contraseña es débil
✓ Debe retornar 400 si faltan campos requeridos
✓ Debe retornar 400 si el email no es válido
✓ El token retornado debe ser válido
```

**Validaciones**:
- Email es requerido y debe ser válido
- Contraseña mínimo 8 caracteres
- Nombre es requerido
- Email único en la BD

### POST /api/auth/login (8 tests)

```javascript
✓ Debe loguear con credenciales correctas y retornar 200
✓ Debe retornar token JWT válido en login
✓ Debe retornar 401 si el email no existe
✓ Debe retornar 401 si la contraseña es incorrecta
✓ Debe retornar 400 si el email está vacío
✓ Debe retornar 400 si la contraseña está vacía
✓ Debe retornar 400 si faltan email y password
✓ Debe actualizar lastLoginAt del usuario
```

**Validaciones**:
- Credenciales correctas retornan token válido
- Token tiene estructura JWT (3 partes separadas por puntos)
- Email y contraseña son requeridos
- lastLoginAt se actualiza en cada login

### GET /api/auth/me (5 tests)

```javascript
✓ Debe retornar perfil del usuario autenticado con 200
✓ Debe retornar 401 sin token
✓ Debe retornar 401 con token inválido
✓ Debe retornar 401 con token expirado
✓ Debe retornar 401 sin Bearer en header
```

**Validaciones**:
- Solo usuarios autenticados pueden acceder
- Requiere formato `Bearer <token>`
- Retorna datos del usuario: userId, email, name

### POST /api/auth/logout (3 tests)

```javascript
✓ Debe cerrar sesión exitosamente retornando 200
✓ Debe retornar 200 incluso sin autenticación
✓ Debe retornar estructura de respuesta correcta
```

### Flujo Completo de Autenticación (3 tests)

```javascript
✓ Debe permitir registro -> login -> acceso a perfil
✓ Debe prevenir acceso sin token válido después de registro
✓ Debe impedir registro con mismo email dos veces
```

Estos tests validan el flujo completo de usuario.

## 🚀 Ejecutar los Tests

```bash
# Ejecutar solo tests de auth
npm run test -- tests/integration/auth.test.js --run

# Ejecutar en modo watch (desarrollo)
npm run test -- tests/integration/auth.test.js

# Ejecutar todos los tests
npm run test -- --run

# Ejecutar con coverage
npm run test:coverage
```

## 📦 Dependencias Instaladas

```bash
npm install --save-dev supertest      # HTTP assertions
npm install --save-dev vitest         # Test runner (ya existía)
npm install --save-dev mongodb-memory-server  # (ya existía)
```

## 🔑 Variables de Entorno para Tests

```javascript
JWT_SECRET = 'test_jwt_secret_key_for_tests_12345'
JWT_EXPIRE = '7d'
NODE_ENV = 'test'
```

Se configuran automáticamente en el `beforeAll()`

## 📝 Headers Utilizados

Todos los requests usan:
```javascript
'Content-Type': 'application/json'
'Authorization': 'Bearer <token>'  // Para rutas protegidas
```

## 🛠️ Helpers y Fixtures Utilizados

### Desde `tests/fixtures/data.js`:
- `generateRandomEmail()` - Genera emails únicos para cada test

### Desde `tests/helpers/dbHandler.js`:
- `clearCollections()` - Limpia colecciones después de cada test
- `insertTestUser()` - Crea usuarios de prueba

## ✅ Checklist de Cambios Realizados

- [x] Modificar `server.js` para exportar la app
- [x] Crear `tests/integration/auth.test.js` con 25 tests
- [x] Agregar endpoint `GET /api/auth/me` en routes
- [x] Agregar controlador `getProfile()` en authController
- [x] Agregar método `getUserProfile()` en authService
- [x] Instalar `supertest` como devDependency
- [x] Todos los tests pasan ✓

## 📊 Resultado Final

```
Test Files  1 passed (1)
Tests       25 passed (25)
Duration    7.41s
```

## 🔍 Notas Importantes

1. **MongoDB Memory Server**: Se usa para no necesitar una instancia de MongoDB real
2. **Limpieza de BD**: Se limpia después de cada test para evitar interferencias
3. **Tokens JWT**: Se validan con la estructura correcta (3 partes)
4. **Contraseñas**: Se hashean automáticamente mediante `insertTestUser()`
5. **Emails Únicos**: Los tests usan `generateRandomEmail()` para no tener conflictos

## 🐛 Solución de Problemas

### "Can't call `openUri()` on an active connection"
**Solución**: Desconectar mongoose antes de crear nueva conexión en `beforeAll()`

### Tests Skipped
Los tests están siendo ejecutados correctamente si ves el símbolo ✓ al lado de cada test.

---

Para más información sobre Vitest: https://vitest.dev/
Para más información sobre Supertest: https://github.com/visionmedia/supertest
