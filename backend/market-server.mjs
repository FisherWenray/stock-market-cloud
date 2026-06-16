import http from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const cacheDir = path.join(rootDir, '.market-cache');
const mockDataPath = path.join(rootDir, 'src', 'services', 'mockData.ts');

const PORT = Number(process.env.MARKET_SERVER_PORT || 8787);
const REFRESH_MS = Number(process.env.MARKET_REFRESH_MS || 5 * 60 * 1000);
const UNIVERSE_REFRESH_MS = Number(process.env.MARKET_UNIVERSE_REFRESH_MS || 12 * 60 * 60 * 1000);
const MAX_STOCKS_PER_RESPONSE = Number(process.env.MARKET_MAX_STOCKS || 1500);
const ENABLE_HK_FULL_SCAN = process.env.MARKET_HK_FULL_SCAN !== 'false';

const NASDAQ_LISTED_URL = 'https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt';
const OTHER_LISTED_URL = 'https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt';
const TENCENT_QUOTE_URL = 'https://qt.gtimg.cn/q=';

const state = {
  universe: { US: [], HK: [] },
  knownMeta: { US: new Map(), HK: new Map() },
  cache: { US: null, HK: null },
  lastUniverseRefresh: 0,
  refreshInFlight: new Map(),
};

const nowIso = () => new Date().toISOString();

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,OPTIONS',
    'access-control-allow-headers': 'content-type',
    'cache-control': 'no-store',
  });
  res.end(body);
}

function normalizeUsSymbol(symbol) {
  return String(symbol || '').trim().replace('-', '.');
}

function normalizeHkSymbol(symbol) {
  const code = String(symbol || '').split('.')[0].replace(/\D/g, '');
  return code ? `${code.padStart(5, '0')}.HK` : '';
}

function getTencentCode(symbol, market) {
  if (market === 'HK') {
    const code = normalizeHkSymbol(symbol).split('.')[0];
    return code ? `hk${code}` : '';
  }
  return `us${String(symbol).replace('-', '.')}`;
}

function parsePipeRows(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const [headerLine, ...rows] = lines;
  const headers = headerLine.split('|');
  return rows
    .filter(line => !line.startsWith('File Creation Time'))
    .map(line => {
      const values = line.split('|');
      return Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
    });
}

async function fetchText(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`${url} returned ${res.status}`);
    const buffer = await res.arrayBuffer();
    return new TextDecoder('utf-8').decode(buffer);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchGbkText(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`${url} returned ${res.status}`);
    const buffer = await res.arrayBuffer();
    return new TextDecoder('gbk').decode(buffer);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function loadFallbackUniverse() {
  const text = await readFile(mockDataPath, 'utf8');
  const usMatch = text.match(/export const US_STOCKS: Stock\[] = (\[[\s\S]*?\]);\s*export const HK_STOCKS/);
  const hkMatch = text.match(/export const HK_STOCKS: Stock\[] = (\[[\s\S]*?\]);\s*$/);
  const usStocks = usMatch ? JSON.parse(usMatch[1]) : [];
  const hkStocks = hkMatch ? JSON.parse(hkMatch[1]) : [];

  state.knownMeta.US = new Map(usStocks.map(stock => [stock.symbol, stock]));
  state.knownMeta.HK = new Map(hkStocks.map(stock => [stock.symbol, stock]));
  state.universe.US = usStocks.map(stock => ({
    symbol: stock.symbol,
    name: stock.name,
    sector: stock.sector,
    source: 'fallback',
  }));
  state.universe.HK = hkStocks.map(stock => ({
    symbol: normalizeHkSymbol(stock.symbol),
    name: stock.name,
    sector: stock.sector,
    source: 'fallback',
  }));
}

function isLikelyCommonEquity(name) {
  const upper = String(name || '').toUpperCase();
  const blocked = [
    'WARRANT',
    'RIGHT',
    'UNIT',
    'PREFERRED',
    'PREFERENCE',
    'NOTE',
    'BOND',
    'DEBENTURE',
    'ETF',
    'ETN',
    'FUND',
    'TRUST',
    'INDEX',
  ];
  return !blocked.some(term => upper.includes(term));
}

async function refreshUsUniverse() {
  const [nasdaqText, otherText] = await Promise.all([
    fetchText(NASDAQ_LISTED_URL),
    fetchText(OTHER_LISTED_URL),
  ]);

  const nasdaqRows = parsePipeRows(nasdaqText)
    .filter(row => row['Test Issue'] === 'N')
    .filter(row => row.ETF !== 'Y')
    .filter(row => isLikelyCommonEquity(row['Security Name']))
    .map(row => ({
      symbol: normalizeUsSymbol(row.Symbol),
      name: row['Security Name'],
      sector: state.knownMeta.US.get(normalizeUsSymbol(row.Symbol))?.sector || 'Other',
      source: 'nasdaqtrader',
    }));

  const otherRows = parsePipeRows(otherText)
    .filter(row => row['Test Issue'] === 'N')
    .filter(row => row.ETF !== 'Y')
    .filter(row => isLikelyCommonEquity(row['Security Name']))
    .map(row => ({
      symbol: normalizeUsSymbol(row['ACT Symbol']),
      name: row['Security Name'],
      sector: state.knownMeta.US.get(normalizeUsSymbol(row['ACT Symbol']))?.sector || 'Other',
      exchange: row.Exchange,
      source: 'nasdaqtrader',
    }));

  const bySymbol = new Map();
  for (const item of [...nasdaqRows, ...otherRows]) {
    if (item.symbol && !bySymbol.has(item.symbol)) {
      bySymbol.set(item.symbol, item);
    }
  }

  state.universe.US = Array.from(bySymbol.values());
}

function buildHkScanUniverse() {
  const symbols = [];
  for (let code = 1; code <= 9999; code += 1) {
    const symbol = `${String(code).padStart(5, '0')}.HK`;
    const known = state.knownMeta.HK.get(symbol);
    symbols.push({
      symbol,
      name: known?.name || symbol,
      sector: known?.sector || 'Other',
      source: known ? 'fallback' : 'hk-scan',
    });
  }
  return symbols;
}

async function refreshUniverse() {
  await loadFallbackUniverse();

  try {
    await refreshUsUniverse();
  } catch (error) {
    console.warn('[market-server] US universe refresh failed, using fallback list:', error.message);
  }

  if (ENABLE_HK_FULL_SCAN) {
    state.universe.HK = buildHkScanUniverse();
  }

  state.lastUniverseRefresh = Date.now();
  await mkdir(cacheDir, { recursive: true });
  await writeFile(
    path.join(cacheDir, 'universe.json'),
    JSON.stringify({
      generatedAt: nowIso(),
      counts: {
        US: state.universe.US.length,
        HK: state.universe.HK.length,
      },
      US: state.universe.US,
      HK: state.universe.HK,
    }),
    'utf8',
  );
}

function parseTencentQuoteLine(line, market) {
  const parts = line.split('="');
  if (parts.length < 2) return null;

  const rawTicker = parts[0].trim();
  const dataStr = parts[1].replace(/";?\s*$/, '');
  const fields = dataStr.split('~');
  if (fields.length < 46) return null;

  const symbol = market === 'HK'
    ? normalizeHkSymbol(rawTicker.replace('v_hk', ''))
    : rawTicker.replace('v_us', '');
  const price = Number.parseFloat(fields[3]) || 0;
  const change = Number.parseFloat(fields[32]) || 0;
  const marketCap = (Number.parseFloat(fields[45]) || 0) * 1e8;
  const name = fields[1] || symbol;

  if (!symbol || price <= 0 || !name || name === '0') return null;

  const meta = market === 'HK'
    ? state.knownMeta.HK.get(symbol)
    : state.knownMeta.US.get(symbol);

  return {
    symbol,
    name: meta?.name || name,
    price,
    change,
    marketCap,
    sector: meta?.sector || 'Other',
  };
}

async function fetchTencentQuotes(universe, market) {
  const chunks = [];
  const symbols = universe.map(item => item.symbol);
  for (let index = 0; index < symbols.length; index += 100) {
    chunks.push(symbols.slice(index, index + 100));
  }

  const stocks = [];
  for (const chunk of chunks) {
    const codes = chunk.map(symbol => getTencentCode(symbol, market)).filter(Boolean);
    if (codes.length === 0) continue;

    try {
      const text = await fetchGbkText(`${TENCENT_QUOTE_URL}${codes.join(',')}&_=${Date.now()}`);
      for (const line of text.split(/\r?\n|;/).filter(Boolean)) {
        const stock = parseTencentQuoteLine(line, market);
        if (stock) stocks.push(stock);
      }
    } catch (error) {
      console.warn(`[market-server] Tencent quote chunk failed for ${market}:`, error.message);
    }
  }

  const bySymbol = new Map();
  for (const stock of stocks) {
    if (!bySymbol.has(stock.symbol)) bySymbol.set(stock.symbol, stock);
  }
  return Array.from(bySymbol.values())
    .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
}

function injectDerivedMetrics(stocks) {
  return stocks.map(stock => {
    let hash = 0;
    for (let index = 0; index < stock.symbol.length; index += 1) {
      hash = stock.symbol.charCodeAt(index) + ((hash << 5) - hash);
    }
    const pe = 10 + Math.abs(hash % 60);
    const volumeBase = stock.marketCap > 0 && stock.price > 0
      ? stock.marketCap / stock.price / 1000
      : 1000;
    return {
      ...stock,
      pe,
      volume: Math.floor(volumeBase * (0.5 + Math.abs(hash % 10) / 10)) || 1000,
    };
  });
}

async function loadCacheFromDisk(market) {
  try {
    const text = await readFile(path.join(cacheDir, `${market}.json`), 'utf8');
    state.cache[market] = JSON.parse(text);
  } catch {
    state.cache[market] = null;
  }
}

async function refreshMarket(market) {
  const existing = state.refreshInFlight.get(market);
  if (existing) return existing;

  const promise = (async () => {
    if (Date.now() - state.lastUniverseRefresh > UNIVERSE_REFRESH_MS || state.universe[market].length === 0) {
      await refreshUniverse();
    }

    const stocks = injectDerivedMetrics(await fetchTencentQuotes(state.universe[market], market));
    if (stocks.length === 0) {
      throw new Error(`No live quotes parsed for ${market}`);
    }

    const payload = {
      market,
      stocks,
      isMock: false,
      source: 'market-server:tencent',
      universeCount: state.universe[market].length,
      lastUpdated: nowIso(),
    };

    state.cache[market] = payload;
    await mkdir(cacheDir, { recursive: true });
    await writeFile(path.join(cacheDir, `${market}.json`), JSON.stringify(payload), 'utf8');
    return payload;
  })().finally(() => {
    state.refreshInFlight.delete(market);
  });

  state.refreshInFlight.set(market, promise);
  return promise;
}

async function getMarketPayload(market, limit) {
  await loadCacheFromDisk(market);
  const cached = state.cache[market];
  const stale = !cached || Date.now() - Date.parse(cached.lastUpdated) > REFRESH_MS;

  if (!cached) {
    await refreshMarket(market);
  } else if (stale) {
    refreshMarket(market).catch(error => {
      console.warn(`[market-server] background refresh failed for ${market}:`, error.message);
    });
  }

  const latest = state.cache[market];
  const effectiveLimit = Number.isFinite(limit) && limit > 0
    ? Math.min(limit, latest.stocks.length)
    : Math.min(MAX_STOCKS_PER_RESPONSE, latest.stocks.length);

  return {
    ...latest,
    stocks: latest.stocks.slice(0, effectiveLimit),
    totalStocks: latest.stocks.length,
    returnedStocks: effectiveLimit,
  };
}

function parseMarket(value) {
  return value === 'HK' ? 'HK' : 'US';
}

async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (url.pathname === '/api/health') {
      sendJson(res, 200, {
        ok: true,
        refreshMs: REFRESH_MS,
        universeRefreshMs: UNIVERSE_REFRESH_MS,
        hkFullScan: ENABLE_HK_FULL_SCAN,
        universeCounts: {
          US: state.universe.US.length,
          HK: state.universe.HK.length,
        },
        cache: {
          US: state.cache.US?.lastUpdated || null,
          HK: state.cache.HK?.lastUpdated || null,
        },
      });
      return;
    }

    if (url.pathname === '/api/market') {
      const market = parseMarket(url.searchParams.get('type'));
      const limit = Number(url.searchParams.get('limit'));
      const payload = await getMarketPayload(market, limit);
      sendJson(res, 200, payload);
      return;
    }

    if (url.pathname === '/api/refresh') {
      const market = parseMarket(url.searchParams.get('type'));
      const payload = await refreshMarket(market);
      sendJson(res, 200, payload);
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error('[market-server] request failed:', error);
    sendJson(res, 500, { error: error.message || String(error) });
  }
}

async function main() {
  await mkdir(cacheDir, { recursive: true });
  await Promise.all([loadCacheFromDisk('US'), loadCacheFromDisk('HK')]);
  await refreshUniverse();

  refreshMarket('US').catch(error => console.warn('[market-server] initial US refresh failed:', error.message));
  refreshMarket('HK').catch(error => console.warn('[market-server] initial HK refresh failed:', error.message));

  const server = http.createServer((req, res) => {
    handleRequest(req, res);
  });

  server.listen(PORT, () => {
    console.log(`[market-server] listening on http://localhost:${PORT}`);
    console.log(`[market-server] HK full scan: ${ENABLE_HK_FULL_SCAN ? 'enabled' : 'disabled'}`);
  });
}

main().catch(error => {
  console.error('[market-server] failed to start:', error);
  process.exitCode = 1;
});
