import { MarketData, Stock, IndexData } from '../types';
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
  timeoutMs: 5000,
};

export async function fetchMarketData(market: 'US' | 'HK', lang: 'zh' | 'en' = 'zh'): Promise<MarketData> {
  const defaultMockStocks = market === 'US' ? US_STOCKS : HK_STOCKS;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);

  try {
    let fetchPromises: Promise<Response>[] = [];

    if (API_CONFIG.apiKey && API_CONFIG.apiKey !== 'YOUR_API_KEY') {
      const url = `${API_CONFIG.baseUrl}/market?type=${market}&apikey=${API_CONFIG.apiKey}`;
      fetchPromises.push(fetch(url, { signal: controller.signal }));
    } else {
      const tencentTickers = defaultMockStocks.map(s => {
        if (market === 'US') {
          return `us${s.symbol}`;
        } else {
          const numPart = s.symbol.split('.')[0];
          const padded = numPart.padStart(5, '0');
          return `hk${padded}`;
        }
      });

      const chunkSize = 100;
      for (let i = 0; i < tencentTickers.length; i += chunkSize) {
        const chunk = tencentTickers.slice(i, i + chunkSize);
        const url = `/api-yahoo/q=${chunk.join(',')}`;
        fetchPromises.push(fetch(url, { signal: controller.signal }));
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

        let symbol = '';
        if (market === 'US') {
          symbol = rawTicker.replace('v_us', '');
        } else {
          const cleanCode = rawTicker.replace('v_hk', '');
          const matchedStock = defaultMockStocks.find(s => {
            const sCode = s.symbol.split('.')[0];
            return Number(sCode) === Number(cleanCode);
          });
          symbol = matchedStock ? matchedStock.symbol : cleanCode + '.HK';
        }

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
      } else if (typeof data !== 'undefined' && data !== null && Array.isArray(data.stocks)) {
        mappedStocks = data.stocks.map((stockItem: any) => ({
          symbol: String(stockItem.symbol),
          name: String(stockItem.name || stockItem.symbol),
          price: Number(stockItem.price),
          change: Number(stockItem.change),
          marketCap: Number(stockItem.marketCap),
          sector: String(stockItem.sector),
        }));
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

export async function fetchMarketIndices(market: 'US' | 'HK'): Promise<IndexData[]> {
  const symbols = market === 'US' ? ['usINX', 'usDJI', 'usIXIC'] : ['hkHSI', 'hkHSTECH', 'hkHSCEI'];
  const mockData: IndexData[] = market === 'US' 
    ? [
        { symbol: 'usINX', nameKey: 'usINX', price: 7479.50, change: -1.38 },
        { symbol: 'usDJI', nameKey: 'usDJI', price: 51278.62, change: -0.55 },
        { symbol: 'usIXIC', nameKey: 'usIXIC', price: 26199.83, change: -2.35 },
      ]
    : [
        { symbol: 'hkHSI', nameKey: 'hkHSI', price: 18567.89, change: -1.20 },
        { symbol: 'hkHSTECH', nameKey: 'hkHSTECH', price: 3845.67, change: -2.15 },
        { symbol: 'hkHSCEI', nameKey: 'hkHSCEI', price: 6543.21, change: -1.05 },
      ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);

  try {
    const url = `https://qt.gtimg.cn/q=${symbols.join(',')}`;

    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error('Indices API fetch failed');
    
    const text = await res.text();
    clearTimeout(timeoutId);

    const items = text.split(';').filter(line => line.trim().length > 0);
    if (items.length === 0) throw new Error('Empty Indices response');
    return items.map((item, idx) => {
      const fields = item.split('~');
      return {
        symbol: symbols[idx],
        nameKey: symbols[idx],
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
