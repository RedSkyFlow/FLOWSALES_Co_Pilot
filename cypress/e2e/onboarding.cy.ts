/**
 * @fileoverview End-to-end (E2E) test for the full Onboarding Engine journey.
 *
 * This test simulates a 'Pro' tier user going through the entire
 * "AI-Guided Setup" process.
 */
describe('Onboarding Engine Journey', () => {

  beforeEach(() => {
    // Programmatically log in as a 'pro' tier user before each test
    cy.login('pro-user@example.com', 'password');
    cy.visit('/settings/onboarding');
  });

  it('should allow a user to analyze a website and save brand assets', () => {
    // 1. Enter a URL into the website analysis input
    cy.get('input[type="url"]').type('https://example.com');
    // 2. Click the "Scrape Website" button
    cy.contains('Scrape Website').click();
    // 3. Verify that a success toast appears with scraping results
    cy.contains('Scraping Complete').should('be.visible');
    // (Optional) Verify that the assets were saved in a mock Firestore database
  });

  it('should allow a user to upload a product catalog and see the results', () => {
    // 1. Attach a fixture file (e.g., 'sample-catalog.pdf') to the file input
    cy.get('input[type="file"]').first().attachFile('sample-catalog.pdf');
    // 2. Click the "Analyze Document" button
    cy.contains('Analyze Document').click();
    // 3. Verify the "Verify and Approve Configuration" section appears
    cy.contains('Verify and Approve Configuration').should('be.visible');
    // 4. Check that the extracted products and rules tables are populated
    cy.get('table').find('tr').should('have.length.greaterThan', 1);
  });
  
  it('should allow a user to approve a new product configuration', () => {
    // This test would build on the previous one
    // 1. After analysis, click the "Approve & Save Configuration" button
    cy.contains('Approve & Save Configuration').click();
    // 2. Verify that a success toast appears
    cy.contains('Configuration Saved!').should('be.visible');
    // 3. Verify that the verification tables disappear from the UI
    cy.contains('Verify and Approve Configuration').should('not.exist');
  });

  it('should allow a user to create a new template from a document', () => {
    // 1. Attach a fixture file (e.g., 'sample-proposal.docx') to the template file input
    cy.get('input[type="file"]').last().attachFile('sample-proposal.docx');
    // 2. Click the "Create Template" button
    cy.contains('Create Template').click();
    // 3. Verify a success toast that includes the new template ID
    cy.contains('Template Created').should('be.visible');
    cy.contains('template_').should('be.visible'); // Check for the ID prefix
  });
});
