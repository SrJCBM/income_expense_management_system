# Guía de Instalación y Configuración

## ⚙️ Configuración Inicial

### Requisitos Previos
- Node.js 18 o superior
- MongoDB (local o MongoDB Atlas)
- npm o yarn
- Git

### Verificar Versión de Node
```bash
node --version
npm --version
```

---

## 🔧 Backend - Configuración

### 1. Instalar Dependencias

**⚠️ IMPORTANTE** (Error común): Ejecuta npm install DENTRO de la carpeta backend

**En Windows (PowerShell):**
```powershell
cd backend
npm install
```

**Si tienes espacios en la ruta, usa comillas:**
```powershell
cd "C:\Ruta\Larga\Con Espacios\backend"
npm install
```

**Deberías ver:**
```
added 142 packages, and audited 143 packages in 6s
```

### 2. Verificar que Hay un Punto de Entrada

**Asegúrate de que existe el archivo `server.js` en `backend/`**

```bash
ls backend/server.js  # En Linux/Mac
dir backend\server.js # En Windows PowerShell
```

Si existe, continúa. Si no, contacta al líder del proyecto.

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cd backend
cp .env.example .env
```

**En Windows (si cp no funciona):**
```powershell
Copy-Item .env.example .env
```

**Editar `backend/.env` con cualquier editor de texto:**
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/income_expense_db
DB_NAME=income_expense_db

# JWT
JWT_SECRET=tu_clave_secreta_muy_larga_y_compleja_aqui_min_32_caracteres
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Security
BCRYPT_ROUNDS=10
```

### 4. Configurar MongoDB

**Opción A: MongoDB Local**
```bash
# Instalar MongoDB Community
# https://docs.mongodb.com/manual/installation/

# Iniciar MongoDB
mongod
```

**Opción B: MongoDB Atlas (Recomendado para equipo)**
1. Ir a https://www.mongodb.com/cloud/atlas
2. Crear cuenta gratuita
3. Crear cluster
4. Click en "Connect" → "Drivers"
5. Copiar connection string
6. Reemplazar `<username>` y `<password>` con credenciales
7. Pegar en `MONGODB_URI` del .env

### 5. Iniciar Servidor Backend

```bash
# En la carpeta backend
npm run dev
```

**Deberías ver en la consola:**
```
✅ Servidor ejecutándose en puerto 5000
📍 Entorno: development
🔒 CORS configurado para http://localhost:3000
```

**También puedes probar en browser:**
```
http://localhost:5000/api/health
```

Deberías ver: `{"status":"ok"}`

---

## 🎨 Frontend - Configuración

### 1. Instalar Dependencias

**⚠️ IMPORTANTE**: Usa OTRA terminal/PowerShell (no cierres la del backend)

```bash
cd frontend
npm install
```

**Deberías ver:**
```
added 90 packages, and audited 91 packages in 19s
```

### 2. Verificar Archivos Necesarios

**⚠️ CRÍTICO**: Asegúrate de que existen estos archivos:

```bash
# En Windows PowerShell, desde carpeta frontend:
dir index.html      # Debe existir
dir src\main.jsx    # Debe existir
dir src\App.jsx     # Debe existir
```

Si cualquiera falta, contacta al líder del proyecto.

### 3. Configurar Variables de Entorno

```bash
cd frontend
cp .env.example .env
```

**En Windows (si cp no funciona):**
```powershell
Copy-Item .env.example .env
```

**Editar `frontend/.env`:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_API_TIMEOUT=10000
VITE_APP_NAME=Income & Expense Manager
VITE_ENV=development
```

### 4. Iniciar Servidor Frontend

```bash
# En la carpeta frontend (en la SEGUNDA terminal)
npm run dev
```

**Deberías ver:**
```
  VITE v4.4.0  ready in 200 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

**El navegador debe abrir automáticamente** en http://localhost:3000

---

## ✅ Verificación - ¿Funcionó todo?

### Backend OK si:
- [ ] Terminal muestra "✅ Servidor ejecutándose en puerto 5000"
- [ ] `curl http://localhost:5000/api/health` retorna `{"status":"ok"}`

### Frontend OK si:
- [ ] El navegador abrió automáticamente
- [ ] Ves la página con "💰 Sistema de Control de Gastos e Ingresos"
- [ ] Los botones "Iniciar Sesión" y "Registrarse" son visibles

---

## 🐛 Troubleshooting - Errores Comunes

### Error 1: "ENOENT: no such file or directory, open 'package.json'"
**Causa**: Ejecutaste npm install desde la carpeta equivocada

**Solución**: 
```bash
# Primero verifica dónde estás:
pwd  # Linux/Mac
cd   # Windows PowerShell (muestra carpeta actual)

# Luego navega correctamente:
cd backend          # Antes de: npm install
cd ../frontend      # Para cambiar a frontend
```

### Error 2: "ReferenceError: userRoutes is not defined"
**Causa**: El server.js tiene un problema (ya debe estar corregido)

**Solución**: El proyecto incluye la corrección. Si ves esto, contacta al líder.

### Error 3: Browser muestra "No se encuentra esta página" en localhost:3000
**Causa**: Falta archivo `index.html` en la raíz de frontend

**Solución**: El proyecto incluye este archivo. Si falta, contacta al líder.

### Error 4: "Port 5000 already in use"
**Causa**: Otro proceso usa ese puerto

**Solución**:
```bash
# En Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess
# Luego cierra ese programa o usa otro puerto en .env

# En Linux/Mac:
lsof -i :5000
kill -9 <PID>
```

### Error 5: "Failed to load resource: vite.svg 404"
**Causa**: Falta ícono favicon (NO ES CRÍTICO)

**Solución**: Es solo un ícono decorativo. La app funciona bien sin él. Ignore este error.

### Error 6: MongoDB Connection Error
**Causa**: MongoDB no está corriendo o URL es incorrecta

**Solución**:
```bash
# Verifica MongoDB está ejecutándose:
# - Si usas local: mongod debe estar corriendo
# - Si usas Atlas: verifica MONGODB_URI en .env

# Prueba la conexión desde backend:
npm run dev
# Verifica si dice "📊 Conectado a MongoDB"
```

---

## 🚀 Ejecutar Ambos Servidores (Flujo Normal)

**Terminal 1 (Backend):**
```powershell
cd "C:\Ruta\al\proyecto\backend"
npm run dev
```

Espera a ver:
```
✅ Servidor ejecutándose en puerto 5000
```

**Terminal 2 (Frontend) - NUEVA VENTANA:**
```powershell
cd "C:\Ruta\al\proyecto\frontend"
npm run dev
```

Espera a ver:
```
➜  Local:   http://localhost:3000/
```

**Ahora ambos servidores corren simultáneamente.**

---

## 🐳 Docker (Opcional)

Si quieres usar Docker para desarrollo local:

```bash
# Crear docker-compose.yml en la raíz
touch docker-compose.yml
```

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: income_expense_db
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/income_expense_db
      - JWT_SECRET=your_secret_here
    depends_on:
      - mongodb

volumes:
  mongodb_data:
```

```bash
# Ejecutar con Docker
docker-compose up
```

---

## 🌍 Deploy en Render

### Render (Backend)

1. **Crear proyecto en Render**:
   - Ir a https://render.com
   - Conectar repositorio de GitHub
   - New → Web Service

2. **Configuración**:
   - Name: `income-expense-api`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Root Directory: `backend` (si está disponible)

3. **Configurar Variables de Entorno**:
   - Click en "Environment"
   - Agregar variables:
     ```
     MONGODB_URI=mongodb+srv://...
     JWT_SECRET=clave_muy_segura_min_32_caracteres
     NODE_ENV=production
     FRONTEND_URL=https://tu-app.onrender.com
     PORT=5000
     ```

4. **Deploy**:
   - Click en "Create Web Service"
   - Render desplegará automáticamente

### Render (Frontend - Estático)

1. **Build** (local):
```bash
cd frontend
npm run build
```

2. **Crear en Render**:
   - New → Static Site
   - Name: `income-expense-app`
   - Build Command: `cd frontend && npm run build`
   - Publish Directory: `frontend/dist`

3. **Configurar Variables de Entorno**:
   ```
   VITE_API_URL=https://income-expense-api.onrender.com/api
   VITE_ENV=production
   ```

4. **Deploy y esperar**

---

## 📐 Estructura Final

```
income_expense_management_system/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── middlewares/
│   ├── validators/
│   ├── config/
│   ├── utils/
│   ├── server.js ✅
│   ├── package.json ✅
│   ├── .env (NO COMMITAR - crear desde .env.example)
│   └── .env.example ✅
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── models/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx ✅
│   │   └── main.jsx ✅
│   ├── public/
│   ├── index.html ✅
│   ├── vite.config.js ✅
│   ├── package.json ✅
│   ├── .env (NO COMMITAR - crear desde .env.example)
│   └── .env.example ✅
│
├── docs/
│   ├── ARCHITECTURE.md ✅
│   ├── SETUP.md (este archivo) ✅
│   ├── API.md
│   ├── DEVELOPMENT_GUIDE.md
│   └── PROJECT_STRUCTURE.md
│
├── .gitignore ✅
├── README.md ✅
└── INICIO_RAPIDO.md ✅
```

---

## 📞 Soporte

Si tienes problemas después de seguir esta guía:

1. **Verifica los requisitos previos**: Node 18+, npm, Git
2. **Revisa los errores comunes** arriba
3. **Limpia caché**:
   ```bash
   rm -r node_modules
   rm package-lock.json
   npm install
   ```
4. **Contacta al líder del proyecto** con:
   - Tu sistema operativo (Windows/Mac/Linux)
   - Versión de Node (`node --version`)
   - Mensaje de error exacto (captura de pantalla)


Si quieres usar Docker para desarrollo local:

```bash
# Crear docker-compose.yml en la raíz
touch docker-compose.yml
```

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: income_expense_db
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/income_expense_db
      - JWT_SECRET=your_secret_here
    depends_on:
      - mongodb

volumes:
  mongodb_data:
```

```bash
# Ejecutar con Docker
docker-compose up
```

---

## 🌍 Deploy en Render

### Render (Backend)

1. **Crear proyecto en Render**:
   - Ir a https://render.com
   - Conectar repositorio de GitHub
   - New → Web Service

2. **Configuración**:
   - Name: `income-expense-api`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Root Directory: `backend`

3. **Configurar Variables de Entorno**:
   - Click en "Environment"
   - Agregar variables:
     ```
     MONGODB_URI=mongodb+srv://...
     JWT_SECRET=clave_muy_segura
     NODE_ENV=production
     FRONTEND_URL=https://tu-app.onrender.com
     ```

4. **Deploy**:
   - Click en "Create Web Service"
   - Render desplegará automáticamente

### Render (Frontend - Estático)

1. **Build** (local):
```bash
cd frontend
npm run build
```

2. **Crear en Render**:
   - New → Static Site
   - Name: `income-expense-app`
   - Build Command: `cd frontend && npm run build`
   - Publish Directory: `frontend/dist`

3. **Configurar Variables de Entorno**:
   ```
   VITE_API_URL=https://income-expense-api.onrender.com/api
   ```

4. **Deploy y esperar**

---

## 📐 Estructura Final

```
income_expense_management_system/
├── backend/
│   ├── src/
│   ├── server.js
│   ├── package.json
│   ├── .env (NO COMMITAR)
│   └── .env.example ✅
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── vite.config.js
│   ├── package.json
│   ├── .env (NO COMMITAR)
│   └── .env.example ✅
│
├── docs/
│   ├── ARCHITECTURE.md ✅
│   ├── SETUP.md (este archivo)
│   └── API.md (por hacer)
│
├── .gitignore ✅
└── README.md ✅
```

---

## ✅ Checklist de Configuración

- [ ] Node.js 18+ instalado
- [ ] Git configurado
- [ ] MongoDB configurado (local o Atlas)
- [ ] Backend `.env` configurado
- [ ] Frontend `.env` configurado
- [ ] Backend corriendo en `localhost:5000`
- [ ] Frontend corriendo en `localhost:3000`
- [ ] Endpoints de API accesibles
- [ ] CORS funcionando correctamente
- [ ] Variables de entorno seguras en producción

---

## 🆘 Troubleshooting

### Backend no inicia
```bash
# 1. Verificar que MongoDB esté corriendo
# 2. Verificar MONGODB_URI en .env
# 3. Ver logs: npm run dev

# Limpiar y reinstalar
rm -rf node_modules
npm install
npm run dev
```

### Frontend no conecta con API
```bash
# 1. Verificar que backend esté corriendo
# 2. Verificar VITE_API_URL en .env
# 3. Ver console en DevTools (F12)
# 4. Verificar CORS en backend
```

### Puerto ya está en uso
```bash
# Buscar proceso en puerto 5000
lsof -i :5000

# Matar proceso
kill -9 PID

# O usar otro puerto en .env
PORT=5001
```

---

**Última actualización**: 2026
**¿Necesitas ayuda?**: Revisa la documentación en `/docs/`
