import React, { useRef } from 'react';
import { hierarchy, treemap as d3Treemap, treemapSquarify } from 'd3-hierarchy';
import { Stock, Language } from '../types';
import { useContainerSize } from '../hooks/useContainerSize';
import { translations } from '../locales';

export interface TreemapNode {
  name: string;
  symbol?: string;
  price?: number;
  change?: number;
  marketCap?: number;
  sector?: string;
  pe?: number;
  volume?: number;
  children?: TreemapNode[];
}

export interface TreemapProps {
  stocks: Stock[];
  theme: 'international' | 'chinese';
  lang: Language;
  searchQuery?: string;
  onStockHover?: (stock: Stock | null, x: number, y: number) => void;
  onStockClick?: (stock: Stock) => void;
  colorMetric?: 'change' | 'pe';
}

const getTileColor = (
  stock: { change: number; pe?: number; volume?: number; marketCap: number; price: number },
  theme: 'international' | 'chinese',
  colorMetric: 'change' | 'pe' = 'change'
): string => {
  if (colorMetric === 'pe') {
    const pe = stock.pe || 25;
    const isUpRed = theme === 'chinese';
    const absChangeColor = pe < 15 ? (isUpRed ? 'red' : 'emerald') : (pe >= 50 ? (isUpRed ? 'emerald' : 'red') : 'slate');
    
    if (absChangeColor === 'red') {
      if (pe >= 65) return 'fill-red-600 hover:fill-red-500 transition-colors duration-200';
      if (pe >= 55) return 'fill-red-700 hover:fill-red-600 transition-colors duration-200';
      return 'fill-red-900 hover:fill-red-800 transition-colors duration-200';
    } else if (absChangeColor === 'emerald') {
      if (pe < 10) return 'fill-emerald-600 hover:fill-emerald-500 transition-colors duration-200';
      if (pe < 13) return 'fill-emerald-700 hover:fill-emerald-600 transition-colors duration-200';
      return 'fill-emerald-950 hover:fill-emerald-900 transition-colors duration-200';
    }
    return 'fill-slate-700 hover:fill-slate-600 transition-colors duration-200';
  }
  
  const change = stock.change;
  if (change === 0) return 'fill-slate-700 hover:fill-slate-600 transition-colors duration-200';

  const isPositive = change > 0;
  const absChange = Math.abs(change);
  const upColor = theme === 'chinese' ? 'red' : 'emerald';
  const downColor = theme === 'chinese' ? 'emerald' : 'red';
  const color = isPositive ? upColor : downColor;

  if (color === 'red') {
    if (absChange >= 3) return 'fill-red-600 hover:fill-red-500 transition-colors duration-200';
    if (absChange >= 1) return 'fill-red-700 hover:fill-red-600 transition-colors duration-200';
    return 'fill-red-900 hover:fill-red-800 transition-colors duration-200';
  } else {
    if (absChange >= 3) return 'fill-emerald-600 hover:fill-emerald-500 transition-colors duration-200';
    if (absChange >= 1) return 'fill-emerald-700 hover:fill-emerald-600 transition-colors duration-200';
    return 'fill-emerald-950 hover:fill-emerald-900 transition-colors duration-200';
  }
};

const getTrendColor = (change: number): 'up' | 'down' | 'neutral' => {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'neutral';
};

export const Treemap: React.FC<TreemapProps> = ({
  stocks,
  theme,
  lang,
  searchQuery = '',
  onStockHover,
  onStockClick,
  colorMetric = 'change',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(containerRef);
  const t = translations[lang];

  const [zoomedSector, setZoomedSector] = React.useState<string | null>(null);

  React.useEffect(() => {
    setZoomedSector(null);
  }, [stocks]);

  const displayedStocks = zoomedSector
    ? stocks.filter(s => s.sector === zoomedSector)
    : stocks;

  const hasStocks = displayedStocks.length > 0;
  const hasDimensions = width > 0 && height > 0;

  // 1. Group stocks by sector
  const sectorsMap = new Map<string, Stock[]>();
  if (hasStocks) {
    displayedStocks.forEach(stock => {
      const list = sectorsMap.get(stock.sector) || [];
      list.push(stock);
      sectorsMap.set(stock.sector, list);
    });
  }

  const hierarchyData: TreemapNode = {
    name: 'root',
    children: Array.from(sectorsMap.entries()).map(([sectorName, sectorStocks]) => ({
      name: sectorName,
      children: sectorStocks.map(stock => ({
        name: stock.name,
        symbol: stock.symbol,
        price: stock.price,
        change: stock.change,
        marketCap: stock.marketCap,
        sector: stock.sector,
        pe: stock.pe,
        volume: stock.volume,
      })),
    })),
  };

  // 2. Generate layout if dimensions are valid
  let sectorsLayout: any[] = [];

  if (hasStocks && hasDimensions) {
    const rootNode = hierarchy<TreemapNode>(hierarchyData)
      .sum(d => d.marketCap || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const layoutGenerator = d3Treemap<TreemapNode>()
      .size([width, height])
      .tile(treemapSquarify)
      .paddingOuter(6)
      .paddingTop(node => (node.depth === 1 ? 24 : 6))
      .paddingInner(3);

    layoutGenerator(rootNode);
    sectorsLayout = rootNode.children || [];
  }

  const isHighlighted = (node: TreemapNode): boolean => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return false;
    const symbolMatch = node.symbol?.toLowerCase().includes(q) ?? false;
    const nameMatch = node.name?.toLowerCase().includes(q) ?? false;
    return symbolMatch || nameMatch;
  };

  const handleMouseEnter = (event: React.MouseEvent, node: TreemapNode) => {
    if (!onStockHover || !node.symbol) return;
    const stock: Stock = {
      symbol: node.symbol,
      name: node.name,
      price: node.price || 0,
      change: node.change || 0,
      marketCap: node.marketCap || 0,
      sector: node.sector || '',
    };

    const rect = event.currentTarget.getBoundingClientRect();
    const parentRect = containerRef.current?.getBoundingClientRect();
    const x = rect.left - (parentRect?.left || 0) + rect.width / 2;
    const y = rect.top - (parentRect?.top || 0);

    onStockHover(stock, x, y);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[500px] bg-transparent overflow-hidden relative"
    >
      {zoomedSector && (
        <button
          onClick={() => setZoomedSector(null)}
          className="absolute top-3 right-3 z-30 px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 text-xs font-bold text-emerald-400 hover:text-emerald-300 border border-slate-700/80 hover:border-emerald-500/50 rounded-lg shadow-xl backdrop-blur-md transition-all duration-300 flex items-center gap-1.5 transform hover:-translate-y-0.5"
        >
          <span>←</span>
          <span>{lang === 'zh' ? '返回全部板块' : 'Back to All Sectors'}</span>
        </button>
      )}

      {!hasStocks ? (
        <div className="w-full h-full min-h-[490px] flex items-center justify-center bg-black/20 text-slate-400 border border-white/5 rounded-2xl">
          {t.noData}
        </div>
      ) : !hasDimensions ? (
        <div className="w-full h-full min-h-[490px] flex items-center justify-center text-slate-500 text-sm">
          {t.calculating}
        </div>
      ) : (
        <svg
          data-testid="treemap-container"
          width={width}
          height={height}
          className="select-none font-sans"
        >
          {sectorsLayout.map(sectorNode => {
            const sectorName = sectorNode.data.name;
            const sectorNameLower = sectorName.toLowerCase();
            
            // Calculate weighted average change for this sector
            const sectorStocks = sectorsMap.get(sectorName) || [];
            const totalCap = sectorStocks.reduce((sum, s) => sum + s.marketCap, 0);
            const avgChange = totalCap > 0
              ? sectorStocks.reduce((sum, s) => sum + (s.change * s.marketCap), 0) / totalCap
              : 0;
            const avgChangeText = `${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%`;
            
            const isUpRed = theme === 'chinese';
            const avgColor = avgChange > 0 
              ? (isUpRed ? 'fill-red-400' : 'fill-emerald-400') 
              : (avgChange < 0 ? (isUpRed ? 'fill-emerald-400' : 'fill-red-400') : 'fill-slate-400');

            return (
              <g
                key={sectorName}
                data-testid={`treemap-sector-${sectorNameLower}`}
              >
                {/* Clickable header background rect */}
                {!zoomedSector && (
                  <rect
                    x={sectorNode.x0}
                    y={sectorNode.y0}
                    width={sectorNode.x1 - sectorNode.x0}
                    height={24}
                    fill="rgba(255, 255, 255, 0.01)"
                    className="cursor-zoom-in hover:fill-white/5 transition-colors duration-200"
                    onClick={() => setZoomedSector(sectorName)}
                  />
                )}

                {/* Sector header text */}
                <text
                  data-testid={`treemap-sector-title-${sectorNameLower}`}
                  x={sectorNode.x0 + 6}
                  y={sectorNode.y0 + 16}
                  className="text-[11px] font-black fill-slate-300 pointer-events-none uppercase tracking-[0.15em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                >
                  {t.sectors[sectorName] || sectorName}
                  <tspan className={`${avgColor} font-mono ml-2 font-black`}> {avgChangeText}</tspan>
                  {!zoomedSector ? (lang === 'zh' ? ' (🔍 点击缩放)' : ' (🔍 Click to Zoom)') : ''}
                </text>

                {/* Stock tiles inside the sector */}
                {sectorNode.children?.map((stockNode: any) => {
                  const stock = stockNode.data;
                  const symbol = stock.symbol!;
                  let w = stockNode.x1 - stockNode.x0;
                  let h = stockNode.y1 - stockNode.y0;

                  if (w < 1) w = 1;
                  if (h < 1) h = 1;

                  const isMatch = searchQuery.trim() ? isHighlighted(stock) : null;
                  const trendColor = getTrendColor(stock.change);

                  // Formatting metric label
                  let metricLabel = '';
                  if (colorMetric === 'pe') {
                    metricLabel = `PE: ${stock.pe || '-'}`;
                  } else {
                    metricLabel = `${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%`;
                  }

                  return (
                    <g
                      key={symbol}
                      data-testid={`stock-tile-${symbol}`}
                      data-highlighted={isMatch !== null ? (isMatch ? "true" : "false") : undefined}
                      data-trend-color={trendColor}
                      transform={`translate(${stockNode.x0}, ${stockNode.y0})`}
                      className={`cursor-pointer transition-opacity duration-300 ${
                        searchQuery.trim() && isMatch === false ? 'opacity-20 saturate-50' : 'opacity-100'
                      }`}
                      onMouseEnter={(e) => handleMouseEnter(e, stock)}
                      onMouseLeave={() => onStockHover?.(null, 0, 0)}
                      onClick={() => onStockClick?.({
                        symbol,
                        name: stock.name,
                        price: stock.price || 0,
                        change: stock.change || 0,
                        marketCap: stock.marketCap || 0,
                        sector: stock.sector || '',
                        pe: stock.pe,
                        volume: stock.volume,
                      })}
                    >
                      {/* Colored Tile Rect */}
                      <rect
                        width={w}
                        height={h}
                        className={`${getTileColor(stock, theme, colorMetric)} drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                        stroke="#ffffff"
                        strokeOpacity={0.06}
                        strokeWidth={w < 15 || h < 15 ? 0 : 1}
                        rx={w < 25 || h < 25 ? 2 : 4}
                        ry={w < 25 || h < 25 ? 2 : 4}
                      />

                      {/* Ticker/Name Text - Render only if dimensions permit */}
                      {w > 42 && h > 24 && (
                        <text
                          data-testid={`stock-symbol-${symbol}`}
                          x={w / 2}
                          y={h > 36 ? h / 2 - 5 : h / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="font-extrabold text-[13px] fill-white pointer-events-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                        >
                          {symbol.endsWith('.HK') ? stock.name : symbol}
                        </text>
                      )}

                      {/* Change Percentage / Metric Text - Render only if height permits */}
                      {w > 50 && h > 36 && (
                        <text
                          data-testid={`stock-change-${symbol}`}
                          x={w / 2}
                          y={h / 2 + 10}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-[11px] font-semibold fill-slate-100 pointer-events-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                        >
                          {metricLabel}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
};
