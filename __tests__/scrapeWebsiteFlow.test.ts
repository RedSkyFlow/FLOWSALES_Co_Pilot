import { scrapeWebsiteFlow } from '@/ai/flows/scrapeWebsiteFlow';
import { saveBrandAssets } from '@/app/(protected)/settings/onboarding/actions';

// Mock the server action
jest.mock('@/app/(protected)/settings/onboarding/actions', () => ({
  saveBrandAssets: jest.fn().mockResolvedValue({ success: true }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('scrapeWebsiteFlow', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    (fetch as jest.Mock).mockClear();
    (saveBrandAssets as jest.Mock).mockClear();
  });

  it('should scrape a website, analyze tone, and save the assets', async () => {
    const mockHtml = `
      <html>
        <head>
          <title>Test Site</title>
          <meta property="og:image" content="https://example.com/logo.png">
        </head>
        <body>
          <h1>Welcome</h1>
          <p style="background-color: #ff0000;">Some professional and friendly text.</p>
        </body>
      </html>
    `;
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockHtml),
    });

    const input = {
      url: 'https://example.com',
      tenantId: 'test-tenant-123',
    };

    const result = await scrapeWebsiteFlow(input);

    // Verify the output
    expect(result.logoUrl).toEqual('https://example.com/logo.png');
    expect(result.brandColors).toEqual(['#ff0000']);
    expect(result.toneOfVoice).toBeDefined(); // AI result will vary, just check it exists

    // Verify that the save action was called correctly
    expect(saveBrandAssets).toHaveBeenCalledWith({
      ...result,
      tenantId: input.tenantId,
    });
  });

  it('should throw an error if the website fetch fails', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    });

    const input = {
      url: 'https://nonexistent-site.com',
      tenantId: 'test-tenant-404',
    };

    await expect(scrapeWebsiteFlow(input)).rejects.toThrow(
      'Failed to analyze the website: Failed to fetch website: Not Found'
    );
  });
});
