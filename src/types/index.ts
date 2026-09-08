export type Market = 'US' | 'HK' | 'CN';

export type MarketScope =
  | 'A_ALL'     // A股全图
  | 'SH_A'      // 上证A股
  | 'SZ_A'      // 深证A股
  | 'HS300'     // 沪深300
  | 'ZZ_A500'   // 中证A500
  | 'CYB'       // 创业板
  | 'KCB'       // 科创板
  | 'HK_ALL'    // 港股大盘
  | 'HK_TECH';  // 恒生科技

export type Timeframe =
  | 'today'     // 当日涨跌幅
  | 'yesterday' // 昨日涨跌幅
  | 'week'      // 近一周涨跌
  | 'month'     // 近一月涨跌
  | 'ytd'       // 今年来涨跌
  | 'year';     // 近一年涨跌

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;       // Change percentage, e.g., +1.5 or -0.8
  marketCap: number;    // Market cap
  sector: string;       // Primary Sector, e.g., '电子'
  subsector?: string;   // Secondary Subsector, e.g., '半导体'
  pe?: number;          // P/E Ratio
  volume?: number;      // Trading volume
  turnover?: number;    // Trading turnover
  open?: number;
  high?: number;
  low?: number;
  prevClose?: number;
}

export interface MarketBreadth {
  upCount: number;
  flatCount: number;
  downCount: number;
  totalTurnover: number; // in 亿
  diffTurnover: number;  // in 亿 (+放量, -缩量)
}

export interface MarketIndexItem {
  name: string;
  code: string;
  point: number;
  changePercent: number;
  changeAmount?: number;
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
  selectedScope: MarketScope;
  timeframe: Timeframe;
  theme: ColorTheme;
  searchQuery: string;
  hoveredStock: Stock | null;
  selectedStock: Stock | null;
  selectedSubsector: { sector: string; subsector: string } | null;
  loading: boolean;
  error: string | null;
}
