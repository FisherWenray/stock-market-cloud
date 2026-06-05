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
