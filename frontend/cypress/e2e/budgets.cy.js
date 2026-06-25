const TEST_TOKEN = 'fake-jwt-token-cypress';
const TEST_USER = { id: 1, name: 'Test User', email: 'testuser@example.com', currency: 'USD' };
const TEST_CATEGORY_ID = '665f1a111111111111111111';

const sampleCategory = {
  id: TEST_CATEGORY_ID,
  _id: TEST_CATEGORY_ID,
  name: 'Alimentacion',
  type: 'expense',
  color: '#ef4444',
};

const sampleBudget = {
  id: 'budget-1',
  _id: 'budget-1',
  categoryId: TEST_CATEGORY_ID,
  category: sampleCategory,
  limitAmount: 500,
  month: 6,
  year: 2026,
  alertThreshold: 80,
  spentAmount: 200,
  remainingAmount: 300,
  percentageUsed: 40,
  isOverBudget: false,
  isNearLimit: false,
};

const overBudget = {
  ...sampleBudget,
  id: 'budget-2',
  _id: 'budget-2',
  spentAmount: 650,
  remainingAmount: 0,
  percentageUsed: 130,
  isOverBudget: true,
  category: { ...sampleCategory, id: '665f1a222222222222222222', _id: '665f1a222222222222222222', name: 'Transporte' },
  categoryId: '665f1a222222222222222222',
};

describe('Gestión de Presupuestos (E2E)', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/budgets?*', {
      statusCode: 200,
      body: { success: true, data: [sampleBudget, overBudget] },
    }).as('getBudgets');

    cy.intercept('GET', '**/api/categories?type=expense*', {
      statusCode: 200,
      body: { success: true, data: [sampleCategory] },
    }).as('getExpenseCategories');

    cy.visitWithSession('/budgets', TEST_TOKEN, TEST_USER);
    cy.wait('@getBudgets');
  });

  it('Debe mostrar los presupuestos con su progreso de gasto', () => {
    cy.get('[data-testid="budget-list"]').should('be.visible');
    cy.get('[data-testid="budget-item"]').should('have.length', 2);
    cy.get('[data-testid="budget-spent"]').first().should('contain', '200');
    cy.get('[data-testid="budget-limit-amount"]').first().should('contain', '500');
  });

  it('Debe marcar visualmente los presupuestos excedidos', () => {
    cy.get('[data-testid="budget-item"]')
      .eq(1)
      .should('have.class', 'budget-over')
      .find('[data-testid="budget-status"]')
      .should('contain', 'Excedido');
  });

  it('Debe exponer el progreso como barra accesible (progressbar)', () => {
    cy.get('[data-testid="budget-item"]')
      .first()
      .find('[role="progressbar"]')
      .should('have.attr', 'aria-valuenow', '40');
  });

  it('Debe crear un presupuesto con datos válidos', () => {
    cy.intercept('POST', '**/api/budgets*', {
      statusCode: 201,
      body: {
        success: true,
        message: 'Presupuesto creado exitosamente',
        data: { ...sampleBudget, id: 'budget-created', limitAmount: 800, spentAmount: 0, percentageUsed: 0 },
      },
    }).as('createBudget');

    cy.get('[data-testid="new-budget-button"]').click();
    cy.get('[data-testid="budget-form"]').should('be.visible');
    cy.get('[data-testid="budget-category"]').select(TEST_CATEGORY_ID);
    cy.get('[data-testid="budget-limit"]').clear().type('800');
    cy.get('[data-testid="budget-submit"]').click();

    cy.wait('@createBudget').its('response.statusCode').should('eq', 201);
    cy.get('[data-testid="success-message"]').should('contain', 'creado');
  });

  it('Debe validar que el monto límite sea mayor a 0', () => {
    cy.get('[data-testid="new-budget-button"]').click();
    cy.get('[data-testid="budget-category"]').select(TEST_CATEGORY_ID);
    cy.get('[data-testid="budget-limit"]').clear().type('0');
    cy.get('[data-testid="budget-submit"]').click();

    cy.get('[data-testid="budget-error"]').should('be.visible').and('contain', 'mayor a 0');
  });

  it('Debe editar el límite de un presupuesto existente', () => {
    cy.intercept('PUT', '**/api/budgets/*', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Presupuesto actualizado exitosamente',
        data: { ...sampleBudget, limitAmount: 900, percentageUsed: 22 },
      },
    }).as('updateBudget');

    cy.get('[data-testid="edit-budget"]').first().click();
    cy.get('[data-testid="budget-form"]').should('be.visible');
    cy.get('[data-testid="budget-limit"]').clear().type('900');
    cy.get('[data-testid="budget-submit"]').click();

    cy.wait('@updateBudget').its('response.statusCode').should('eq', 200);
    cy.get('[data-testid="success-message"]').should('contain', 'actualizado');
  });

  it('Debe eliminar un presupuesto confirmando el diálogo', () => {
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });

    cy.intercept('DELETE', '**/api/budgets/*', {
      statusCode: 200,
      body: { success: true, message: 'Presupuesto eliminado exitosamente' },
    }).as('deleteBudget');

    cy.get('[data-testid="delete-budget"]').first().click();

    cy.wait('@deleteBudget').its('response.statusCode').should('eq', 200);
    cy.get('[data-testid="success-message"]').should('contain', 'eliminado');
  });

  it('Debe mostrar el estado vacío cuando no hay presupuestos', () => {
    cy.intercept('GET', '**/api/budgets?*', {
      statusCode: 200,
      body: { success: true, data: [] },
    }).as('getEmptyBudgets');

    cy.get('[data-testid="budget-period"]').type('2026-01');
    cy.wait('@getEmptyBudgets');
    cy.get('[data-testid="budget-empty"]').should('be.visible');
  });
});
