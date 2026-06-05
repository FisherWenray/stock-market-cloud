# Milestone 2: Data Integration - Synthesized Plan

This plan details the implementation of types, mock datasets, the fetch-with-fallback client, the data status indicator UI component, and the unit testing suite.

## 1. Quality Improvements from Milestone 1 Review
We will update `package.json` to:
- Pin `"lucide-react"` to `^0.450.0` (previously wildcard `*`).
- Add `"@vitest/coverage-v8"` to `devDependencies`.

## 2. File and Component Tasks

### `src/types/index.ts`
Define TS schemas matching the Stock and MarketData interfaces:
```typescript
export type Market = 'US' | 'HK';

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;       // Change percentage, e.g., +1.5 or -0.8
  marketCap: number;    // Market cap in USD or HKD
  sector: string;       // Sector/Industry group, e.g., 'Technology'
}

export interface MarketData {
  market: Market;
  stocks: Stock[];
  isMock: boolean;
  lastUpdated: string;
}

export type ColorTheme = 'international' | 'chinese';

export interface DashboardState {
  selectedMarket: Market;
  theme: ColorTheme;
  searchQuery: string;
  hoveredStock: Stock | null;
  loading: boolean;
  error: string | null;
}
```

### `src/services/mockData.ts`
Implement 52 US and 52 HK stocks across sectors. Refer to the dataset in `C:\Users\fisher\.gemini\antigravity\scratch\stock_market_cloud\.agents\explorer_m2_3\analysis.md` (lines 47 to 184).

### `src/services/api.ts`
Create the fetch client with abort signal, timeout, HTTP ok check, schema mapping, and fallback to mock data with simulated price/change fluctuations (+/-1%):
```typescript
import { MarketData, Stock } from '../types';
import { US_STOCKS, HK_STOCKS } from './mockData';

export function getFluctuatedMockData(stocks: Stock[]): Stock[] {
  return stocks.map(stock => {
    const fluctuationPercent = (Math.random() * 2 - 1) * 0.01;
    const oldPrice = stock.price;
    const newPrice = Number((oldPrice * (1 + fluctuationPercent)).toFixed(2));
    const changeDelta = fluctuationPercent * 100;
    const newChange = Number((stock.change + changeDelta).toFixed(2));

    return {
      ...stock,
      price: newPrice,
      change: newChange,
    };
  });
}

const API_CONFIG = {
  baseUrl: import.meta.env.VITE_STOCK_API_URL || 'https://api.example.com/v1',
  apiKey: import.meta.env.VITE_STOCK_API_KEY || '',
  timeoutMs: 5000,
};

export async function fetchMarketData(market: 'US' | 'HK'): Promise<MarketData> {
  const defaultMockStocks = market === 'US' ? US_STOCKS : HK_STOCKS;

  if (!API_CONFIG.apiKey || API_CONFIG.apiKey === 'YOUR_API_KEY') {
    return {
      market,
      stocks: getFluctuatedMockData(defaultMockStocks),
      isMock: true,
      lastUpdated: new Date().toISOString(),
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);

  try {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/market?type=${market}&apikey=${API_CONFIG.apiKey}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API returned unsuccessful response code: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.stocks)) {
      throw new Error('Invalid schema format from API response payload');
    }

    const mappedStocks: Stock[] = data.stocks.map((stockItem: any) => ({
      symbol: String(stockItem.symbol),
      name: String(stockItem.name),
      price: Number(stockItem.price),
      change: Number(stockItem.change),
      marketCap: Number(stockItem.marketCap),
      sector: String(stockItem.sector),
    }));

    return {
      market,
      stocks: mappedStocks,
      isMock: false,
      lastUpdated: new Date().toISOString(),
    };

  } catch (error: any) {
    clearTimeout(timeoutId);
    const errMessage = error?.name === 'AbortError' 
      ? 'Request timed out' 
      : (error?.message || String(error));
    console.warn(`[StockDataService] Fallback active: Failed to fetch live data for ${market}. Reason: ${errMessage}`);

    return {
      market,
      stocks: getFluctuatedMockData(defaultMockStocks),
      isMock: true,
      lastUpdated: new Date().toISOString(),
    };
  }
}
```

### `src/components/DataStatusIndicator.tsx`
Create the React status component conforming to the test selector attributes:
- `data-testid="data-source-indicator"` with `data-source={isMock ? 'mock' : 'live'}`.
- `data-testid="data-status-indicator"` showing status messages.

```tsx
import React from 'react';

interface DataStatusIndicatorProps {
  isMock: boolean;
  lastUpdated: string;
  loading: boolean;
  error: string | null;
  onRefresh?: () => void;
}

export const DataStatusIndicator: React.FC<DataStatusIndicatorProps> = ({
  isMock,
  lastUpdated,
  loading,
  error,
  onRefresh,
}) => {
  const formattedTime = lastUpdated 
    ? new Date(lastUpdated).toLocaleTimeString() 
    : 'Never';

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 shadow-md">
      <div className="flex items-center gap-3">
        <div 
          data-testid="data-source-indicator"
          data-source={isMock ? 'mock' : 'live'}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
            isMock 
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
          }`}
        >
          <span className={`w-2 h-2 rounded-full animate-pulse ${isMock ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          {isMock ? 'Mock Mode' : 'Live Mode'}
        </div>

        <div 
          data-testid="data-status-indicator" 
          className="text-sm font-medium text-slate-400"
        >
          {loading ? (
            <span className="text-blue-400 animate-pulse">Syncing quotes...</span>
          ) : error ? (
            <span className="text-rose-400 flex items-center gap-1">
              ⚠️ Sync Error (Fallback Active)
            </span>
          ) : (
            <span>Last Updated: {formattedTime}</span>
          )}
        </div>
      </div>

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 disabled:opacity-50 disabled:pointer-events-none rounded transition-all duration-200 hover:shadow"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      )}
    </div>
  );
};
```

### `src/services/api.test.ts`
Implement the unit test suite verifying:
- Successful fetch returns live data (`isMock=false`).
- Empty API key triggers mock fallback (`isMock=true`).
- 429 Error triggers mock fallback.
- Reject / network disconnection triggers mock fallback.
- Timeout / abort triggers mock fallback.
- Invalid payload structure triggers mock fallback.
- Fluctuations successfully modify baseline mock data.
Refer to the unit test file in `C:\Users\fisher\.gemini\antigravity\scratch\stock_market_cloud\.agents\explorer_m2_3\analysis.md` (lines 386 to 504).
