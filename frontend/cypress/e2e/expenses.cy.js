/**
 * E2E tests — Expenses CRUD
 *
 * Rutas utilizadas:
 * - /dashboard - donde se muestran los gastos
 * - /expenses - lista de gastos
 * - /expenses/new - formulario para crear gasto
 * - /expenses/:id/edit - formulario para editar gasto
 */

describe('CRUD de Gastos (E2E)', () => {
  beforeEach(() => {
    // 1. Setup: Registrar usuario y sembrar sesión programáticamente para estabilizar y acelerar los tests
    cy.fixture('testData').as('testData').then((data) => {
      const email = data.testUser?.email || 'demo@example.com';
      const password = data.testUser?.password || 'Password123';
      const name = data.testUser?.name || 'Test User';
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5000/api';
      
      // Intentar registrar al usuario (ignora el error 409 si ya está registrado)
      cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/register`,
        body: { name, email, password },
        failOnStatusCode: false
      }).then(() => {
        // Hacer login directamente a la API e iniciar sesión en el navegador
        cy.request('POST', `${apiUrl}/auth/login`, { email, password }).then((res) => {
          const { token, user } = res.body.data;
          cy.seedSession(token, user);
        });
      });
    });
  });

  describe('1. Crear Gasto', () => {
    it('Debe navegar a la página de crear gasto y mostrar el formulario', () => {
      cy.visit('/dashboard');
      
      // Navegar a lista de gastos y luego a crear
      cy.get('[data-testid="nav-expenses"]').click();
      cy.get('[data-testid="new-expense-button"]').click();
      
      cy.url().should('include', '/expenses/new');
      cy.get('[data-testid="expense-form"]').should('be.visible');
    });

    it('Debe crear un gasto con datos válidos, mostrar éxito y redirigir', function() {
      cy.visit('/expenses/new');
      
      // Datos proporcionados por el fixture (o fallback en su defecto)
      const expense = this.testData?.testExpense || {
        amount: '150.00',
        categoryName: 'Alimentación',
        date: '2026-05-01',
        description: 'Compra de prueba'
      };
      
      cy.get('[data-testid="expense-amount"]').type(expense.amount);
      cy.get('[data-testid="expense-category"]').select(expense.categoryName || 'Alimentación');
      cy.get('[data-testid="expense-date"]').type(expense.date);
      cy.get('[data-testid="expense-description"]').type(expense.description);
      
      cy.intercept('POST', '**/api/expenses*').as('createExpense');
      
      cy.get('[data-testid="expense-submit"]').click();
      
      // Loading state mientras se procesa
      cy.get('[data-testid="expense-submit"]').should('be.disabled');
      
      cy.wait('@createExpense').its('response.statusCode').should('be.oneOf', [200, 201]);
      
      // Debe mostrar mensaje de éxito
      cy.get('[data-testid="success-message"]').should('be.visible').and('contain', 'creado');
      
      // Debe redirigir a la lista de gastos
      cy.url().should('match', /\/expenses$/);
      
      // El nuevo gasto debe aparecer en la lista
      cy.get('[data-testid="expense-list"]').should('be.visible');
      cy.get('[data-testid="expense-item"]').should('contain', expense.description);
    });

    it('Debe validar que monto > 0 (mostrar error si es negativo)', () => {
      cy.visit('/expenses/new');
      
      cy.get('[data-testid="expense-amount"]').type('-50');
      cy.get('[data-testid="expense-submit"]').click();
      
      cy.get('[data-testid="error-amount"]').should('be.visible');
    });

    it('Debe validar que categoría es requerida', () => {
      cy.visit('/expenses/new');
      
      cy.get('[data-testid="expense-amount"]').type('100');
      cy.get('[data-testid="expense-date"]').type('2026-05-15');
      // Se omite categoría intencionalmente
      
      cy.get('[data-testid="expense-submit"]').click();
      
      cy.get('[data-testid="error-category"]').should('be.visible');
    });
  });

  describe('2. Listar Gastos', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/expenses*').as('getExpenses');
      cy.visit('/expenses');
      cy.wait('@getExpenses');
    });

    it('Debe mostrar lista de gastos del usuario y el total de gastos', () => {
      cy.get('[data-testid="expense-list"]').should('be.visible');
      cy.get('[data-testid="expense-item"]').should('have.length.greaterThan', 0);
      cy.get('[data-testid="expense-total"]').should('be.visible').and('not.be.empty');
    });

    it('Debe permitir filtrar por categoría', () => {
      cy.get('[data-testid="filter-category"]').select('Alimentación');
      
      // Asumimos que si no es de aplicación automática, hay un botón:
      cy.get('[data-testid="apply-filters"]').click();
      cy.wait('@getExpenses');
      
      // Valida que el contenedor de lista se actualice
      cy.get('[data-testid="expense-list"]').should('exist');
    });

    it('Debe permitir filtrar por fecha (mes/año)', () => {
      cy.get('[data-testid="filter-month"]').type('2026-05');
      cy.get('[data-testid="apply-filters"]').click();
      cy.wait('@getExpenses');
      
      cy.get('[data-testid="expense-list"]').should('exist');
    });

    it('Debe ordenar por fecha descendente', () => {
      cy.get('[data-testid="expense-item"] [data-testid="expense-date"]').then($dates => {
        if ($dates.length > 1) {
          const dates = $dates.map((i, el) => new Date(el.innerText)).get();
          // Validamos que estén ordenadas del más reciente al más antiguo
          const isDescending = dates.every((date, i) => i === 0 || dates[i - 1] >= date);
          expect(isDescending).to.be.true;
        }
      });
    });
  });

  describe('3. Editar Gasto', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/expenses*').as('getExpenses');
      cy.visit('/expenses');
      cy.wait('@getExpenses');
    });

    it('Debe navegar a la edición desde la lista y cargar datos', () => {
      cy.get('[data-testid="edit-expense"]').first().click();
      
      cy.url().should('match', /\/expenses\/[a-zA-Z0-9_-]+\/edit/);
      
      // Debe cargar los datos actuales en el formulario
      cy.get('[data-testid="expense-form"]').should('be.visible');
      cy.get('[data-testid="expense-amount"]').should('not.have.value', '');
    });

    it('Debe actualizar el monto y la descripción exitosamente', () => {
      cy.get('[data-testid="edit-expense"]').first().click();
      
      cy.intercept('PUT', '**/api/expenses/*').as('updateExpense');
      
      // Editar monto y descripción
      cy.get('[data-testid="expense-amount"]').clear().type('250.75');
      cy.get('[data-testid="expense-description"]').clear().type('Descripción editada por E2E');
      
      cy.get('[data-testid="expense-submit"]').click();
      
      // Loading state mientras se procesa
      cy.get('[data-testid="expense-submit"]').should('be.disabled');
      
      cy.wait('@updateExpense').its('response.statusCode').should('eq', 200);
      
      // Debe mostrar mensaje de éxito
      cy.get('[data-testid="success-message"]').should('be.visible').and('contain', 'actualizado');
      
      // Los cambios deben reflejarse en la lista
      cy.url().should('match', /\/expenses$/);
      cy.get('[data-testid="expense-list"]').should('contain', '250.75');
      cy.get('[data-testid="expense-list"]').should('contain', 'Descripción editada por E2E');
    });
  });

  describe('4. Eliminar Gasto', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/expenses*').as('getExpenses');
      cy.visit('/expenses');
      cy.wait('@getExpenses');
    });

    it('Debe mostrar botón de eliminar, confirmar y borrar exitosamente', () => {
      cy.get('[data-testid="expense-item"]').then($items => {
        const initialCount = $items.length;
        
        cy.intercept('DELETE', '**/api/expenses/*').as('deleteExpense');
        
        // Debe mostrar botón de eliminar en cada gasto
        cy.get('[data-testid="delete-expense"]').first().click();
        
        // Debe confirmar la eliminación (modal)
        cy.get('[data-testid="confirm-delete"]').should('be.visible').click();
        
        cy.wait('@deleteExpense').its('response.statusCode').should('eq', 200);
        
        // Debe mostrar mensaje de éxito
        cy.get('[data-testid="success-message"]').should('be.visible').and('contain', 'eliminado');
        
        // El gasto no debe aparecer en la lista
        if (initialCount > 1) {
          cy.get('[data-testid="expense-item"]').should('have.length', initialCount - 1);
        } else {
          cy.get('[data-testid="expense-item"]').should('not.exist');
        }
      });
    });
  });
});
