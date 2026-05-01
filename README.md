# 💰 Sistema de Control de Gastos e Ingresos

Un sistema completo para gestionar y analizar movimientos financieros personales o familiares. Permite registrar ingresos, gastos, crear categorías, establecer presupuestos y visualizar reportes analíticos con gráficos interactivos.

## ✨ Características

- ✅ Registro de ingresos y gastos
- ✅ Clasificación por categorías (CRUD completo)
- ✅ Reportes y visualizaciones interactivas
- ✅ Exportación PDF y Excel
- ✅ Control de presupuestos *(en desarrollo)*
- ✅ Autenticación JWT segura
- ✅ Interfaz responsive (mobile-first)
- ✅ WCAG 2.1 AA accesible
- ✅ Deploy en Render
- ✅ Clean Code aplicado

---

## 🚀 Inicio Rápido (3 pasos)

**Requisitos**: Node.js 18+, npm, MongoDB (Atlas recomendado)

**Terminal 1:**
```bash
cd backend && npm install && npm run dev
```

**Terminal 2 (Nueva ventana):**
```bash
cd frontend && npm install && npm run dev
```

**¡Listo!** Se abre en http://localhost:3000

> Credentials de prueba: `demo@example.com` / `Password123`

**¿Problemas?** → Ver [ERRORES_COMUNES.md](ERRORES_COMUNES.md)

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [**INICIO_RAPIDO.md**](INICIO_RAPIDO.md) | Setup en 3 pasos (este archivo) |
| [**ERRORES_COMUNES.md**](ERRORES_COMUNES.md) | Troubleshooting y soluciones |
| [**docs/SETUP.md**](docs/SETUP.md) | Instalación detallada y configuración |
| [**docs/ARCHITECTURE.md**](docs/ARCHITECTURE.md) | Patrón MVC: Backend MC + Frontend MV |
| [**docs/PROJECT_STRUCTURE.md**](docs/PROJECT_STRUCTURE.md) | Mapeo completo de carpetas y archivos |
| [**docs/API.md**](docs/API.md) | Endpoints y especificaciones REST |
| [**docs/DEVELOPMENT_GUIDE.md**](docs/DEVELOPMENT_GUIDE.md) | Guía de desarrollo y próximos pasos |
| [**AUDIT_GRAPHICS_ACCESSIBILITY.md**](AUDIT_GRAPHICS_ACCESSIBILITY.md) | Validación WCAG 2.1 AA + Nielsen heuristics |

---

## 🏗️ Stack Tecnológico

### Backend
- **Runtime**: Node.js + Express
- **Base de Datos**: MongoDB (Mongoose ODM)
- **Autenticación**: JWT + bcrypt
- **Validación**: Joi + Custom validators
- **Manejo de errores**: Custom Error classes
- **Seguridad**: CORS, helmet, variables de entorno

### Frontend
- **Framework**: React 18 + Vite
- **Visualización**: Recharts (gráficos interactivos)
- **Exportación**: jsPDF (PDF) + XLSX (Excel)
- **Hooks**: Custom hooks para lógica reutilizable
- **Estilos**: CSS modular + responsive design
- **Accesibilidad**: WCAG 2.1 AA compliant

---

## 📊 Estado del Proyecto

| Módulo | Estado | Notas |
|--------|--------|-------|
| **Autenticación** | ✅ Completo | Login/Register con JWT |
| **Gastos (CRUD)** | ✅ Completo | Crear, leer, actualizar, eliminar |
| **Ingresos (CRUD)** | ✅ Completo | Crear, leer, actualizar, eliminar |
| **Categorías (CRUD)** | ✅ Completo | Crear, leer, actualizar, eliminar |
| **Reportes** | ✅ Completo | Gráficos, exportación PDF/Excel |
| **Presupuestos** | 🟡 En desarrollo | Estructura lista, endpoints desactivados |
| **Perfil Usuario** | 🟡 En desarrollo | Endpoints comentados |

---

## 🎯 Arquitectura

```
REQUEST → MIDDLEWARE → ROUTES → CONTROLLER → SERVICE → MODEL → DATABASE
         (Auth)         (API)      (HTTP)      (Logic)    (Schema)
```

**Backend**: Model-Controller (MC) - Services reutilizable  
**Frontend**: Model-View + Hooks (MVH) - Lógica en hooks reutilizable

Ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para más detalles.

---

## 📁 Estructura del Proyecto

```
income_expense_management_system/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Lógica HTTP
│   │   ├── models/            # Esquemas MongoDB
│   │   ├── routes/            # Endpoints
│   │   ├── services/          # Lógica de negocio
│   │   ├── middlewares/       # Auth, validación, errores
│   │   ├── utils/             # Funciones auxiliares
│   │   ├── validators/        # Esquemas de validación
│   │   └── config/            # Base datos, CORS
│   ├── server.js              # Punto de entrada
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── pages/             # Páginas principales
│   │   ├── hooks/             # Hooks reutilizables
│   │   ├── services/          # Llamadas API
│   │   ├── utils/             # Funciones auxiliares
│   │   ├── styles/            # CSS modular
│   │   └── constants/         # Constantes
│   ├── index.html
│   └── package.json
│
├── docs/                      # Documentación técnica
├── README.md                  # Este archivo
├── INICIO_RAPIDO.md           # Setup rápido
├── ERRORES_COMUNES.md         # Troubleshooting
└── AUDIT_GRAPHICS_ACCESSIBILITY.md
```

---

## 🔐 Variables de Entorno

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your_super_secret_key_change_in_production
NODE_ENV=development
PORT=5000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

---

## 🧪 Testing

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm run test
```

---

## 🌐 Deploy

El proyecto está listo para desplegar en **Render**:

1. Conecta tu repositorio a Render
2. Configura variables de entorno
3. Deploy automático en cada push

Ver [docs/SETUP.md](docs/SETUP.md) para instrucciones completas.

---

## 📝 Licencia

MIT

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-feature`)
3. Commit (`git commit -m 'Add nueva feature'`)
4. Push (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

---

## 📞 Soporte

- **Issues**: Abre un issue en GitHub
- **Documentación**: Lee [ERRORES_COMUNES.md](ERRORES_COMUNES.md)
- **Email**: *(Agregá tu email si deseas)*

---

**Versión**: 1.0.0  
**Última actualización**: Mayo 2026  
**Estado**: ✅ Producción

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

**Fase 1 - Backend Base**: ✅ Completada
- [x] Implementar controladores de autenticación
- [x] Conectar Mongoose con MongoDB
- [x] Crear servicios de negocio
- [x] CRUD de Gastos, Ingresos, Categorías y Reportes

**Fase 2 - Frontend Base**: ✅ Completada
- [x] Implementar React pages
- [x] Conectar frontend con API
- [x] CRUD dinámico con categorías
- [x] Reportes con filtros dinámicos

**Próximas Fases**:
- [ ] Testing completo de endpoints
- [ ] Módulo de Usuarios (Perfil) - En Desarrollo
- [ ] Módulo de Presupuestos - Planificado
- [ ] Deploy en Render
- [ ] Gráficos avanzados y exportación a PDF

## 📞 Soporte y Contacto

Para reportar bugs o sugerencias, crear un issue en el repositorio.

---

**Fecha de creación**: 2026  
**Licencia**: MIT  
**Estado**: 🚀 En desarrollo (Arquitectura Completa)

