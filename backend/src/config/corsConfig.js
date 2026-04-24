/**
 * Configuración de CORS
 * Define qué dominios pueden acceder a los endpoints
 */

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Vite default
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.RENDER_EXTERNAL_URL, // Render production URL
];

export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 horas
};
