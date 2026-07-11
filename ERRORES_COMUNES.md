# 🐛 Errores Comunes y Soluciones Rápidas

## ❌ Error: "ENOENT: no such file or directory, open 'package.json'"

**¿Qué significa?**: El archivo package.json no existe donde estás ejecutando npm

**Causa**: Ejecutaste `npm install` desde la carpeta equivocada

**Solución**:
```powershell
# Verifica dónde estás:
cd  # Muestra la carpeta actual en Windows PowerShell

# Navega a la carpeta correcta:
cd backend      # Si instalas backend
cd ../web       # Si cambias a frontend

# Luego ejecuta:
npm install
```

---

## ❌ Error: "port 5000 is already in use" / "port 3000 is already in use"

**¿Qué significa?**: Otro programa ya está usando ese puerto

**Solución en Windows PowerShell:**
```powershell
# Encuentra qué programa usa el puerto 5000:
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess

# Cierra ese programa o usa otro puerto en .env:
# Cambia: PORT=5001  (en backend/.env)
# O:      port: 5001  (en web/vite.config.js)
```

**Solución rápida**: Reinicia tu computadora

---

## ❌ Error: "Failed to load resource: vite.svg 404"

**¿Qué significa?**: Falta el ícono favicon

**¿Es crítico?**: **NO** - Solo es un ícono decorativo. La app funciona perfectamente.

**Solución**: Ignora este error. Si quieres arreglarlo, crea el archivo `web/public/vite.svg` (busca en google "vite.svg")

---

## ❌ Error: "ReferenceError: userRoutes is not defined"

**¿Qué significa?**: El código intenta usar una variable que no está importada

**Causa**: Las rutas están comentadas pero el servidor intenta usarlas

**Solución**: Este error ya debe estar corregido en el proyecto. Si lo ves, contacta al líder.

---

## ❌ Error: "Cannot find module 'react'" o similar

**¿Qué significa?**: Falta instalar dependencias

**Causa**: No ejecutaste `npm install` o algo se corrompió

**Solución**:
```bash
# Elimina los módulos instalados:
rm -r node_modules
rm package-lock.json

# Reinstala todo:
npm install
```

**En Windows PowerShell** (si rm no funciona):
```powershell
Remove-Item -Recurse node_modules
Remove-Item package-lock.json
npm install
```

---

## ❌ Error: "MongoDB connection error" / "Cannot connect to MongoDB"

**¿Qué significa?**: No puede conectar a la base de datos

**Causa 1**: MongoDB no está corriendo (si usas local)
```bash
# Inicia MongoDB (debe estar instalado):
mongod
```

**Causa 2**: La URL de MongoDB es incorrecta
```bash
# Verifica MONGODB_URI en backend/.env
# Ejemplo correcto: mongodb+srv://user:pass@cluster.mongodb.net/db

# Asegúrate de:
# - Reemplazar user y pass con credenciales reales
# - El cluster exista en MongoDB Atlas (atlas.mongodb.com)
# - Las credenciales sean correctas
```

**Causa 3**: Firewall bloquea la conexión
- En MongoDB Atlas, asegúrate de agregar tu IP
- Ve a: Security → Network Access → Add IP Address

---

## ❌ Error: "No se encuentra esta página de localhost"

**¿Qué significa?**: El navegador no puede acceder a http://localhost:3000

**Causa 1**: Frontend no está ejecutándose
```bash
# Verifica en Terminal 2:
cd web
npm run dev

# Deberías ver:
# ➜  Local:   http://localhost:3000/
```

**Causa 2**: Falta el archivo `index.html` en frontend
```bash
# Verifica que existe:
cd web
dir index.html  # En Windows PowerShell

# Si falta, contacta al líder del proyecto
```

**Causa 3**: Puerto 3000 está en uso
```bash
# Usa otro puerto en web/vite.config.js:
# port: 3001  (en lugar de 3000)
```

---

## ❌ Error: "Unsafe attempt to load URL"

**¿Qué significa?**: Error de seguridad en el navegador (muy común en desarrollo)

**¿Es crítico?**: **NO** - Es un warning. Haz clic en "Inspeccionar" de todas formas.

**Causa**: React DevTools intenta iniciarse

**Solución**: Ignora este error, es normal en desarrollo

---

## ❌ Error: "npm: command not found"

**¿Qué significa?**: npm no está instalado o no se encuentra

**Solución**:
1. Descarga Node.js desde nodejs.org (incluye npm)
2. Reinstala Node.js
3. Reinicia PowerShell/Terminal
4. Verifica: `npm --version`

---

## ❌ Error: Cambios en código no se reflejan

**Causa**: Hot reload no está funcionando

**Solución**:
```bash
# Detén la ejecución: Presiona Ctrl+C en la terminal

# Backend:
npm run dev  # Nodemon reinicia automáticamente

# Frontend:
npm run dev  # Vite detecta cambios automáticamente

# Si aún no funciona, limpia caché:
rm -r node_modules/.vite
npm run dev
```

---

## ✅ Checklist - Antes de pedir ayuda

- [ ] Estoy en la carpeta correcta (backend o frontend)
- [ ] Ejecuté `npm install` correctamente
- [ ] Tengo dos terminales: una para backend, otra para frontend
- [ ] Ambos servidores están ejecutándose (npm run dev)
- [ ] Revisé [docs/SETUP.md](./docs/SETUP.md)
- [ ] Copié .env.example a .env (las variables necesarias)
- [ ] Reinicié las terminales
- [ ] Reinicié mi computadora

---

## 📞 Si El Problema Persiste

1. **Captura la pantalla** con el error exacto
2. **Copia el mensaje de error** completo
3. **Verifica tu sistema operativo** (Windows/Mac/Linux)
4. **Nota tu versión de Node**: `node --version`
5. **Contacta al líder** con toda esta información

---

**Última actualización**: 2026  
**Si encuentras un error no lisado aquí**, por favor reporta al líder del proyecto.
