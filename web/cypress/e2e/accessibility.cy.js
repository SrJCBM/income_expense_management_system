describe('Accessibility smoke', () => {
  it('Login page should expose a proper form structure', () => {
    cy.visit('/#/login');
    cy.get('[role="main"]').should('exist');
    // El .auth-card tiene una animación de entrada (slideUpFade, 350ms) que anima
    // opacity 0 -> 1. Si axe escanea a mitad de la animación, el texto muestra un
    // contraste transitorio más bajo y el chequeo es un falso positivo (no refleja
    // el estado final, estable, de la UI). Esperamos a que termine antes de auditar.
    cy.wait(400);
    cy.auditA11y();
  });

  it('Register page should expose a proper form structure', () => {
    cy.visit('/#/register');
    cy.get('[role="main"]').should('exist');
    // Ver comentario equivalente en el test de Login: se espera a que termine la
    // animación de entrada del formulario antes de auditar accesibilidad.
    cy.wait(400);
    cy.auditA11y();
  });

  it('Dashboard should keep landmarks and buttons accessible', () => {
    cy.visitWithSession('/');
    cy.get('[data-testid="dashboard-balance"]').should('be.visible');
    cy.auditA11y();
  });
});
