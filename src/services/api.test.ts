import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchMarketData, getFluctuatedMockData } from './api';
import { US_STOCKS } from './mockData';

describe('StockDataService API and Fallbacks', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
    // Simulate setup where VITE_STOCK_API_KEY environment variable is defined
    vi.stubEnv('VITE_STOCK_API_KEY', 'MOCK_SECRET_API_KEY');
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('verifies standard successful fetching returns live data (isMock=false)', async () => {
    const apiPayload = [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 180.50, change: 1.2, marketCap: 2800000000000, sector: 'Technology' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', price: 420.20, change: -0.5, marketCap: 3100000000000, sector: 'Technology' }
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => apiPayload
    });

    const result = await fetchMarketData('US');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.isMock).toBe(false);
    expect(result.market).toBe('US');
    expect(result.stocks).toHaveLength(2);
    expect(result.stocks[0].symbol).toBe('AAPL');
    expect(result.stocks[0].price).toBe(180.50);
    expect(result.lastUpdated).toBeDefined();
  });

  it('tries to fetch keyless Yahoo Finance data if API key environment variable is empty', async () => {
    vi.stubEnv('VITE_STOCK_API_KEY', ''); // Clear key

    const apiPayload = {
      quoteResponse: {
        result: [
          { symbol: 'AAPL', regularMarketPrice: 180.50, regularMarketChangePercent: 1.2, marketCap: 2800000000000, shortName: 'Apple Inc.' }
        ]
      }
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => apiPayload
    });

    const result = await fetchMarketData('US');

    expect(global.fetch).toHaveBeenCalledTimes(6); // 505 stocks = 6 chunks
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api-yahoo/q='),
      expect.any(Object)
    );
    expect(result.isMock).toBe(false);
    expect(result.market).toBe('US');
    expect(result.stocks[0].symbol).toBe('AAPL');
    expect(result.stocks[0].price).toBe(180.50);
  });

  it('gracefully falls back to mock data when API returns HTTP 429 Rate Limit error', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests'
    });

    const result = await fetchMarketData('US');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.isMock).toBe(true);
    expect(result.market).toBe('US');
    expect(result.stocks.length).toBe(US_STOCKS.length);
  });

  it('gracefully falls back to mock data on sudden offline network disconnection (Fetch Reject)', async () => {
    (global.fetch as any).mockRejectedValue(new TypeError('Failed to fetch'));

    const result = await fetchMarketData('US');

    expect(global.fetch).toHaveBeenCalled();
    expect(result.isMock).toBe(true);
    expect(result.market).toBe('US');
  });

  it('gracefully falls back to mock data when connection request times out / aborts', async () => {
    const abortException = new DOMException('The operation was aborted.', 'AbortError');
    (global.fetch as any).mockRejectedValue(abortException);

    const result = await fetchMarketData('US');

    expect(global.fetch).toHaveBeenCalled();
    expect(result.isMock).toBe(true);
  });

  it('gracefully falls back to mock data when the live API format does not contain stock list', async () => {
    const invalidPayload = { invalidKey: 'some data' };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => invalidPayload
    });

    const result = await fetchMarketData('US');

    expect(global.fetch).toHaveBeenCalled();
    expect(result.isMock).toBe(true);
  });

  it('verifies that fluctuation correctly modifies mock data from baseline', () => {
    const baseline = [
      { symbol: 'TEST', name: 'Test Stock', price: 100.00, change: 2.0, marketCap: 1000000, sector: 'Technology' }
    ];

    const fluctuated = getFluctuatedMockData(baseline);

    expect(fluctuated[0].symbol).toBe('TEST');
    expect(fluctuated[0].price).not.toBe(100.00); // Verify value change
    expect(fluctuated[0].price).toBeGreaterThanOrEqual(99.00);
    expect(fluctuated[0].price).toBeLessThanOrEqual(101.00);
    expect(fluctuated[0].change).not.toBe(2.0); // Verify change percentage updates accordingly
  });
});
