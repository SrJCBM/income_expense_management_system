# FinanceApp Mobile (Fase 2 — pendiente)

Esta carpeta alojará la app Android construida con **Capacitor**, reutilizando
el código React de `../web` (sin reescritura).

## Diseño aprobado (2026-07-10)

- `@capacitor/core` + `@capacitor/android`, con `webDir: '../web/dist'`.
- El proyecto `android/` generado se abre en **Android Studio** y se ejecuta en
  el emulador Pixel 8 Pro o en un dispositivo físico.
- API por ambiente (variables Vite en `../web`):
  - Desarrollo (emulador): `VITE_API_URL=http://10.0.2.2:5000/api`
    (el emulador ve el `localhost` de la PC como `10.0.2.2`; para un teléfono
    físico, cambiar a la IP LAN de la PC, p. ej. `http://192.168.x.x:5000/api`).
  - Producción: `VITE_API_URL=https://income-expense-api-hgsu.onrender.com/api`
    (backend ya desplegado en Render; no se despliega nada nuevo).
- Scripts previstos: `sync:dev` / `sync:prod` (build de web en el modo
  correspondiente + `npx cap sync`).
- Dev requiere permitir HTTP cleartext hacia `10.0.2.2` (solo builds de
  desarrollo). HashRouter y localStorage ya funcionan en WebView sin cambios.

## Estado

Solo esqueleto. No ejecutar `npm init` ni instalar Capacitor hasta que la
Fase 2 sea aprobada explícitamente.
