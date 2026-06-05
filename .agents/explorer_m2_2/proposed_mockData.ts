import { Stock, MarketData } from '../types';

export const mockUsStocks: Stock[] = [
  // Technology
  { symbol: 'AAPL', name: 'Apple Inc.', price: 175.50, change: 1.25, marketCap: 2750000000000, sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 415.20, change: 0.85, marketCap: 3080000000000, sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.12, change: 3.40, marketCap: 2180000000000, sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 152.30, change: -0.45, marketCap: 1910000000000, sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 178.15, change: 1.10, marketCap: 1850000000000, sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms, Inc.', price: 505.40, change: -1.20, marketCap: 1290000000000, sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 170.18, change: -2.35, marketCap: 540000000000, sector: 'Technology' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', price: 1350.00, change: 2.15, marketCap: 620000000000, sector: 'Technology' },
  { symbol: 'ASML', name: 'ASML Holding N.V.', price: 920.50, change: 0.90, marketCap: 370000000000, sector: 'Technology' },
  { symbol: 'ADBE', name: 'Adobe Inc.', price: 485.60, change: -0.75, marketCap: 218000000000, sector: 'Technology' },
  { symbol: 'AMD', name: 'Advanced Micro Devices, Inc.', price: 168.20, change: -3.10, marketCap: 272000000000, sector: 'Technology' },
  { symbol: 'NFLX', name: 'Netflix, Inc.', price: 610.30, change: 1.80, marketCap: 264000000000, sector: 'Technology' },

  // Finance
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 195.40, change: 0.65, marketCap: 565000000000, sector: 'Finance' },
  { symbol: 'BAC', name: 'Bank of America Corporation', price: 37.20, change: -0.30, marketCap: 295000000000, sector: 'Finance' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', price: 58.40, change: 0.40, marketCap: 205000000000, sector: 'Finance' },
  { symbol: 'MS', name: 'Morgan Stanley', price: 92.80, change: -0.80, marketCap: 152000000000, sector: 'Finance' },
  { symbol: 'GS', name: 'The Goldman Sachs Group, Inc.', price: 410.50, change: 1.05, marketCap: 135000000000, sector: 'Finance' },
  { symbol: 'V', name: 'Visa Inc.', price: 275.60, change: 0.22, marketCap: 570000000000, sector: 'Finance' },
  { symbol: 'MA', name: 'Mastercard Incorporated', price: 460.10, change: 0.35, marketCap: 430000000000, sector: 'Finance' },
  { symbol: 'AXP', name: 'American Express Company', price: 220.30, change: 1.50, marketCap: 158000000000, sector: 'Finance' },
  { symbol: 'C', name: 'Citigroup Inc.', price: 62.50, change: -0.50, marketCap: 120000000000, sector: 'Finance' },
  { symbol: 'BLK', name: 'BlackRock, Inc.', price: 790.80, change: -1.15, marketCap: 118000000000, sector: 'Finance' },

  // Consumer
  { symbol: 'PG', name: 'The Procter & Gamble Company', price: 160.20, change: 0.15, marketCap: 380000000000, sector: 'Consumer' },
  { symbol: 'KO', name: 'The Coca-Cola Company', price: 61.10, change: -0.20, marketCap: 264000000000, sector: 'Consumer' },
  { symbol: 'PEP', name: 'PepsiCo, Inc.', price: 172.50, change: 0.45, marketCap: 236000000000, sector: 'Consumer' },
  { symbol: 'WMT', name: 'Walmart Inc.', price: 60.25, change: 0.80, marketCap: 485000000000, sector: 'Consumer' },
  { symbol: 'COST', name: 'Costco Wholesale Corporation', price: 725.40, change: -0.90, marketCap: 322000000000, sector: 'Consumer' },
  { symbol: 'NKE', name: 'NIKE, Inc.', price: 98.60, change: -1.50, marketCap: 148000000000, sector: 'Consumer' },
  { symbol: 'MCD', name: 'McDonald\'s Corporation', price: 282.10, change: 0.30, marketCap: 204000000000, sector: 'Consumer' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', price: 88.40, change: -1.10, marketCap: 100000000000, sector: 'Consumer' },
  { symbol: 'TGT', name: 'Target Corporation', price: 165.30, change: 2.10, marketCap: 76000000000, sector: 'Consumer' },
  { symbol: 'TJX', name: 'The TJX Companies, Inc.', price: 98.20, change: 0.55, marketCap: 112000000000, sector: 'Consumer' },

  // Healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson', price: 158.40, change: -0.35, marketCap: 382000000000, sector: 'Healthcare' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', price: 760.20, change: 2.45, marketCap: 722000000000, sector: 'Healthcare' },
  { symbol: 'UNH', name: 'UnitedHealth Group Incorporated', price: 490.50, change: -0.95, marketCap: 454000000000, sector: 'Healthcare' },
  { symbol: 'MRK', name: 'Merck & Co., Inc.', price: 125.60, change: 0.75, marketCap: 318000000000, sector: 'Healthcare' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', price: 178.30, change: 0.50, marketCap: 315000000000, sector: 'Healthcare' },
  { symbol: 'PFE', name: 'Pfizer Inc.', price: 27.80, change: -1.40, marketCap: 157000000000, sector: 'Healthcare' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.', price: 575.40, change: 1.15, marketCap: 220000000000, sector: 'Healthcare' },
  { symbol: 'ABT', name: 'Abbott Laboratories', price: 112.50, change: -0.10, marketCap: 195000000000, sector: 'Healthcare' },
  { symbol: 'AMGN', name: 'Amgen Inc.', price: 272.80, change: 0.60, marketCap: 146000000000, sector: 'Healthcare' },
  { symbol: 'CVS', name: 'CVS Health Corporation', price: 74.20, change: -2.05, marketCap: 93000000000, sector: 'Healthcare' },

  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', price: 118.50, change: -1.05, marketCap: 472000000000, sector: 'Energy' },
  { symbol: 'CVX', name: 'Chevron Corporation', price: 158.20, change: -0.80, marketCap: 298000000000, sector: 'Energy' },
  { symbol: 'COP', name: 'ConocoPhillips', price: 128.40, change: 0.60, marketCap: 150000000000, sector: 'Energy' },
  { symbol: 'SLB', name: 'Schlumberger Limited', price: 54.60, change: -1.50, marketCap: 77000000000, sector: 'Energy' },
  { symbol: 'EOG', name: 'EOG Resources, Inc.', price: 128.90, change: 0.35, marketCap: 74000000000, sector: 'Energy' },
  { symbol: 'MPC', name: 'Marathon Petroleum Corporation', price: 202.40, change: 1.95, marketCap: 72000000000, sector: 'Energy' },
  { symbol: 'PSX', name: 'Phillips 66', price: 162.50, change: 1.20, marketCap: 70000000000, sector: 'Energy' },
  { symbol: 'VLO', name: 'Valero Energy Corporation', price: 172.10, change: 2.10, marketCap: 56000000000, sector: 'Energy' },

  // Industrials
  { symbol: 'CAT', name: 'Caterpillar Inc.', price: 360.40, change: 1.30, marketCap: 180000000000, sector: 'Industrials' },
  { symbol: 'GE', name: 'General Electric Company', price: 156.80, change: 0.70, marketCap: 170000000000, sector: 'Industrials' },
  { symbol: 'UNP', name: 'Union Pacific Corporation', price: 242.30, change: -0.45, marketCap: 147000000000, sector: 'Industrials' },
  { symbol: 'HON', name: 'Honeywell International Inc.', price: 198.50, change: -0.20, marketCap: 129000000000, sector: 'Industrials' },
  { symbol: 'RTX', name: 'RTX Corporation', price: 98.40, change: 0.85, marketCap: 132000000000, sector: 'Industrials' },
  { symbol: 'LMT', name: 'Lockheed Martin Corporation', price: 450.60, change: 0.40, marketCap: 108000000000, sector: 'Industrials' },
  { symbol: 'DE', name: 'Deere & Company', price: 395.20, change: -1.65, marketCap: 110000000000, sector: 'Industrials' },
  { symbol: 'MMM', name: '3M Company', price: 92.50, change: -0.90, marketCap: 51000000000, sector: 'Industrials' },

  // Utilities
  { symbol: 'NEE', name: 'NextEra Energy, Inc.', price: 62.40, change: -0.50, marketCap: 128000000000, sector: 'Utilities' },
  { symbol: 'SO', name: 'The Southern Company', price: 70.80, change: 0.25, marketCap: 77000000000, sector: 'Utilities' },
  { symbol: 'DUK', name: 'Duke Energy Corporation', price: 96.10, change: 0.10, marketCap: 74000000000, sector: 'Utilities' },
  { symbol: 'AEP', name: 'American Electric Power Company, Inc.', price: 84.30, change: -0.30, marketCap: 44000000000, sector: 'Utilities' },
  { symbol: 'D', name: 'Dominion Energy, Inc.', price: 47.50, change: -0.85, marketCap: 40000000000, sector: 'Utilities' },
  { symbol: 'SRE', name: 'Sempra', price: 72.10, change: 0.65, marketCap: 45000000000, sector: 'Utilities' }
];

export const mockHkStocks: Stock[] = [
  // Technology
  { symbol: '0700.HK', name: 'Tencent Holdings Limited', price: 302.40, change: -1.20, marketCap: 2850000000000, sector: 'Technology' },
  { symbol: '9988.HK', name: 'Alibaba Group Holding Limited', price: 72.85, change: 0.45, marketCap: 1480000000000, sector: 'Technology' },
  { symbol: '3690.HK', name: 'Meituan', price: 98.50, change: 2.10, marketCap: 615000000000, sector: 'Technology' },
  { symbol: '1810.HK', name: 'Xiaomi Corporation', price: 15.60, change: 1.85, marketCap: 390000000000, sector: 'Technology' },
  { symbol: '9888.HK', name: 'Baidu, Inc.', price: 102.30, change: -0.90, marketCap: 288000000000, sector: 'Technology' },
  { symbol: '9618.HK', name: 'JD.com, Inc.', price: 108.40, change: -1.50, marketCap: 340000000000, sector: 'Technology' },
  { symbol: '9999.HK', name: 'NetEase, Inc.', price: 165.20, change: 3.10, marketCap: 535000000000, sector: 'Technology' },
  { symbol: '2015.HK', name: 'Li Auto Inc.', price: 118.60, change: -4.20, marketCap: 235000000000, sector: 'Technology' },
  { symbol: '9868.HK', name: 'XPeng Inc.', price: 35.40, change: -5.80, marketCap: 62000000000, sector: 'Technology' },
  { symbol: '9866.HK', name: 'NIO Inc.', price: 42.10, change: -3.90, marketCap: 72000000000, sector: 'Technology' },
  { symbol: '2018.HK', name: 'AAC Technologies Holdings Inc.', price: 22.50, change: 0.80, marketCap: 27000000000, sector: 'Technology' },
  { symbol: '0285.HK', name: 'BYD Electronic (International) Co., Ltd.', price: 28.30, change: 1.40, marketCap: 64000000000, sector: 'Technology' },

  // Finance
  { symbol: '0939.HK', name: 'China Construction Bank Corporation', price: 4.85, change: 0.20, marketCap: 1210000000000, sector: 'Finance' },
  { symbol: '1398.HK', name: 'Industrial and Commercial Bank of China Limited', price: 4.02, change: -0.50, marketCap: 1430000000000, sector: 'Finance' },
  { symbol: '3988.HK', name: 'Bank of China Limited', price: 3.25, change: 0.00, marketCap: 956000000000, sector: 'Finance' },
  { symbol: '2318.HK', name: 'Ping An Insurance (Group) Company of China, Ltd.', price: 38.60, change: -1.05, marketCap: 705000000000, sector: 'Finance' },
  { symbol: '2628.HK', name: 'China Life Insurance Company Limited', price: 9.88, change: -0.70, marketCap: 279000000000, sector: 'Finance' },
  { symbol: '1299.HK', name: 'AIA Group Limited', price: 62.50, change: 1.15, marketCap: 712000000000, sector: 'Finance' },
  { symbol: '0005.HK', name: 'HSBC Holdings plc', price: 64.20, change: 0.55, marketCap: 1230000000000, sector: 'Finance' },
  { symbol: '3968.HK', name: 'China Merchants Bank Co., Ltd.', price: 32.10, change: 1.40, marketCap: 810000000000, sector: 'Finance' },
  { symbol: '0388.HK', name: 'Hong Kong Exchanges and Clearing Limited', price: 238.40, change: -2.30, marketCap: 302000000000, sector: 'Finance' },
  { symbol: '2388.HK', name: 'BOC Hong Kong (Holdings) Limited', price: 22.15, change: 0.30, marketCap: 234000000000, sector: 'Finance' },

  // Consumer
  { symbol: '1211.HK', name: 'BYD Company Limited', price: 215.40, change: 2.80, marketCap: 627000000000, sector: 'Consumer' },
  { symbol: '0291.HK', name: 'China Resources Beer (Holdings) Company Limited', price: 34.20, change: -0.85, marketCap: 111000000000, sector: 'Consumer' },
  { symbol: '2319.HK', name: 'China Mengniu Dairy Company Limited', price: 17.50, change: -1.20, marketCap: 69000000000, sector: 'Consumer' },
  { symbol: '1928.HK', name: 'Sands China Ltd.', price: 20.15, change: 0.40, marketCap: 163000000000, sector: 'Consumer' },
  { symbol: '0288.HK', name: 'WH Group Limited', price: 5.12, change: 0.20, marketCap: 66000000000, sector: 'Consumer' },
  { symbol: '6098.HK', name: 'Country Garden Services Holdings Company Limited', price: 5.80, change: -3.50, marketCap: 19000000000, sector: 'Consumer' },
  { symbol: '6862.HK', name: 'Haidilao International Holding Ltd.', price: 14.30, change: 1.05, marketCap: 80000000000, sector: 'Consumer' },
  { symbol: '0027.HK', name: 'Galaxy Entertainment Group Limited', price: 42.50, change: -0.60, marketCap: 185000000000, sector: 'Consumer' },
  { symbol: '2020.HK', name: 'ANTA Sports Products Limited', price: 82.40, change: 0.95, marketCap: 233000000000, sector: 'Consumer' },
  { symbol: '2331.HK', name: 'Li Ning Company Limited', price: 20.30, change: -2.15, marketCap: 53000000000, sector: 'Consumer' },

  // Healthcare
  { symbol: '2269.HK', name: 'Wuxi Biologics (Cayman) Inc.', price: 18.50, change: -3.40, marketCap: 79000000000, sector: 'Healthcare' },
  { symbol: '1093.HK', name: 'CSPC Pharmaceutical Group Limited', price: 6.20, change: 0.80, marketCap: 74000000000, sector: 'Healthcare' },
  { symbol: '1177.HK', name: 'Sino Biopharmaceutical Limited', price: 3.15, change: -0.65, marketCap: 59000000000, sector: 'Healthcare' },
  { symbol: '1801.HK', name: 'Innovent Biologics, Inc.', price: 38.40, change: 2.10, marketCap: 62000000000, sector: 'Healthcare' },
  { symbol: '3692.HK', name: 'Hansoh Pharmaceutical Group Company Limited', price: 15.20, change: 1.30, marketCap: 90000000000, sector: 'Healthcare' },
  { symbol: '2616.HK', name: 'CStone Pharmaceuticals', price: 1.45, change: -2.50, marketCap: 2000000000, sector: 'Healthcare' },
  { symbol: '1548.HK', name: 'Genscript Biotech Corporation', price: 14.10, change: -1.05, marketCap: 30000000000, sector: 'Healthcare' },
  { symbol: '2162.HK', name: 'Akeso, Inc.', price: 48.20, change: 4.50, marketCap: 42000000000, sector: 'Healthcare' },

  // Energy
  { symbol: '0857.HK', name: 'PetroChina Company Limited', price: 6.42, change: 0.50, marketCap: 1170000000000, sector: 'Energy' },
  { symbol: '0883.HK', name: 'CNOOC Limited', price: 17.20, change: 1.85, marketCap: 768000000000, sector: 'Energy' },
  { symbol: '0386.HK', name: 'China Petroleum & Chemical Corporation', price: 4.55, change: -0.22, marketCap: 550000000000, sector: 'Energy' },
  { symbol: '1088.HK', name: 'China Shenhua Energy Company Limited', price: 32.40, change: 0.60, marketCap: 645000000000, sector: 'Energy' },
  { symbol: '1171.HK', name: 'Yankuang Energy Group Company Limited', price: 16.80, change: -1.40, marketCap: 125000000000, sector: 'Energy' },
  { symbol: '0836.HK', name: 'China Resources Power Holdings Company Limited', price: 18.90, change: 1.10, marketCap: 91000000000, sector: 'Energy' },

  // Industrials
  { symbol: '0066.HK', name: 'MTR Corporation Limited', price: 26.50, change: -0.30, marketCap: 164000000000, sector: 'Industrials' },
  { symbol: '0267.HK', name: 'CITIC Limited', price: 7.85, change: 0.40, marketCap: 228000000000, sector: 'Industrials' },
  { symbol: '1109.HK', name: 'China Resources Land Limited', price: 24.50, change: -1.80, marketCap: 175000000000, sector: 'Industrials' },
  { symbol: '0688.HK', name: 'China Overseas Land & Investment Limited', price: 11.20, change: -2.30, marketCap: 122000000000, sector: 'Industrials' },
  { symbol: '0175.HK', name: 'Geely Automobile Holdings Limited', price: 8.95, change: 0.50, marketCap: 90000000000, sector: 'Industrials' },
  { symbol: '1113.HK', name: 'CK Asset Holdings Limited', price: 36.20, change: -0.80, marketCap: 130000000000, sector: 'Industrials' },

  // Utilities
  { symbol: '0003.HK', name: 'The Hong Kong and China Gas Company Limited', price: 5.95, change: -0.20, marketCap: 111000000000, sector: 'Utilities' },
  { symbol: '0006.HK', name: 'Power Assets Holdings Limited', price: 47.80, change: 0.50, marketCap: 102000000000, sector: 'Utilities' },
  { symbol: '0002.HK', name: 'CLP Holdings Limited', price: 63.40, change: 0.10, marketCap: 160000000000, sector: 'Utilities' },
  { symbol: '1038.HK', name: 'CK Infrastructure Holdings Limited', price: 45.20, change: -0.40, marketCap: 114000000000, sector: 'Utilities' }
];

export const getMockMarketData = (market: 'US' | 'HK'): MarketData => {
  return {
    market,
    stocks: market === 'US' ? mockUsStocks : mockHkStocks,
    isMock: true,
    lastUpdated: new Date().toISOString()
  };
};
