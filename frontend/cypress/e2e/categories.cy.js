describe('Gestión de Categorías', () => {
  beforeEach(() => {
    // Interceptar la carga inicial para evitar requests reales al backend durante setup
    cy.intercept('GET', '**/api/categories', {
      statusCode: 200,
      body: { data: [{ id: 'cat-1', name: 'Alimentación', type: 'expense', icon: '🍽️', color: '#6366f1' }] }
    }).as('getCategories');
    cy.intercept('GET', '**/api/auth/me', { statusCode: 200, body: { id: '1', name: 'Test User' } }).as('getUser');

    cy.visitWithSession('/categories');
    cy.wait('@getCategories');
  });

  it('debería mostrar la lista de categorías correctamente', () => {
    cy.get('[data-testid="category-list"]').should('be.visible');
    cy.get('[data-testid="category-item"]').should('have.length.at.least', 1);
  });

  it('debería crear una categoría nueva exitosamente', () => {
    cy.intercept('POST', '**/api/categories', {
      statusCode: 201,
      body: {
        data: {
          id: 'new-cat-id',
          name: 'Suscripciones',
          type: 'expense',
          color: '#ff0000',
          icon: '🧾',
          description: 'Netflix, Spotify, etc.'
        }
      }
    }).as('addCategory');

    cy.get('[data-testid="new-category-button"]').click();
    
    // Llenar formulario
    cy.get('[data-testid="category-name"]').type('Suscripciones');
    cy.get('[data-testid="category-type"]').select('expense');
    cy.get('[data-testid="category-color"]').invoke('val', '#ff0000').trigger('change');
    cy.get('[data-testid="category-icon"]').select('🧾');
    cy.get('[data-testid="category-description"]').type('Netflix, Spotify, etc.');
    
    cy.get('[data-testid="category-submit"]').click();
    
    cy.wait('@addCategory').its('request.body').should('deep.include', {
      name: 'Suscripciones',
      type: 'expense',
      icon: '🧾'
    });
    
    cy.get('[data-testid="success-message"]').should('contain.text', 'Categoria creada exitosamente');
  });

  it('debería editar una categoría existente', () => {
    cy.intercept('PUT', '**/api/categories/*', {
      statusCode: 200,
      body: {
        data: {
          id: 'cat-1',
          name: 'Alimentación Modificada',
          type: 'expense',
          icon: '🍽️'
        }
      }
    }).as('updateCategory');

    cy.get('[data-testid="edit-category"]').first().click();
    
    cy.get('[data-testid="category-name"]').clear().type('Alimentación Modificada');
    cy.get('[data-testid="category-submit"]').click();
    
    cy.wait('@updateCategory').its('request.body').should('include', {
      name: 'Alimentación Modificada'
    });
    
    cy.get('[data-testid="success-message"]').should('contain.text', 'Categoria actualizada exitosamente');
  });

  it('debería eliminar una categoría tras confirmar', () => {
    cy.intercept('DELETE', '**/api/categories/*', {
      statusCode: 200,
      body: { message: 'Categoría eliminada' }
    }).as('deleteCategory');

    // Stub window.confirm to always return true
    cy.on('window:confirm', () => true);

    cy.get('[data-testid="delete-category"]').first().click();
    
    cy.wait('@deleteCategory');
    cy.get('[data-testid="success-message"]').should('contain.text', 'Categoria eliminada exitosamente');
  });

  it('debería cancelar la creación de una categoría', () => {
    cy.get('[data-testid="new-category-button"]').click();
    cy.get('[data-testid="category-form"]').should('be.visible');
    
    cy.get('[data-testid="category-cancel"]').click();
    cy.get('[data-testid="category-form"]').should('not.exist');
  });

  it('debería validar nombres vacíos', () => {
    cy.get('[data-testid="new-category-button"]').click();
    cy.get('[data-testid="category-submit"]').click();
    
    cy.get('[data-testid="category-error-general"]')
      .should('be.visible')
      .and('contain.text', 'El nombre y tipo de categoria son obligatorios');
  });

  it('debería validar nombres duplicados o inválidos (error del servidor)', () => {
    cy.intercept('POST', '**/api/categories', {
      statusCode: 400,
      body: { message: 'Ya existe una categoría con este nombre.' }
    }).as('addDuplicateCategory');

    cy.get('[data-testid="new-category-button"]').click();
    
    cy.get('[data-testid="category-name"]').type('Alimentación');
    cy.get('[data-testid="category-submit"]').click();
    
    cy.wait('@addDuplicateCategory');
    cy.get('[data-testid="category-error-general"]')
      .should('be.visible')
      .and('contain.text', 'Ya existe una categoría con este nombre.');
  });
});
