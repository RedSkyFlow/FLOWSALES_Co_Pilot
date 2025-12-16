
/// <reference types="cypress" />

import { auth } from '@/lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';

// This is required to prevent "global scope" errors
export {};

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to log in a user programmatically.
       * @example cy.login('user@example.com', 'password')
       */
      login(email: string, password?: string): Chainable<void>;

      /**
       * Custom command to attach a file to a DOM element.
       * @example cy.get('input[type="file"]').attachFile('my-file.pdf')
       */
      attachFile(filePath: string): Chainable<void>;
       /**
       * Custom command to seed the database with test data.
       * @example cy.seed('products', [{...}])
       */
      seed(collection: string, data: any[]): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (email: string, password?: string) => {
    // Cypress tasks can be used to run code in Node.js
    cy.task('createCustomToken', email).then((token) => {
        cy.wrap(signInWithCustomToken(auth, token as string), { log: false });
    });
});

Cypress.Commands.add('attachFile', { prevSubject: 'element' }, (subject, filePath: string) => {
    // Implementation for attaching a file
    console.log(`Attaching file ${filePath} to`, subject);
});

Cypress.Commands.add('seed', (collection: string, data: any[]) => {
    // Implementation for seeding the database
    console.log(`Seeding ${collection} with ${data.length} items`);
});
