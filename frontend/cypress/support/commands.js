const API_URL = Cypress.env('apiUrl') || 'http://localhost:3001/api';

/**
 * Seed auth session via localStorage — bypasses the login UI.
 * Mirrors authService.js keys: 'authToken' / 'authUser'.
 */
Cypress.Commands.add('seedSession', (token, user) => {
  cy.window().then((win) => {
    win.localStorage.setItem('authToken', token);
    win.localStorage.setItem('authUser', JSON.stringify(user));
  });
});

/**
 * Log in via the UI login form.
 */
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').clear().type(email);
  cy.get('[data-testid="password-input"]').clear().type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('not.include', '/login');
});

/**
 * Log out via the UI logout button.
 */
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

/**
 * Reset test data through the backend test-support endpoint.
 * Only available when the server runs in test mode.
 */
Cypress.Commands.add('clearDatabase', () => {
  cy.request({
    method: 'POST',
    url: `${API_URL}/test/reset`,
    failOnStatusCode: false,
  });
});

/**
 * Shorthand for selecting elements by data-test attribute.
 */
Cypress.Commands.add('getByDataTest', (testId) => {
  return cy.get(`[data-testid="${testId}"]`);
});

/**
 * Run an axe accessibility audit on the current page.
 * Wraps the command provided by cypress-axe without shadowing it.
 */
Cypress.Commands.add('auditA11y', (context = null, options = {}) => {
  cy.injectAxe();
  const target = context || 'body';

  cy.get(target)
    .then(($target) => cy.window().then((win) => win.axe.run($target[0], options)))
    .then(({ violations }) => {
    violations.forEach((violation) => {
      const nodes = violation.nodes.map((n) => n.target).join(', ');
      cy.log(`[a11y] ${violation.id} — ${violation.description} | nodes: ${nodes}`);
    });
  });
});
