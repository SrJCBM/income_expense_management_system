/**
 * Fixtures - Datos de prueba reutilizables
 * Contiene datos de prueba y funciones generadoras para tests
 */

/**
 * Categorías comunes predefinidas
 */
export const commonCategories = {
  food: {
    name: 'Alimentación',
    type: 'expense',
    color: '#FF6B6B',
    icon: '🍔',
    description: 'Gastos en comida y bebidas'
  },
  transport: {
    name: 'Transporte',
    type: 'expense',
    color: '#4ECDC4',
    icon: '🚗',
    description: 'Gasolina, transporte público, taxis'
  },
  entertainment: {
    name: 'Entretenimiento',
    type: 'expense',
    color: '#FFE66D',
    icon: '🎬',
    description: 'Cine, juegos, hobbies'
  },
  bills: {
    name: 'Facturas',
    type: 'expense',
    color: '#95E1D3',
    icon: '💳',
    description: 'Servicios, suscripciones, pagos'
  },
  salary: {
    name: 'Salario',
    type: 'income',
    color: '#A8E6CF',
    icon: '💰',
    description: 'Ingreso laboral principal'
  },
  freelance: {
    name: 'Freelance',
    type: 'income',
    color: '#FFD3B6',
    icon: '💻',
    description: 'Ingresos de trabajos puntuales'
  }
};

/**
 * Usuario de prueba por defecto
 */
export const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  name: 'Test User'
};

/**
 * Gasto de prueba por defecto
 */
export const testExpense = {
  amount: 50.00,
  category: 'food',
  date: new Date('2024-05-01'),
  description: 'Almuerzo en restaurante'
};

/**
 * Ingreso de prueba por defecto
 */
export const testIncome = {
  amount: 2500.00,
  category: 'salary',
  date: new Date('2024-05-01'),
  description: 'Salario mensual'
};

/**
 * Genera un email aleatorio único para tests
 * @returns {string} Email formato: test_<timestamp>_<random>@example.com
 */
export const generateRandomEmail = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `test_${timestamp}_${random}@example.com`;
};

/**
 * Genera un usuario aleatorio completo
 * @param {Object} overrides - Propiedades a sobrescribir
 * @returns {Object} Objeto usuario con valores aleatorios
 */
export const generateRandomUser = (overrides = {}) => {
  const names = [
    'Alice Johnson',
    'Bob Smith',
    'Carlos García',
    'Diana López',
    'Emma Wilson',
    'Frank Miller',
    'Grace Chen',
    'Henry Brown'
  ];

  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomEmail = generateRandomEmail();

  return {
    email: randomEmail,
    password: 'ValidPassword123!',
    name: randomName,
    ...overrides
  };
};

/**
 * Genera una lista de gastos variados para tests
 * @param {number} count - Cantidad de gastos a generar
 * @param {Object} baseData - Datos base a usar
 * @returns {Array} Array de objetos expense
 */
export const generateExpenses = (count = 5, baseData = {}) => {
  const descriptions = [
    'Almuerzo en restaurante',
    'Gasolina',
    'Película en cine',
    'Compras del supermercado',
    'Café con amigos',
    'Taxi al trabajo',
    'Streaming subscription',
    'Ropa nueva',
    'Cena en casa'
  ];

  const categoryKeys = Object.keys(commonCategories).filter(
    key => commonCategories[key].type === 'expense'
  );

  const expenses = [];
  for (let i = 0; i < count; i++) {
    expenses.push({
      amount: Math.round((Math.random() * 100 + 10) * 100) / 100,
      category: categoryKeys[Math.floor(Math.random() * categoryKeys.length)],
      date: new Date(2024, 4, Math.floor(Math.random() * 28) + 1),
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      ...baseData
    });
  }

  return expenses;
};

/**
 * Genera una lista de ingresos variados para tests
 * @param {number} count - Cantidad de ingresos a generar
 * @param {Object} baseData - Datos base a usar
 * @returns {Array} Array de objetos income
 */
export const generateIncomes = (count = 3, baseData = {}) => {
  const descriptions = [
    'Salario mensual',
    'Proyecto freelance completado',
    'Bonificación laboral',
    'Venta de artículos',
    'Ingresos por consultoría'
  ];

  const categoryKeys = Object.keys(commonCategories).filter(
    key => commonCategories[key].type === 'income'
  );

  const incomes = [];
  for (let i = 0; i < count; i++) {
    incomes.push({
      amount: Math.round((Math.random() * 2000 + 500) * 100) / 100,
      category: categoryKeys[Math.floor(Math.random() * categoryKeys.length)],
      date: new Date(2024, 4, (i + 1) * 10),
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      notes: Math.random() > 0.7 ? 'Notas adicionales' : undefined,
      ...baseData
    });
  }

  return incomes;
};
