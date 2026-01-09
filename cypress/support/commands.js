// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Custom command to login a user
 * @example cy.login('user@example.com', 'password123')
 */
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/auth');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  // Wait for navigation after login
  cy.url().should('not.include', '/auth');
});

/**
 * Custom command to logout
 * @example cy.logout()
 */
Cypress.Commands.add('logout', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

/**
 * Custom command to wait for API calls to complete
 * @example cy.waitForApi()
 */
Cypress.Commands.add('waitForApi', () => {
  cy.wait(1000); // Adjust based on your API response times
});

/**
 * Custom command to check if element is visible in viewport
 * @example cy.get('.element').shouldBeVisible()
 */
Cypress.Commands.add('shouldBeVisible', { prevSubject: true }, subject => {
  cy.wrap(subject).should('be.visible');
});
