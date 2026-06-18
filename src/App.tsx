import { useEffect, useState, useMemo } from 'react';
import { Treemap } from './components/Treemap';
import { fetchMarketData, fetchMarketIndices } from './services/api';
import { Stock, Market, ColorTheme, Language, IndexData } from './types';
import { DataStatusIndicator } from './components/DataStatusIndicator';
import { MarketIndices } from './components/MarketIndices';
import { translations } from './locales';

const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1e12) {
    return `${(marketCap / 1e12).toFixed(2)}T`;
  }
  if (marketCap >= 1e9) {
    return `${(marketCap / 1e9).toFixed(2)}B`;
  }
  if (marketCap >= 1e6) {
    return `${(marketCap / 1e6).toFixed(2)}M`;
  }
  return marketCap.toLocaleString();
};

const getStoredPreference = (key: string): string | null => {
  try {
    return typeof localStorage?.getItem === 'function' ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
};

const setStoredPreference = (key: string, value: string) => {
  try {
    if (typeof localStorage?.setItem === 'function') {
      localStorage.setItem(key, value);
    }
  } catch {
    // Preference persistence is optional; the app should still render.
  }
};

const getCurrencySymbol = (market: Market): string => {
  if (market === 'US') return '$';
  if (market === 'HK') return 'HK$';
  return '¥';
};

const prefersNameFirst = (market: Market): boolean => market === 'CN';

const getTrendTone = (
  change: number,
  theme: ColorTheme
): 'red' | 'emerald' | 'slate' => {
  if (change === 0) return 'slate';
  const isUpRed = theme === 'chinese';
  if (change > 0) return isUpRed ? 'red' : 'emerald';
  return isUpRed ? 'emerald' : 'red';
};

const getTooltipSparkline = (stock: Stock) => {
  const changeFraction = stock.change / 100;
  const prevClose = Number((stock.price / (1 + changeFraction)).toFixed(2));
  
  // Deterministic seed based on symbol character codes to prevent flickering on re-hover
  let hash = 0;
  for (let i = 0; i < stock.symbol.length; i++) {
    hash = stock.symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const points = 8;
  const chartPoints = [];
  const startPrice = prevClose;
  for (let i = 0; i < points; i++) {
    const fraction = i / (points - 1);
    const trend = startPrice + (stock.price - startPrice) * fraction;
    // Deterministic wave using sine and character hash
    const wave = Math.sin(fraction * Math.PI * 1.5 + Math.abs(hash % 10)) * (stock.price - startPrice) * 0.15;
    const noise = Math.cos(i * 1.3 + Math.abs(hash % 7)) * (stock.price * 0.001);
    const price = Number((trend + wave + noise).toFixed(2));
    chartPoints.push({ x: fraction * 100, y: price });
  }
  chartPoints[points - 1] = { x: 100, y: stock.price };
  
  const prices = chartPoints.map(p => p.y);
  const minP = Math.min(...prices) * 0.998;
  const maxP = Math.max(...prices) * 1.002;
  const range = maxP - minP || 1;
  
  const svgWidth = 160;
  const svgHeight = 40;
  const coords = chartPoints.map(p => ({
    x: (p.x / 100) * svgWidth,
    y: svgHeight - ((p.y - minP) / range) * svgHeight
  }));
  
  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const areaPath = `${linePath} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;
  
  return { linePath, areaPath, svgWidth, svgHeight };
};

function App() {
  const [selectedMarket, setSelectedMarket] = useState<Market>(() => {
    const saved = getStoredPreference('selected-market');
    return (saved === 'US' || saved === 'HK' || saved === 'CN') ? saved : 'US';
  });
  const theme: ColorTheme = 'chinese';
  const [lang, setLang] = useState<Language>(() => {
    const saved = getStoredPreference('lang');
    return (saved === 'zh' || saved === 'en') ? saved : 'zh';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredStock, setHoveredStock] = useState<Stock | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const [refreshProgress, setRefreshProgress] = useState<number>(0);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [colorMetric, setColorMetric] = useState<'change' | 'pe'>('change');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [chartPeriod, setChartPeriod] = useState<'24h' | '5d' | '1m'>('24h');
  const currencySymbol = getCurrencySymbol(selectedMarket);
  const showNameFirst = prefersNameFirst(selectedMarket);
  const treemapHeightClass = 'h-[1800px]';

  const loadData = () => {
    setLoading(true);
    setError(null);
    setRefreshProgress(0);
    Promise.all([
      fetchMarketData(selectedMarket, lang),
      fetchMarketIndices(selectedMarket)
    ])
      .then(([marketData, indicesData]) => {
        setStocks(marketData.stocks);
        setIsMock(marketData.isMock);
        setLastUpdated(marketData.lastUpdated);
        setIndices(indicesData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load market data');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [selectedMarket, lang]);

  useEffect(() => {
    setRefreshProgress(0);
  }, [selectedMarket]);

  // Auto-refresh and countdown tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshProgress(prev => {
        if (prev >= 100) {
          Promise.all([
            fetchMarketData(selectedMarket, lang),
            fetchMarketIndices(selectedMarket)
          ])
            .then(([marketData, indicesData]) => {
              setStocks(marketData.stocks);
              setIsMock(marketData.isMock);
              setLastUpdated(marketData.lastUpdated);
              setIndices(indicesData);
            })
            .catch(() => {});
          return 0;
        }
        return prev + 1; // 1% every 100ms
      });
    }, 100);

    return () => clearInterval(timer);
  }, [selectedMarket, lang]);

  // Close details panel when market or lang changes
  useEffect(() => {
    setSelectedStock(null);
  }, [selectedMarket, lang]);

  // Click outside listener for search autocomplete
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowSuggestions(false);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Show suggestions when search text is inputted
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const matchingStocks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return stocks.filter(s =>
      s.symbol.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q)
    );
  }, [searchQuery, stocks]);

  const detailedStats = useMemo(() => {
    if (!selectedStock) return null;
    const stock = selectedStock;
    const changeFraction = stock.change / 100;
    const prevClose = Number((stock.price / (1 + changeFraction)).toFixed(2));
    const openPrice = Number((prevClose * 1.002).toFixed(2));
    const highPrice = Number((Math.max(stock.price, prevClose, openPrice) * 1.015).toFixed(2));
    const lowPrice = Number((Math.min(stock.price, prevClose, openPrice) * 0.985).toFixed(2));
    const volume = stock.volume || Math.floor(stock.marketCap / 25000 / stock.price);
    
    let hash = 0;
    for (let i = 0; i < stock.symbol.length; i++) {
      hash = stock.symbol.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate trend chart data points based on period
    const points = chartPeriod === '24h' ? 12 : (chartPeriod === '5d' ? 25 : 30);
    const chartPoints = [];
    const startPrice = prevClose;
    const seed = hash + (chartPeriod === '5d' ? 500 : (chartPeriod === '1m' ? 1000 : 0));

    for (let i = 0; i < points; i++) {
      const fraction = i / (points - 1);
      const trend = startPrice + (stock.price - startPrice) * fraction;
      
      let wave = 0;
      let noise = 0;
      if (chartPeriod === '24h') {
        wave = Math.sin(fraction * Math.PI * 1.5 + Math.abs(seed % 10)) * (stock.price - startPrice) * 0.15;
        noise = Math.cos(i * 1.3 + Math.abs(seed % 7)) * (stock.price * 0.002);
      } else if (chartPeriod === '5d') {
        wave = Math.sin(fraction * Math.PI * 4 + Math.abs(seed % 15)) * (stock.price * 0.012);
        noise = Math.cos(i * 0.8 + Math.abs(seed % 5)) * (stock.price * 0.004);
      } else {
        wave = Math.sin(fraction * Math.PI * 2 + Math.abs(seed % 8)) * (stock.price * 0.035) + 
               Math.cos(fraction * Math.PI * 5) * (stock.price * 0.015);
        noise = Math.cos(i * 0.5 + Math.abs(seed % 9)) * (stock.price * 0.006);
      }
      
      const price = Number((trend + wave + noise).toFixed(2));
      chartPoints.push({ x: fraction * 100, y: price });
    }
    chartPoints[points - 1] = { x: 100, y: stock.price };
    
    const prices = chartPoints.map(p => p.y);
    const minP = Math.min(...prices) * 0.995;
    const maxP = Math.max(...prices) * 1.005;
    const range = maxP - minP || 1;
    
    const svgWidth = 320;
    const svgHeight = 140;
    const coords = chartPoints.map(p => ({
      x: (p.x / 100) * svgWidth,
      y: svgHeight - ((p.y - minP) / range) * svgHeight
    }));
    
    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
    const areaPath = `${linePath} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;
    
    return { prevClose, openPrice, highPrice, lowPrice, volume, linePath, areaPath, svgWidth, svgHeight, minP, maxP };
  }, [selectedStock, chartPeriod]);

  useEffect(() => {
    setStoredPreference('lang', lang);
  }, [lang]);

  useEffect(() => {
    setStoredPreference('selected-market', selectedMarket);
  }, [selectedMarket]);

  const handleStockHover = (stock: Stock | null, x: number, y: number) => {
    setHoveredStock(stock);
    if (stock) {
      setHoverPos({ x, y });
    } else {
      setHoverPos(null);
    }
  };

  const t = translations[lang];
  const marketTabs: Array<{ market: Market; label: string; testId: string }> = [
    { market: 'CN', label: t.cnMarket, testId: 'market-tab-cn' },
    { market: 'HK', label: t.hkMarket, testId: 'market-tab-hk' },
    { market: 'US', label: t.usMarket, testId: 'market-tab-us' },
  ];
  const segmentedButtonBase = 'rounded-md border transition-all duration-300';
  const segmentedButtonActive = 'border-rose-400/25 bg-gradient-to-b from-rose-500/25 via-rose-500/12 to-amber-400/15 text-rose-50 shadow-[0_0_18px_rgba(251,113,133,0.14)] scale-100';
  const segmentedButtonInactive = 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5 scale-95';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,107,107,0.12),_transparent_28%),radial-gradient(circle_at_86%_16%,_rgba(120,185,255,0.12),_transparent_22%),linear-gradient(180deg,_rgba(12,14,20,0.96),_rgba(6,7,10,1))] text-slate-100 flex flex-col p-4 md:p-6 md:px-8 font-sans selection:bg-rose-500/30">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/10 pb-4 mb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3 drop-shadow-[0_0_18px_rgba(251,113,133,0.22)]">
            <img src="/logo.svg" alt="Stock Market Cloud logo" className="w-11 h-11 md:w-12 md:h-12 object-contain rounded-2xl ring-1 ring-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.35)]" />
            <span className="bg-gradient-to-br from-rose-300 via-amber-200 to-sky-300 bg-clip-text text-transparent">
              {t.appTitle}
            </span>
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 mb-4 md:mb-0">
            <p className="text-sm md:text-base text-slate-300/70 font-medium tracking-wide">
              {t.appSubtitle}
            </p>
            <a 
              href="https://www.wenyaoyefei.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold hover:bg-rose-500/20 hover:text-amber-200 transition-all shadow-[0_0_10px_rgba(251,113,133,0.12)]"
            >
              <span className="text-[10px]">🏠</span>
              <span>{t.visitAuthor}</span>
            </a>
          </div>
        </div>

        <div className="flex-1 flex justify-center md:justify-start md:ml-8 lg:ml-12 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <MarketIndices indices={indices} theme={theme} lang={lang} />
        </div>

        <div className="mt-4 md:mt-0 flex-shrink-0">
          <DataStatusIndicator
            isMock={isMock}
            lastUpdated={lastUpdated}
            loading={loading}
            error={error}
            onRefresh={loadData}
            lang={lang}
            refreshProgress={refreshProgress}
          />
        </div>
      </header>

      {/* Control Panel */}
      <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-5 mb-8 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 transition-all">
        {/* Settings Panel */}
        <div className="flex flex-wrap items-center gap-6">
          {/* Market Selection */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500/80">{t.market}</span>
            <div className="inline-flex bg-black/40 rounded-lg p-1 border border-white/5 shadow-inner">
              {marketTabs.map(tab => (
                <button
                  key={tab.market}
                  data-testid={tab.testId}
                  data-active={selectedMarket === tab.market ? 'true' : 'false'}
                  onClick={() => {
                    if (selectedMarket !== tab.market) {
                      setLoading(true);
                      setSelectedMarket(tab.market);
                    }
                  }}
                  className={`px-4 py-2 text-sm font-semibold ${segmentedButtonBase} ${
                    selectedMarket === tab.market ? segmentedButtonActive : segmentedButtonInactive
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language Switch */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500/80">{t.language}</span>
            <div className="inline-flex bg-black/40 rounded-lg p-1 border border-white/5 shadow-inner">
              <button
                onClick={() => setLang('zh')}
                className={`px-3 py-1.5 text-xs font-semibold ${segmentedButtonBase} ${lang === 'zh' ? segmentedButtonActive : segmentedButtonInactive}`}
              >
                {t.langZh}
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 text-xs font-semibold ${segmentedButtonBase} ${lang === 'en' ? segmentedButtonActive : segmentedButtonInactive}`}
              >
                {t.langEn}
              </button>
            </div>
          </div>

          {/* Color Dimension / Metric Selection */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500/80">{t.colorMetric}</span>
            <div className="inline-flex bg-black/40 rounded-lg p-1 border border-white/5 shadow-inner">
              <button
                data-testid="metric-change"
                onClick={() => setColorMetric('change')}
                className={`px-3 py-1.5 text-xs font-semibold ${segmentedButtonBase} ${
                  colorMetric === 'change' ? segmentedButtonActive : segmentedButtonInactive
                }`}
              >
                {t.metricChange}
              </button>
              <button
                data-testid="metric-pe"
                onClick={() => setColorMetric('pe')}
                className={`px-3 py-1.5 text-xs font-semibold ${segmentedButtonBase} ${
                  colorMetric === 'pe' ? segmentedButtonActive : segmentedButtonInactive
                }`}
              >
                {t.metricPe}
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div 
          className="flex flex-col gap-1.5 w-full xl:w-96 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500/80">{t.searchTitle}</span>
          <div className="relative group">
            <input
              data-testid="search-input"
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 group-hover:border-white/20 focus:border-rose-400/50 focus:shadow-[0_0_0_3px_rgba(251,113,133,0.08)] rounded-lg px-4 py-2.5 text-sm font-medium text-slate-100 placeholder-slate-500 outline-none transition-all duration-300 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs px-1"
              >
                {t.clear}
              </button>
            )}
            
            {showSuggestions && matchingStocks.length > 0 && (
              <div 
                data-testid="search-suggestions"
                className="absolute z-50 left-0 right-0 mt-1 bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl max-h-64 overflow-y-auto divide-y divide-white/5 scrollbar-thin scrollbar-thumb-slate-800"
              >
                {matchingStocks.map(stock => {
                  const trendTone = getTrendTone(stock.change, theme);
                  const colorClass = trendTone === 'red'
                    ? 'text-red-400'
                    : trendTone === 'emerald'
                    ? 'text-emerald-400'
                    : 'text-slate-400';
                  
                  return (
                    <div
                      key={stock.symbol}
                      data-testid={`suggestion-item-${stock.symbol.toLowerCase()}`}
                      onClick={() => {
                        setSelectedStock(stock);
                        setChartPeriod('24h');
                        setShowSuggestions(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center justify-between px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className={`font-bold text-white text-sm truncate max-w-[200px] ${showNameFirst ? '' : 'font-mono'}`}>
                          {showNameFirst ? stock.name : stock.symbol}
                        </span>
                        <span className={`text-slate-400 text-xs truncate max-w-[200px] ${showNameFirst ? 'font-mono' : ''}`}>
                          {showNameFirst ? stock.symbol : stock.name}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-white text-sm">
                          {currencySymbol}{stock.price.toFixed(2)}
                        </span>
                        <span className={`font-mono text-xs font-bold ${colorClass}`}>
                          {stock.change >= 0 ? `+${stock.change.toFixed(2)}%` : `${stock.change.toFixed(2)}%`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Treemap Area */}
      <main className={`w-full relative flex flex-col ${treemapHeightClass} mb-20 shadow-2xl rounded-2xl overflow-hidden border border-white/5 bg-black/20`}>
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 border border-slate-800 rounded-xl min-h-[500px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-400 mb-4"></div>
            <span className="text-slate-400 text-sm">{t.fetchingFeeds}</span>
          </div>
        ) : error ? (
          <div className={`flex-1 flex flex-col items-center justify-center bg-black/30 backdrop-blur-md rounded-2xl p-6 ${treemapHeightClass}`}>
            <div className="text-red-400 text-4xl mb-4 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]">⚠</div>
            <span className="text-slate-200 text-lg font-bold tracking-wide mb-2">{t.errorLoading}</span>
            <span className="text-slate-400 text-sm mb-6">{error}</span>
            <button 
              onClick={loadData}
              className="px-6 py-2.5 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white font-semibold rounded-lg border border-slate-600 shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {t.tryAgain}
            </button>
          </div>
        ) : (
          <div className={`flex-1 relative ${treemapHeightClass} rounded-2xl overflow-visible`}>
            <Treemap
              stocks={stocks}
              market={selectedMarket}
              theme={theme}
              lang={lang}
              searchQuery={searchQuery}
              onStockHover={handleStockHover}
              onStockClick={(stock) => {
                setSelectedStock(stock);
                setChartPeriod('24h');
              }}
              colorMetric={colorMetric}
            />

            {/* Hover Tooltip - Prepared for Milestone 5 but fully operational */}
            {hoveredStock && hoverPos && (() => {
              const spark = getTooltipSparkline(hoveredStock);
              const chartColor = getTrendTone(hoveredStock.change, theme);
              const chartStroke = chartColor === 'red' ? '#f87171' : (chartColor === 'emerald' ? '#34d399' : '#94a3b8');

              return (
                <div
                  data-testid="stock-tooltip"
                  className="absolute bg-slate-900 border border-slate-800 text-slate-100 p-3 rounded-lg shadow-2xl text-xs pointer-events-none transition-all duration-75 z-50 min-w-[195px] border-slate-700/60"
                  style={{
                    left: `${hoverPos.x}px`,
                    top: `${hoverPos.y - 12}px`,
                    transform: hoverPos.y > 150 ? 'translate(-50%, -100%)' : 'translate(-50%, 24px)',
                  }}
                >
                  <div className="font-bold border-b border-slate-800 pb-1.5 mb-1.5 flex justify-between gap-3">
                    {showNameFirst ? (
                      <>
                        <span data-testid="tooltip-name" className="text-slate-100 text-sm truncate max-w-[120px]">{hoveredStock.name}</span>
                        <span data-testid="tooltip-symbol" className="text-amber-300 font-mono text-xs">{hoveredStock.symbol}</span>
                      </>
                    ) : (
                      <>
                        <span data-testid="tooltip-symbol" className="text-amber-300 font-mono text-sm">{hoveredStock.symbol}</span>
                        <span data-testid="tooltip-name" className="text-slate-300 font-normal truncate max-w-[100px]">{hoveredStock.name}</span>
                      </>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t.price}:</span>
                      <span data-testid="tooltip-price" className="font-mono text-slate-200">
                        {currencySymbol}{hoveredStock.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t.change}:</span>
                      <span
                        data-testid="tooltip-change"
                        className={`font-mono font-bold ${
                          chartColor === 'red'
                            ? 'text-red-400'
                            : chartColor === 'emerald'
                            ? 'text-emerald-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {hoveredStock.change >= 0 ? `+${hoveredStock.change.toFixed(2)}%` : `${hoveredStock.change.toFixed(2)}%`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t.marketCap}:</span>
                      <span data-testid="tooltip-market-cap" className="font-mono text-slate-200">
                        {currencySymbol}{formatMarketCap(hoveredStock.marketCap)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800/80 mt-1">
                      <span className="text-slate-500">{t.sector}:</span>
                      <span className="text-slate-300 font-medium">{t.sectors[hoveredStock.sector] || hoveredStock.sector}</span>
                    </div>
                  </div>

                  {/* Sparkline section */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-col gap-1.5">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">{t.todayTrend}</span>
                    <div className="w-full h-10 bg-black/20 rounded overflow-hidden relative border border-white/[0.03] flex items-center justify-center">
                      <svg
                        width="100%"
                        height={spark.svgHeight}
                        viewBox={`0 0 ${spark.svgWidth} ${spark.svgHeight}`}
                        className="overflow-visible"
                      >
                        <defs>
                          <linearGradient id={`t-grad-red-${hoveredStock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25"/>
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0"/>
                          </linearGradient>
                          <linearGradient id={`t-grad-emerald-${hoveredStock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                          </linearGradient>
                          <linearGradient id={`t-grad-slate-${hoveredStock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#64748b" stopOpacity="0.25"/>
                            <stop offset="100%" stopColor="#64748b" stopOpacity="0.0"/>
                          </linearGradient>
                        </defs>
                        <path d={spark.areaPath} fill={`url(#t-grad-${chartColor}-${hoveredStock.symbol})`} />
                        <path d={spark.linePath} fill="none" stroke={chartStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </main>

      {/* Global Footer */}
      <footer className="mt-auto pt-8 pb-4 flex flex-col items-center justify-center text-center border-t border-white/5 relative z-10">
        <p className="text-slate-500 text-sm font-medium tracking-wide flex flex-col sm:flex-row items-center gap-1.5">
          <span>{t.footerCopyright}</span>
          <a 
            href="https://www.wenyaoyefei.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-rose-300 hover:text-amber-200 font-bold transition-colors underline decoration-rose-500/30 underline-offset-4"
          >
            www.wenyaoyefei.com
          </a>
        </p>
      </footer>

      {/* Stock Details Sidebar */}
      {selectedStock && detailedStats && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedStock(null)}
          />

          {/* Panel */}
          <div data-testid="stock-details-panel" className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800/60 p-6 md:p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl z-10 overflow-y-auto">
            <div>
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`text-3xl font-black text-white ${showNameFirst ? '' : 'font-mono'}`}>
                      {showNameFirst ? selectedStock.name : selectedStock.symbol}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {t.sectors[selectedStock.sector] || selectedStock.sector}
                    </span>
                  </div>
                  <h2 className={`text-slate-400 text-sm mt-1.5 font-medium ${showNameFirst ? 'font-mono' : ''}`}>
                    {showNameFirst ? selectedStock.symbol : selectedStock.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedStock(null)}
                  className="w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors shadow-inner"
                  title={t.closeDetail}
                >
                  ✕
                </button>
              </div>

              {/* Price Details */}
              <div className="bg-black/35 rounded-2xl p-5 border border-white/5 shadow-inner mb-6 flex items-baseline justify-between">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-500">{t.price}</span>
                  <div className="text-3xl font-mono font-black text-white mt-1">
                    {currencySymbol}{selectedStock.price.toFixed(2)}
                  </div>
                </div>
                
                {(() => {
                  const trendTone = getTrendTone(selectedStock.change, theme);
                  const colorClass = trendTone === 'red'
                    ? 'bg-red-500/15 text-red-400 border-red-500/30'
                    : trendTone === 'emerald'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700';
                  
                  return (
                    <span className={`px-3.5 py-1.5 rounded-xl border text-sm font-bold font-mono ${colorClass}`}>
                      {selectedStock.change >= 0 ? `+${selectedStock.change.toFixed(2)}%` : `${selectedStock.change.toFixed(2)}%`}
                    </span>
                  );
                })()}
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{t.openPrice}</span>
                  <span className="text-base font-mono font-bold text-slate-200 mt-1">
                    {currencySymbol}{detailedStats.openPrice}
                  </span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{t.prevClose}</span>
                  <span className="text-base font-mono font-bold text-slate-200 mt-1">
                    {currencySymbol}{detailedStats.prevClose}
                  </span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{t.highPrice}</span>
                  <span className="text-base font-mono font-bold text-slate-200 mt-1">
                    {currencySymbol}{detailedStats.highPrice}
                  </span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{t.lowPrice}</span>
                  <span className="text-base font-mono font-bold text-slate-200 mt-1">
                    {currencySymbol}{detailedStats.lowPrice}
                  </span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{t.volume}</span>
                  <span className="text-base font-mono font-bold text-slate-200 mt-1">
                    {detailedStats.volume.toLocaleString()}
                  </span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{t.marketCap}</span>
                  <span className="text-base font-mono font-bold text-slate-200 mt-1">
                    {currencySymbol}{formatMarketCap(selectedStock.marketCap)}
                  </span>
                </div>
              </div>

              {/* Sparkline Trend Chart */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{t.todayTrend}</span>
                  <div className="inline-flex bg-black/40 rounded-lg p-0.5 border border-white/5 shadow-inner">
                    <button
                      data-testid="period-tab-24h"
                      onClick={() => setChartPeriod('24h')}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all duration-300 ${
                        chartPeriod === '24h' 
                          ? 'bg-slate-800 text-white shadow-sm' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      24H
                    </button>
                    <button
                      data-testid="period-tab-5d"
                      onClick={() => setChartPeriod('5d')}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all duration-300 ${
                        chartPeriod === '5d' 
                          ? 'bg-slate-800 text-white shadow-sm' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      5D
                    </button>
                    <button
                      data-testid="period-tab-1m"
                      onClick={() => setChartPeriod('1m')}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all duration-300 ${
                        chartPeriod === '1m' 
                          ? 'bg-slate-800 text-white shadow-sm' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      1M
                    </button>
                  </div>
                </div>
                <div className="w-full h-[140px] flex items-center justify-center bg-black/20 rounded-xl overflow-hidden relative border border-white/5">
                  {(() => {
                    const chartColor = getTrendTone(selectedStock.change, theme);
                    const chartStroke = chartColor === 'red' ? '#f87171' : (chartColor === 'emerald' ? '#34d399' : '#94a3b8');
                    
                    return (
                      <svg
                        width="100%"
                        height={detailedStats.svgHeight}
                        viewBox={`0 0 ${detailedStats.svgWidth} ${detailedStats.svgHeight}`}
                        className="overflow-visible"
                      >
                        <defs>
                          <linearGradient id="chart-grad-red" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0"/>
                          </linearGradient>
                          <linearGradient id="chart-grad-emerald" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                          </linearGradient>
                          <linearGradient id="chart-grad-slate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#64748b" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#64748b" stopOpacity="0.0"/>
                          </linearGradient>
                        </defs>
                        <path d={detailedStats.areaPath} fill={`url(#chart-grad-${chartColor})`} />
                        <path d={detailedStats.linePath} fill="none" stroke={chartStroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    );
                  })()}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedStock(null)}
              className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-xl border border-slate-700 transition-colors shadow-lg"
            >
              {t.closeDetail}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
