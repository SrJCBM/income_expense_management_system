/**
 * E2E tests — Authentication Flow
 *
 * Covers: Registration · Login · Logout · Route protection
 *
 * API intercepts use glob patterns so the baseUrl in VITE_API_URL doesn't break tests.
 * localStorage keys match authService.js: 'authToken' / 'authUser'.
 * The protected dashboard lives at '/' (PrivateRoute → Layout → Dashboard).
 */

const FAKE_TOKEN = 'fake-jwt-token-cypress';
const FAKE_USER  = { id: 1, name: 'Test User', email: 'testuser@example.com' };

const loginSuccess = (overrides = {}) => ({
  statusCode: 200,
  body: {
    success: true,
    data: { token: FAKE_TOKEN, user: FAKE_USER },
    ...overrides,
  },
});

// ---------------------------------------------------------------------------
describe('Authentication Flow', () => {
  let td; // testData fixture

  before(() => {
    cy.fixture('testData').then((data) => {
      td = data;
    });
  });

  // =========================================================================
  describe('Registration', () => {
    beforeEach(() => {
      cy.visit('/register');
    });

    // --- Form visibility ---------------------------------------------------
    it('Debe mostrar el formulario de registro', () => {
      cy.getByDataTest('name-input').should('be.visible');
      cy.getByDataTest('email-input').should('be.visible');
      cy.getByDataTest('password-input').should('be.visible');
      cy.getByDataTest('confirm-password-input').should('be.visible');
      cy.getByDataTest('register-button')
        .should('be.visible')
        .and('contain.text', 'Crear Cuenta');
    });

    // --- Happy path --------------------------------------------------------
    it('Debe registrar un nuevo usuario con datos válidos', () => {
      cy.intercept('POST', '**/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          message: 'Usuario registrado exitosamente',
          data: { token: FAKE_TOKEN, user: { ...FAKE_USER, name: td.testUser.name, email: td.testUser.email } },
        },
      }).as('registerRequest');

      cy.getByDataTest('name-input').type(td.testUser.name);
      cy.getByDataTest('email-input').type(td.testUser.email);
      cy.getByDataTest('password-input').type(td.testUser.password);
      cy.getByDataTest('confirm-password-input').type(td.testUser.password);
      cy.getByDataTest('register-button').click();

      cy.wait('@registerRequest').its('request.body').should('deep.include', {
        name: td.testUser.name,
        email: td.testUser.email,
      });
    });

    it('Debe redirigir a / (dashboard) después del registro exitoso', () => {
      cy.intercept('POST', '**/auth/register', {
        statusCode: 201,
        body: { success: true, data: { token: FAKE_TOKEN, user: FAKE_USER } },
      }).as('registerOk');

      cy.getByDataTest('name-input').type(td.testUser.name);
      cy.getByDataTest('email-input').type(td.testUser.email);
      cy.getByDataTest('password-input').type(td.testUser.password);
      cy.getByDataTest('confirm-password-input').type(td.testUser.password);
      cy.getByDataTest('register-button').click();

      cy.wait('@registerOk');
      cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
      cy.contains('Panel de Control').should('be.visible');
    });

    // --- Error: duplicate email -------------------------------------------
    it('Debe mostrar error si el email ya existe', () => {
      cy.intercept('POST', '**/auth/register', {
        statusCode: 409,
        body: { success: false, message: 'El email ya está registrado' },
      }).as('emailExists');

      cy.getByDataTest('name-input').type(td.testUser.name);
      cy.getByDataTest('email-input').type(td.testUser.email);
      cy.getByDataTest('password-input').type(td.testUser.password);
      cy.getByDataTest('confirm-password-input').type(td.testUser.password);
      cy.getByDataTest('register-button').click();

      cy.wait('@emailExists');
      cy.getByDataTest('error-message')
        .should('be.visible')
        .and('contain.text', 'El email ya está registrado');
      cy.url().should('include', '/register');
    });

    // --- Error: password mismatch (client-side) ----------------------------
    it('Debe mostrar error si las contraseñas no coinciden', () => {
      cy.getByDataTest('name-input').type(td.testUser.name);
      cy.getByDataTest('email-input').type(td.testUser.email);
      cy.getByDataTest('password-input').type('Password123!');
      cy.getByDataTest('confirm-password-input').type('OtroPassword456!');
      cy.getByDataTest('register-button').click();

      cy.get('[role="alert"]').should('contain.text', 'Las contraseñas no coinciden');
      cy.url().should('include', '/register');
    });

    // --- Error: weak password (client-side) --------------------------------
    it('Debe mostrar error si la contraseña es débil (< 6 caracteres)', () => {
      cy.getByDataTest('name-input').type(td.testUser.name);
      cy.getByDataTest('email-input').type(td.testUser.email);
      cy.getByDataTest('password-input').type('abc');
      cy.getByDataTest('confirm-password-input').type('abc');
      cy.getByDataTest('register-button').click();

      cy.get('[role="alert"]').should('contain.text', 'al menos 6 caracteres');
      cy.url().should('include', '/register');
    });

    // --- Accessibility attributes -----------------------------------------
    it('Los campos deben tener atributos ARIA accesibles', () => {
      cy.getByDataTest('name-input').should('have.attr', 'aria-required', 'true');
      cy.getByDataTest('email-input')
        .should('have.attr', 'type', 'email')
        .and('have.attr', 'aria-required', 'true');
      cy.getByDataTest('password-input')
        .should('have.attr', 'type', 'password')
        .and('have.attr', 'aria-required', 'true');
      cy.getByDataTest('confirm-password-input')
        .should('have.attr', 'type', 'password')
        .and('have.attr', 'aria-required', 'true');
      cy.get('[role="main"]').should('exist');
    });
  });

  // =========================================================================
  describe('Login', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    // --- Form visibility ---------------------------------------------------
    it('Debe mostrar el formulario de login', () => {
      cy.getByDataTest('email-input').should('be.visible');
      cy.getByDataTest('password-input').should('be.visible');
      cy.getByDataTest('login-button')
        .should('be.visible')
        .and('contain.text', 'Iniciar Sesión');
    });

    // --- Happy path --------------------------------------------------------
    it('Debe iniciar sesión con credenciales válidas', () => {
      cy.intercept('POST', '**/auth/login', loginSuccess()).as('loginRequest');

      cy.getByDataTest('email-input').type(td.testUser.email);
      cy.getByDataTest('password-input').type(td.testUser.password);
      cy.getByDataTest('login-button').click();

      cy.wait('@loginRequest').its('request.body').should('deep.equal', {
        email: td.testUser.email,
        password: td.testUser.password,
      });
    });

    it('Debe redirigir a / (dashboard) después del login', () => {
      cy.intercept('POST', '**/auth/login', loginSuccess()).as('loginOk');

      cy.getByDataTest('email-input').type(td.testUser.email);
      cy.getByDataTest('password-input').type(td.testUser.password);
      cy.getByDataTest('login-button').click();

      cy.wait('@loginOk');
      cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
      cy.contains('Panel de Control').should('be.visible');
    });

    // --- Error: wrong credentials ------------------------------------------
    it('Debe mostrar error con credenciales inválidas', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 401,
        body: { success: false, message: 'Credenciales inválidas. Verifica tu email o contraseña.' },
      }).as('loginFail');

      cy.getByDataTest('email-input').type('notexist@example.com');
      cy.getByDataTest('password-input').type('wrongpassword');
      cy.getByDataTest('login-button').click();

      cy.wait('@loginFail');
      cy.getByDataTest('error-message')
        .should('be.visible')
        .and('contain.text', 'Credenciales inválidas');
      cy.url().should('include', '/login');
    });

    // --- Error: empty fields (client-side) ---------------------------------
    it('Debe mostrar error si el email está vacío', () => {
      cy.getByDataTest('password-input').type(td.testUser.password);
      cy.getByDataTest('login-button').click();

      cy.get('[role="alert"]').should('contain.text', 'completa todos los campos');
    });

    it('Debe mostrar error si la contraseña está vacía', () => {
      cy.getByDataTest('email-input').type(td.testUser.email);
      cy.getByDataTest('login-button').click();

      cy.get('[role="alert"]').should('contain.text', 'completa todos los campos');
    });

    // --- Session persistence -----------------------------------------------
    it('Debe persistir la sesión al recargar la página', () => {
      cy.intercept('POST', '**/auth/login', loginSuccess()).as('loginPersist');

      cy.getByDataTest('email-input').type(td.testUser.email);
      cy.getByDataTest('password-input').type(td.testUser.password);
      cy.getByDataTest('login-button').click();
      cy.wait('@loginPersist');

      // Confirm token was persisted
      cy.window().then((win) => {
        expect(win.localStorage.getItem('authToken')).to.equal(FAKE_TOKEN);
      });

      cy.reload();

      // PrivateRoute reads localStorage on mount → stays authenticated
      cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
      cy.contains('Panel de Control').should('be.visible');
    });
  });

  // =========================================================================
  describe('Logout', () => {
    beforeEach(() => {
      cy.seedSession(FAKE_TOKEN, FAKE_USER);
      cy.visit('/');
      cy.contains('Panel de Control').should('be.visible');
    });

    // --- Logout button visible ---------------------------------------------
    it('Debe mostrar el botón de logout en el dashboard', () => {
      cy.getByDataTest('logout-button')
        .should('be.visible')
        .and('contain.text', 'Cerrar Sesión');
    });

    // --- Happy path logout -------------------------------------------------
    it('Debe limpiar la sesión al hacer click en logout', () => {
      cy.intercept('POST', '**/auth/logout', { statusCode: 200, body: { success: true } }).as('logoutRequest');

      cy.getByDataTest('logout-button').click();
      cy.wait('@logoutRequest');

      cy.window().then((win) => {
        expect(win.localStorage.getItem('authToken')).to.be.null;
        expect(win.localStorage.getItem('authUser')).to.be.null;
      });
    });

    it('Debe redirigir a /login después del logout', () => {
      cy.intercept('POST', '**/auth/logout', { statusCode: 200, body: { success: true } }).as('logoutRedirect');

      cy.getByDataTest('logout-button').click();
      cy.wait('@logoutRedirect');

      cy.url().should('include', '/login');
    });

    // --- Route protection --------------------------------------------------
    it('No debe permitir acceder al dashboard sin token (redirige a /login)', () => {
      cy.clearLocalStorage();
      cy.visit('/');
      cy.url().should('include', '/login');
    });

    it('No debe mostrar el dashboard si el token es eliminado y se recarga', () => {
      cy.window().then((win) => {
        win.localStorage.removeItem('authToken');
        win.localStorage.removeItem('authUser');
      });
      cy.reload();
      cy.url().should('include', '/login');
    });
  });
});
