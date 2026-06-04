const API_URL = Cypress.env('apiUrl') || 'http://localhost:3001/api';

const DEFAULT_TEST_TOKEN = 'fake-jwt-token-cypress';
const DEFAULT_TEST_USER = { id: 1, name: 'Test User', email: 'testuser@example.com' };

const toHashPath = (path) => {
  if (path.startsWith('/#/')) {
    return path;
  }

  return `/#${path.startsWith('/') ? path : `/${path}`}`;
};

Cypress.Commands.add('mockProtectedApi', () => {
  cy.intercept('GET', '**/api/reports/summary*', {
    statusCode: 200,
    body: {
      success: true,
      data: {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        expensesByCategory: [],
      },
    },
  }).as('getSummary');

  cy.intercept('GET', '**/api/reports/filters*', {
    statusCode: 200,
    body: {
      success: true,
      data: {
        years: [2026],
        monthsByYear: { 2026: [6] },
        suggestedMonth: 6,
        suggestedYear: 2026,
        hasData: false,
      },
    },
  }).as('getReportFilters');
});

Cypress.Commands.add('seedSession', (token, user) => {
  cy.window().then((win) => {
    win.localStorage.setItem('authToken', token || DEFAULT_TEST_TOKEN);
    win.localStorage.setItem('authUser', JSON.stringify(user || DEFAULT_TEST_USER));
  });
});

Cypress.Commands.add('visitWithSession', (path, token = DEFAULT_TEST_TOKEN, user = DEFAULT_TEST_USER) => {
  cy.mockProtectedApi();
  cy.visit(toHashPath(path), {
    onBeforeLoad(win) {
      win.localStorage.setItem('authToken', token);
      win.localStorage.setItem('authUser', JSON.stringify(user));
    },
  });
});

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/#/login');
  cy.get('[data-testid="email-input"]').clear().type(email);
  cy.get('[data-testid="password-input"]').clear().type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('not.include', '/login');
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

Cypress.Commands.add('clearDatabase', () => {
  cy.request({
    method: 'POST',
    url: `${API_URL}/test/reset`,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('getByDataTest', (testId) => {
  return cy.get(`[data-testid="${testId}"]`);
});

Cypress.Commands.add('auditA11y', (context = null, options = {}) => {
  cy.injectAxe();
  const target = context || 'body';

  cy.get(target)
    .then(($target) => cy.window().then((win) => win.axe.run($target[0], options)))
    .then(({ violations }) => {
      violations.forEach((violation) => {
        const nodes = violation.nodes.map((n) => n.target).join(', ');
        cy.log(`[a11y] ${violation.id} - ${violation.description} | nodes: ${nodes}`);
      });

      if (violations.length > 0) {
        return cy
          .writeFile('cypress/a11y-violations.json', violations)
          .then(() => {
            expect(violations, 'accessibility violations').to.have.length(0);
          });
      }

      expect(violations, 'accessibility violations').to.have.length(0);
    });
});
