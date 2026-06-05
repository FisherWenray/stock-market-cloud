import { useEffect, useState } from 'react';
import { Treemap } from './components/Treemap';
import { fetchMarketData, fetchMarketIndices } from './services/api';
import { Stock, Market, ColorTheme, Language, IndexData } from './types';
import { ColorLegend } from './components/ColorLegend';
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

function App() {
  const [selectedMarket, setSelectedMarket] = useState<Market>('US');
  const [theme, setTheme] = useState<ColorTheme>(() => {
    const saved = localStorage.getItem('color-theme');
    return (saved === 'chinese' || saved === 'international') ? saved : 'chinese'; // Default to chinese theme as implied
  });
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('lang');
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

  const loadData = () => {
    setLoading(true);
    setError(null);
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

  // Auto-refresh every 10 seconds for real-time monitoring
  useEffect(() => {
    const intervalId = setInterval(() => {
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
        .catch(() => {
          // Silently ignore refresh errors
        });
    }, 10000);

    return () => clearInterval(intervalId);
  }, [selectedMarket]);

  useEffect(() => {
    localStorage.setItem('color-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const handleStockHover = (stock: Stock | null, x: number, y: number) => {
    setHoveredStock(stock);
    if (stock) {
      setHoverPos({ x, y });
    } else {
      setHoverPos(null);
    }
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black text-slate-100 flex flex-col p-4 md:p-6 md:px-8 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
            <span className="bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
              {t.appTitle}
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-2 font-medium tracking-wide opacity-80 mb-4 md:mb-0">
            {t.appSubtitle}
          </p>
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
          />
        </div>
      </header>

      {/* Control Panel */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-5 mb-8 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 transition-all">
        {/* Settings Panel */}
        <div className="flex flex-wrap items-center gap-6">
          {/* Market Selection */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500/80">{t.market}</span>
            <div className="inline-flex bg-black/40 rounded-lg p-1 border border-white/5 shadow-inner">
              <button
                data-testid="market-tab-us"
                data-active={selectedMarket === 'US' ? 'true' : 'false'}
                onClick={() => {
                  if (selectedMarket !== 'US') {
                    setLoading(true);
                    setSelectedMarket('US');
                  }
                }}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
                  selectedMarket === 'US' 
                    ? 'bg-slate-800 text-white shadow-md shadow-black/20 scale-100' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 scale-95'
                }`}
              >
                {t.usMarket}
              </button>
              <button
                data-testid="market-tab-hk"
                data-active={selectedMarket === 'HK' ? 'true' : 'false'}
                onClick={() => {
                  if (selectedMarket !== 'HK') {
                    setLoading(true);
                    setSelectedMarket('HK');
                  }
                }}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
                  selectedMarket === 'HK' 
                    ? 'bg-slate-800 text-white shadow-md shadow-black/20 scale-100' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 scale-95'
                }`}
              >
                {t.hkMarket}
              </button>
            </div>
          </div>

          {/* Color System */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500/80">{t.colorSystem}</span>
            <div className="flex flex-wrap items-center gap-3">
              <button
                data-testid="theme-toggle"
                data-theme-style={theme}
                onClick={() => setTheme(theme === 'international' ? 'chinese' : 'international')}
                className="px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 bg-black/40 hover:bg-slate-800 text-slate-300 border border-white/5 hover:border-white/20 shadow-inner"
              >
                {t.theme}: {theme === 'international' ? t.themeInternational : t.themeChinese}
              </button>
              <ColorLegend theme={theme} lang={lang} />
            </div>
          </div>

          {/* Language Switch */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500/80">{t.language}</span>
            <div className="inline-flex bg-black/40 rounded-lg p-1 border border-white/5 shadow-inner">
              <button
                onClick={() => setLang('zh')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 ${lang === 'zh' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              >
                {t.langZh}
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 ${lang === 'en' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              >
                {t.langEn}
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-1.5 w-full xl:w-96">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500/80">{t.searchTitle}</span>
          <div className="relative group">
            <input
              data-testid="search-input"
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 group-hover:border-white/20 focus:border-emerald-500/50 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-100 placeholder-slate-500 outline-none transition-all duration-300 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs px-1"
              >
                {t.clear}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Treemap Area */}
      <main className="w-full relative flex flex-col h-[1800px] mb-20 shadow-2xl rounded-2xl overflow-hidden border border-white/5 bg-black/20">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 border border-slate-800 rounded-xl min-h-[500px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-400 mb-4"></div>
            <span className="text-slate-400 text-sm">{t.fetchingFeeds}</span>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-black/30 backdrop-blur-md rounded-2xl p-6 h-[1800px]">
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
          <div className="flex-1 relative h-[1800px] rounded-2xl overflow-visible">
            <Treemap
              stocks={stocks}
              theme={theme}
              lang={lang}
              searchQuery={searchQuery}
              onStockHover={handleStockHover}
              onStockClick={(stock) => {
                console.log('Stock clicked:', stock);
              }}
            />

            {/* Hover Tooltip - Prepared for Milestone 5 but fully operational */}
            {hoveredStock && hoverPos && (
              <div
                data-testid="stock-tooltip"
                className="absolute bg-slate-900 border border-slate-800 text-slate-100 p-3 rounded-lg shadow-2xl text-xs pointer-events-none transition-all duration-75 z-50 min-w-[180px] border-slate-700/60"
                style={{
                  left: `${hoverPos.x}px`,
                  top: `${hoverPos.y - 12}px`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <div className="font-bold border-b border-slate-800 pb-1.5 mb-1.5 flex justify-between gap-3">
                  <span data-testid="tooltip-symbol" className="text-emerald-400 font-mono text-sm">{hoveredStock.symbol}</span>
                  <span data-testid="tooltip-name" className="text-slate-300 font-normal truncate max-w-[100px]">{hoveredStock.name}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.price}:</span>
                    <span data-testid="tooltip-price" className="font-mono text-slate-200">
                      {selectedMarket === 'US' ? '$' : 'HK$'}{hoveredStock.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.change}:</span>
                    <span
                      data-testid="tooltip-change"
                      className={`font-mono font-bold ${
                        hoveredStock.change > 0
                          ? theme === 'chinese' ? 'text-red-500' : 'text-emerald-500'
                          : hoveredStock.change < 0
                          ? theme === 'chinese' ? 'text-emerald-500' : 'text-red-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {hoveredStock.change >= 0 ? `+${hoveredStock.change.toFixed(2)}%` : `${hoveredStock.change.toFixed(2)}%`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.marketCap}:</span>
                    <span data-testid="tooltip-market-cap" className="font-mono text-slate-200">
                      {selectedMarket === 'US' ? '$' : 'HK$'}{formatMarketCap(hoveredStock.marketCap)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800/80 mt-1">
                    <span className="text-slate-500">{t.sector}:</span>
                    <span className="text-slate-300 font-medium">{t.sectors[hoveredStock.sector] || hoveredStock.sector}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
