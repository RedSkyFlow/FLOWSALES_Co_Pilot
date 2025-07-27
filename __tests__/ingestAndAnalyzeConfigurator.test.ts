/**
 * @fileoverview Unit tests for the ingestAndAnalyzeConfigurator Genkit flow.
 */

import { ingestAndAnalyzeConfigurator, type DocumentAnalysisOutput } from '../src/ai/flows/ingest-and-analyze-configurator';
import { ai } from '../src/ai/genkit';
import { GenkitError } from 'genkit';
import { doc, getDoc } from 'firebase/firestore';

// Create a shared mock function for the prompt that we can control
const mockPromptFn = jest.fn();

// Mock the entire Genkit AI module
jest.mock('../src/ai/genkit', () => ({
  ai: {
    defineFlow: jest.fn((config, implementation) => implementation),
    // Ensure definePrompt always returns our shared mock function
    definePrompt: jest.fn(() => mockPromptFn),
  },
}));

// Mock Firestore to simulate subscription checks
jest.mock('../src/lib/firebase', () => ({
  db: {}, // Mock the db export
}));

jest.mock('firebase/firestore', () => ({
  getDoc: jest.fn(),
  doc: jest.fn(),
}));


describe('AI Document Intelligence Engine (ingestAndAnalyzeConfiguratorFlow)', () => {

  // Clear mocks before each test to ensure isolation
  beforeEach(() => {
    mockPromptFn.mockClear();
    (getDoc as jest.Mock).mockClear();
  });

  // Test Case 1: Successful AI analysis for a user with a "pro" subscription
  it('should correctly parse a document and extract products and rules for a pro user', async () => {
    const mockOutput: DocumentAnalysisOutput = {
      products: [{ name: 'Test Product', description: 'A great product', basePrice: 100, pricingModel: 'one-time', type: 'product' }],
      rules: [{ name: 'Test Rule', description: 'A critical rule', condition: 'if Test Product', action: 'add another' }],
    };
    
    // Configure our mock AI to return the successful output
    mockPromptFn.mockResolvedValue({ output: mockOutput });

    // Configure our mock Firestore to return a "pro" user
    (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ subscription: { tier: 'pro' } }),
    });

    const result = await ingestAndAnalyzeConfigurator({
      tenantId: 'pro-tenant-id',
      documentDataUri: 'data:text/plain;base64,dGVzdA==', // "test"
    });

    // Assert that the results are what we expect
    expect(result.products).toHaveLength(1);
    expect(result.products[0].name).toBe('Test Product');
    expect(result.rules).toHaveLength(1);
    expect(result.rules[0].name).toBe('Test Rule');
  });

  // Test Case 2: Permission error for a user with a "basic" subscription
  it('should throw a permission error if the user\'s subscription tier is not pro or enterprise', async () => {
    // Configure our mock Firestore to return a "basic" user
    (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ subscription: { tier: 'basic' } }),
    });

    // We expect this call to fail (reject) with a specific error
    await expect(ingestAndAnalyzeConfigurator({
        tenantId: 'basic-tenant-id',
        documentDataUri: 'data:text/plain;base64,dGVzdA==',
    })).rejects.toThrow(new GenkitError({
        status: 'PERMISSION_DENIED',
        message: `Your current subscription tier ('basic') does not have access to the Document Intelligence Engine. Please upgrade to 'pro' or 'enterprise'.`
    }));
  });

  // Placeholder tests from the original plan
  it.todo('should correctly parse a standard XLSX product catalog and extract products');
  it.todo('should correctly parse a PDF price list and extract products');
  it.todo('should identify dependency rules from an XLSX file with notes');
});