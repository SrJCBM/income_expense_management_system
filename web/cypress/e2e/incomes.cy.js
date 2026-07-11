const TEST_TOKEN = 'fake-jwt-token-cypress';
const TEST_USER = { id: 1, name: 'Test User', email: 'testuser@example.com' };
const TEST_CATEGORY_ID = '775f1a111111111111111111';

const sampleCategory = {
  id: TEST_CATEGORY_ID,
  _id: TEST_CATEGORY_ID,
  name: 'Salario',
  type: 'income',
  color: '#10b981',
  icon: '💰',
};

const sampleIncome = {
  id: 'income-1',
  _id: 'income-1',
  concept: 'Salario Mensual',
  amount: 2500.00,
  date: '2026-05-01T12:00:00',
  categoryId: TEST_CATEGORY_ID,
  category: sampleCategory,
  description: 'Pago de nómina de mayo',
};

describe('CRUD de Ingresos (E2E)', () => {
  let testData;

  before(() => {
    cy.fixture('testData').then((data) => {
      testData = data;
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '**/api/incomes*', {
      statusCode: 200,
      body: { success: true, data: [sampleIncome] },
    }).as('getIncomes');

    cy.intercept('GET', '**/api/categories?type=income*', {
      statusCode: 200,
      body: { success: true, data: [sampleCategory] },
    }).as('getIncomeCategories');

    cy.visitWithSession('/incomes', TEST_TOKEN, TEST_USER);
    cy.wait('@getIncomes');
  });

  it('Debe mostrar la lista de ingresos y la tabla con los datos correctos', () => {
    cy.get('[data-testid="income-list"]').should('be.visible');
    cy.get('[data-testid="income-item"]').should('have.length', 1);
    cy.get('[data-testid="income-item"]').first().should('contain', 'Salario Mensual');
    // formatCurrency con es-MX da "$2,500.00"; verificamos partes numéricas independientemente del separador
    cy.get('[data-testid="income-item"]').first()
      .find('td.positive').invoke('text').should('match', /\+.+2.500/);
  });

  it('Debe abrir el formulario de nuevo ingreso desde la lista', () => {
    cy.get('[data-testid="new-income-button"]').click();
    cy.get('[data-testid="income-form"]').should('be.visible');
    cy.get('[data-testid="income-concept"]').should('be.visible');
  });

  it('Debe crear un ingreso con datos validos', () => {
    const income = {
      concept: 'Proyecto Freelance',
      amount: 800.50,
      categoryId: TEST_CATEGORY_ID,
      date: '2026-05-10',
      description: 'Desarrollo web completado',
    };

    cy.intercept('POST', '**/api/incomes*', {
      statusCode: 201,
      body: {
        success: true,
        message: 'Ingreso creado exitosamente',
        data: {
          id: 'income-created',
          concept: income.concept,
          amount: Number(income.amount),
          date: `${income.date}T12:00:00`,
          categoryId: TEST_CATEGORY_ID,
          category: sampleCategory,
          description: income.description,
        },
      },
    }).as('createIncome');

    cy.get('[data-testid="new-income-button"]').click();
    cy.get('[data-testid="income-concept"]').clear().type(income.concept);
    cy.get('[data-testid="income-amount"]').clear().type(String(income.amount));
    cy.get('[data-testid="income-category"]').select(TEST_CATEGORY_ID);
    cy.get('[data-testid="income-date"]').clear().type(income.date);
    cy.get('[data-testid="income-notes"]').clear().type(income.description);
    cy.get('[data-testid="income-submit"]').click();

    cy.wait('@createIncome').its('response.statusCode').should('eq', 201);
    cy.get('[data-testid="success-message"]').should('contain', 'creado');
    cy.get('[data-testid="income-list"]').should('contain', income.concept);
  });

  it('Debe validar que los campos obligatorios sean requeridos', () => {
    cy.get('[data-testid="new-income-button"]').click();
    // Intenta enviar vacio
    cy.get('[data-testid="income-submit"]').click();
    cy.get('[data-testid="income-error-general"]').should('be.visible')
      .and('contain', 'Completa concepto, monto, fecha y categoría.');
  });

  it('Debe validar que el monto sea mayor a 0', () => {
    cy.get('[data-testid="new-income-button"]').click();
    cy.get('[data-testid="income-concept"]').clear().type('Ingreso de prueba');
    cy.get('[data-testid="income-amount"]').clear().type('-150');
    cy.get('[data-testid="income-category"]').select(TEST_CATEGORY_ID);
    cy.get('[data-testid="income-submit"]').click();

    cy.get('[data-testid="income-error-amount"]').should('be.visible')
      .and('contain', 'mayor a 0');
  });

  it('Debe editar un ingreso desde la lista', () => {
    cy.intercept('PUT', '**/api/incomes/*', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Ingreso actualizado exitosamente',
        data: {
          ...sampleIncome,
          concept: 'Salario de Mayo (Editado)',
          amount: 2700.00,
        },
      },
    }).as('updateIncome');

    cy.get('[data-testid="edit-income"]').first().click();
    cy.get('[data-testid="income-form"]').should('be.visible');
    
    // Validar que se precarga el valor actual
    cy.get('[data-testid="income-concept"]').should('have.value', 'Salario Mensual');
    
    // Editar
    cy.get('[data-testid="income-concept"]').clear().type('Salario de Mayo (Editado)');
    cy.get('[data-testid="income-amount"]').clear().type('2700');
    cy.get('[data-testid="income-submit"]').click();

    cy.wait('@updateIncome').its('response.statusCode').should('eq', 200);
    cy.get('[data-testid="success-message"]').should('contain', 'actualizado');
    cy.get('[data-testid="income-list"]').should('contain', 'Salario de Mayo (Editado)');
  });

  it('Debe eliminar un ingreso confirmando el dialogo del navegador', () => {
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });

    cy.intercept('DELETE', '**/api/incomes/*', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Ingreso eliminado exitosamente',
      },
    }).as('deleteIncome');

    cy.get('[data-testid="delete-income"]').first().click();

    cy.wait('@deleteIncome').its('response.statusCode').should('eq', 200);
    cy.get('[data-testid="success-message"]').should('contain', 'eliminado');
  });

  it('Debe verificar que la fecha no se desfase en el guardado y en la edicion', () => {
    // 1. Verificamos que la fecha cargada inicialmente (que vino como '2026-05-01T12:00:00') se muestre como '2026-05-01' en la tabla
    cy.get('[data-testid="income-list"]').within(() => {
      cy.get('tbody tr').first().find('td').first().should('have.text', '2026-05-01');
    });

    // 2. Al editar el registro, la fecha en el input tipo date debe ser exactamente '2026-05-01'
    cy.get('[data-testid="edit-income"]').first().click();
    cy.get('[data-testid="income-date"]').should('have.value', '2026-05-01');

    // 3. Editamos la fecha a '2026-05-15' y guardamos.
    cy.intercept('PUT', '**/api/incomes/*', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Ingreso actualizado exitosamente',
        data: {
          ...sampleIncome,
          date: '2026-05-15T12:00:00',
        },
      },
    }).as('updateIncomeDate');

    cy.get('[data-testid="income-date"]').clear().type('2026-05-15');
    cy.get('[data-testid="income-submit"]').click();

    cy.wait('@updateIncomeDate').then((xhr) => {
      // Validamos que el payload enviado a la API fue con la hora local ajustada a mediodia para evitar desfasamiento
      expect(xhr.request.body.date).to.equal('2026-05-15T12:00:00');
    });

    // 4. Verificamos que la lista refleje exactamente '2026-05-15' sin desfasamiento por zona horaria
    cy.get('[data-testid="income-list"]').within(() => {
      cy.get('tbody tr').first().find('td').first().should('have.text', '2026-05-15');
    });
  });
});
