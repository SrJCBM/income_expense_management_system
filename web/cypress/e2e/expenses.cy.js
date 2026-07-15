const TEST_TOKEN = 'fake-jwt-token-cypress';
const TEST_USER = { id: 1, name: 'Test User', email: 'testuser@example.com' };
const TEST_CATEGORY_ID = '665f1a111111111111111111';

const sampleCategory = {
  id: TEST_CATEGORY_ID,
  _id: TEST_CATEGORY_ID,
  name: 'Alimentacion',
  type: 'expense',
  color: '#ef4444',
  icon: '📌',
};

const sampleExpense = {
  id: 'expense-1',
  _id: 'expense-1',
  concept: 'Supermercado',
  amount: 150.75,
  date: '2026-05-01',
  categoryId: TEST_CATEGORY_ID,
  category: sampleCategory,
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

    cy.intercept('GET', '**/api/categories?type=expense*', {
      statusCode: 200,
      body: { success: true, data: [sampleCategory] },
    }).as('getExpenseCategories');

    cy.visitWithSession('/expenses', TEST_TOKEN, TEST_USER);
    cy.wait('@getExpenses');
  });

  it('Debe mostrar la lista de gastos y el total', () => {
    cy.get('[data-testid="expense-list"]').should('be.visible');
    cy.get('[data-testid="expense-item"]').should('have.length', 1);
    cy.get('[data-testid="expense-total"]').invoke('text').should('match', /150[,.]75/);
  });

  it('Debe mostrar un botón accesible para actualizar los datos', () => {
    cy.get('[data-testid="refresh-button"]')
      .should('be.visible')
      .and('have.attr', 'type', 'button')
      .and('have.attr', 'aria-label', 'Actualizar datos')
      .and('contain', 'Actualizar');
  });

  it('Debe traducir el botón Actualizar al cambiar la interfaz a inglés', () => {
    cy.get('.btn-lang-toggle:visible').first().click();

    cy.get('[data-testid="refresh-button"]')
      .should('have.attr', 'aria-label', 'Update data')
      .and('contain', 'Update');
  });

  it('Debe solicitar nuevamente los gastos al pulsar Actualizar', () => {
    cy.intercept('GET', '**/api/expenses*', {
      statusCode: 200,
      body: { success: true, data: [sampleExpense] },
    }).as('refreshExpenses');

    cy.get('[data-testid="refresh-button"]').click();

    cy.wait('@refreshExpenses').its('response.statusCode').should('eq', 200);
  });

  it('Debe pausar el polling con el formulario abierto y reanudarlo al cerrarlo', () => {
    let requestCount = 0;
    let initialRequestCount = 0;
    cy.intercept('GET', '**/api/expenses?page=1*', (request) => {
      requestCount += 1;
      request.reply({ statusCode: 200, body: { success: true, data: [sampleExpense] } });
    }).as('trackedExpenses');

    cy.clock();
    cy.reload();
    cy.wait('@trackedExpenses');
    cy.wait('@trackedExpenses');
    cy.then(() => {
      initialRequestCount = requestCount;
    });

    cy.get('[data-testid="new-expense-button"]').click();
    cy.tick(30000);
    cy.then(() => expect(requestCount).to.eq(initialRequestCount));

    cy.get('[data-testid="expense-cancel"]').click();
    cy.tick(30000);
    cy.wait('@trackedExpenses');
    cy.then(() => expect(requestCount).to.eq(initialRequestCount + 1));
  });

  it('Debe abrir el formulario de nuevo gasto desde la lista', () => {
    cy.get('[data-testid="new-expense-button"]').click();
    cy.get('[data-testid="expense-form"]').should('be.visible');
    cy.get('[data-testid="expense-concept"]').should('be.visible');
  });

  it('Debe crear un gasto con datos validos', () => {
    const expense = testData?.testExpense || {
      concept: 'Compra de prueba',
      amount: 150.75,
      categoryId: TEST_CATEGORY_ID,
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
          categoryId: TEST_CATEGORY_ID,
          category: sampleCategory,
          description: expense.description,
        },
      },
    }).as('createExpense');

    cy.get('[data-testid="new-expense-button"]').click();
    cy.get('[data-testid="expense-concept"]').clear().type(expense.concept);
    cy.get('[data-testid="expense-amount"]').clear().type(String(expense.amount));
    cy.get('[data-testid="expense-category"]').select(TEST_CATEGORY_ID);
    cy.get('[data-testid="expense-date"]').clear().type(expense.date);
    cy.get('[data-testid="expense-notes"]').clear().type(expense.description);
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
    cy.get('[data-testid="expense-concept"]').clear().type('Compra minima');
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

  it('Debe eliminar un gasto confirmando el dialogo del navegador', () => {
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

describe('Búsqueda y Filtros Avanzados de Gastos (E2E)', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/expenses*', {
      statusCode: 200,
      body: { success: true, data: [sampleExpense] },
    }).as('getExpenses');

    cy.intercept('GET', '**/api/categories?type=expense*', {
      statusCode: 200,
      body: { success: true, data: [sampleCategory] },
    }).as('getExpenseCategories');

    cy.visitWithSession('/expenses', TEST_TOKEN, TEST_USER);
    cy.wait('@getExpenses');
  });

  it('Debe enviar el término de búsqueda al backend', () => {
    cy.intercept('GET', '**/api/expenses?*search=Supermercado*', {
      statusCode: 200,
      body: { success: true, data: [sampleExpense] },
    }).as('searchExpenses');

    cy.get('[data-testid="filter-search"]').type('Supermercado');
    cy.get('[data-testid="apply-filters"]').click();

    cy.wait('@searchExpenses').its('request.url').should('include', 'search=Supermercado');
    cy.get('[data-testid="expense-item"]').should('have.length', 1);
  });

  it('Debe conservar el filtro activo al actualizar manualmente', () => {
    cy.intercept('GET', '**/api/expenses?*search=Supermercado*', {
      statusCode: 200,
      body: { success: true, data: [sampleExpense] },
    }).as('filteredRefresh');

    cy.get('[data-testid="filter-search"]').type('Supermercado');
    cy.get('[data-testid="apply-filters"]').click();
    cy.wait('@filteredRefresh');

    cy.get('[data-testid="refresh-button"]').click();

    cy.wait('@filteredRefresh')
      .its('request.url')
      .should('include', 'search=Supermercado');
  });

  it('Debe buscar al presionar Enter en el campo de búsqueda', () => {
    cy.intercept('GET', '**/api/expenses?*search=*', {
      statusCode: 200,
      body: { success: true, data: [] },
    }).as('searchExpenses');

    cy.get('[data-testid="filter-search"]').type('inexistente{enter}');

    cy.wait('@searchExpenses');
    cy.get('[data-testid="expense-empty"]').should('be.visible');
  });

  it('Debe aplicar filtros avanzados de monto y orden', () => {
    cy.get('[data-testid="toggle-advanced-filters"]').click();
    cy.get('[data-testid="advanced-filters"]').should('be.visible');

    cy.intercept('GET', '**/api/expenses?*minAmount=100*', {
      statusCode: 200,
      body: { success: true, data: [sampleExpense] },
    }).as('filteredExpenses');

    cy.get('[data-testid="filter-min-amount"]').type('100');
    cy.get('[data-testid="filter-max-amount"]').type('500');
    cy.get('[data-testid="filter-sort"]').select('amount-desc');
    cy.get('[data-testid="apply-filters"]').click();

    cy.wait('@filteredExpenses')
      .its('request.url')
      .should('include', 'minAmount=100')
      .and('include', 'maxAmount=500')
      .and('include', 'sort=amount-desc');
  });

  it('Debe limpiar todos los filtros con el botón Limpiar', () => {
    cy.get('[data-testid="filter-search"]').type('algo');
    cy.get('[data-testid="toggle-advanced-filters"]').click();
    cy.get('[data-testid="filter-min-amount"]').type('50');

    cy.intercept('GET', '**/api/expenses*', {
      statusCode: 200,
      body: { success: true, data: [sampleExpense] },
    }).as('resetExpenses');

    cy.get('[data-testid="clear-filters"]').click();

    cy.wait('@resetExpenses').its('request.url').should('not.include', 'search=');
    cy.get('[data-testid="filter-search"]').should('have.value', '');
    cy.get('[data-testid="filter-min-amount"]').should('have.value', '');
  });
});
