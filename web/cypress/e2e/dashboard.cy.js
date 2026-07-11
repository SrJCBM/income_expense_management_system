describe('Dashboard y Totales', () => {
  beforeEach(() => {
    // Mockea todos los endpoints protegidos (budgets/alerts, reports/yearly, etc.)
    // para que no se dispare un auto-logout por 401 en llamadas no mockeadas.
    cy.mockProtectedApi();
    cy.intercept('GET', '**/api/auth/me', { statusCode: 200, body: { id: '1', name: 'Test User' } }).as('getUser');
  });

  it('debería mostrar los totales de ingresos, gastos y balance correctamente', () => {
    cy.intercept('GET', '**/api/reports/summary*', {
      statusCode: 200,
      body: {
        data: {
          totalIncome: 5000,
          totalExpense: 2000,
          balance: 3000,
          expensesByCategory: [{ name: 'Alimentación', amount: 2000 }]
        }
      }
    }).as('getSummary');

    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('authToken', 'fake-jwt-token-cypress');
        win.localStorage.setItem('authUser', JSON.stringify({ id: 1, name: 'Test User' }));
      }
    });
    cy.wait('@getSummary');

    cy.get('[data-testid="dashboard-balance-amount"]').should('contain.text', '3,000.00');
    cy.get('[data-testid="dashboard-incomes-amount"]').should('contain.text', '5,000.00');
    cy.get('[data-testid="dashboard-expenses-amount"]').should('contain.text', '2,000.00');
    cy.get('[data-testid="dashboard-category-item"]').should('contain.text', 'Alimentación').and('contain.text', '2,000.00');
  });

  it('debería manejar montos altos sin romper la visualización', () => {
    // Montos extremadamente altos para probar si el formateo falla o la card se rompe (al menos a nivel de texto)
    const highAmount = 9999999999.99;
    
    cy.intercept('GET', '**/api/reports/summary*', {
      statusCode: 200,
      body: {
        data: {
          totalIncome: highAmount,
          totalExpense: highAmount,
          balance: 0,
          expensesByCategory: []
        }
      }
    }).as('getSummaryHigh');

    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('authToken', 'fake-jwt-token-cypress');
        win.localStorage.setItem('authUser', JSON.stringify({ id: 1, name: 'Test User' }));
      }
    });
    cy.wait('@getSummaryHigh');

    // Dependiendo del locale (es-PE), el separador de miles será una coma o espacio, y los decimales con punto o coma
    // Solo verificamos que la card sea visible y contenga parte del número enorme formateado
    cy.get('[data-testid="dashboard-incomes-amount"]').should('contain.text', '999');
    cy.get('[data-testid="dashboard-expenses-amount"]').should('contain.text', '999');
    
    cy.get('[data-testid="dashboard-empty-state"]').should('be.visible').and('contain.text', 'No hay actividad reciente');
  });
});
