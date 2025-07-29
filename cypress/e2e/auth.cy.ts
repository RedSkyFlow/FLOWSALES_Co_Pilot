/**
 * @fileoverview End-to-end (E2E) test for the User Authentication journey.
 *
 * This test requires a full E2E testing framework like Cypress or Playwright.
 * It simulates a user signing up, logging out, and logging back in.
 */
describe('User Authentication Journey', () => {

  const testUser = {
    email: `test-user-${Date.now()}@example.com`,
    password: 'SecurePassword123',
  };

  it('should allow a new user to sign up and see the onboarding page', () => {
    // 1. Visit the home page (which should redirect to /login)
    cy.visit('/');
    cy.url().should('include', '/login');

    // 2. Click the "Sign Up" or "Create Account" link
    cy.contains('Sign Up').click();
    
    // 3. Fill out the sign-up form and submit
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();

    // 4. Verify redirection to the main dashboard or onboarding page
    cy.url().should('match', /\/(dashboard|settings\/onboarding)/);
    cy.contains('Welcome').should('be.visible');
  });

  it('should allow an existing user to log out', () => {
    // 1. Log in programmatically (to ensure a clean state)
    cy.login(testUser.email, testUser.password);
    cy.visit('/dashboard');

    // 2. Find and click the user profile/logout button
    cy.get('[data-testid="user-menu"]').click();
    cy.contains('Log Out').click();

    // 3. Verify the user is redirected to the login page
    cy.url().should('include', '/login');
  });

  it('should allow an existing user to log in', () => {
    // 1. Visit the login page
    cy.visit('/login');

    // 2. Fill out the login form and submit
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    // 3. Verify redirection to the dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });
});
