/**
 * E2E tests — Expenses CRUD
 *
 * The real app keeps the expense form inline inside /expenses.
 */

const TEST_TOKEN = 'fake-jwt-token-cypress';
const TEST_USER = { id: 1, name: 'Test User', email: 'testuser@example.com' };

const visitExpensesWithSession = () => {
  cy.visit('/expenses', {
    onBeforeLoad(win) {
      win.localStorage.setItem('authToken', TEST_TOKEN);
      win.localStorage.setItem('authUser', JSON.stringify(TEST_USER));
    },
  });
};

const sampleExpense = {
  id: 'expense-1',
  concept: 'Supermercado',
  amount: 150.75,
  date: '2026-05-01',
  category: { name: 'Alimentación' },
  description: 'Compra semanal de alimentos',
};

describe('CRUD de Gastos (E2E)', () => {
  let testData;

  before(() => {
    cy.fixture('testData').then((data) => {
      testData = data;
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '**/api/expenses*', {
      statusCode: 200,
      body: { success: true, data: [sampleExpense] },
    }).as('getExpenses');

    visitExpensesWithSession();
    cy.wait('@getExpenses');
  });

  it('Debe mostrar la lista de gastos y el total', () => {
    cy.get('[data-testid="expense-list"]').should('be.visible');
    cy.get('[data-testid="expense-item"]').should('have.length', 1);
    cy.get('[data-testid="expense-total"]').should('contain', '150.75');
  });

  it('Debe abrir el formulario de nuevo gasto desde la lista', () => {
    cy.get('[data-testid="new-expense-button"]').click();
    cy.get('[data-testid="expense-form"]').should('be.visible');
    cy.get('[data-testid="expense-concept"]').should('be.visible');
  });

  it('Debe crear un gasto con datos válidos', () => {
    const expense = testData?.testExpense || {
      concept: 'Compra de prueba',
      amount: 150.75,
      categoryId: '1',
      date: '2026-05-01',
      description: 'Compra semanal de alimentos',
    };

    cy.intercept('POST', '**/api/expenses*', {
      statusCode: 201,
      body: {
        success: true,
        message: 'Gasto creado exitosamente',
        data: {
          id: 'expense-created',
          concept: expense.concept,
          amount: Number(expense.amount),
          date: expense.date,
          category: { name: 'Alimentación' },
          description: expense.description,
        },
      },
    }).as('createExpense');

    cy.get('[data-testid="new-expense-button"]').click();
    cy.get('[data-testid="expense-concept"]').clear().type(expense.concept);
    cy.get('[data-testid="expense-amount"]').clear().type(String(expense.amount));
    cy.get('[data-testid="expense-category"]').select('Alimentación');
    cy.get('[data-testid="expense-date"]').clear().type(expense.date);
    cy.get('[data-testid="expense-description"]').clear().type(expense.description);
    cy.get('[data-testid="expense-submit"]').click();

    cy.wait('@createExpense').its('response.statusCode').should('eq', 201);
    cy.get('[data-testid="success-message"]').should('contain', 'creado');
    cy.get('[data-testid="expense-list"]').should('contain', expense.concept);
  });

  it('Debe validar que el concepto sea obligatorio', () => {
    cy.get('[data-testid="new-expense-button"]').click();
    cy.get('[data-testid="expense-amount"]').clear().type('100');
    cy.get('[data-testid="expense-date"]').clear().type('2026-05-15');
    cy.get('[data-testid="expense-submit"]').click();

    cy.get('[data-testid="expense-error-general"]').should('be.visible');
  });

  it('Debe validar que el monto sea mayor a 0', () => {
    cy.get('[data-testid="new-expense-button"]').click();
    cy.get('[data-testid="expense-concept"]').clear().type('Compra mínima');
    cy.get('[data-testid="expense-amount"]').clear().type('-50');
    cy.get('[data-testid="expense-date"]').clear().type('2026-05-15');
    cy.get('[data-testid="expense-submit"]').click();

    cy.get('[data-testid="expense-error-amount"]').should('be.visible');
  });

  it('Debe editar un gasto desde la lista', () => {
    cy.intercept('PUT', '**/api/expenses/*', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Gasto actualizado exitosamente',
        data: {
          ...sampleExpense,
          concept: 'Supermercado editado',
          amount: 250.75,
        },
      },
    }).as('updateExpense');

    cy.get('[data-testid="edit-expense"]').first().click();
    cy.get('[data-testid="expense-form"]').should('be.visible');
    cy.get('[data-testid="expense-concept"]').clear().type('Supermercado editado');
    cy.get('[data-testid="expense-amount"]').clear().type('250.75');
    cy.get('[data-testid="expense-submit"]').click();

    cy.wait('@updateExpense').its('response.statusCode').should('eq', 200);
    cy.get('[data-testid="success-message"]').should('contain', 'actualizado');
    cy.get('[data-testid="expense-list"]').should('contain', 'Supermercado editado');
  });

  it('Debe eliminar un gasto confirmando el diálogo del navegador', () => {
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });

    cy.intercept('DELETE', '**/api/expenses/*', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Gasto eliminado exitosamente',
      },
    }).as('deleteExpense');

    cy.get('[data-testid="delete-expense"]').first().click();

    cy.wait('@deleteExpense').its('response.statusCode').should('eq', 200);
    cy.get('[data-testid="success-message"]').should('contain', 'eliminado');
  });
});
