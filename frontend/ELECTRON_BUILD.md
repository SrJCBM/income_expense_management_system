# Build y Distribución - Income Expense Manager

## Guía de Construcción para Electron + Windows Installer

### 📋 Requisitos Previos

- Node.js v18+ instalado
- npm v9+
- Windows 7+ (para crear instalador)

### 🎯 Modos de Ejecución

#### 1. **Desarrollo (con Electron)**

Arranca Electron con hot-reload del frontend y backend nodemon:

```bash
cd frontend
npm run electron-dev
```

**Qué sucede:**
- Electron detecta `ELECTRON=1`
- Lanza backend con `npm run dev` (nodemon + puerto 5000)
- Lanza frontend con Vite (puerto 3000)
- Abre ventana Electron apuntando a localhost:3000
- DevTools activo en ventana principal

**Útil para:** Desarrollo activo, cambios rápidos, debugging.

---

#### 2. **Build de Distribución (Instalador .exe)**

Compila todo y genera instalador Windows ready-to-distribute:

```bash
cd frontend
npm run build:dist
```

**Qué sucede:**
1. Compila frontend con Vite → `dist/`
2. Instala dependencias backend en modo producción
3. Copia backend compilado a `dist/resources/backend/`
4. Ejecuta electron-builder → `release/Income Expense Manager Setup 1.0.0.exe`

**Duración:** ~5-10 minutos (depende de velocidad de copia)

**Resultado:** 
```
frontend/release/
├── Income Expense Manager Setup 1.0.0.exe  ← Instalador
├── Income Expense Manager 1.0.0.exe        ← Ejecutable portable
└── builder-effective-config.yaml
```

**Útil para:** Distribución final, releases, testing pre-distribución.

---

### 🏗️ Estructura de Distribución

Cuando ejecutas `npm run build:dist`, se crea:

```
frontend/dist/
├── index.html                    ← Frontend compilado (Vite)
├── assets/
│   ├── main.*.js                 ← React bundle
│   └── style.*.css
├── resources/
│   └── backend/                  ← Backend compilado
│       ├── server.js
│       ├── src/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── models/
│       │   └── ...
│       ├── package.json
│       └── node_modules/         ← Deps sin dev-deps
└── electron/
    ├── main.cjs
    └── preload.cjs
```

---

### ⚙️ Cómo Funciona el Instalador

#### En Desarrollo (`npm run electron-dev`):
```
Electron Main Process
  ├─ spawn: npm run dev (backend)     → http://127.0.0.1:5000
  ├─ spawn: npm run dev (frontend)    → http://127.0.0.1:3000
  └─ BrowserWindow loads localhost:3000
```

#### En Producción (instalador .exe):
```
Income Expense Manager.exe
  ├─ spawn: node dist/resources/backend/server.js  → http://127.0.0.1:5000
  └─ BrowserWindow loads http://127.0.0.1:3000
     (frontend files sirven desde dist/)
```

**Diferencia clave:** En producción, no necesita npm, Node o git. Solo la app .exe se distribuye.

---

### 📦 Instalación del Usuario Final

1. Descarga: `Income Expense Manager Setup 1.0.0.exe`
2. Ejecuta instalador (Next > Next > Finish)
3. Abre app desde menú Inicio o Desktop
4. App arranca automaticamente:
   - Inicia backend en background
   - Abre ventana con UI
   - Todo funciona local (no necesita internet)

---

### 🔍 Troubleshooting Build

#### Error: "electron-builder not found"
```bash
npm install -D electron-builder
```

#### El instalador es muy grande (> 500MB)
- Normal: incluye Node.js + dependencias del backend
- Para reducir: elimina tests/docs del backend antes de build

#### Backend no inicia en producción
- Verifica que `dist/resources/backend/server.js` existe
- Comprueba que `dist/resources/backend/node_modules` tiene contenido
- Revisa logs: abre DevTools (Ctrl+Shift+I) en Electron

#### Error "Cannot find module 'express'" en producción
- Ejecuta: `npm install --omit=dev` en `backend/`
- Luego: `npm run build:dist` nuevamente

---

### 🚀 Próximas Mejoras Opcionales

1. **Codesigning** (Windows): Firmar el .exe con certificado
2. **Auto-Update**: Implementar actualizaciones automáticas
3. **Logging**: Guardar logs en `%APPDATA%/Income Expense Manager/logs/`
4. **Portable Mode**: Generar ZIP portable además de instalador

---

### 📊 Resumen de Comandos

| Comando | Propósito | Output |
|---------|-----------|--------|
| `npm run electron-dev` | Desarrollo con hot-reload | Electron window + console |
| `npm run build:dist` | Compilar instalador Windows | `release/*.exe` |
| `npm run build:frontend` | Solo compilar frontend (Vite) | `dist/` (sin backend) |
| `npm run electron` | Ejecutar electron empaquetado | Electron window (requiere build previo) |

---

**Última Actualización:** Mayo 4, 2026  
**Estado:** ✅ Ready for Distribution
