# Milestone 2 Data Integration Analysis and Design

This report outlines the recommended design, interfaces, mock data, and fallback services for Milestone 2 (Data Integration) of the Stock Market Cloud Visualization dashboard.

---

## 1. TypeScript Schemas (`src/types/index.ts`)
The TypeScript definitions align precisely with the `Stock` and `MarketData` interfaces defined in `PROJECT.md`, and also define schemas for application state and color themes.

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

export interface AppState {
  market: 'US' | 'HK';
  data: MarketData | null;
  loading: boolean;
  error: string | null;
  theme: ColorTheme;
  hoveredStock: Stock | null;
  searchQuery: string;
}
```

---

## 2. Mock Data Structure (`src/services/mockData.ts`)
A balanced mock dataset comprising exactly **50 US stocks** and **50 HK stocks**, categorized evenly (10 stocks per sector) across five primary sectors: **Technology, Finance, Consumer, Healthcare, and Energy**. This provides a robust fallback structure when offline or rate-limited.

```typescript
import { Stock } from '../types';

export const MOCK_US_STOCKS: Stock[] = [
  // Technology
  { symbol: 'AAPL', name: 'Apple Inc.', price: 175.50, change: 1.5, marketCap: 2750000000000, sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 415.20, change: 0.8, marketCap: 3080000000000, sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 152.30, change: -1.2, marketCap: 1900000000000, sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 178.40, change: 2.1, marketCap: 1850000000000, sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.00, change: 3.6, marketCap: 2180000000000, sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms, Inc.', price: 505.50, change: -0.5, marketCap: 1280000000000, sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 171.00, change: -2.3, marketCap: 545000000000, sector: 'Technology' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', price: 1350.00, change: 1.1, marketCap: 625000000000, sector: 'Technology' },
  { symbol: 'ADBE', name: 'Adobe Inc.', price: 485.60, change: -0.9, marketCap: 218000000000, sector: 'Technology' },
  { symbol: 'CRM', name: 'Salesforce, Inc.', price: 272.30, change: 0.4, marketCap: 264000000000, sector: 'Technology' },

  // Finance
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 195.20, change: 0.5, marketCap: 562000000000, sector: 'Finance' },
  { symbol: 'BAC', name: 'Bank of America Corporation', price: 37.10, change: -0.8, marketCap: 292000000000, sector: 'Finance' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', price: 57.50, change: -1.1, marketCap: 202000000000, sector: 'Finance' },
  { symbol: 'C', name: 'Citigroup Inc.', price: 61.20, change: 0.3, marketCap: 117000000000, sector: 'Finance' },
  { symbol: 'MS', name: 'Morgan Stanley', price: 92.40, change: 1.2, marketCap: 151000000000, sector: 'Finance' },
  { symbol: 'GS', name: 'The Goldman Sachs Group, Inc.', price: 402.80, change: 0.9, marketCap: 133000000000, sector: 'Finance' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', price: 408.30, change: -0.2, marketCap: 885000000000, sector: 'Finance' },
  { symbol: 'V', name: 'Visa Inc.', price: 275.60, change: 0.7, marketCap: 570000000000, sector: 'Finance' },
  { symbol: 'MA', name: 'Mastercard Incorporated', price: 462.10, change: -0.4, marketCap: 428000000000, sector: 'Finance' },
  { symbol: 'AXP', name: 'American Express Company', price: 220.50, change: 1.5, marketCap: 158000000000, sector: 'Finance' },

  // Consumer
  { symbol: 'WMT', name: 'Walmart Inc.', price: 60.20, change: 0.3, marketCap: 482000000000, sector: 'Consumer' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', price: 162.40, change: -0.1, marketCap: 382000000000, sector: 'Consumer' },
  { symbol: 'KO', name: 'The Coca-Cola Company', price: 61.50, change: 0.5, marketCap: 265000000000, sector: 'Consumer' },
  { symbol: 'PEP', name: 'PepsiCo, Inc.', price: 172.80, change: -0.6, marketCap: 236000000000, sector: 'Consumer' },
  { symbol: 'COST', name: 'Costco Wholesale Corporation', price: 725.30, change: 1.8, marketCap: 322000000000, sector: 'Consumer' },
  { symbol: 'MCD', name: 'McDonald\'s Corporation', price: 282.10, change: -1.2, marketCap: 204000000000, sector: 'Consumer' },
  { symbol: 'NKE', name: 'NIKE, Inc.', price: 98.40, change: -2.0, marketCap: 148000000000, sector: 'Consumer' },
  { symbol: 'HD', name: 'The Home Depot, Inc.', price: 362.50, change: 0.9, marketCap: 358000000000, sector: 'Consumer' },
  { symbol: 'EL', name: 'The Estée Lauder Companies Inc.', price: 145.20, change: -3.2, marketCap: 52000000000, sector: 'Consumer' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', price: 88.30, change: 0.2, marketCap: 100000000000, sector: 'Consumer' },

  // Healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson', price: 155.80, change: -0.4, marketCap: 375000000000, sector: 'Healthcare' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', price: 760.30, change: 2.8, marketCap: 722000000000, sector: 'Healthcare' },
  { symbol: 'UNH', name: 'UnitedHealth Group Incorporated', price: 490.50, change: -1.5, marketCap: 454000000000, sector: 'Healthcare' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', price: 178.20, change: 0.6, marketCap: 315000000000, sector: 'Healthcare' },
  { symbol: 'MRK', name: 'Merck & Co., Inc.', price: 125.40, change: 0.9, marketCap: 318000000000, sector: 'Healthcare' },
  { symbol: 'PFE', name: 'Pfizer Inc.', price: 27.80, change: -0.8, marketCap: 157000000000, sector: 'Healthcare' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.', price: 575.20, change: 1.4, marketCap: 221000000000, sector: 'Healthcare' },
  { symbol: 'ABT', name: 'Abbott Laboratories', price: 112.50, change: -0.2, marketCap: 195000000000, sector: 'Healthcare' },
  { symbol: 'CVS', name: 'CVS Health Corporation', price: 72.10, change: -2.5, marketCap: 91000000000, sector: 'Healthcare' },
  { symbol: 'BMY', name: 'Bristol-Myers Squibb Company', price: 48.50, change: 0.1, marketCap: 98000000000, sector: 'Healthcare' },

  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', price: 120.40, change: 1.7, marketCap: 480000000000, sector: 'Energy' },
  { symbol: 'CVX', name: 'Chevron Corporation', price: 162.80, change: 0.9, marketCap: 304000000000, sector: 'Energy' },
  { symbol: 'COP', name: 'ConocoPhillips', price: 128.50, change: -0.5, marketCap: 152000000000, sector: 'Energy' },
  { symbol: 'SLB', name: 'Schlumberger Limited', price: 54.30, change: -1.2, marketCap: 77000000000, sector: 'Energy' },
  { symbol: 'EOG', name: 'EOG Resources, Inc.', price: 132.10, change: 0.4, marketCap: 76000000000, sector: 'Energy' },
  { symbol: 'MPC', name: 'Marathon Petroleum Corporation', price: 202.50, change: 2.2, marketCap: 71000000000, sector: 'Energy' },
  { symbol: 'PSX', name: 'Phillips 66', price: 165.40, change: 1.5, marketCap: 72000000000, sector: 'Energy' },
  { symbol: 'VLO', name: 'Valero Energy Corporation', price: 172.30, change: 0.8, marketCap: 56000000000, sector: 'Energy' },
  { symbol: 'OXY', name: 'Occidental Petroleum Corporation', price: 65.80, change: -0.3, marketCap: 58000000000, sector: 'Energy' },
  { symbol: 'HAL', name: 'Halliburton Company', price: 38.70, change: -1.8, marketCap: 34000000000, sector: 'Energy' }
];

export const MOCK_HK_STOCKS: Stock[] = [
  // Technology
  { symbol: '0700.HK', name: 'Tencent Holdings Limited', price: 380.40, change: 1.8, marketCap: 3620000000000, sector: 'Technology' },
  { symbol: '9988.HK', name: 'Alibaba Group Holding Limited', price: 78.50, change: -1.2, marketCap: 1610000000000, sector: 'Technology' },
  { symbol: '3690.HK', name: 'Meituan', price: 115.20, change: 2.5, marketCap: 718000000000, sector: 'Technology' },
  { symbol: '9618.HK', name: 'JD.com, Inc.', price: 128.40, change: -0.9, marketCap: 405000000000, sector: 'Technology' },
  { symbol: '9888.HK', name: 'Baidu, Inc.', price: 98.60, change: -1.5, marketCap: 278000000000, sector: 'Technology' },
  { symbol: '1810.HK', name: 'Xiaomi Corporation', price: 18.20, change: 3.4, marketCap: 453000000000, sector: 'Technology' },
  { symbol: '0992.HK', name: 'Lenovo Group Limited', price: 10.40, change: 0.5, marketCap: 129000000000, sector: 'Technology' },
  { symbol: '9898.HK', name: 'Weibo Corporation', price: 68.30, change: -2.1, marketCap: 16000000000, sector: 'Technology' },
  { symbol: '0981.HK', name: 'Semiconductor Manufacturing International Corporation (SMIC)', price: 16.50, change: 0.8, marketCap: 131000000000, sector: 'Technology' },
  { symbol: '1347.HK', name: 'Hua Hong Semiconductor Limited', price: 18.90, change: 1.2, marketCap: 32000000000, sector: 'Technology' },

  // Finance
  { symbol: '0005.HK', name: 'HSBC Holdings plc', price: 68.50, change: 0.6, marketCap: 1280000000000, sector: 'Finance' },
  { symbol: '1299.HK', name: 'AIA Group Limited', price: 62.40, change: -1.4, marketCap: 708000000000, sector: 'Finance' },
  { symbol: '3988.HK', name: 'Bank of China Limited', price: 3.82, change: 0.8, marketCap: 1120000000000, sector: 'Finance' },
  { symbol: '1398.HK', name: 'Industrial and Commercial Bank of China Limited', price: 4.65, change: 0.4, marketCap: 1650000000000, sector: 'Finance' },
  { symbol: '0939.HK', name: 'China Construction Bank Corporation', price: 5.72, change: 0.2, marketCap: 1430000000000, sector: 'Finance' },
  { symbol: '2318.HK', name: 'Ping An Insurance (Group) Company of China, Ltd.', price: 38.50, change: -2.3, marketCap: 702000000000, sector: 'Finance' },
  { symbol: '3968.HK', name: 'China Merchants Bank Co., Ltd.', price: 34.20, change: 1.1, marketCap: 862000000000, sector: 'Finance' },
  { symbol: '0388.HK', name: 'Hong Kong Exchanges and Clearing Limited', price: 260.80, change: -0.5, marketCap: 330000000000, sector: 'Finance' },
  { symbol: '2628.HK', name: 'China Life Insurance Company Limited', price: 11.50, change: -1.8, marketCap: 325000000000, sector: 'Finance' },
  { symbol: '2388.HK', name: 'BOC Hong Kong (Holdings) Limited', price: 23.40, change: 0.9, marketCap: 247000000000, sector: 'Finance' },

  // Consumer
  { symbol: '9999.HK', name: 'NetEase, Inc.', price: 142.50, change: 1.5, marketCap: 458000000000, sector: 'Consumer' },
  { symbol: '0291.HK', name: 'China Resources Beer (Holdings) Company Limited', price: 32.40, change: -2.0, marketCap: 105000000000, sector: 'Consumer' },
  { symbol: '0961.HK', name: 'Sands China Ltd.', price: 18.50, change: -1.2, marketCap: 149000000000, sector: 'Consumer' },
  { symbol: '2020.HK', name: 'ANTA Sports Products Limited', price: 82.30, change: 2.1, marketCap: 233000000000, sector: 'Consumer' },
  { symbol: '2331.HK', name: 'Li Ning Company Limited', price: 19.80, change: -3.5, marketCap: 51000000000, sector: 'Consumer' },
  { symbol: '1211.HK', name: 'BYD Company Limited', price: 220.40, change: 4.2, marketCap: 641000000000, sector: 'Consumer' },
  { symbol: '1928.HK', name: 'Sands China Ltd.', price: 19.20, change: 0.5, marketCap: 155000000000, sector: 'Consumer' },
  { symbol: '0027.HK', name: 'Galaxy Entertainment Group Limited', price: 38.60, change: -0.8, marketCap: 168000000000, sector: 'Consumer' },
  { symbol: '6808.HK', name: 'Sun Art Retail Group Limited', price: 1.45, change: 0.0, marketCap: 13800000000, sector: 'Consumer' },
  { symbol: '0322.HK', name: 'Tingyi (Cayman Islands) Holding Corp.', price: 9.80, change: 0.6, marketCap: 55000000000, sector: 'Consumer' },

  // Healthcare
  { symbol: '1093.HK', name: 'CSPC Pharmaceutical Group Limited', price: 6.20, change: -0.5, marketCap: 73000000000, sector: 'Healthcare' },
  { symbol: '1177.HK', name: 'Sino Biopharmaceutical Limited', price: 3.15, change: 0.8, marketCap: 58000000000, sector: 'Healthcare' },
  { symbol: '2269.HK', name: 'WuXi Biologics (Cayman) Inc.', price: 14.20, change: -4.5, marketCap: 60400000000, sector: 'Healthcare' },
  { symbol: '2359.HK', name: 'WuXi AppTec Co., Ltd.', price: 38.60, change: -3.2, marketCap: 113000000000, sector: 'Healthcare' },
  { symbol: '1548.HK', name: 'Genscript Biotech Corporation', price: 12.40, change: 1.5, marketCap: 26000000000, sector: 'Healthcare' },
  { symbol: '1801.HK', name: 'Innovent Biologics, Inc.', price: 36.50, change: 2.8, marketCap: 59000000000, sector: 'Healthcare' },
  { symbol: '6185.HK', name: 'CanSino Biologics Inc.', price: 18.20, change: -1.1, marketCap: 5000000000, sector: 'Healthcare' },
  { symbol: '0574.HK', name: 'Baiming Pharmaceutical', price: 8.50, change: 0.0, marketCap: 4500000000, sector: 'Healthcare' },
  { symbol: '0853.HK', name: 'MicroPort Scientific Corporation', price: 6.40, change: -2.5, marketCap: 11000000000, sector: 'Healthcare' },
  { symbol: '3320.HK', name: 'China Resources Pharmaceutical Group Limited', price: 5.80, change: 0.3, marketCap: 36000000000, sector: 'Healthcare' },

  // Energy
  { symbol: '0857.HK', name: 'PetroChina Company Limited', price: 7.20, change: 2.3, marketCap: 1310000000000, sector: 'Energy' },
  { symbol: '0883.HK', name: 'CNOOC Limited', price: 18.90, change: 3.1, marketCap: 843000000000, sector: 'Energy' },
  { symbol: '0386.HK', name: 'China Petroleum & Chemical Corporation (Sinopec)', price: 4.60, change: 0.8, marketCap: 558000000000, sector: 'Energy' },
  { symbol: '1088.HK', name: 'China Shenhua Energy Company Limited', price: 32.50, change: 1.5, marketCap: 646000000000, sector: 'Energy' },
  { symbol: '3993.HK', name: 'China Molybdenum Co., Ltd.', price: 6.80, change: 2.4, marketCap: 146000000000, sector: 'Energy' },
  { symbol: '2883.HK', name: 'China Oilfield Services Limited', price: 8.20, change: -1.4, marketCap: 39000000000, sector: 'Energy' },
  { symbol: '1157.HK', name: 'Zoomlion Heavy Industry Science and Technology Co., Ltd.', price: 5.10, change: -0.5, marketCap: 44000000000, sector: 'Energy' },
  { symbol: '3899.HK', name: 'CIMC Enric Holdings Limited', price: 7.15, change: 0.2, marketCap: 14000000000, sector: 'Energy' },
  { symbol: '0003.HK', name: 'The Hong Kong and China Gas Company Limited', price: 6.05, change: -0.3, marketCap: 112000000000, sector: 'Energy' },
  { symbol: '0006.HK', name: 'Power Assets Holdings Limited', price: 45.80, change: 0.5, marketCap: 97000000000, sector: 'Energy' }
];

export function getMockStocks(market: 'US' | 'HK'): Stock[] {
  return market === 'US' ? MOCK_US_STOCKS : MOCK_HK_STOCKS;
}
```

---

## 3. API Connectivity Service (`src/services/api.ts`)
The API service attempts to fetch real-time quotes using a URL that contains `'yahoo'` or `'finnhub'` to ensure proper Playwright request routing.
If an error is thrown, a rate limit (429) occurs, the request times out (aborted after 5 seconds), or the returned dataset contains no stocks matching the selected market (e.g. mock returning only US stocks for HK), the service gracefully falls back to the mock data with `isMock: true`.

```typescript
import { Stock, MarketData } from '../types';
import { MOCK_US_STOCKS, MOCK_HK_STOCKS } from './mockData';

export const StockDataService = {
  async fetchMarketData(market: 'US' | 'HK'): Promise<MarketData> {
    try {
      // Endpoint contains 'yahoo' or 'finnhub' to match Playwright routes
      // Yahoo Finance v7 API query format
      const symbolsParam = market === 'US' 
        ? 'AAPL,MSFT,JPM,PG,JNJ,XOM' 
        : '0700.HK,9988.HK,3690.HK';
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsParam}`;

      // Set timeout controller (5000ms) to abort hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Normalize and parse standard formats
      let resultList: any[] = [];
      if (data && data.quoteResponse && Array.isArray(data.quoteResponse.result)) {
        resultList = data.quoteResponse.result;
      } else if (Array.isArray(data)) {
        resultList = data;
      } else if (data && typeof data === 'object') {
        resultList = [data]; // Single quote fallback
      }

      // Map API fields into Stock structures
      const stocks: Stock[] = resultList
        .filter((item: any) => item && (item.symbol || item.s))
        .map((item: any) => {
          const symbol = item.symbol || item.s;
          const name = item.name || item.longName || item.displayName || symbol;
          const price = item.regularMarketPrice ?? item.c ?? 0;
          const change = item.regularMarketChangePercent ?? item.dp ?? 0;
          const marketCap = item.marketCap ?? 0;
          const sector = item.sector || 'Other';

          return { symbol, name, price, change, marketCap, sector };
        });

      // Filter stocks based on selected market suffix (.HK)
      const filtered = stocks.filter((stock) => {
        const isHk = stock.symbol.endsWith('.HK');
        return market === 'HK' ? isHk : !isHk;
      });

      // If the API returns no matching stocks for the requested market,
      // trigger fallback to ensure we do not render an empty UI
      if (filtered.length === 0) {
        throw new Error(`No matching ${market} stocks found in API response`);
      }

      return {
        market,
        stocks: filtered,
        isMock: false,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.warn(`[StockDataService] Fallback active for ${market} market:`, error);
      return {
        market,
        stocks: market === 'US' ? MOCK_US_STOCKS : MOCK_HK_STOCKS,
        isMock: true,
        lastUpdated: new Date().toISOString()
      };
    }
  }
};
```

---

## 4. Status Indicator Component (`src/components/StatusIndicator.tsx`)
The indicator component tracks the loading state, whether fallback data is active (`isMock`), and matches the `data-testid` selector contract used by E2E tests.

### Selector Contract Details
- **Status indicator**: `[data-testid="data-status-indicator"]` containing either `"success"` (live data loaded) or `"fallback"` (offline/mock fallback).
- **Source indicator**: `[data-testid="data-source-indicator"]` containing the `data-source` attribute set to `"live"` or `"mock"`, and displaying corresponding text.

```tsx
import React from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'; // Example lucide icons

interface StatusIndicatorProps {
  isMock: boolean;
  loading: boolean;
  lastUpdated: string;
  error: string | null;
  onRefresh: () => void;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isMock,
  loading,
  lastUpdated,
  error,
  onRefresh
}) => {
  const formattedTime = lastUpdated 
    ? new Date(lastUpdated).toLocaleTimeString() 
    : 'Never';

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">
      <div className="flex items-center gap-3">
        {/* Status Indicator */}
        <span 
          data-testid="data-status-indicator"
          className={`flex items-center gap-1.5 font-medium px-2 py-0.5 rounded ${
            isMock 
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' 
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
          }`}
        >
          {isMock ? 'Fallback' : 'Success'}
        </span>

        {/* Source Indicator */}
        <span 
          data-testid="data-source-indicator"
          data-source={isMock ? 'mock' : 'live'}
          className={`flex items-center gap-1.5 font-medium px-2 py-0.5 rounded ${
            isMock 
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/25' 
              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25'
          }`}
        >
          {isMock ? (
            <>
              <WifiOff size={14} className="inline" />
              Mock Mode
            </>
          ) : (
            <>
              <Wifi size={14} className="inline" />
              Live Mode
            </>
          )}
        </span>

        <span className="text-slate-500 text-xs">
          Last updated: {formattedTime}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {error && (
          <span className="text-rose-400 text-xs truncate max-w-[200px]" title={error}>
            {error}
          </span>
        )}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center justify-center p-1.5 hover:bg-slate-700 disabled:opacity-50 text-slate-400 hover:text-white rounded transition"
          aria-label="Refresh data"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  );
};
```

---

## 5. Unit Test Suite using Vitest (`src/services/api.test.ts`)
The unit tests verify both the successful data fetching case and various fallback scenarios (offline/network errors, 429 rate limit, 500 server error, timeout, and API payload issues).

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StockDataService } from './api';
import { MOCK_US_STOCKS, MOCK_HK_STOCKS } from './mockData';

describe('StockDataService Unit Tests', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles successful API fetch for US market', async () => {
    const apiResult = {
      quoteResponse: {
        result: [
          { symbol: 'AAPL', name: 'Apple Inc.', regularMarketPrice: 180.0, regularMarketChangePercent: 2.5, marketCap: 2800000000000, sector: 'Technology' },
          { symbol: 'MSFT', name: 'Microsoft Corporation', regularMarketPrice: 420.0, regularMarketChangePercent: 1.0, marketCap: 3100000000000, sector: 'Technology' }
        ]
      }
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => apiResult,
    } as Response);

    const result = await StockDataService.fetchMarketData('US');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.isMock).toBe(false);
    expect(result.market).toBe('US');
    expect(result.stocks).toHaveLength(2);
    expect(result.stocks[0].symbol).toBe('AAPL');
    expect(result.stocks[0].price).toBe(180.0);
    expect(result.stocks[0].change).toBe(2.5);
  });

  it('handles successful API fetch for HK market', async () => {
    const apiResult = {
      quoteResponse: {
        result: [
          { symbol: '0700.HK', name: 'Tencent', regularMarketPrice: 390.0, regularMarketChangePercent: -0.5, marketCap: 3700000000000, sector: 'Technology' }
        ]
      }
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => apiResult,
    } as Response);

    const result = await StockDataService.fetchMarketData('HK');

    expect(result.isMock).toBe(false);
    expect(result.market).toBe('HK');
    expect(result.stocks).toHaveLength(1);
    expect(result.stocks[0].symbol).toBe('0700.HK');
    expect(result.stocks[0].price).toBe(390.0);
    expect(result.stocks[0].change).toBe(-0.5);
  });

  it('falls back to mock data on HTTP status 500 error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const result = await StockDataService.fetchMarketData('US');

    expect(result.isMock).toBe(true);
    expect(result.market).toBe('US');
    expect(result.stocks).toEqual(MOCK_US_STOCKS);
  });

  it('falls back to mock data on network / offline error', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const result = await StockDataService.fetchMarketData('US');

    expect(result.isMock).toBe(true);
    expect(result.stocks).toEqual(MOCK_US_STOCKS);
  });

  it('falls back to mock data on rate limit error (429)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
    } as Response);

    const result = await StockDataService.fetchMarketData('HK');

    expect(result.isMock).toBe(true);
    expect(result.stocks).toEqual(MOCK_HK_STOCKS);
  });

  it('falls back to mock data when API returns empty or invalid result set', async () => {
    const apiResult = { quoteResponse: { result: [] } };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => apiResult,
    } as Response);

    const result = await StockDataService.fetchMarketData('US');

    expect(result.isMock).toBe(true);
    expect(result.stocks).toEqual(MOCK_US_STOCKS);
  });

  it('falls back to mock data when API results contain no matching market symbols', async () => {
    // API returns only US stocks when HK was requested
    const apiResult = {
      quoteResponse: {
        result: [
          { symbol: 'AAPL', name: 'Apple Inc.', regularMarketPrice: 180.0, regularMarketChangePercent: 2.5, marketCap: 2800000000000, sector: 'Technology' }
        ]
      }
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => apiResult,
    } as Response);

    const result = await StockDataService.fetchMarketData('HK');

    expect(result.isMock).toBe(true);
    expect(result.stocks).toEqual(MOCK_HK_STOCKS);
  });
});
```

---

## Summary of Forensic Verification Considerations
1. **Contrast Ratio Compliance**: Ensure status and source indicators use Tailwind background opacity (e.g. `bg-amber-500/10`) coupled with high-contrast text colors (`text-amber-400`) to guarantee contrast ratios > 4.5:1.
2. **Dynamic Formatting**: For market cap visualization and tooltip components, values should be formatted using letters (K, M, B, T) to fit small tile sizes (down to 100px width).
3. **Currency Localization**: For `US` market components, pricing should render with standard `$` prefix, whereas `HK` market components should render with `HK$` prefix.
