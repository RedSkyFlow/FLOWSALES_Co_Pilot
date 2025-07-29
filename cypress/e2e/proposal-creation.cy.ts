/**
 * @fileoverview End-to-end (E2E) test for the Proposal Creation Wizard.
 *
 * This test simulates a user creating a new proposal, adding line items,
 * and saving it as a draft.
 */
describe('Proposal Creation Journey', () => {

  beforeEach(() => {
    // Programmatically log in and ensure some products exist in the database
    cy.login('sales-user@example.com', 'password');
    cy.seed('products', [{ id: 'prod-001', name: 'Basic Widget', price: 100 }]);
    cy.visit('/proposals/new');
  });

  it('should allow a user to create a new proposal draft', () => {
    // 1. Fill in the basic proposal details
    cy.get('input[name="title"]').type('New Quarterly Proposal');
    cy.get('[data-testid="client-select"]').click().type('Test Client{enter}');

    // 2. Add a product to the proposal
    cy.contains('Add Product').click();
    cy.get('[data-testid="product-select"]').click().type('Basic Widget{enter}');
    cy.get('input[name="quantity"]').type('5');
    
    // 3. Verify that the line item total and proposal total are calculated correctly
    cy.get('[data-testid="line-item-total"]').should('contain', '$500.00');
    cy.get('[data-testid="proposal-total"]').should('contain', '$500.00');

    // 4. Save the proposal draft
    cy.contains('Save Draft').click();

    // 5. Verify redirection to the newly created proposal's page
    cy.url().should('include', '/proposals/');
    cy.contains('New Quarterly Proposal').should('be.visible');
    cy.contains('Draft').should('be.visible');
  });

  it('should apply dependency rules when adding products', () => {
    // 1. Seed the database with a dependency rule
    cy.seed('rules', [{ type: 'dependency', productIds: ['prod-001', 'prod-002'] }]);
    cy.seed('products', [{ id: 'prod-002', name: 'Required Add-on', price: 50 }]);
    
    // 2. Add the initial product that has a dependency
    cy.contains('Add Product').click();
    cy.get('[data-testid="product-select"]').click().type('Basic Widget{enter}');

    // 3. Verify that the dependent product was automatically added as a new line item
    cy.get('table').find('tr').should('have.length', 2); // Two products in the table
    cy.contains('Required Add-on').should('be.visible');

    // 4. Verify that the total price reflects both items
    cy.get('[data-testid="proposal-total"]').should('contain', '$150.00');
  });
});
