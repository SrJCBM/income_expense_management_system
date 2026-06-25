const TEST_TOKEN = 'fake-jwt-token-cypress';
const TEST_USER = { id: 1, name: 'Test User', email: 'testuser@example.com', currency: 'USD' };

const sampleProfile = {
  userId: '1',
  name: 'Test User',
  email: 'testuser@example.com',
  role: 'user',
  currency: 'USD',
  createdAt: '2025-01-15T12:00:00.000Z',
};

describe('Perfil de Usuario (E2E)', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/users/profile', {
      statusCode: 200,
      body: { success: true, data: sampleProfile },
    }).as('getProfile');

    cy.visitWithSession('/profile', TEST_TOKEN, TEST_USER);
    cy.wait('@getProfile');
  });

  it('Debe mostrar la información del perfil', () => {
    cy.get('[data-testid="profile-name"]').should('have.value', 'Test User');
    cy.get('[data-testid="profile-email"]').should('have.value', 'testuser@example.com').and('be.disabled');
    cy.get('[data-testid="profile-currency"]').should('have.value', 'USD');
    cy.get('[data-testid="profile-member-since"]').should('be.visible');
  });

  it('Debe actualizar el nombre y la moneda preferida', () => {
    cy.intercept('PUT', '**/api/users/profile', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: { ...sampleProfile, name: 'Nuevo Nombre', currency: 'EUR' },
      },
    }).as('updateProfile');

    cy.get('[data-testid="profile-name"]').clear().type('Nuevo Nombre');
    cy.get('[data-testid="profile-currency"]').select('EUR');
    cy.get('[data-testid="profile-save"]').click();

    cy.wait('@updateProfile').its('request.body').should('deep.include', {
      name: 'Nuevo Nombre',
      currency: 'EUR',
    });
    cy.get('[data-testid="profile-success"]').should('contain', 'actualizado');
  });

  it('Debe validar el nombre antes de guardar', () => {
    cy.get('[data-testid="profile-name"]').clear().type('A');
    cy.get('[data-testid="profile-save"]').click();

    cy.get('[data-testid="profile-form-error"]').should('be.visible').and('contain', '2 caracteres');
  });

  it('Debe cambiar la contraseña con datos válidos', () => {
    cy.intercept('PUT', '**/api/users/profile/password', {
      statusCode: 200,
      body: { success: true, message: 'Contraseña actualizada exitosamente', data: {} },
    }).as('changePassword');

    cy.get('[data-testid="current-password"]').type('password123');
    cy.get('[data-testid="new-password"]').type('newpassword456');
    cy.get('[data-testid="confirm-password"]').type('newpassword456');
    cy.get('[data-testid="password-save"]').click();

    cy.wait('@changePassword').its('response.statusCode').should('eq', 200);
    cy.get('[data-testid="password-success"]').should('contain', 'actualizada');
  });

  it('Debe validar que las contraseñas nuevas coincidan', () => {
    cy.get('[data-testid="current-password"]').type('password123');
    cy.get('[data-testid="new-password"]').type('newpassword456');
    cy.get('[data-testid="confirm-password"]').type('otrodistinto789');
    cy.get('[data-testid="password-save"]').click();

    cy.get('[data-testid="password-error"]').should('be.visible').and('contain', 'no coinciden');
  });

  it('Debe mostrar el error del backend si la contraseña actual es incorrecta', () => {
    cy.intercept('PUT', '**/api/users/profile/password', {
      statusCode: 401,
      body: { success: false, message: 'La contraseña actual es incorrecta' },
    }).as('changePasswordFail');

    cy.get('[data-testid="current-password"]').type('incorrecta');
    cy.get('[data-testid="new-password"]').type('newpassword456');
    cy.get('[data-testid="confirm-password"]').type('newpassword456');
    cy.get('[data-testid="password-save"]').click();

    cy.wait('@changePasswordFail');
    cy.get('[data-testid="password-error"]').should('contain', 'incorrecta');
  });

  it('La moneda elegida debe reflejarse en otras vistas (gastos)', () => {
    cy.intercept('PUT', '**/api/users/profile', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: { ...sampleProfile, currency: 'EUR' },
      },
    }).as('updateProfile');

    cy.get('[data-testid="profile-currency"]').select('EUR');
    cy.get('[data-testid="profile-save"]').click();
    cy.wait('@updateProfile');
    // Esperar a que la UI confirme el guardado para garantizar que la sesión local ya tiene EUR
    cy.get('[data-testid="profile-success"]').should('be.visible');

    cy.intercept('GET', '**/api/expenses*', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 'expense-1',
            concept: 'Supermercado',
            amount: 100,
            date: '2026-06-01',
            category: { name: 'Alimentacion' },
          },
        ],
      },
    }).as('getExpenses');
    cy.intercept('GET', '**/api/categories?type=expense*', {
      statusCode: 200,
      body: { success: true, data: [] },
    }).as('getCategories');

    cy.visit('/#/expenses');
    cy.wait('@getExpenses');

    // Según los datos ICU del navegador, EUR se muestra como "€" o "EUR"
    cy.get('[data-testid="expense-total"]')
      .invoke('text')
      .should('match', /€|EUR/);
  });
});
