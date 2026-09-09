import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { Stock } from '../types';

export interface StockHoverTooltipProps {
  stock: Stock;
  sector: string;
  subsector: string;
  subsectorStocks: Stock[];
  subsectorRect?: { x: number; y: number; w: number; h: number };
  containerWidth: number;
  cursorX: number;
  onStockDoubleClick?: (stock: Stock) => void;
  onMouseEnterTooltip?: () => void;
  onMouseLeaveTooltip?: () => void;
}

export function getTooltipTextColor(change: number): string {
  if (change >= 3.0) return '#fb7185';
  if (change >= 1.0) return '#f43f5e';
  if (change > 0.0) return '#fda4af';
  if (change === 0.0) return '#94a3b8';
  if (change >= -1.0) return '#6ee7b7';
  if (change >= -3.0) return '#10b981';
  return '#34d399';
}

export function getSparklineUrl(symbol: string): string {
  const [code, exchange] = symbol.split('.');
  const cleanCode = code.replace(/\D/g, '');
  const isSh = exchange?.toLowerCase() === 'sh' || cleanCode.startsWith('6') || cleanCode.startsWith('688');
  const nid = isSh ? `1.${cleanCode}` : `0.${cleanCode}`;
  return `https://webquotepic.eastmoney.com/GetPic.aspx?nid=${nid}&imageType=RJY`;
}

export function getKlineUrl(symbol: string): string {
  const [code, exchange] = symbol.split('.');
  const cleanCode = code.replace(/\D/g, '');
  const isSh = exchange?.toLowerCase() === 'sh' || cleanCode.startsWith('6') || cleanCode.startsWith('688');
  const prefix = isSh ? 'sh' : 'sz';
  return `https://image.sinajs.cn/newchart/daily/n/${prefix}${cleanCode}.gif`;
}

export const StockHoverTooltip: React.FC<StockHoverTooltipProps> = ({
  stock,
  sector,
  subsector,
  subsectorStocks,
  subsectorRect,
  containerWidth,
  cursorX,
  onStockDoubleClick,
  onMouseEnterTooltip,
  onMouseLeaveTooltip,
}) => {
  // Current active stock preview inside tooltip (defaults to hovered stock)
  const [activeStock, setActiveStock] = useState<Stock>(stock);

  // Sync active stock when external hovered stock changes
  useEffect(() => {
    setActiveStock(stock);
  }, [stock]);

  const isUp = activeStock.change > 0;
  const isDown = activeStock.change < 0;
  const sign = isUp ? '+' : '';

  // Calculate position with adjacent docking logic
  const tooltipWidth = 328;
  let leftPos = 0;

  if (subsectorRect && containerWidth > 0) {
    const subRight = subsectorRect.x + subsectorRect.w;
    const subLeft = subsectorRect.x;

    if (subRight + tooltipWidth <= containerWidth) {
      leftPos = Math.round(subRight + 3);
    } else if (subLeft - tooltipWidth >= 0) {
      leftPos = Math.round(subLeft - tooltipWidth - 3);
    } else {
      if (cursorX > containerWidth / 2) {
        leftPos = Math.max(0, Math.round(cursorX - tooltipWidth - 15));
      } else {
        leftPos = Math.min(containerWidth - tooltipWidth, Math.round(cursorX + 15));
      }
    }
  } else if (containerWidth > 0) {
    if (cursorX > containerWidth / 2) {
      leftPos = Math.max(0, Math.round(cursorX - tooltipWidth - 15));
    } else {
      leftPos = Math.min(containerWidth - tooltipWidth, Math.round(cursorX + 15));
    }
  }

  // Sort subsector stocks by market cap descending
  const sortedStocks = [...subsectorStocks].sort(
    (a, b) => (b.marketCap || 0) - (a.marketCap || 0)
  );

  const heroBg = isUp
    ? 'bg-gradient-to-r from-rose-950/70 via-slate-900/90 to-[#0c101c] border-b border-rose-900/40'
    : isDown
    ? 'bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-[#0c101c] border-b border-emerald-900/40'
    : 'bg-slate-900/90 border-b border-slate-800';

  const badgePill = isUp
    ? 'text-rose-300 bg-rose-500/20 border border-rose-500/30'
    : isDown
    ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/30'
    : 'text-slate-300 bg-slate-800 border border-slate-700';

  return (
    <div
      id="hover-tip"
      className="absolute top-[2px] z-[999] select-none bg-[#0c101c]/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl shadow-black/80 flex flex-col font-sans overflow-hidden ring-1 ring-white/10"
      style={{
        left: `${leftPos}px`,
        width: `${tooltipWidth}px`,
        maxHeight: 'calc(100% - 4px)',
      }}
      onMouseEnter={onMouseEnterTooltip}
      onMouseLeave={onMouseLeaveTooltip}
    >
      <section className="tooltip-section w-[328px] flex flex-col h-full overflow-hidden text-[14px]">
        {/* 1. Header Bar: Sector - Subsector Tags */}
        <div className="h-[36px] bg-[#111726] border-b border-slate-800/80 px-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-1.5 truncate max-w-[210px]">
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-700/60">
              {sector}
            </span>
            <span className="text-[12.5px] font-bold text-sky-400 truncate">
              {subsector}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
            <span className="font-mono">{sortedStocks.length}只个股</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-400/90 flex items-center">
              双击K线
              <ExternalLink size={10} className="ml-0.5" />
            </span>
          </div>
        </div>

        {/* 2. Top Selected Item Hero Card */}
        <div
          className={`tooltip-item tooltip-top-item flex items-center justify-between px-3 py-2 text-white shrink-0 ${heroBg}`}
          style={{ height: '58px' }}
        >
          <div className="flex flex-col truncate w-[84px]">
            <span className="truncate font-bold text-[15px] text-white tracking-tight">
              {activeStock.name}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {activeStock.symbol}
            </span>
          </div>

          <div className="w-[74px] h-[34px] rounded bg-white/95 p-0.5 shadow-sm border border-slate-700/40 flex items-center justify-center shrink-0">
            <img
              src={getSparklineUrl(activeStock.symbol)}
              alt={activeStock.name}
              className="w-full h-full object-contain"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="text-right font-mono font-bold text-[16px] text-slate-100 min-w-[56px]">
            {activeStock.price.toFixed(2)}
          </div>

          <div className={`text-right font-mono font-bold text-[13px] px-2 py-0.5 rounded-md shrink-0 ${badgePill}`}>
            {sign}{activeStock.change.toFixed(2)}%
          </div>
        </div>

        {/* 3. Daily K-line Chart Image Container */}
        <div className="w-full bg-[#080b13] shrink-0 flex flex-col border-b border-slate-800/80">
          <div className="px-3 pt-1.5 pb-0.5 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>日K线趋势</span>
            <span className="text-[9.5px] text-slate-500 font-mono">SINA · 每日收盘</span>
          </div>

          <div className="w-[328px] h-[168px] overflow-hidden flex items-center justify-center px-1 pb-1">
            <img
              className="tooltip-top-img w-[326px] h-[166px] object-fill rounded border border-slate-800 shadow-inner"
              src={getKlineUrl(activeStock.symbol)}
              alt="大盘云图"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* 4. Column Labels for Stocks List */}
        <div className="h-[22px] bg-[#0e1320] border-b border-slate-800/70 px-3 flex items-center justify-between text-[10.5px] font-semibold text-slate-400 shrink-0">
          <span className="w-[84px]">股票名称</span>
          <span className="w-[74px] text-center">分时</span>
          <span className="w-[56px] text-right">现价</span>
          <span className="w-[62px] text-right">涨跌幅</span>
        </div>

        {/* 5. Component Stocks List */}
        <div className="flex-1 overflow-y-auto bg-[#0a0e19] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {sortedStocks.map((st) => {
            const stSign = st.change > 0 ? '+' : '';
            const textColor = getTooltipTextColor(st.change);
            const isRowSelected = st.symbol === activeStock.symbol;

            return (
              <div
                key={st.symbol}
                className={`tooltip-item flex items-center justify-between px-3 cursor-pointer transition-all ${
                  isRowSelected
                    ? 'bg-amber-500/15 border-l-[3px] border-amber-400 pl-[9px] text-white'
                    : 'hover:bg-slate-800/50 text-slate-300'
                }`}
                style={{
                  height: '37px',
                  borderBottom: '1px solid rgba(30, 41, 59, 0.45)',
                }}
                onMouseEnter={() => setActiveStock(st)}
                onDoubleClick={() => onStockDoubleClick?.(st)}
                title="双击在雪球查看行情"
              >
                <div className="w-[84px] truncate flex flex-col">
                  <span className="truncate text-[13px] font-semibold text-slate-200">
                    {st.name}
                  </span>
                  <span className="text-[9.5px] text-slate-500 font-mono -mt-0.5">
                    {st.symbol.split('.')[0]}
                  </span>
                </div>

                <div className="w-[74px] h-[26px] rounded bg-white/95 p-0.2 shadow-sm border border-slate-700/40 flex items-center justify-center shrink-0">
                  <img
                    src={getSparklineUrl(st.symbol)}
                    alt="分时"
                    className="w-full h-full object-contain"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                <div className="w-[56px] text-right font-mono font-bold text-[13px] text-slate-200">
                  {st.price.toFixed(2)}
                </div>

                <div
                  className="w-[62px] text-right font-mono font-bold text-[13px]"
                  style={{ color: textColor }}
                >
                  {stSign}{st.change.toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

