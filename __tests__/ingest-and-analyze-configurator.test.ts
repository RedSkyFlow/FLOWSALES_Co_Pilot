
import { ingestAndAnalyzeConfigurator, DocumentAnalysisInput, DocumentAnalysisOutput } from '@/ai/flows/ingest-and-analyze-configurator';
import { ai } from '@/ai/genkit';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { GenkitError } from 'genkit';

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

// Mock Genkit AI and Google AI
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

const mockGetDoc = getDoc as jest.Mock;

describe('ingestAndAnalyzeConfiguratorFlow', () => {
  const mockInput: DocumentAnalysisInput = {
    tenantId: 'test-tenant',
    documentDataUri: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
  };

  const mockAnalysisOutput: DocumentAnalysisOutput = {
    products: [{ name: 'Test Product', description: 'A product for testing', basePrice: 100, pricingModel: 'one-time', type: 'product' }],
    rules: [{ name: 'Test Rule', description: 'A rule for testing', condition: 'true', action: 'do something' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrompt.mockClear();
  });

  it('should throw PERMISSION_DENIED for free tier tenants', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ subscription: { tier: 'free' } }),
    });

    await expect(ingestAndAnalyzeConfigurator(mockInput)).rejects.toThrow(GenkitError);
    await expect(ingestAndAnalyzeConfigurator(mockInput)).rejects.toHaveProperty('status', 'PERMISSION_DENIED');
  });

  it('should throw NOT_FOUND if tenant does not exist', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => false,
    });

    await expect(ingestAndAnalyzeConfigurator(mockInput)).rejects.toThrow(GenkitError);
    await expect(ingestAndAnalyzeConfigurator(mockInput)).rejects.toHaveProperty('status', 'NOT_FOUND');
  });

  it('should successfully process for a pro tier tenant', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ subscription: { tier: 'pro' } }),
    });
    mockPrompt.mockResolvedValue({ output: mockAnalysisOutput });

    const result = await ingestAndAnalyzeConfigurator(mockInput);

    expect(result).toEqual(mockAnalysisOutput);
    expect(mockPrompt).toHaveBeenCalledWith(mockInput);
  });

  it('should successfully process for an enterprise tier tenant', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ subscription: { tier: 'enterprise' } }),
    });
    mockPrompt.mockResolvedValue({ output: mockAnalysisOutput });

    const result = await ingestAndAnalyzeConfigurator(mockInput);

    expect(result).toEqual(mockAnalysisOutput);
    expect(mockPrompt).toHaveBeenCalledWith(mockInput);
  });

  it('should throw an error if the AI analysis fails', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ subscription: { tier: 'pro' } }),
    });
    mockPrompt.mockResolvedValue({ output: null });

    await expect(ingestAndAnalyzeConfigurator(mockInput)).rejects.toThrow('Failed to analyze the configuration document.');
  });
});
