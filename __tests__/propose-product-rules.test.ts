
import { proposeProductRules, ProposeProductRulesInput } from '@/ai/flows/propose-product-rules';
import { ai } from '@/ai/genkit';

// Mock the AI and prompt functions to isolate the flow logic
const mockPrompt = jest.fn();
jest.mock('@/ai/genkit', () => ({
  ai: {
    definePrompt: jest.fn().mockReturnValue(mockPrompt),
    defineFlow: jest.fn((_, implementation) => implementation),
  },
}));

jest.mock('@genkit-ai/googleai', () => ({
  googleAI: {
    model: jest.fn(),
  },
}));

describe('propose-product-rules', () => {
  beforeEach(() => {
    mockPrompt.mockClear();
  });

  it('should propose a rule for a product with clear dependencies', async () => {
    const input: ProposeProductRulesInput = {
      productName: 'VoIP Phone Model X',
      productDescription: 'An advanced IP phone that requires a VoIP service plan to function.',
    };

    // Mock the prompt to return a specific output
    mockPrompt.mockResolvedValue({
      output: { proposedRule: 'Suggest a VoIP service plan with this phone.' },
    });

    const result = await proposeProductRules(input);
    expect(result.proposedRule).toEqual('Suggest a VoIP service plan with this phone.');
  });

  it('should return "No specific rule suggestion" for a generic product', async () => {
    const input: ProposeProductRulesInput = {
      productName: 'Standard Consulting Services',
      productDescription: 'Hourly consulting services.',
    };
    
    mockPrompt.mockResolvedValue({
        output: { proposedRule: 'No specific rule suggestion.' },
      });

    const result = await proposeProductRules(input);
    expect(result.proposedRule).toEqual('No specific rule suggestion.');
  });
});
