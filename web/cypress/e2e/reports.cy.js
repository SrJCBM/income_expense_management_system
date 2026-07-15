describe('Análisis y Reportes', () => {
  beforeEach(() => {
    // Mockea todos los endpoints protegidos (incluye reports/yearly, que Reports.jsx
    // llama para alimentar ReportCharts) para evitar un auto-logout por 401.
    cy.mockProtectedApi();

    // Interceptar llamadas de API para reportes
    cy.intercept('GET', '**/api/reports/filters*', {
      statusCode: 200,
      body: { data: { years: [2024], monthsByYear: { 2024: [1, 2, 3, 4, 5] }, hasData: true, suggestedYear: 2024, suggestedMonth: 5 } }
    }).as('getReportFilters');
    cy.intercept('GET', '**/api/reports/summary*', {
      statusCode: 200,
      body: {
        data: {
          totalIncome: 5000,
          totalExpense: 2000,
          balance: 3000,
          expensesByCategory: [{ name: 'Alimentación', amount: 2000, percentage: 100, color: '#ff0000' }]
        }
      }
    }).as('getSummary');
    cy.intercept('GET', '**/api/auth/me', { statusCode: 200, body: { id: '1', name: 'Test User' } }).as('getUser');

    cy.visit('/#/reports', {
      onBeforeLoad(win) {
        win.localStorage.setItem('authToken', 'fake-jwt-token-cypress');
        win.localStorage.setItem('authUser', JSON.stringify({ id: 1, name: 'Test User' }));
      }
    });
  });

  it('debería mostrar el resumen mensual correctamente', () => {
    cy.wait('@getReportFilters');
    cy.wait('@getSummary');

    cy.get('[data-testid="summary-income"]').should('contain.text', 'Ingresos');
    cy.get('[data-testid="summary-expense"]').should('contain.text', 'Gastos');
    cy.get('[data-testid="summary-balance"]').should('contain.text', 'Balance Neto');

    // Comprobar que al menos hay una categoría listada en los gastos
    cy.get('[data-testid="category-bar-item"]').should('have.length.at.least', 1);
  });

  it('debería permitir cambiar el mes y el año actualizando los datos', () => {
    cy.wait('@getReportFilters');
    cy.wait('@getSummary');

    cy.intercept('GET', '**/api/reports/summary?*month=1*').as('getJanuarySummary');

    // Cambiamos el mes y verificamos que se dispare otra llamada
    cy.get('[data-testid="report-month-select"]').select('1'); // Enero, si está disponible en el fixture

    // Puede existir una revalidación por foco en paralelo; esperamos la consulta específica de enero.
    cy.wait('@getJanuarySummary').its('request.url').should('include', 'month=1');
  });

  it('debería tener la funcionalidad de exportar PDF y Excel sin errores de UI', () => {
    cy.wait('@getReportFilters');
    cy.wait('@getSummary');

    // Hacemos clic en exportar a PDF
    cy.get('[data-testid="export-pdf-button"]').click();
    
    // Verificamos que no se haya roto la UI
    cy.get('.reports-container').should('be.visible');

    // Hacemos clic en exportar a Excel
    cy.get('[data-testid="export-excel-button"]').click();
    
    // Verificamos que no se haya roto la UI
    cy.get('.reports-container').should('be.visible');
  });
});
