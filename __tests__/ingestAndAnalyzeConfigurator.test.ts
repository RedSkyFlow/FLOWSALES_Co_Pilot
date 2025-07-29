import { ingestAndAnalyzeConfiguratorFlow } from '@/ai/flows/ingestAndAnalyzeConfigurator';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

// Mock the database interactions
jest.mock('@/lib/firebase', () => ({
  db: jest.fn(),
}));

// A mock for the getDoc function
const getDocMock = jest.fn();

// A mock for the doc function
const docMock = jest.fn((...args) => ({
  // Return a path or some identifier that getDocMock can use
  path: args.join('/'),
}));

// Before each test, we need to wire up our mocks
beforeEach(() => {
    // Reset mocks
    getDocMock.mockClear();
    docMock.mockClear();
    
    // Replace the actual firestore functions with our mocks
    jest.spyOn(require('firebase/firestore'), 'doc').mockImplementation(docMock);
    jest.spyOn(require('firebase/firestore'), 'getDoc').mockImplementation(getDocMock);
});


describe('ingestAndAnalyzeConfiguratorFlow', () => {

  const baseInput = {
    documentContent: 'data:text/plain;base64,U2FtcGxlIGRvY3VtZW50IGNvbnRlbnQ=', // "Sample document content"
    userId: 'test-user-pro',
  };

  it('should allow access for a user with a "pro" subscription', async () => {
    getDocMock.mockResolvedValue({
      exists: () => true,
      data: () => ({ subscription: { tier: 'pro' } }),
    });

    const result = await ingestAndAnalyzeConfiguratorFlow(baseInput);
    expect(result).toBeDefined();
    expect(result.products).toBeInstanceOf(Array);
    expect(result.rules).toBeInstanceOf(Array);
  });

  it('should allow access for a user with an "enterprise" subscription', async () => {
    getDocMock.mockResolvedValue({
      exists: () => true,
      data: () => ({ subscription: { tier: 'enterprise' } }),
    });

    const result = await ingestAndAnalyzeConfiguratorFlow({ ...baseInput, userId: 'test-user-enterprise' });
    expect(result).toBeDefined();
  });

  it('should deny access for a user with a "free" subscription', async () => {
    getDocMock.mockResolvedValue({
      exists: () => true,
      data: () => ({ subscription: { tier: 'free' } }),
    });

    await expect(ingestAndAnalyzeConfiguratorFlow({ ...baseInput, userId: 'test-user-free' })).rejects.toThrow(
      'This feature requires a Pro or Enterprise subscription.'
    );
  });
  
  it('should deny access if the user has no subscription information', async () => {
    getDocMock.mockResolvedValue({
      exists: () => true,
      data: () => ({}), // No subscription field
    });

    await expect(ingestAndAnalyzeConfiguratorFlow({ ...baseInput, userId: 'test-user-no-sub' })).rejects.toThrow(
      'This feature requires a Pro or Enterprise subscription.'
    );
  });

  it('should throw an error if the user document does not exist', async () => {
    getDocMock.mockResolvedValue({
      exists: () => false,
    });

    await expect(ingestAndAnalyzeConfiguratorFlow({ ...baseInput, userId: 'ghost-user' })).rejects.toThrow(
      'User not found'
    );
  });
});
