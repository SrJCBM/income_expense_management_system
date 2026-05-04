/**
 * E2E accessibility smoke tests.
 * Uses cypress-axe through the custom `auditA11y` command.
 */

const TEST_TOKEN = 'fake-jwt-token-cypress';
const TEST_USER = { id: 1, name: 'Test User', email: 'testuser@example.com' };

const visitWithSession = (path) => {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem('authToken', TEST_TOKEN);
      win.localStorage.setItem('authUser', JSON.stringify(TEST_USER));
    },
  });
};

describe('Accessibility smoke', () => {
  it('Login page should expose a proper form structure', () => {
    cy.visit('/login');
    cy.get('[role="main"]').should('exist');
    cy.auditA11y();
  });

  it('Register page should expose a proper form structure', () => {
    cy.visit('/register');
    cy.get('[role="main"]').should('exist');
    cy.auditA11y();
  });

  it('Dashboard should keep landmarks and buttons accessible', () => {
    visitWithSession('/');
    cy.contains('Panel de Control').should('be.visible');
    cy.auditA11y();
  });
});
