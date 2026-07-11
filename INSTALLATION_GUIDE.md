# Installation and Build Guide for Income Expense Manager - Electron

## Quick Start

### Prerequisites
- Node.js 18+ (download from nodejs.org)
- npm 9+ (included with Node.js)
- Windows 7 or later

### Installation Steps

```powershell
# 1. Clone or extract the project
cd income_expense_management_system

# 2. Install dependencies
cd installer
npm install
cd ../backend
npm install
cd ../web
npm install
cd ../installer

# 3. Run in development mode
npm run electron-dev
```

## For Building the Installer

```powershell
# From installer directory
npm run build:dist
```

This will:
1. Compile the React frontend
2. Install production dependencies for backend
3. Bundle backend with frontend
4. Generate Windows installer: `release/Income Expense Manager Setup 1.0.0.exe`

### Build Output

```
installer/
├── dist/
│   ├── index.html (compiled frontend)
│   ├── assets/ (React bundles)
│   └── resources/backend/ (Node.js server)
└── release/
    └── Income Expense Manager Setup 1.0.0.exe ← Distribution installer
```

## Troubleshooting

### Build fails with "command not found"
```powershell
npm install -g npm@latest
npm install -D electron electron-builder cross-env
```

### Node not found in production
```powershell
cd backend
npm ci --omit=dev
cd ../installer
npm run build:dist
```

### Very large installer (500MB+)
This is expected - includes Node.js runtime + all dependencies
- Delete `backend/tests` before building to save space
- Delete `backend/.git` if present

## Scripts Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Run Vite dev server only |
| `npm run electron-dev` | Run Electron dev mode (backend + frontend + DevTools) |
| `npm run build` | Build frontend only to `dist/` |
| `npm run build:backend` | Install production dependencies |
| `npm run build:resources` | Prepare resources (frontend + backend) |
| `npm run build:dist` | **Generate full Windows installer** |

## What Happens When User Installs

1. User downloads: `Income Expense Manager Setup 1.0.0.exe`
2. Runs installer (standard Windows installer UI)
3. Creates Start Menu shortcut and Desktop shortcut
4. User clicks shortcut to launch app
5. Application automatically:
   - Starts Node.js backend on port 5000
   - Opens UI window with React frontend
   - No additional steps required!

## Production Mode Architecture

```
Income Expense Manager.exe
├── Electron Main Process
│   ├── Spawns: node dist/resources/backend/server.js
│   └── Serves: Frontend from dist/
└── User Window
    └── Shows: React UI at http://127.0.0.1:3000
        (connects to backend at http://127.0.0.1:5000)
```

**Key Point:** Users don't need Node.js or npm installed. Everything is bundled!

## Development vs Production

### Development (`npm run electron-dev`)
- Frontend: Vite hot-reload (fast changes)
- Backend: Nodemon auto-restart
- DevTools enabled
- Console debugging available
- Good for development

### Production (`npm run build:dist` → .exe)
- Frontend: Pre-compiled & minified
- Backend: Production dependencies only
- No DevTools
- Single executable file
- Ready for distribution

---

For more details, see: [ELECTRON_BUILD.md](./ELECTRON_BUILD.md)
