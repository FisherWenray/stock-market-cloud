export type Market = 'US' | 'HK';

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;       // Change percentage, e.g., +1.5 or -0.8
  marketCap: number;    // Market cap in USD or HKD
  sector: string;       // Sector/Industry group, e.g., 'Technology'
  pe?: number;          // P/E Ratio (valuation)
  volume?: number;      // Trading volume
}

export interface MarketData {
  market: Market;
  stocks: Stock[];
  isMock: boolean;
  lastUpdated: string;
}

export interface IndexData {
  symbol: string;
  nameKey: string;
  price: number;
  change: number;
}

export type ColorTheme = 'international' | 'chinese';
export type Language = 'zh' | 'en';

export interface DashboardState {
  selectedMarket: Market;
  theme: ColorTheme;
  searchQuery: string;
  hoveredStock: Stock | null;
  loading: boolean;
  error: string | null;
}
