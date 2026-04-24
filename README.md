# Sistema de Control de Gastos e Ingresos

## 📋 Descripción del Proyecto

Un sistema completo para gestionar y analizar movimientos financieros personales o familiares. Permite registrar ingresos, gastos, crear categorías, establecer presupuestos y visualizar reportes analíticos.

## 🎯 Características Principales

- ✅ Registro de ingresos y gastos
- ✅ Clasificación por categorías
- ✅ Reportes y visualizaciones
- ✅ Control de presupuestos
- ✅ Autenticación y autorización segura
- ✅ Interfaz responsive
- ✅ Deploy en Render
- ✅ Clean Code aplicado

## ⚡ Inicio Rápido (5 minutos)

**Requisitos previos**: Node.js 18+, npm, MongoDB (opcional inicialmente)

### Paso 1: Backend (Terminal 1)
```bash
cd backend
npm install
npm run dev
```

Deberías ver: `✅ Servidor ejecutándose en puerto 5000`

### Paso 2: Frontend (Terminal 2 - Nueva ventana)
```bash
cd frontend
npm install
npm run dev
```

**El navegador abrirá automáticamente** en http://localhost:3000

### ¡Listo! 🎉
Verás una página con "💰 Sistema de Control de Gastos e Ingresos"

**Para más detalles**, lee [INICIO_RAPIDO.md](./INICIO_RAPIDO.md) o [docs/SETUP.md](./docs/SETUP.md)

---

## 🏗️ Arquitectura del Proyecto

### Backend (Node.js + Express)
Sigue el patrón **Model-Controller (MC)**:
- **Models**: Esquemas MongoDB y lógica de datos
- **Controllers**: Lógica de negocio y manejo de solicitudes
- **Routes**: Definición de endpoints
- **Middlewares**: Autenticación, validación, manejo de errores
- **Services**: Lógica reutilizable
- **Utils**: Funciones auxiliares
- **Validators**: Validación de datos
- **Errors**: Manejo centralizado de errores

### Frontend (React + Vite)
Sigue el patrón **Model-View (MV)**:
- **Models**: Clases de datos y lógica de negocio
- **Views/Components**: Componentes visuales
- **Pages**: Páginas principales
- **Services**: Comunicación con API
- **Hooks**: Lógica reutilizable
- **Utils**: Funciones auxiliares
- **Assets/Styles**: Recursos visuales

## 📁 Estructura de Carpetas

```
income_expense_management_system/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Controladores
│   │   ├── models/            # Esquemas MongoDB
│   │   ├── routes/            # Rutas de API
│   │   ├── middlewares/       # Auth, validación, errores
│   │   ├── services/          # Servicios de negocio
│   │   ├── validators/        # Validadores
│   │   ├── config/            # BD, CORS, etc
│   │   └── utils/             # Utilidades
│   ├── server.js              # Punto de entrada ✅
│   ├── package.json
│   └── .env.example           # Variables de entorno
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes
│   │   ├── pages/             # Páginas
│   │   ├── models/            # Modelos de datos
│   │   ├── services/          # Servicios API
│   │   ├── hooks/             # Custom Hooks
│   │   ├── styles/            # CSS
│   │   ├── App.jsx            # Componente raíz ✅
│   │   └── main.jsx           # Entry point ✅
│   ├── index.html             # HTML principal ✅
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
│
└── docs/                      # Documentación
    ├── SETUP.md               # Instalación detallada
    ├── ARCHITECTURE.md
    ├── API.md
    └── DEVELOPMENT_GUIDE.md
```

## 🔒 Seguridad

### Protección de Datos
- Variables de entorno (.env) para datos sensibles
- **NO COMMITAR archivos .env** - Solo commitar .env.example
- JWT para autenticación
- Bcrypt para contraseñas
- CORS configurado
- Helmet para headers de seguridad

### Configuración Inicial
```bash
# 1. Copiar archivos ejemplo
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Editar con valores reales (sin commitear)
```

## 🚀 Instalación Completa

## � Instalación Completa

Para instrucciones detalladas con troubleshooting y solución de errores comunes, ver:
- 📖 **[INICIO_RAPIDO.md](./INICIO_RAPIDO.md)** - Guía rápida (3 pasos)
- 📘 **[docs/SETUP.md](./docs/SETUP.md)** - Guía completa con errores comunes

### Backend Quick Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Quick Setup (Nueva Terminal)
```bash
cd frontend
npm install
npm run dev
```

---

## 📝 Clean Code Principles

El proyecto sigue los siguientes principios:

1. **Nombres Significativos**: Variables, funciones y clases con nombres descriptivos
2. **Funciones Pequeñas**: Cada función hace una sola cosa bien
3. **Comentarios Útiles**: JSDoc para funciones importantes
4. **Manejo de Errores**: Try-catch y errores personalizados
5. **DRY (Don't Repeat Yourself)**: Código reutilizable en servicios y utils
6. **SOLID**: Responsabilidad única, abierto-cerrado, etc.
7. **Formateo Consistente**: Indentación, convenciones de nombres
8. **Validación**: Entrada validada en frontend y backend

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/users/profile` - Obtener perfil
- `PUT /api/users/profile/update` - Actualizar perfil

### Gastos
- `GET /api/expenses` - Listar gastos
- `POST /api/expenses` - Crear gasto
- `PUT /api/expenses/:id` - Actualizar gasto
- `DELETE /api/expenses/:id` - Eliminar gasto

### Ingresos
- `GET /api/incomes` - Listar ingresos
- `POST /api/incomes` - Crear ingreso
- `PUT /api/incomes/:id` - Actualizar ingreso
- `DELETE /api/incomes/:id` - Eliminar ingreso

### Categorías
- `GET /api/categories` - Listar categorías
- `POST /api/categories` - Crear categoría

### Reportes
- `GET /api/reports/summary` - Resumen general
- `GET /api/reports/monthly` - Reporte mensual
- `GET /api/reports/yearly` - Reporte anual

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [INICIO_RAPIDO.md](./INICIO_RAPIDO.md) | Guía de inicio rápido (3 pasos) |
| [docs/SETUP.md](./docs/SETUP.md) | Instalación detallada + troubleshooting |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Arquitectura y patrones de diseño |
| [docs/API.md](./docs/API.md) | Documentación de endpoints |
| [docs/DEVELOPMENT_GUIDE.md](./docs/DEVELOPMENT_GUIDE.md) | Guía para desarrolladores |
| [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) | Estructura completa del proyecto |

## 📦 Deploy en Render

### Pasos para Render:

1. **Crear cuenta en Render** (render.com)

2. **Backend**:
   - Conectar repositorio Git
   - Seleccionar backend/ como raíz del servicio
   - Variables de entorno en dashboard de Render
   - Start: `npm run start`

3. **Frontend**:
   - Build command: `npm run build`
   - Publicar desde carpeta `dist/`

### Variables en Render:
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=tu_clave_segura
NODE_ENV=production
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Express.js** - Framework web
- **MongoDB** - Base de datos
- **Mongoose** - ODM
- **JWT** - Autenticación
- **bcryptjs** - Encriptación
- **Helmet** - Seguridad HTTP
- **CORS** - Control de origen
- **express-validator** - Validación
- **nodemon** - Hot reload desarrollo

### Frontend
- **React 18** - Librería UI
- **Vite 4** - Build tool ultra-rápido
- **React Router v6** - Navegación
- **Axios** - Cliente HTTP
- **CSS3** - Estilos responsive

## 🐛 Troubleshooting

### Errores Comunes

**"npm: command not found"**
- Instala Node.js desde nodejs.org
- Verifica: `node --version` y `npm --version`

**"ENOENT: no such file or directory"**
- Asegúrate de estar en la carpeta correcta (backend o frontend)
- Código: `cd backend` o `cd frontend` primero

**"Port already in use"**
- Otro proceso usa el puerto 5000 o 3000
- Cierra el programa o cambia el puerto en .env

**"MongoDB connection error"**
- Verifica que MongoDB está corriendo
- Comprueba MONGODB_URI en backend/.env
- En Render, verifica la credencial de MongoDB Atlas

### Para más ayuda
- Lee [docs/SETUP.md](./docs/SETUP.md) (sección Troubleshooting)
- Crea un issue en el repositorio
- Contacta al líder del proyecto

---

## ✅ Checklist de Implementación

Para próximas fases:
- [ ] Implementar controladores de autenticación
- [ ] Conectar Mongoose con MongoDB
- [ ] Crear servicios de negocio
- [ ] Implementar React pages
- [ ] Conectar frontend con API
- [ ] Testing de endpoints
- [ ] Deploy en Render

## 📞 Soporte y Contacto

Para reportar bugs o sugerencias, crear un issue en el repositorio.

---

**Fecha de creación**: 2026  
**Licencia**: MIT  
**Estado**: 🚀 En desarrollo (Arquitectura Completa)

