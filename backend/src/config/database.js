/**
 * Configuración de Base de Datos MongoDB
 * Gestiona la conexión y desconexión de MongoDB
 */

import mongoose from 'mongoose';

const NUMBER_BSON_TYPES = ['double', 'int', 'long', 'decimal'];

const COLLECTION_DEFINITIONS = {
  users: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'email', 'password', 'role', 'isActive'],
        properties: {
          name: {
            bsonType: 'string',
            minLength: 2,
            maxLength: 120,
          },
          email: {
            bsonType: 'string',
            maxLength: 180,
            pattern: '^.+@.+\\..+$',
          },
          password: {
            bsonType: 'string',
            minLength: 8,
          },
          role: {
            enum: ['user', 'admin'],
          },
          isActive: {
            bsonType: 'bool',
          },
          currency: {
            bsonType: ['string', 'null'],
            maxLength: 10,
          },
          lastLoginAt: {
            bsonType: ['date', 'null'],
          },
        },
      },
    },
    indexes: [
      {
        key: { email: 1 },
        name: 'users_email_unique_idx',
        unique: true,
      },
    ],
  },
  expenses: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'description', 'amount', 'category', 'date'],
        properties: {
          userId: { bsonType: 'objectId' },
          description: { bsonType: 'string', maxLength: 500 },
          amount: { bsonType: NUMBER_BSON_TYPES, minimum: 0 },
          category: { bsonType: 'objectId' },
          date: { bsonType: 'date' },
          notes: { bsonType: ['string', 'null'], maxLength: 1000 },
          tags: {
            bsonType: ['array', 'null'],
            items: { bsonType: 'string' },
          },
        },
      },
    },
    indexes: [
      { key: { userId: 1, date: -1 }, name: 'expenses_user_date_idx' },
      { key: { userId: 1, category: 1 }, name: 'expenses_user_category_idx' },
    ],
  },
  incomes: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'description', 'amount', 'category', 'date'],
        properties: {
          userId: { bsonType: 'objectId' },
          description: { bsonType: 'string', maxLength: 500 },
          amount: { bsonType: NUMBER_BSON_TYPES, minimum: 0 },
          category: { bsonType: 'objectId' },
          date: { bsonType: 'date' },
          notes: { bsonType: ['string', 'null'], maxLength: 1000 },
        },
      },
    },
    indexes: [{ key: { userId: 1, date: -1 }, name: 'incomes_user_date_idx' }],
  },
  categories: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'name', 'type'],
        properties: {
          userId: { bsonType: 'objectId' },
          name: { bsonType: 'string', maxLength: 120 },
          type: { enum: ['expense', 'income'] },
          color: { bsonType: ['string', 'null'] },
          icon: { bsonType: ['string', 'null'] },
          description: { bsonType: ['string', 'null'], maxLength: 500 },
        },
      },
    },
    indexes: [{ key: { userId: 1, type: 1 }, name: 'categories_user_type_idx' }],
  },
  budgets: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'category', 'limitAmount', 'month', 'year'],
        properties: {
          userId: { bsonType: 'objectId' },
          category: { bsonType: 'objectId' },
          limitAmount: { bsonType: NUMBER_BSON_TYPES, minimum: 0 },
          month: { bsonType: ['int', 'long'], minimum: 1, maximum: 12 },
          year: { bsonType: ['int', 'long'], minimum: 2020 },
          alertThreshold: { bsonType: NUMBER_BSON_TYPES, minimum: 0, maximum: 100 },
        },
      },
    },
    indexes: [{ key: { userId: 1, year: 1, month: 1 }, name: 'budgets_user_year_month_idx' }],
  },
};

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME || 'income_expense_db';
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI no está definida en .env');
    }

    const connection = await mongoose.connect(mongoURI, {
      dbName,
    });

    console.log(`✅ Base de datos conectada: ${connection.connection.host}`);
    console.log(`🗄️  Base de datos activa: ${connection.connection.name}`);
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

export const getDb = () => mongoose.connection.db;

export const initializeDatabaseSchema = async () => {
  const db = getDb();

  if (!db) {
    throw new Error('No hay conexión activa para inicializar colecciones');
  }

  const existingCollections = await db.listCollections({}, { nameOnly: true }).toArray();
  const existingCollectionNames = new Set(existingCollections.map((c) => c.name));

  for (const [collectionName, definition] of Object.entries(COLLECTION_DEFINITIONS)) {
    const exists = existingCollectionNames.has(collectionName);

    if (!exists) {
      await db.createCollection(collectionName, {
        validator: definition.validator,
        validationLevel: 'moderate',
        validationAction: 'error',
      });

      console.log(`✅ Colección creada con validación: ${collectionName}`);
    } else {
      console.log(`ℹ️  Colección existente detectada: ${collectionName} (se reutiliza)`);
    }

    if (Array.isArray(definition.indexes) && definition.indexes.length > 0) {
      const collection = db.collection(collectionName);

      for (const indexSpec of definition.indexes) {
        try {
          const options = {
            name: indexSpec.name,
          };

          if (typeof indexSpec.unique === 'boolean') {
            options.unique = indexSpec.unique;
          }

          await collection.createIndex(indexSpec.key, options);
        } catch (error) {
          const message = String(error?.message || '');

          if (
            message.includes('already exists with a different name') ||
            message.includes('already exists')
          ) {
            console.log(
              `ℹ️  Índice ya existente detectado en ${collectionName}: ${JSON.stringify(indexSpec.key)}`
            );
            continue;
          }

          throw error;
        }
      }

      console.log(`✅ Índices verificados en colección: ${collectionName}`);
    }
  }
};
