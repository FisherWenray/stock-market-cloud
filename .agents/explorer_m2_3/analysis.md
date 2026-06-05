# Analysis of Milestone 2 (Data Integration) Requirements

This document provides structured code recommendations for the implementation of Milestone 2 (Data Integration) in `stock_market_cloud`.

---

## 1. TypeScript Schemas (`src/types/index.ts`)
The TypeScript types must match the specifications from the project's interface contracts and support overall application state management.

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

---

## 2. Mock Data Provider (`src/services/mockData.ts`)
This file defines comprehensive lists of US and HK stocks (52 stocks each) organized by sectors to serve as a robust local fallback if API requests fail or if no API key is configured.

```typescript
import { Stock } from '../types';

export const US_STOCKS: Stock[] = [
  // TECHNOLOGY SECTOR
  { symbol: 'AAPL', name: 'Apple Inc.', price: 190.25, change: 1.25, marketCap: 2950000000000, sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.50, change: -0.45, marketCap: 3100000000000, sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 900.10, change: 4.80, marketCap: 2250000000000, sector: 'Technology' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', price: 1350.00, change: 0.85, marketCap: 630000000000, sector: 'Technology' },
  { symbol: 'ADBE', name: 'Adobe Inc.', price: 485.20, change: -1.10, marketCap: 218000000000, sector: 'Technology' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', price: 48.10, change: 0.20, marketCap: 195000000000, sector: 'Technology' },
  { symbol: 'CRM', name: 'Salesforce Inc.', price: 275.40, change: 1.55, marketCap: 265000000000, sector: 'Technology' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', price: 170.30, change: -2.30, marketCap: 275000000000, sector: 'Technology' },
  { symbol: 'QCOM', name: 'Qualcomm Inc.', price: 185.60, change: 2.10, marketCap: 205000000000, sector: 'Technology' },
  { symbol: 'INTC', name: 'Intel Corp.', price: 30.50, change: -3.40, marketCap: 130000000000, sector: 'Technology' },

  // FINANCE SECTOR
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 195.40, change: 0.65, marketCap: 560000000000, sector: 'Finance' },
  { symbol: 'BAC', name: 'Bank of America Corp.', price: 38.20, change: 0.15, marketCap: 300000000000, sector: 'Finance' },
  { symbol: 'WFC', name: 'Wells Fargo & Co.', price: 58.60, change: -0.80, marketCap: 205000000000, sector: 'Finance' },
  { symbol: 'MS', name: 'Morgan Stanley', price: 92.30, change: 1.10, marketCap: 150000000000, sector: 'Finance' },
  { symbol: 'GS', name: 'Goldman Sachs Group', price: 410.50, change: -1.25, marketCap: 135000000000, sector: 'Finance' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', price: 405.00, change: 0.40, marketCap: 880000000000, sector: 'Finance' },
  { symbol: 'V', name: 'Visa Inc.', price: 275.80, change: 0.50, marketCap: 560000000000, sector: 'Finance' },
  { symbol: 'MA', name: 'Mastercard Inc.', price: 450.20, change: -0.30, marketCap: 420000000000, sector: 'Finance' },

  // CONSUMER SECTOR
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 180.10, change: 1.95, marketCap: 1870000000000, sector: 'Consumer' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 175.50, change: -4.20, marketCap: 560000000000, sector: 'Consumer' },
  { symbol: 'WMT', name: 'Walmart Inc.', price: 60.40, change: 0.30, marketCap: 485000000000, sector: 'Consumer' },
  { symbol: 'HD', name: 'Home Depot Inc.', price: 350.60, change: -0.90, marketCap: 348000000000, sector: 'Consumer' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', price: 162.30, change: 0.10, marketCap: 390000000000, sector: 'Consumer' },
  { symbol: 'KO', name: 'Coca-Cola Co.', price: 61.20, change: -0.15, marketCap: 265000000000, sector: 'Consumer' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', price: 170.80, change: 0.25, marketCap: 235000000000, sector: 'Consumer' },
  { symbol: 'MCD', name: 'McDonald\'s Corp.', price: 265.40, change: -0.75, marketCap: 192000000000, sector: 'Consumer' },
  { symbol: 'COST', name: 'Costco Wholesale Corp.', price: 725.00, change: 1.40, marketCap: 320000000000, sector: 'Consumer' },
  { symbol: 'NKE', name: 'Nike Inc.', price: 92.50, change: -1.80, marketCap: 140000000000, sector: 'Consumer' },

  // HEALTHCARE SECTOR
  { symbol: 'LLY', name: 'Eli Lilly & Co.', price: 780.20, change: 2.50, marketCap: 740000000000, sector: 'Healthcare' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', price: 505.40, change: -1.40, marketCap: 465000000000, sector: 'Healthcare' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', price: 155.60, change: 0.05, marketCap: 375000000000, sector: 'Healthcare' },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', price: 125.30, change: 0.80, marketCap: 317000000000, sector: 'Healthcare' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', price: 165.40, change: -0.55, marketCap: 292000000000, sector: 'Healthcare' },
  { symbol: 'PFE', name: 'Pfizer Inc.', price: 28.20, change: -1.20, marketCap: 160000000000, sector: 'Healthcare' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific', price: 575.00, change: 0.90, marketCap: 220000000000, sector: 'Healthcare' },
  { symbol: 'ABT', name: 'Abbott Laboratories', price: 105.50, change: -0.30, marketCap: 183000000000, sector: 'Healthcare' },

  // ENERGY SECTOR
  { symbol: 'XOM', name: 'Exxon Mobil Corp.', price: 118.50, change: 1.15, marketCap: 470000000000, sector: 'Energy' },
  { symbol: 'CVX', name: 'Chevron Corp.', price: 155.20, change: 0.85, marketCap: 290000000000, sector: 'Energy' },
  { symbol: 'COP', name: 'ConocoPhillips', price: 122.40, change: 1.50, marketCap: 142000000000, sector: 'Energy' },
  { symbol: 'SLB', name: 'Schlumberger Ltd.', price: 52.30, change: 0.40, marketCap: 74000000000, sector: 'Energy' },
  { symbol: 'EOG', name: 'EOG Resources Inc.', price: 125.80, change: -0.50, marketCap: 72000000000, sector: 'Energy' },

  // INDUSTRIALS SECTOR
  { symbol: 'GE', name: 'General Electric Co.', price: 155.40, change: 1.65, marketCap: 168000000000, sector: 'Industrials' },
  { symbol: 'CAT', name: 'Caterpillar Inc.', price: 345.20, change: -1.10, marketCap: 172000000000, sector: 'Industrials' },
  { symbol: 'HON', name: 'Honeywell International Inc.', price: 195.80, change: 0.20, marketCap: 127000000000, sector: 'Industrials' },
  { symbol: 'UNP', name: 'Union Pacific Corp.', price: 235.40, change: -0.45, marketCap: 143000000000, sector: 'Industrials' },
  { symbol: 'LMT', name: 'Lockheed Martin Corp.', price: 460.50, change: 0.75, marketCap: 110000000000, sector: 'Industrials' },
  { symbol: 'UPS', name: 'United Parcel Service Inc.', price: 145.20, change: -1.30, marketCap: 124000000000, sector: 'Industrials' },

  // UTILITIES SECTOR
  { symbol: 'NEE', name: 'NextEra Energy Inc.', price: 65.40, change: 0.80, marketCap: 134000000000, sector: 'Utilities' },
  { symbol: 'SO', name: 'Southern Co.', price: 72.30, change: 0.25, marketCap: 79000000000, sector: 'Utilities' },
  { symbol: 'DUK', name: 'Duke Energy Corp.', price: 98.50, change: -0.10, marketCap: 76000000000, sector: 'Utilities' },
  { symbol: 'AEP', name: 'American Electric Power', price: 84.20, change: 0.35, marketCap: 44000000000, sector: 'Utilities' },
  { symbol: 'SRE', name: 'Sempra', price: 74.10, change: -0.50, marketCap: 47000000000, sector: 'Utilities' }
];

export const HK_STOCKS: Stock[] = [
  // TECHNOLOGY SECTOR
  { symbol: '0700.HK', name: 'Tencent Holdings Ltd.', price: 380.20, change: 1.85, marketCap: 3580000000000, sector: 'Technology' },
  { symbol: '9988.HK', name: 'Alibaba Group Holding Ltd.', price: 78.50, change: -0.90, marketCap: 1620000000000, sector: 'Technology' },
  { symbol: '3690.HK', name: 'Meituan', price: 118.40, change: 3.40, marketCap: 740000000000, sector: 'Technology' },
  { symbol: '1810.HK', name: 'Xiaomi Corp.', price: 18.20, change: 2.15, marketCap: 450000000000, sector: 'Technology' },
  { symbol: '9618.HK', name: 'JD.com Inc.', price: 125.60, change: -1.50, marketCap: 390000000000, sector: 'Technology' },
  { symbol: '9888.HK', name: 'Baidu Inc.', price: 98.40, change: -0.75, marketCap: 345000000000, sector: 'Technology' },
  { symbol: '9999.HK', name: 'NetEase Inc.', price: 148.50, change: 1.10, marketCap: 480000000000, sector: 'Technology' },
  { symbol: '2015.HK', name: 'Li Auto Inc.', price: 82.30, change: -5.40, marketCap: 172000000000, sector: 'Technology' },
  { symbol: '9868.HK', name: 'XPeng Inc.', price: 32.10, change: -4.20, marketCap: 61000000000, sector: 'Technology' },
  { symbol: '9866.HK', name: 'NIO Inc.', price: 40.50, change: -3.80, marketCap: 84000000000, sector: 'Technology' },

  // FINANCE SECTOR
  { symbol: '0005.HK', name: 'HSBC Holdings plc', price: 68.45, change: 0.50, marketCap: 1280000000000, sector: 'Finance' },
  { symbol: '1299.HK', name: 'AIA Group Ltd.', price: 62.30, change: -1.20, marketCap: 700000000000, sector: 'Finance' },
  { symbol: '0939.HK', name: 'China Construction Bank Corp.', price: 5.80, change: 0.85, marketCap: 1450000000000, sector: 'Finance' },
  { symbol: '1398.HK', name: 'Industrial & Commercial Bank', price: 4.60, change: 0.40, marketCap: 1640000000000, sector: 'Finance' },
  { symbol: '3988.HK', name: 'Bank of China Ltd.', price: 3.90, change: 0.60, marketCap: 1150000000000, sector: 'Finance' },
  { symbol: '2318.HK', name: 'Ping An Insurance Group', price: 39.50, change: -1.05, marketCap: 710000000000, sector: 'Finance' },
  { symbol: '3968.HK', name: 'China Merchants Bank Co.', price: 35.40, change: 1.25, marketCap: 890000000000, sector: 'Finance' },
  { symbol: '0388.HK', name: 'Hong Kong Exchanges & Clearing', price: 268.40, change: -0.60, marketCap: 340000000000, sector: 'Finance' },

  // CONSUMER SECTOR
  { symbol: '9633.HK', name: 'Nongfu Spring Co. Ltd.', price: 42.10, change: -1.15, marketCap: 470000000000, sector: 'Consumer' },
  { symbol: '2319.HK', name: 'China Mengniu Dairy Co.', price: 15.40, change: 0.20, marketCap: 61000000000, sector: 'Consumer' },
  { symbol: '0291.HK', name: 'China Resources Beer Holdings', price: 28.50, change: -0.90, marketCap: 92000000000, sector: 'Consumer' },
  { symbol: '1928.HK', name: 'Sands China Ltd.', price: 18.40, change: -2.30, marketCap: 148000000000, sector: 'Consumer' },
  { symbol: '2020.HK', name: 'ANTA Sports Products Ltd.', price: 82.50, change: 1.60, marketCap: 233000000000, sector: 'Consumer' },
  { symbol: '2331.HK', name: 'Li Ning Co. Ltd.', price: 17.20, change: -3.10, marketCap: 45000000000, sector: 'Consumer' },
  { symbol: '6690.HK', name: 'Haier Smart Home Co. Ltd.', price: 29.40, change: 1.10, marketCap: 278000000000, sector: 'Consumer' },
  { symbol: '0288.HK', name: 'WH Group Ltd.', price: 5.30, change: 0.40, marketCap: 68000000000, sector: 'Consumer' },
  { symbol: '1918.HK', name: 'Sunac China Holdings Ltd.', price: 1.20, change: -6.50, marketCap: 10000000000, sector: 'Consumer' },
  { symbol: '1109.HK', name: 'China Resources Land Ltd.', price: 28.30, change: 1.40, marketCap: 202000000000, sector: 'Consumer' },

  // HEALTHCARE SECTOR
  { symbol: '2269.HK', name: 'Wuxi Biologics Cayman Inc.', price: 12.40, change: -3.80, marketCap: 53000000000, sector: 'Healthcare' },
  { symbol: '1093.HK', name: 'CSPC Pharmaceutical Group Ltd.', price: 6.80, change: 0.15, marketCap: 81000000000, sector: 'Healthcare' },
  { symbol: '1177.HK', name: 'Sino Biopharmaceutical Ltd.', price: 3.20, change: -0.80, marketCap: 60000000000, sector: 'Healthcare' },
  { symbol: '1801.HK', name: 'Innovent Biologics Inc.', price: 38.50, change: 2.40, marketCap: 62000000000, sector: 'Healthcare' },
  { symbol: '3692.HK', name: 'Wuxi AppTec Co. Ltd.', price: 39.20, change: -4.50, marketCap: 115000000000, sector: 'Healthcare' },
  { symbol: '2616.HK', name: 'CStone Pharmaceuticals', price: 1.15, change: -2.10, marketCap: 1500000000, sector: 'Healthcare' },
  { symbol: '1548.HK', name: 'Genscript Biotech Corp.', price: 9.40, change: 1.80, marketCap: 20000000000, sector: 'Healthcare' },
  { symbol: '0999.HK', name: 'China Resources Sanjiu Medical', price: 58.20, change: 0.50, marketCap: 57000000000, sector: 'Healthcare' },

  // ENERGY SECTOR
  { symbol: '0857.HK', name: 'PetroChina Co. Ltd.', price: 7.25, change: 1.65, marketCap: 1320000000000, sector: 'Energy' },
  { symbol: '0386.HK', name: 'China Petroleum & Chemical', price: 4.85, change: 0.80, marketCap: 590000000000, sector: 'Energy' },
  { symbol: '0883.HK', name: 'CNOOC Ltd.', price: 20.40, change: 2.50, marketCap: 910000000000, sector: 'Energy' },
  { symbol: '1088.HK', name: 'China Shenhua Energy Co. Ltd.', price: 35.80, change: 1.10, marketCap: 710000000000, sector: 'Energy' },
  { symbol: '3993.HK', name: 'China Molybdenum Co. Ltd.', price: 7.50, change: -1.20, marketCap: 162000000000, sector: 'Energy' },

  // INDUSTRIALS SECTOR
  { symbol: '0066.HK', name: 'MTR Corp. Ltd.', price: 25.40, change: -0.30, marketCap: 158000000000, sector: 'Industrials' },
  { symbol: '0019.HK', name: 'Swire Pacific Ltd. A', price: 68.20, change: 0.75, marketCap: 100000000000, sector: 'Industrials' },
  { symbol: '0144.HK', name: 'China Merchants Port Holdings', price: 12.30, change: 1.10, marketCap: 50000000000, sector: 'Industrials' },
  { symbol: '0027.HK', name: 'Galaxy Entertainment Group Ltd.', price: 35.40, change: -1.80, marketCap: 154000000000, sector: 'Industrials' },
  { symbol: '0267.HK', name: 'CITIC Ltd.', price: 7.80, change: 0.50, marketCap: 227000000000, sector: 'Industrials' },
  { symbol: '1199.HK', name: 'COSCO SHIPPING Ports Ltd.', price: 5.15, change: -0.40, marketCap: 18000000000, sector: 'Industrials' },

  // UTILITIES SECTOR
  { symbol: '0002.HK', name: 'CLP Holdings Ltd.', price: 64.20, change: 0.30, marketCap: 162000000000, sector: 'Utilities' },
  { symbol: '0003.HK', name: 'Hong Kong & China Gas Co.', price: 6.15, change: -0.20, marketCap: 115000000000, sector: 'Utilities' },
  { symbol: '0006.HK', name: 'Power Assets Holdings Ltd.', price: 48.50, change: 0.40, marketCap: 103000000000, sector: 'Utilities' },
  { symbol: '0902.HK', name: 'Huaneng Power International', price: 5.20, change: 1.85, marketCap: 82000000000, sector: 'Utilities' },
  { symbol: '0836.HK', name: 'China Resources Power Holdings', price: 22.40, change: 2.10, marketCap: 110000000000, sector: 'Utilities' }
];
```

---

## 3. Live Connectivity and Graceful Fallback (`src/services/api.ts`)
The connectivity service attempts to fetch from a public endpoint but will catch all errors (offline state, API rate limits (e.g. `429`), timeouts, malformed response structures) and gracefully fall back to local mock data. It also applies minor fluctuations to the mock data to simulate real-time market activity when in mock mode.

```typescript
import { MarketData, Stock } from '../types';
import { US_STOCKS, HK_STOCKS } from './mockData';

/**
 * Simulates real-time market price and change fluctuation (+/-1%)
 * to make the dashboard feel active even under fallback mock data mode.
 */
export function getFluctuatedMockData(stocks: Stock[]): Stock[] {
  return stocks.map(stock => {
    // Random fluctuation percentage between -1.0% and +1.0%
    const fluctuationPercent = (Math.random() * 2 - 1) * 0.01;
    const oldPrice = stock.price;
    const newPrice = Number((oldPrice * (1 + fluctuationPercent)).toFixed(2));
    
    // Calculate new change percentage relative to the original price structure
    const changeDelta = fluctuationPercent * 100;
    const newChange = Number((stock.change + changeDelta).toFixed(2));

    return {
      ...stock,
      price: newPrice,
      change: newChange,
    };
  });
}

// Configuration details for a stock market api
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_STOCK_API_URL || 'https://api.example.com/v1',
  apiKey: import.meta.env.VITE_STOCK_API_KEY || '', // Left empty by default to trigger mock fallback
  timeoutMs: 5000, // 5 seconds request timeout
};

/**
 * Fetches recent quotes for the given market.
 * Fallback pattern handles rate limits, offline states, and server failures.
 */
export async function fetchMarketData(market: 'US' | 'HK'): Promise<MarketData> {
  const defaultMockStocks = market === 'US' ? US_STOCKS : HK_STOCKS;

  // Rule 1: Fail-fast fallback if no API key is supplied
  if (!API_CONFIG.apiKey || API_CONFIG.apiKey === 'YOUR_API_KEY') {
    return {
      market,
      stocks: getFluctuatedMockData(defaultMockStocks),
      isMock: true,
      lastUpdated: new Date().toISOString(),
    };
  }

  // Rule 2: Execute network fetch with timeout boundary
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);

  try {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/market?type=${market}&apikey=${API_CONFIG.apiKey}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    // Rule 3: Catch rate limit (429) or other non-success HTTP status codes
    if (!response.ok) {
      throw new Error(`API returned unsuccessful response code: ${response.status}`);
    }

    const data = await response.json();

    // Rule 4: Validate expected API response payload structure
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
    
    // Distinguish abort error vs standard network errors in diagnostic warning
    const errMessage = error?.name === 'AbortError' 
      ? 'Request timed out' 
      : (error?.message || String(error));
      
    console.warn(`[StockDataService] Fallback active: Failed to fetch live data for ${market}. Reason: ${errMessage}`);

    // Rule 5: Gracefully return fluctuated mock data
    return {
      market,
      stocks: getFluctuatedMockData(defaultMockStocks),
      isMock: true,
      lastUpdated: new Date().toISOString(),
    };
  }
}
```

---

## 4. On-Screen Status Indicator Component (`src/components/DataStatusIndicator.tsx`)
A status indicator component providing visibility into connection health. It strictly aligns with the required testing contract:
- `[data-testid="data-status-indicator"]` containing descriptive status text.
- `[data-testid="data-source-indicator"]` exposing a custom attribute `data-source="live"` or `data-source="mock"`.

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
        {/* Source indicator tag conforming to requirements */}
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

        {/* Status text conforming to requirements */}
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

---

## 5. Vitest Unit Test Suite (`src/services/api.test.ts`)
This test suite uses Vitest to thoroughly verify the `fetchMarketData` connectivity service. It overrides the global `fetch` object and mocks the configuration environment variables to assert both the standard API paths and the multiple fallback conditions.

```typescript
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
    const apiPayload = {
      stocks: [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 180.50, change: 1.2, marketCap: 2800000000000, sector: 'Technology' },
        { symbol: 'MSFT', name: 'Microsoft Corp.', price: 420.20, change: -0.5, marketCap: 3100000000000, sector: 'Technology' }
      ]
    };

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

  it('gracefully falls back to mock data if API key environment variable is empty', async () => {
    vi.stubEnv('VITE_STOCK_API_KEY', ''); // Clear key

    const result = await fetchMarketData('US');

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.isMock).toBe(true);
    expect(result.market).toBe('US');
    expect(result.stocks.length).toBe(US_STOCKS.length);
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
    expect(fluctuated[0].price).toBeGreaterThan(99.00);
    expect(fluctuated[0].price).toBeLessThan(101.00);
    expect(fluctuated[0].change).not.toBe(2.0); // Verify change percentage updates accordingly
  });
});
```
