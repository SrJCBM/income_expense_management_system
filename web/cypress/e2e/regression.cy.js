describe('Pruebas de Regresión', () => {
  
  describe('Registro de Usuario', () => {
    beforeEach(() => {
      // Limpiar local storage y session para asegurarse de no estar logueado y que /register no redirija
      cy.clearLocalStorage();
      cy.window().then((win) => {
        win.sessionStorage.clear();
      });
      // Interceptar auth
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 400,
        body: { message: 'El nombre debe incluir al menos una letra' }
      }).as('register');
    });

    it('debería rechazar un nombre de usuario que contenga solo símbolos', () => {
      cy.visit('/#/register');
      cy.get('[data-testid="name-input"]').should('be.visible').type('!@#$%^&*');
      cy.get('[data-testid="email-input"]').type('test@test.com');
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="confirm-password-input"]').type('password123');
      
      cy.get('[data-testid="register-button"]').click();
      
      // La validación en el frontend de Register.jsx lanza el error, ni siquiera llega al backend
      cy.get('#name-error').should('be.visible').and('contain.text', 'El nombre debe incluir al menos una letra');
    });
  });

  describe('Edición de Ingresos y Manejo de Fechas', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/incomes*', {
        statusCode: 200,
        body: {
          success: true,
          data: [{
            id: 'inc-1',
            _id: 'inc-1',
            concept: 'Salario Base',
            amount: 5000,
            date: '2024-05-15T12:00:00.000Z',
            notes: 'Mes de Mayo',
            category: { _id: 'cat1', name: 'Salario' }
          }]
        }
      }).as('getIncomes');
      cy.intercept('GET', '**/api/categories?type=income*', {
        statusCode: 200,
        body: { success: true, data: [{ _id: 'cat1', name: 'Salario', type: 'income' }] }
      }).as('getCategories');
      
      cy.visitWithSession('/incomes');
      cy.wait(['@getIncomes', '@getCategories']);
    });

    it('debería recuperar los datos correctos en el formulario de edición de ingresos', () => {
      cy.get('[data-testid="edit-income"]').first().click();
      
      // Verificamos que los campos tengan el valor correcto
      cy.get('[data-testid="income-concept"]').should('have.value', 'Salario Base');
      cy.get('[data-testid="income-amount"]').should('have.value', '5000');
      // La fecha se formatea a YYYY-MM-DD
      cy.get('[data-testid="income-date"]').should('have.value', '2024-05-15');
      cy.get('[data-testid="income-notes"]').should('have.value', 'Mes de Mayo');
    });
  });

  describe('Formulario de Gastos', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/expenses*', { statusCode: 200, body: { success: true, data: [] } }).as('getExpenses');
      cy.intercept('GET', '**/api/categories?type=expense*', { statusCode: 200, body: { success: true, data: [] } }).as('getCategoriesExpense');
      
      cy.visitWithSession('/expenses');
      cy.wait(['@getExpenses', '@getCategoriesExpense']);
    });

    it('no debe mostrar selectores de categoría duplicados', () => {
      cy.get('[data-testid="new-expense-button"]').click();
      cy.get('select[name="categoryId"], select[name="category"], select#expense-category', { timeout: 4000 }).should('have.length', 1);
    });
  });
});
