/**
 * Configuración de Base de Datos MongoDB
 * Gestiona la conexión y desconexión de MongoDB
 */

import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI no está definida en .env');
    }

    const connection = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ Base de datos conectada: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error(`❌ Error al conectar BD: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ Desconexión de BD completada');
  } catch (error) {
    console.error(`❌ Error al desconectar BD: ${error.message}`);
    process.exit(1);
  }
};
