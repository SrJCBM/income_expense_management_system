import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll } from 'vitest';

// Configurar variables de entorno para tests
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_jwt_secret_key_for_tests_12345';
}
if (!process.env.JWT_EXPIRE) {
  process.env.JWT_EXPIRE = '7d';
}

let mongoServer;

// Aumentamos timeout de los hooks porque la descarga de binarios de
// MongoMemoryServer puede tardar en entornos CI/local sin caché.
beforeAll(async () => {
  // Permitir mayor tiempo para la creación/descarga
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}, 120000); // 2 minutos

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 60000); // 1 minuto