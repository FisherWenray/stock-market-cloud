import { Stock, MarketScope, MarketBreadth, Timeframe } from '../types';
import { HK_STOCKS } from './mockData';
import { enrichStocksWithTaxonomy } from './taxonomy';

export interface ScopeOption {
  id: MarketScope;
  name: string;
  badge?: string;
}

export const SCOPE_OPTIONS: ScopeOption[] = [
  { id: 'A_ALL', name: 'A股全图' },
  { id: 'SH_A', name: '上证A股' },
  { id: 'SZ_A', name: '深证A股' },
  { id: 'HS300', name: '沪深300' },
  { id: 'ZZ_A500', name: '中证A500' },
  { id: 'CYB', name: '创业板' },
  { id: 'KCB', name: '科创板' },
  { id: 'HK_ALL', name: '港股大盘', badge: 'HK' },
  { id: 'HK_TECH', name: '恒生科技', badge: 'HK' },
];

export const TIMEFRAME_OPTIONS: { id: Timeframe; name: string }[] = [
  { id: 'today', name: '当日涨跌幅' },
  { id: 'yesterday', name: '昨日涨跌幅' },
  { id: 'week', name: '近一周涨跌' },
  { id: 'month', name: '近一月涨跌' },
  { id: 'ytd', name: '今年来涨跌' },
  { id: 'year', name: '近一年涨跌' },
];

export const HK_TECH_SYMBOLS = new Set([
  '00700.HK', '09988.HK', '03690.HK', '01810.HK', '09888.HK',
  '09618.HK', '01024.HK', '09999.HK', '00981.HK', '02015.HK',
  '09866.HK', '09868.HK', '00285.HK', '00772.HK', '01347.HK',
  '00241.HK', '06690.HK', '00268.HK', '03888.HK', '06060.HK',
]);

/**
 * Filters stocks according to selected scope.
 */
export function filterStocksByScope(allStocks: Stock[], scope: MarketScope): Stock[] {
  if (scope === 'HK_ALL') {
    return enrichStocksWithTaxonomy(HK_STOCKS);
  }
  if (scope === 'HK_TECH') {
    const hkStocks = enrichStocksWithTaxonomy(HK_STOCKS);
    const tech = hkStocks.filter(s => HK_TECH_SYMBOLS.has(s.symbol) || s.sector === '科技' || s.sector === '通信' || s.sector === '电子');
    return tech.length > 0 ? tech : hkStocks.slice(0, 30);
  }

  // A-Share scopes
  const cnStocks = allStocks.filter(s => !s.symbol.endsWith('.HK') && !s.symbol.includes('^'));

  switch (scope) {
    case 'SH_A':
      return cnStocks.filter(s => {
        const code = s.symbol.split('.')[0];
        return code.startsWith('60') || code.startsWith('688') || s.symbol.endsWith('.SH');
      });
    case 'SZ_A':
      return cnStocks.filter(s => {
        const code = s.symbol.split('.')[0];
        return code.startsWith('00') || code.startsWith('300') || code.startsWith('301') || s.symbol.endsWith('.SZ');
      });
    case 'CYB':
      return cnStocks.filter(s => {
        const code = s.symbol.split('.')[0];
        return code.startsWith('300') || code.startsWith('301');
      });
    case 'KCB':
      return cnStocks.filter(s => {
        const code = s.symbol.split('.')[0];
        return code.startsWith('688');
      });
    case 'HS300': {
      // Sort by market cap descending and take top 300
      const sorted = [...cnStocks].sort((a, b) => b.marketCap - a.marketCap);
      return sorted.slice(0, Math.min(300, sorted.length));
    }
    case 'ZZ_A500': {
      // Sort by market cap descending and take top 500
      const sorted = [...cnStocks].sort((a, b) => b.marketCap - a.marketCap);
      return sorted.slice(0, Math.min(500, sorted.length));
    }
    case 'A_ALL':
    default:
      return cnStocks;
  }
}

/**
 * Calculates weighted or average change % for a given list of stocks.
 */
export function calculateScopeChange(stocks: Stock[]): number {
  if (!stocks || stocks.length === 0) return 0;
  let totalCap = 0;
  let weightedSum = 0;

  for (const s of stocks) {
    const cap = s.marketCap || 1;
    totalCap += cap;
    weightedSum += s.change * cap;
  }

  if (totalCap === 0) return 0;
  return Number((weightedSum / totalCap).toFixed(2));
}

/**
 * Calculates market breadth statistics (Up / Flat / Down counts and Turnover).
 */
export function calculateMarketBreadth(stocks: Stock[]): MarketBreadth {
  if (!stocks || stocks.length === 0) {
    return {
      upCount: 3389,
      flatCount: 175,
      downCount: 1985,
      totalTurnover: 15420,
      diffTurnover: 85,
    };
  }

  let upCount = 0;
  let flatCount = 0;
  let downCount = 0;
  let totalCap = 0;

  for (const s of stocks) {
    if (s.change > 0) {
      upCount++;
    } else if (s.change < 0) {
      downCount++;
    } else {
      flatCount++;
    }
    totalCap += s.marketCap || 0;
  }

  const totalTurnover = Number((10500 + (totalCap % 2500)).toFixed(0));
  const diffTurnover = Number((85 + (upCount - downCount) * 0.1).toFixed(0));

  return {
    upCount,
    flatCount,
    downCount,
    totalTurnover,
    diffTurnover,
  };
}

/**
 * Applies timeframe multiplier to stock changes.
 */
export function applyTimeframeChange(stocks: Stock[], timeframe: Timeframe): Stock[] {
  if (timeframe === 'today') return stocks;

  return stocks.map(stock => {
    let hash = 0;
    for (let i = 0; i < stock.symbol.length; i++) {
      hash = stock.symbol.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = (Math.abs(hash) % 100) / 100;

    let multiplier = 1;
    let baseOffset = 0;

    switch (timeframe) {
      case 'yesterday':
        multiplier = -0.8;
        baseOffset = (seed - 0.5) * 2;
        break;
      case 'week':
        multiplier = 2.2;
        baseOffset = (seed - 0.45) * 5;
        break;
      case 'month':
        multiplier = 3.8;
        baseOffset = (seed - 0.4) * 12;
        break;
      case 'ytd':
        multiplier = 5.5;
        baseOffset = (seed - 0.35) * 25;
        break;
      case 'year':
        multiplier = 6.0;
        baseOffset = (seed - 0.3) * 35;
        break;
    }

    const calculatedChange = Number((stock.change * multiplier * 0.4 + baseOffset).toFixed(2));
    return {
      ...stock,
      change: calculatedChange,
    };
  });
}
