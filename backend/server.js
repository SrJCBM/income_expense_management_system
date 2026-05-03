/**
 * Backend Server Entry Point
 * Sistema de Control de Gastos e Ingresos
 * 
 * Archivo principal para iniciar el servidor Express
 * Configuración de rutas, middlewares y conexión a BD
 */

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

// Configurar variables de entorno
dotenv.config();

// Importar configuraciones
import { corsOptions } from './src/config/corsConfig.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import { connectDB, initializeDatabaseSchema } from './src/config/database.js';

// Importar rutas
import authRoutes from './src/routes/authRoutes.js';
import expenseRoutes from './src/routes/expenseRoutes.js';
import incomeRoutes from './src/routes/incomeRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
// import budgetRoutes from './src/routes/budgetRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';

const app = express();

// ============================================
// MIDDLEWARES DE SEGURIDAD
// ============================================
app.use(helmet()); // Configurar headers de seguridad
app.use(cors(corsOptions)); // CORS configurado

// ============================================
// MIDDLEWARES DE BODY PARSER
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================
// RUTAS
// ============================================
// Las rutas se agregarán aquí conforme se implementen los controladores
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/categories', categoryRoutes);
// app.use('/api/budgets', budgetRoutes);
app.use('/api/reports', reportRoutes);

// ============================================
// RUTA DE HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Servidor ejecutándose correctamente',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// MANEJO DE RUTAS NO ENCONTRADAS
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
  });
});

// ============================================
// ERROR HANDLER MIDDLEWARE
// ============================================
app.use(errorHandler);

// Exportar app para tests
export default app;

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 5000;

const bootstrap = async () => {
  await connectDB();
  await initializeDatabaseSchema();

  app.listen(PORT, () => {
    console.log(`✅ Servidor ejecutándose en puerto ${PORT}`);
    console.log(`📍 Entorno: ${process.env.NODE_ENV}`);
  });
};

// Iniciar el servidor siempre que no estemos en entorno de pruebas (Vitest)
if (process.env.NODE_ENV !== 'test') {
  bootstrap().catch((error) => {
    console.error(`❌ No se pudo iniciar el servidor: ${error.message}`);
    process.exit(1);
  });
}
