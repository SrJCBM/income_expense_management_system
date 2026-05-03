import './commands';
import 'cypress-axe';

Cypress.on('uncaught:exception', (err) => {
  // Prevent Cypress from failing on unhandled app exceptions.
  // Return false to ignore the error; return true (or nothing) to fail the test.
  if (
    err.message.includes('ResizeObserver loop limit exceeded') ||
    err.message.includes('Non-Error promise rejection captured')
  ) {
    return false;
  }
});
