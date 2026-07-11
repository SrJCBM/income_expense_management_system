# 📚 Income Expense Manager - Documentation Index

## 🎯 Quick Navigation

### 👨‍💻 **If You're a Developer**

#### Want to work on the code?
→ Start here: [DEVELOPMENT_GUIDE.md](../docs/DEVELOPMENT_GUIDE.md)
- Setup instructions
- Available commands
- Project structure

#### Want to build for production?
→ Read: [BUILD_QUICK_GUIDE.md](./BUILD_QUICK_GUIDE.md)
- One-command build process
- What gets created
- Distribution instructions

#### Need detailed build info?
→ See: [ELECTRON_BUILD.md](./ELECTRON_BUILD.md)
- Architecture decisions
- Dev vs production modes
- Troubleshooting guide

#### Ready to build now?
→ Use: [BUILD_CHECKLIST.md](./BUILD_CHECKLIST.md)
- Pre-build verification
- Expected output
- Post-build testing

---

### 👥 **If You're an End User**

#### How do I install the app?
→ Follow: [INSTALLATION_GUIDE.md](../INSTALLATION_GUIDE.md)
- System requirements
- Step-by-step installation
- Launching the app

#### Help! The app won't start
→ Troubleshoot: [ELECTRON_BUILD.md](./ELECTRON_BUILD.md#troubleshooting-build)
- Common issues
- Solutions
- Support contacts

---

### 🏗️ **Project Documentation**

| Document | Purpose |
|----------|---------|
| [PROJECT_STRUCTURE.md](../docs/PROJECT_STRUCTURE.md) | Folder organization |
| [ARCHITECTURE.md](../docs/ARCHITECTURE.md) | System design |
| [API.md](../docs/API.md) | API endpoints reference |
| [SETUP.md](../docs/SETUP.md) | Initial setup guide |
| [DEVELOPMENT_GUIDE.md](../docs/DEVELOPMENT_GUIDE.md) | Development workflow |
| [README.md](../README.md) | Project overview |

---

### 🧪 **Testing**

#### Run Tests
```bash
cd web
npm run test:e2e          # Run E2E tests
npm run cypress:open      # Open Cypress UI

cd backend
npm test                  # Run unit tests
npm run test:coverage     # See coverage report
```

#### Test Documentation
→ See: [TESTING.md](../TESTING.md)
- 401 backend tests documented
- 29 E2E tests documented
- Test commands and expected output

#### Cypress setup and troubleshooting
-> See: [docs/CYPRESS_GUIDE.md](docs/CYPRESS_GUIDE.md)
- Cypress 15.16.0 setup
- UI and headless commands
- Windows `ELECTRON_RUN_AS_NODE` fix

---

### 🚀 **Development Commands**

#### Start Development Environment
```bash
cd installer
npm run electron-dev      # Electron + hot-reload
```

#### Build for Production
```bash
cd installer
npm run build:dist        # Create Windows .exe installer
```

#### Preview Production Build
```bash
cd installer
npm run electron          # Run packaged app (after build)
```

---

## 📊 Current State

✅ **Development**: Fully functional
- Backend: 401 tests passing (87.15% coverage)
- Frontend: 29 E2E tests passing
- Electron: Dev mode working with hot-reload

✅ **Production**: Ready to build
- All dependencies resolved
- Build scripts created
- Documentation complete
- Ready for distribution

---

## 🔗 File Locations

```
income_expense_management_system/
├── README.md                          ← Project overview
├── INSTALLATION_GUIDE.md              ← User installation
├── TESTING.md                         ← Test documentation
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PROJECT_STRUCTURE.md
│   ├── API.md
│   ├── SETUP.md
│   └── DEVELOPMENT_GUIDE.md
├── installer/
│   ├── BUILD_QUICK_GUIDE.md           ← Build overview
│   ├── BUILD_CHECKLIST.md             ← Pre-build checklist
│   ├── ELECTRON_BUILD.md              ← Technical deep-dive
│   └── README.md                      ← Frontend specific
├── backend/
│   └── README.md                      ← Backend specific
└── (other files)
```

---

## ❓ Common Questions

### Q: Where do I find the .exe installer?
**A:** After `npm run build:dist`, check: `installer/release/FinanceApp Setup 1.2.0.exe`

### Q: What does the build script do?
**A:** Compiles frontend → bundles backend → creates Windows installer. Takes 5-10 minutes.

### Q: Can I run the app without npm?
**A:** Yes! The .exe installer bundles everything. Just run the installer and click to launch.

### Q: How do I test before distributing?
**A:** See [BUILD_CHECKLIST.md](./BUILD_CHECKLIST.md#post-build-testing) for testing procedure.

### Q: Can I modify and rebuild?
**A:** Yes! See [DEVELOPMENT_GUIDE.md](../docs/DEVELOPMENT_GUIDE.md) for development setup.

---

## 🎓 Learning Path

**New to this project?**
1. Read [README.md](../README.md)
2. Review [PROJECT_STRUCTURE.md](../docs/PROJECT_STRUCTURE.md)
3. Follow [SETUP.md](../docs/SETUP.md)
4. Try [DEVELOPMENT_GUIDE.md](../docs/DEVELOPMENT_GUIDE.md)

**Want to build?**
1. Check [BUILD_QUICK_GUIDE.md](./BUILD_QUICK_GUIDE.md)
2. Use [BUILD_CHECKLIST.md](./BUILD_CHECKLIST.md)
3. Run `npm run build:dist`

**Need to troubleshoot?**
1. Check [ELECTRON_BUILD.md](./ELECTRON_BUILD.md#troubleshooting-build)
2. Review [TESTING.md](../TESTING.md) for test commands
3. See [DEVELOPMENT_GUIDE.md](../docs/DEVELOPMENT_GUIDE.md) for dev setup

---

**Last Updated:** May 5, 2026  
**Version:** 1.0.0 (Production Ready)
