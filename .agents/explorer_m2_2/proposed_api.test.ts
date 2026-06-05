import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StockDataService } from './api';

describe('StockDataService unit tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should fetch US market data successfully and return parsed stocks with isMock=false', async () => {
    const mockApiResponse = {
      quoteResponse: {
        result: [
          { symbol: 'AAPL', name: 'Apple Inc.', regularMarketPrice: 175.50, regularMarketChangePercent: 1.25, marketCap: 2750000000000, sector: 'Technology' },
          { symbol: 'MSFT', name: 'Microsoft Corp.', regularMarketPrice: 415.20, regularMarketChangePercent: 0.85, marketCap: 3080000000000, sector: 'Technology' }
        ]
      }
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse)
    });
    vi.stubGlobal('fetch', mockFetch);

    const data = await StockDataService.fetchMarketData('US');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('symbols=AAPL,MSFT'),
      expect.any(Object)
    );
    expect(data.isMock).toBe(false);
    expect(data.market).toBe('US');
    expect(data.stocks).toHaveLength(2);
    expect(data.stocks[0]).toEqual({
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 175.50,
      change: 1.25,
      marketCap: 2750000000000,
      sector: 'Technology'
    });
    expect(data.lastUpdated).toBeDefined();
  });

  it('should fetch HK market data successfully and return parsed stocks with isMock=false', async () => {
    const mockApiResponse = {
      quoteResponse: {
        result: [
          { symbol: '0700.HK', name: 'Tencent', regularMarketPrice: 302.40, regularMarketChangePercent: -1.20, marketCap: 2850000000000, sector: 'Technology' }
        ]
      }
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse)
    });
    vi.stubGlobal('fetch', mockFetch);

    const data = await StockDataService.fetchMarketData('HK');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('0700.HK'),
      expect.any(Object)
    );
    expect(data.isMock).toBe(false);
    expect(data.market).toBe('HK');
    expect(data.stocks).toHaveLength(1);
    expect(data.stocks[0].symbol).toBe('0700.HK');
  });

  it('should fall back to mock data when API returns HTTP error (500)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500
    });
    vi.stubGlobal('fetch', mockFetch);

    const data = await StockDataService.fetchMarketData('US');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(data.isMock).toBe(true);
    expect(data.market).toBe('US');
    expect(data.stocks.length).toBeGreaterThanOrEqual(50);
  });

  it('should fall back to mock data when API rate limit occurs (429)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429
    });
    vi.stubGlobal('fetch', mockFetch);

    const data = await StockDataService.fetchMarketData('US');

    expect(data.isMock).toBe(true);
    expect(data.stocks.length).toBeGreaterThanOrEqual(50);
  });

  it('should fall back to mock data when connection aborts or network error happens', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));
    vi.stubGlobal('fetch', mockFetch);

    const data = await StockDataService.fetchMarketData('HK');

    expect(data.isMock).toBe(true);
    expect(data.market).toBe('HK');
    expect(data.stocks.length).toBeGreaterThanOrEqual(50);
  });

  it('should fall back to mock data when API returns invalid JSON content', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new SyntaxError('Unexpected token < in JSON'))
    });
    vi.stubGlobal('fetch', mockFetch);

    const data = await StockDataService.fetchMarketData('US');

    expect(data.isMock).toBe(true);
  });

  it('should fall back to mock data when API returns invalid schema layout', async () => {
    const mockApiResponse = { error: 'Unknown key layout' };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse)
    });
    vi.stubGlobal('fetch', mockFetch);

    const data = await StockDataService.fetchMarketData('US');

    expect(data.isMock).toBe(true);
  });
});
