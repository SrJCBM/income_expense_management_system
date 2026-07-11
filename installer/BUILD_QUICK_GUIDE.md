# 📦 Quick Build Guide - Income Expense Manager Electron

## 🚀 For Users: Install the App

1. **Download** the installer: `Income Expense Manager Setup 1.0.0.exe`
2. **Run** it (double-click)
3. **Follow** the installer wizard
4. **Done!** App appears in Start Menu and Desktop

## 👨‍💻 For Developers: Build the Installer

### Prerequisites
- Node.js 18+ installed
- Run command from `frontend/` directory

### One Command Build

```bash
npm run build:dist
```

That's it! This will:
- ✓ Compile React frontend
- ✓ Install backend production dependencies  
- ✓ Bundle everything together
- ✓ Generate Windows installer
- ✓ Output: `release/Income Expense Manager Setup 1.0.0.exe`

### What Gets Built

```
frontend/release/
├── Income Expense Manager Setup 1.0.0.exe  ← Installer (download this)
└── Income Expense Manager 1.0.0.exe        ← Portable executable
```

### During Build

The script will:
1. Compile frontend (Vite) → `dist/`
2. Install backend deps → `backend/node_modules/`
3. Copy backend → `dist/resources/backend/`
4. Run electron-builder → creates `.exe`

**Time:** ~5-10 minutes depending on system

## 🔧 Development Mode

Want to work on the code? Use dev mode instead:

```bash
npm run electron-dev
```

This:
- Starts both backend (port 5000) and frontend (port 3000)
- Opens Electron with DevTools
- Hot-reloads on code changes
- Great for development!

## 📁 Build Output Structure

After `npm run build:dist`, you'll find:

```
frontend/
├── dist/                         ← Compiled frontend
│   ├── index.html
│   ├── assets/
│   └── resources/backend/        ← Bundled backend
│       ├── src/
│       ├── server.js
│       ├── package.json
│       └── node_modules/
└── release/                      ← Final distribution
    └── Income Expense Manager Setup 1.0.0.exe
```

## ❓ Troubleshooting Build

### "electron-builder not found"
```bash
npm install -D electron-builder
```

### Build takes forever
- Normal: copying `node_modules` is slow
- If > 20 min: check available disk space
- Usually completes in 5-10 minutes

### Installer is huge (> 500MB)
- Expected: includes Node.js + all dependencies
- To reduce: delete `backend/tests/` before building

### "Can't find dist/resources/backend"
- Run: `npm run build:resources` first
- Then: `npm run build:dist`

## 📊 Scripts Reference

From `frontend/` directory:

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server only |
| `npm run build` | Build frontend only |
| `npm run electron-dev` | Electron dev (hot-reload) |
| `npm run build:dist` | **Full production build** |
| `npm run electron` | Run packaged app (needs prior build) |

## 🎯 Distribution

Once you have the `.exe`:

1. **Test it** on a clean Windows system
2. **Sign it** (optional but recommended for trust)
3. **Host it** on your server/GitHub releases
4. **Share** the download link with users

Users just click the `.exe` and it installs everything automatically!

---

**Questions?** See [ELECTRON_BUILD.md](./ELECTRON_BUILD.md) for detailed info.
