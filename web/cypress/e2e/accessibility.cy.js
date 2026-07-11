describe('Accessibility smoke', () => {
  it('Login page should expose a proper form structure', () => {
    cy.visit('/#/login');
    cy.get('[role="main"]').should('exist');
    cy.auditA11y();
  });

  it('Register page should expose a proper form structure', () => {
    cy.visit('/#/register');
    cy.get('[role="main"]').should('exist');
    cy.auditA11y();
  });

  it('Dashboard should keep landmarks and buttons accessible', () => {
    cy.visitWithSession('/');
    cy.get('[data-testid="dashboard-balance"]').should('be.visible');
    cy.auditA11y();
  });
});
