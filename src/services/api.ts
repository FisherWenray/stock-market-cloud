import { MarketData, Stock, IndexData, Market } from '../types';
import { US_STOCKS, HK_STOCKS } from './mockData';
import { CN_STOCKS } from './cnStocks';

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

export function injectMockMetrics(stocks: Stock[]): Stock[] {
  return stocks.map(s => {
    let hash = 0;
    for (let i = 0; i < s.symbol.length; i++) {
      hash = s.symbol.charCodeAt(i) + ((hash << 5) - hash);
    }
    const pe = 10 + Math.abs(hash % 60);
    const baseVolume = s.marketCap / s.price / 1000;
    const volume = Math.floor(baseVolume * (0.5 + Math.abs(hash % 10) / 10)) || 1000;
    return { ...s, pe, volume };
  });
}

const API_CONFIG = {
  get baseUrl() {
    return import.meta.env.VITE_STOCK_API_URL || 'https://api.example.com/v1';
  },
  get apiKey() {
    return import.meta.env.VITE_STOCK_API_KEY || '';
  },
  get marketBackendUrl() {
    return import.meta.env.VITE_MARKET_BACKEND_URL || '/api/market';
  },
  get marketLimit() {
    return Number(import.meta.env.VITE_MARKET_LIMIT || 1500);
  },
  timeoutMs: 15000,
};

function isTestRuntime(): boolean {
  return typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
}

function hasCustomApiKey(): boolean {
  return Boolean(API_CONFIG.apiKey && API_CONFIG.apiKey !== 'YOUR_API_KEY');
}

function getDefaultStocksForMarket(market: Market): Stock[] {
  if (market === 'US') return US_STOCKS;
  if (market === 'HK') return HK_STOCKS;
  return CN_STOCKS;
}

function getTencentTicker(symbol: string, market: Market): string {
  if (market === 'US') {
    return `us${symbol}`;
  }
  const [code, exchange] = symbol.split('.');
  if (market === 'HK') {
    return `hk${code.padStart(5, '0')}`;
  }
  return `${exchange.toLowerCase()}${code}`;
}

function parseTencentSymbol(rawTicker: string, market: Market, defaultMockStocks: Stock[]): string {
  if (market === 'US') {
    return rawTicker.replace('v_us', '');
  }
  if (market === 'HK') {
    const cleanCode = rawTicker.replace('v_hk', '');
    const matchedStock = defaultMockStocks.find(s => {
      const stockCode = s.symbol.split('.')[0];
      return Number(stockCode) === Number(cleanCode);
    });
    return matchedStock ? matchedStock.symbol : `${cleanCode}.HK`;
  }
  const cleanTicker = rawTicker.replace('v_', '');
  const exchange = cleanTicker.startsWith('sh') ? 'SH' : 'SZ';
  return `${cleanTicker.slice(2)}.${exchange}`;
}

async function fetchBackendMarketData(
  market: Market,
  signal: AbortSignal,
): Promise<MarketData | null> {
  if (isTestRuntime() || hasCustomApiKey() || import.meta.env.VITE_USE_MARKET_BACKEND === 'false') {
    return null;
  }

  const backendUrl = new URL(API_CONFIG.marketBackendUrl, window.location.origin);
  backendUrl.searchParams.set('type', market);
  backendUrl.searchParams.set('limit', String(API_CONFIG.marketLimit));

  try {
    const response = await fetch(backendUrl.toString(), { signal });
    if (!response.ok) {
      throw new Error(`Market backend returned ${response.status}`);
    }

    const payload = await response.json();
    if (!payload || !Array.isArray(payload.stocks) || payload.stocks.length === 0) {
      throw new Error('Market backend returned an empty stock list');
    }

    return {
      market,
      stocks: payload.stocks.map((stock: any) => ({
        symbol: String(stock.symbol),
        name: String(stock.name || stock.symbol),
        price: Number(stock.price || 0),
        change: Number(stock.change || 0),
        marketCap: Number(stock.marketCap || 0),
        sector: String(stock.sector || 'Other'),
        pe: stock.pe !== undefined ? Number(stock.pe) : undefined,
        volume: stock.volume !== undefined ? Number(stock.volume) : undefined,
      })),
      isMock: false,
      lastUpdated: String(payload.lastUpdated || new Date().toISOString()),
    };
  } catch (error) {
    console.warn('[StockDataService] Market backend unavailable. Falling back to legacy client fetch.', error);
    return null;
  }
}

async function fetchWithFallback(targetUrl: string, devUrl: string, signal: AbortSignal): Promise<Response> {
  const isTest = isTestRuntime();

  if (import.meta.env.DEV) {
    return fetch(devUrl, isTest ? {} : { signal });
  }

  try {
    const controller = new AbortController();
    const subTimeoutId = setTimeout(() => controller.abort(), 6000); // 6 seconds limit for direct fetch
    
    const onAbort = () => controller.abort();
    if (!isTest) {
      signal.addEventListener('abort', onAbort);
    }

    const fetchOpts: RequestInit = {};
    if (!isTest) {
      fetchOpts.signal = controller.signal;
    }

    const res = await fetch(targetUrl, fetchOpts);
    clearTimeout(subTimeoutId);
    if (!isTest) {
      signal.removeEventListener('abort', onAbort);
    }
    
    if (res.ok) {
      return res;
    }
  } catch (e) {
    console.warn(`[StockDataService] Direct fetch to ${targetUrl} failed or timed out. Falling back to CORS proxy. Error:`, e);
  }

  // Fallback to AllOrigins proxy
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
  return fetch(proxyUrl, isTest ? {} : { signal });
}

export async function fetchMarketData(market: Market, lang: 'zh' | 'en' = 'zh'): Promise<MarketData> {
  const defaultMockStocks = getDefaultStocksForMarket(market);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);

  try {
    const backendData = await fetchBackendMarketData(market, controller.signal);
    if (backendData) {
      clearTimeout(timeoutId);
      return backendData;
    }

    let fetchPromises: Promise<Response>[] = [];

    if (hasCustomApiKey()) {
      const url = `${API_CONFIG.baseUrl}/market?type=${market}&apikey=${API_CONFIG.apiKey}`;
      fetchPromises.push(fetch(url, { signal: controller.signal }));
    } else {
      const tencentTickers = defaultMockStocks.map(s => getTencentTicker(s.symbol, market));

      const chunkSize = 100;
      for (let i = 0; i < tencentTickers.length; i += chunkSize) {
        const chunk = tencentTickers.slice(i, i + chunkSize);
        const targetUrl = `https://qt.gtimg.cn/q=${chunk.join(',')}&_=${Date.now()}`;
        const devUrl = `/api-yahoo/q=${chunk.join(',')}`;
        fetchPromises.push(fetchWithFallback(targetUrl, devUrl, controller.signal));
      }
    }

    console.log(`[StockDataService] Fetching ${fetchPromises.length} chunks...`);
    const responses = await Promise.all(fetchPromises);
    clearTimeout(timeoutId);

    let combinedText = '';
    let isJsonParsed = false;
    let allJsonResults: any[] = [];

    for (const response of responses) {
      if (!response.ok) {
        throw new Error(`API returned unsuccessful response code: ${response.status}`);
      }

      let text = '';
      if (typeof response.arrayBuffer === 'function') {
        try {
          const buffer = await response.arrayBuffer();
          const decoder = new TextDecoder('gbk');
          text = decoder.decode(buffer);
        } catch (e) {
          // Ignored
        }
      } else if (typeof response.text === 'function') {
        try {
          text = await response.text();
        } catch (e) {
          // Ignored
        }
      }

      if (text && text.trim().startsWith('v_')) {
        combinedText += text + '\n';
      } else {
        let jsonPayload = null;
        if (text) {
          try { jsonPayload = JSON.parse(text); } catch(e) {}
        } else if (typeof response.json === 'function') {
          try { jsonPayload = await response.json(); } catch(e) {}
        }
        
        if (jsonPayload) {
          isJsonParsed = true;
          if (jsonPayload.quoteResponse && Array.isArray(jsonPayload.quoteResponse.result)) {
            allJsonResults.push(...jsonPayload.quoteResponse.result);
          } else if (Array.isArray(jsonPayload)) {
            allJsonResults.push(...jsonPayload);
          } else if (jsonPayload.stocks && Array.isArray(jsonPayload.stocks)) {
            allJsonResults.push(...jsonPayload.stocks);
          }
        }
      }
    }

    let mappedStocks: Stock[] = [];

    console.log('[StockDataService] Text length:', combinedText.length, '| Starts with v_:', combinedText.trim().startsWith('v_'));

    if (combinedText && combinedText.trim().startsWith('v_')) {
      // Plain text parsing (Tencent GTimg format)
      const lines = combinedText.split('\n').filter(Boolean);
      const sectorMap = new Map(defaultMockStocks.map(s => [s.symbol, s.sector]));
      const nameMap = new Map(defaultMockStocks.map(s => [s.symbol, s.name]));

      for (const line of lines) {
        const parts = line.split('="');
        if (parts.length < 2) continue;
        
        const rawTicker = parts[0].trim(); // e.g. "v_usAAPL" or "v_hk00700"
        const dataStr = parts[1].slice(0, -2); // Remove trailing ";
        const fields = dataStr.split('~');

        if (fields.length < 46) continue;

        const symbol = parseTencentSymbol(rawTicker, market, defaultMockStocks);

        const price = parseFloat(fields[3]) || 0;
        const change = parseFloat(fields[32]) || 0;
        const marketCap = (parseFloat(fields[45]) || 0) * 1e8; // Convert 100M to base unit

        const engName = nameMap.get(symbol);
        const zhName = fields[1];
        
        const finalName = lang === 'zh' 
          ? (zhName || engName || fields[46] || symbol)
          : (engName || fields[46] || zhName || symbol);

        mappedStocks.push({
          symbol,
          name: String(finalName),
          price,
          change,
          marketCap,
          sector: sectorMap.get(symbol) || String(fields[56] || 'Other'),
        });
      }

      console.log('[StockDataService] Tencent parsed stocks:', mappedStocks.length, '| Sample:', mappedStocks[0]?.symbol, mappedStocks[0]?.price);
      if (mappedStocks.length === 0) {
        throw new Error('Tencent API response was empty or failed to parse');
      }
    } else {
      // JSON format parsing (Yahoo or stocks format)
      if (isJsonParsed && allJsonResults.length > 0) {
        const sectorMap = new Map(defaultMockStocks.map(s => [s.symbol, s.sector]));
        const nameMap = new Map(defaultMockStocks.map(s => [s.symbol, s.name]));

        mappedStocks = allJsonResults.map((stockItem: any) => {
          const rawSymbol = String(stockItem.symbol);
          let symbol = rawSymbol === 'BRK-B' ? 'BRK.B' : rawSymbol;
          if (market === 'HK') {
            const matchedStock = defaultMockStocks.find(s => {
              const sCode = s.symbol.split('.')[0];
              return Number(sCode) === Number(rawSymbol.split('.')[0]);
            });
            if (matchedStock) symbol = matchedStock.symbol;
          } else if (market === 'CN') {
            const exchange = rawSymbol.startsWith('6') ? 'SH' : 'SZ';
            symbol = rawSymbol.includes('.') ? rawSymbol : `${rawSymbol}.${exchange}`;
          }
          const price = Number(stockItem.regularMarketPrice !== undefined ? stockItem.regularMarketPrice : (stockItem.price || 0));
          const change = Number(stockItem.regularMarketChangePercent !== undefined ? stockItem.regularMarketChangePercent : (stockItem.change || 0));
          const marketCap = Number(stockItem.marketCap || 0);

          return {
            symbol,
            name: String(stockItem.name || stockItem.shortName || nameMap.get(symbol) || symbol),
            price,
            change,
            marketCap,
            sector: sectorMap.get(symbol) || String(stockItem.sector || 'Other'),
          };
        });
      } else {
        throw new Error('Invalid schema format from API response payload');
      }
    }

    // Deduplicate stocks by symbol to handle mock overlaps or API anomalies
    const uniqueStocksMap = new Map<string, Stock>();
    for (const s of mappedStocks) {
      if (!uniqueStocksMap.has(s.symbol)) {
        uniqueStocksMap.set(s.symbol, s);
      }
    }
    mappedStocks = Array.from(uniqueStocksMap.values());

    console.log(`[StockDataService] Successfully mapped ${mappedStocks.length} stocks for ${market}`);

    return {
      market,
      stocks: injectMockMetrics(mappedStocks),
      isMock: false,
      lastUpdated: new Date().toISOString(),
    };

  } catch (error: any) {
    clearTimeout(timeoutId);
    const errMessage = error?.name === 'AbortError' 
      ? 'Request timed out' 
      : (error?.message || String(error));
    console.warn(`[StockDataService] Fallback active: Failed to fetch live data for ${market}. Reason: ${errMessage}`);
    console.error('[StockDataService] Full error:', error);

    return {
      market,
      stocks: injectMockMetrics(getFluctuatedMockData(defaultMockStocks)),
      isMock: true,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function fetchMarketIndices(market: Market): Promise<IndexData[]> {
  const symbols = market === 'US'
    ? ['usINX', 'usDJI', 'usIXIC']
    : market === 'HK'
      ? ['hkHSI', 'hkHSTECH', 'hkHSCEI']
      : ['sh000001', 'sz399001', 'sz399006'];
  const mockData: IndexData[] = market === 'US'
    ? [
        { symbol: 'usINX', nameKey: 'usINX', price: 7479.50, change: -1.38 },
        { symbol: 'usDJI', nameKey: 'usDJI', price: 51278.62, change: -0.55 },
        { symbol: 'usIXIC', nameKey: 'usIXIC', price: 26199.83, change: -2.35 },
      ]
    : market === 'HK'
      ? [
          { symbol: 'hkHSI', nameKey: 'hkHSI', price: 18567.89, change: -1.20 },
          { symbol: 'hkHSTECH', nameKey: 'hkHSTECH', price: 3845.67, change: -2.15 },
          { symbol: 'hkHSCEI', nameKey: 'hkHSCEI', price: 6543.21, change: -1.05 },
        ]
      : [
          { symbol: 'sh000001', nameKey: 'cnSHCOMP', price: 4090.48, change: -0.43 },
          { symbol: 'sz399001', nameKey: 'cnSZCOMP', price: 16030.70, change: 0.94 },
          { symbol: 'sz399006', nameKey: 'cnCHINEXT', price: 4252.39, change: 2.05 },
        ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);

  try {
    const targetUrl = `https://qt.gtimg.cn/q=${symbols.join(',')}&_=${Date.now()}`;
    const devUrl = `/api-yahoo/q=${symbols.join(',')}`;

    const res = await fetchWithFallback(targetUrl, devUrl, controller.signal);
    if (!res.ok) throw new Error('Indices API fetch failed');
    
    let text = '';
    try {
      const buffer = await res.arrayBuffer();
      const decoder = new TextDecoder('gbk');
      text = decoder.decode(buffer);
    } catch (e) {
      text = await res.text();
    }
    clearTimeout(timeoutId);

    const items = text.split(';').filter(line => line.trim().length > 0);
    if (items.length === 0) throw new Error('Empty Indices response');
    return items.map((item, idx) => {
      const fields = item.split('~');
      return {
        symbol: symbols[idx],
        nameKey: mockData[idx].nameKey,
        price: Number(fields[3] || 0),
        change: Number(fields[32] || 0)
      };
    });
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`[StockDataService] Fallback active for indices: ${err}`);
    return mockData.map(idx => ({
      ...idx,
      price: Number((idx.price * (1 + (Math.random() * 2 - 1) * 0.005)).toFixed(2)),
      change: Number((idx.change + (Math.random() * 2 - 1) * 0.5).toFixed(2))
    }));
  }
}
