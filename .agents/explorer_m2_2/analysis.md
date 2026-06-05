# Analysis Report: Milestone 2 - Data Integration Requirements

## Overview
This report provides recommendations for implementing the Data Integration milestone (Milestone 2) for the Stock Market Cloud Visualization application. The scope of this milestone encompasses:
1. TypeScript data structures defining `Stock` and `MarketData` models.
2. A robust, sector-grouped mock data service supporting both US (50+ stocks) and HK (50+ stocks) markets.
3. An API service that attempts to query live stock data from a public API but catches network, timeout, or server errors to gracefully fall back to the mock data service.
4. An on-screen UI status indicator component mapping to specific E2E test selectors.
5. A unit test suite using Vitest to verify fallback and successful API fetch scenarios.

---

## 1. TypeScript Types Schema
The TypeScript models represent the foundation of the data flow and directly match the specifications from `PROJECT.md` and requirements from the E2E tests.

*Target Path:* `src/types/index.ts`
*Proposed File location:* `.agents/explorer_m2_2/proposed_types_index.ts`

```typescript
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;       // Change percentage, e.g., +1.5 or -0.8
  marketCap: number;    // Market cap in USD or HKD
  sector: string;       // Sector/Industry group, e.g., 'Technology'
}

export interface MarketData {
  market: 'US' | 'HK';
  stocks: Stock[];
  isMock: boolean;
  lastUpdated: string;
}

export type ColorTheme = 'international' | 'chinese';
```

---

## 2. Mock Data Structure & Distribution
To guarantee visual complexity, responsiveness tests, and high resolution coverage under fallback modes, the mock data must consist of a comprehensive set of stocks distributed across various industry sectors.

*Target Path:* `src/services/mockData.ts`
*Proposed File location:* `.agents/explorer_m2_2/proposed_mockData.ts`

### Sector and Stock Distributions
The proposed mock data includes:
- **US Market (66 stocks total)**:
  - Technology (12)
  - Finance (10)
  - Consumer (10)
  - Healthcare (10)
  - Energy (8)
  - Industrials (8)
  - Utilities (6)
- **HK Market (58 stocks total)**:
  - Technology (12)
  - Finance (10)
  - Consumer (10)
  - Healthcare (8)
  - Energy (6)
  - Industrials (6)
  - Utilities (4)

### Mock Data Excerpt
```typescript
import { Stock, MarketData } from '../types';

export const mockUsStocks: Stock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 175.50, change: 1.25, marketCap: 2750000000000, sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 415.20, change: 0.85, marketCap: 3080000000000, sector: 'Technology' },
  // ... (Full dataset includes 66 US stocks)
];

export const mockHkStocks: Stock[] = [
  { symbol: '0700.HK', name: 'Tencent Holdings Limited', price: 302.40, change: -1.20, marketCap: 2850000000000, sector: 'Technology' },
  { symbol: '9988.HK', name: 'Alibaba Group Holding Limited', price: 72.85, change: 0.45, marketCap: 1480000000000, sector: 'Technology' },
  // ... (Full dataset includes 58 HK stocks)
];

export const getMockMarketData = (market: 'US' | 'HK'): MarketData => {
  return {
    market,
    stocks: market === 'US' ? mockUsStocks : mockHkStocks,
    isMock: true,
    lastUpdated: new Date().toISOString()
  };
};
```

---

## 3. API Connectivity Service
The `StockDataService` is designed to run in two-fold capability: attempting live connection to standard Yahoo Finance API query endpoints, while catching connection failures or server rate limiting.

*Target Path:* `src/services/api.ts`
*Proposed File location:* `.agents/explorer_m2_2/proposed_api.ts`

### Logic Principles
1. **Target URLs**: Employs URL format intercepted by standard E2E routing paths containing `yahoo` or `finnhub` and query params like `market=HK` or `0700.HK`.
2. **Timeout handling**: Employs `AbortController` configured to abort requests taking longer than 5 seconds.
3. **Error robustness**: Explicitly checks `response.ok`, parsing issues, and invalid/empty response schemas.
4. **Resiliency lookup**: If the API response misses the `sector` or `name` field, it resolves them by querying the mock dataset.
5. **Fallback transition**: Any catch block triggers a warning message and falls back directly to `getMockMarketData` returning data with `isMock=true`.

```typescript
import { MarketData, Stock } from '../types';
import { getMockMarketData, mockUsStocks, mockHkStocks } from './mockData';

const US_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'JPM', 'V', 'PG', 'JNJ', 'XOM'];
const HK_SYMBOLS = ['0700.HK', '9988.HK', '3690.HK', '1810.HK', '9999.HK', '1211.HK', '1299.HK', '0005.HK', '2318.HK', '0388.HK'];

export const StockDataService = {
  async fetchMarketData(market: 'US' | 'HK'): Promise<MarketData> {
    const symbols = market === 'US' ? US_SYMBOLS : HK_SYMBOLS;
    const symbolsParam = symbols.join(',');
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsParam}&market=${market}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

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
```

---

## 4. UI Status Indicator Component Setup
The indicators act as a visual banner for the application state (Live API vs Offline Fallback). It adheres to the data selector contracts requested by Playwright.

*Target Path:* `src/components/StatusIndicator.tsx` (or inside Header)
*Proposed File location:* `.agents/explorer_m2_2/proposed_StatusIndicator.tsx`

### Interface Contract Requirements
- **Status Indicator**: Must render an element with attribute `data-testid="data-status-indicator"`. When loading mock fallback, its text content must contain `"fallback"` (e.g. `"Fallback: Using mock market data"`). When successful API fetch, its text content must contain `"success"` (e.g. `"Data loaded successfully"`).
- **Source Indicator**: Must render an element with attribute `data-testid="data-source-indicator"`. It must have the attribute `data-source="live"` or `data-source="mock"` depending on the source.

```typescript
import React from 'react';

interface StatusIndicatorProps {
  isMock: boolean;
  isLoading: boolean;
  lastUpdated?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isMock,
  isLoading,
  lastUpdated
}) => {
  let statusText = '';
  let sourceText = '';
  let sourceVal: 'live' | 'mock' = 'live';

  if (isLoading) {
    statusText = 'Loading market data...';
    sourceText = 'Connecting...';
    sourceVal = 'live';
  } else if (isMock) {
    statusText = 'Fallback: Using mock market data';
    sourceText = 'Mock';
    sourceVal = 'mock';
  } else {
    statusText = 'Data loaded successfully';
    sourceText = 'Live';
    sourceVal = 'live';
  }

  return (
    <div className="flex items-center gap-4 text-xs font-semibold px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
      <div className="flex items-center gap-2">
        <span className="text-slate-400">Status:</span>
        <span
          data-testid="data-status-indicator"
          className={isLoading ? 'text-yellow-400' : isMock ? 'text-orange-400' : 'text-emerald-400'}
        >
          {statusText}
        </span>
      </div>
      <div className="h-4 w-px bg-slate-700" />
      <div className="flex items-center gap-2">
        <span className="text-slate-400">Source:</span>
        <span
          data-testid="data-source-indicator"
          data-source={sourceVal}
          className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
            sourceVal === 'live'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
          }`}
        >
          {sourceText}
        </span>
      </div>
    </div>
  );
};
```

---

## 5. Vitest Unit Test Suite
The unit test suite validates both successful pathways and edge case failures (offline, server error, rate limit 429, timeouts, schema mismatch) in isolation.

*Target Path:* `src/services/api.test.ts`
*Proposed File location:* `.agents/explorer_m2_2/proposed_api.test.ts`

### Execution
Run via:
```powershell
npm run test:run
```
Or to run in watch mode:
```powershell
npm run test
```

### Test Suite Content
Matches `.agents/explorer_m2_2/proposed_api.test.ts`. It mocks the global `fetch` API using Vitest's `vi.stubGlobal('fetch', ...)` and verifies:
1. US market parsing on successful response.
2. HK market parsing on successful response.
3. Fallback path on HTTP 500 error.
4. Fallback path on HTTP 429 Rate Limit error.
5. Fallback path on connection timeout / abort.
6. Fallback path on malformed JSON body response.
7. Fallback path on schema key mismatch.
