# FinanceApp Mobile (Android — Capacitor)

App Android construida con **Capacitor 6**, reutilizando el build React de
`../web` (`webDir: '../web/dist'`). Sin codigo duplicado: la UI se mantiene
solo en `web/`.

## Requisitos

- Android Studio con SDK y emulador (probado con Pixel 8 Pro).
- JDK 17 (Capacitor 6 no soporta Java 21/Capacitor 7 en esta maquina).
- `mobile/android/local.properties` con `sdk.dir` apuntando al Android SDK
  (no se versiona; se crea solo o lo genera Android Studio).

## Flujo de desarrollo (emulador)

1. Backend local corriendo: `cd ../backend && npm run dev` (puerto 5000).
2. `npm run sync:dev` — build de web en modo `mobile`
   (`VITE_API_URL=http://10.0.2.2:5000/api`) + `cap sync android`.
3. `npm run open:android` — abre el proyecto en Android Studio; Run ▶ en el
   emulador Pixel 8 Pro.

El emulador ve el `localhost` de la PC como `10.0.2.2`. El trafico HTTP
cleartext esta permitido SOLO hacia `10.0.2.2`
(`android/app/src/main/res/xml/network_security_config.xml`). La WebView se
sirve con esquema `http` (`server.androidScheme` en `capacitor.config.json`);
con el esquema `https` por defecto, Chromium bloquea las llamadas a
`http://10.0.2.2` como Mixed Content.

> Emulador por CLI: si el AVD Pixel_8_Pro queda `offline` indefinidamente al
> arrancarlo con `emulator.exe -avd Pixel_8_Pro`, relanzarlo con
> `-gpu swiftshader_indirect` (en esta maquina la GPU por defecto lo cuelga).

### Telefono fisico (misma red WiFi)

1. Averiguar la IP LAN de la PC (`ipconfig`).
2. En `../web/.env.mobile`, cambiar `VITE_API_URL` a `http://<IP-LAN>:5000/api`.
3. Anadir `<domain includeSubdomains="false"><IP-LAN></domain>` en
   `network_security_config.xml`.
4. `npm run sync:dev` y Run desde Android Studio con el telefono conectado.

## Build apuntando a produccion (Render)

`npm run sync:prod` usa `../web/.env.mobile-prod`
(`https://income-expense-api-hgsu.onrender.com/api`). Todo HTTPS; no requiere
cleartext.

> Nota: el backend en Render debe tener el commit que permite los origenes
> `capacitor://localhost` / `https://localhost` en CORS
> (`backend/src/config/corsConfig.js`). Redeployar Render es decision del
> usuario; no se hace automaticamente.

## APK por linea de comandos

- Debug: `npm run apk:debug` →
  `android/app/build/outputs/apk/debug/app-debug.apk`.
- Instalar en el emulador: `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`.

## Scripts

| Script          | Que hace                                             |
|-----------------|------------------------------------------------------|
| `sync:dev`      | build web modo `mobile` + `cap sync android`         |
| `sync:prod`     | build web modo `mobile-prod` + `cap sync android`    |
| `open:android`  | abre `android/` en Android Studio                    |
| `apk:debug`     | `gradlew assembleDebug`                              |
