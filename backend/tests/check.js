import { testUser, testExpense, commonCategories as categories } from './fixtures/data.js'
import { clearCollections, insertTestUser, insertTestExpense } from './helpers/dbHandler.js'

console.log('✅ Data imports work:', { testUser, testExpense, categories })
console.log('✅ Helpers imports work:', { clearCollections, insertTestUser, insertTestExpense })