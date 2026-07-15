/**
 * Configuración de CORS
 * Define qué dominios pueden acceder a los endpoints
 */

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  // WebView de Capacitor (app Android): el origen depende del androidScheme.
  'capacitor://localhost',
  'https://localhost',
  'http://localhost',
  // Origen estable del cliente de escritorio empaquetado con Electron.
  'app://financeapp',
  process.env.FRONTEND_URL,
  process.env.RENDER_EXTERNAL_URL,
].filter(Boolean); // elimina valores vacíos/undefined

const isDev = process.env.NODE_ENV !== 'production';

export const corsOptions = {
  origin: (origin, callback) => {
    // Peticiones sin origen (curl, Postman) o en dev desde localhost
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    // En desarrollo permitir cualquier origen localhost / 127.0.0.1
    if (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    callback(new Error('No permitido por CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};
