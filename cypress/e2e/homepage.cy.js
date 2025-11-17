/**
 * Homepage E2E Tests
 * Tests basic navigation and homepage functionality
 */

describe('Homepage', () => {
  beforeEach(() => {
    // Visit homepage before each test
    cy.visit('/');
  });

  it('should load the homepage', () => {
    cy.url().should('include', '/');
    cy.get('body').should('be.visible');
  });

  it('should have navigation elements', () => {
    // Check for common navigation elements
    // Adjust selectors based on your actual homepage structure
    cy.get('body').should('exist');
  });

  it('should be responsive', () => {
    // Test mobile viewport
    cy.viewport(375, 667);
    cy.get('body').should('be.visible');

    // Test tablet viewport
    cy.viewport(768, 1024);
    cy.get('body').should('be.visible');

    // Test desktop viewport
    cy.viewport(1920, 1080);
    cy.get('body').should('be.visible');
  });
});
