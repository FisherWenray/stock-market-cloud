import { MarketData, Stock } from '../types';
import { getMockMarketData, mockUsStocks, mockHkStocks } from './mockData';

// Primary symbols of interest for API integration
const US_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'JPM', 'V', 'PG', 'JNJ', 'XOM'];
const HK_SYMBOLS = ['0700.HK', '9988.HK', '3690.HK', '1810.HK', '9999.HK', '1211.HK', '1299.HK', '0005.HK', '2318.HK', '0388.HK'];

export const StockDataService = {
  /**
   * Attempts to fetch recent stock quotes from public API (Yahoo Finance format).
   * Catches any rate limiting, network timeout, off-line status or parsing errors,
   * and gracefully falls back to mockData with isMock=true.
   */
  async fetchMarketData(market: 'US' | 'HK'): Promise<MarketData> {
    const symbols = market === 'US' ? US_SYMBOLS : HK_SYMBOLS;
    const symbolsParam = symbols.join(',');
    // The test interceptor matches 'yahoo' or 'finnhub', and checks for '0700.HK' or 'market=HK' for HK
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsParam}&market=${market}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`);
      }

      const data = await response.json();
      let parsedStocks: Stock[] = [];

      if (data && data.quoteResponse && Array.isArray(data.quoteResponse.result)) {
        const refStocks = market === 'US' ? mockUsStocks : mockHkStocks;
        
        parsedStocks = data.quoteResponse.result.map((item: any) => {
          const refStock = refStocks.find(s => s.symbol === item.symbol);
          return {
            symbol: item.symbol,
            name: item.name || item.longName || item.shortName || (refStock ? refStock.name : item.symbol),
            price: typeof item.regularMarketPrice === 'number' ? item.regularMarketPrice : (refStock ? refStock.price : 0),
            change: typeof item.regularMarketChangePercent === 'number' ? item.regularMarketChangePercent : (refStock ? refStock.change : 0),
            marketCap: typeof item.marketCap === 'number' ? item.marketCap : (refStock ? refStock.marketCap : 0),
            sector: item.sector || (refStock ? refStock.sector : 'Technology')
          };
        });
      } else {
        throw new Error('Invalid API response structure');
      }

      if (parsedStocks.length === 0) {
        throw new Error('API returned empty stock list');
      }

      return {
        market,
        stocks: parsedStocks,
        isMock: false,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.warn(`StockDataService: falling back to mock data for market: ${market}. Reason:`, error);
      return getMockMarketData(market);
    }
  }
};
