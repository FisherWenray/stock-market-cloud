import React, { useState, useEffect } from 'react';
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
  if (change >= 3.0) return '#df3a3d';
  if (change >= 2.0) return '#a5424a';
  if (change >= 1.0) return '#824450';
  if (change > 0.3) return '#6f4552';
  if (change >= -0.3) return '#414554';
  if (change >= -1.0) return '#3b5a50';
  if (change >= -2.0) return '#366f4e';
  if (change >= -3.0) return '#30974f';
  return '#2fa450';
}

export function getTooltipTopBg(change: number): string {
  if (change > 0) return '#df3a3d';
  if (change < 0) return '#366f4e';
  return '#3a3e4c';
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
  const sign = isUp ? '+' : '';
  const topBg = getTooltipTopBg(activeStock.change);

  // Calculate position matching 52etf.site adjacent docking logic
  const tooltipWidth = 324;
  let leftPos = 0;

  if (subsectorRect && containerWidth > 0) {
    const subRight = subsectorRect.x + subsectorRect.w;
    const subLeft = subsectorRect.x;

    if (subRight + tooltipWidth <= containerWidth) {
      // Dock to the right of the subsector
      leftPos = Math.round(subRight + 2);
    } else if (subLeft - tooltipWidth >= 0) {
      // Dock to the left of the subsector
      leftPos = Math.round(subLeft - tooltipWidth - 2);
    } else {
      // Subsector is wider than space, position adjacent to cursor
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

  // Sort subsector stocks by market cap descending (matching 52etf.site)
  const sortedStocks = [...subsectorStocks].sort(
    (a, b) => (b.marketCap || 0) - (a.marketCap || 0)
  );

  return (
    <div
      id="hover-tip"
      className="absolute top-[1px] z-[999] select-none bg-white border border-[#d9d9d9] shadow-2xl flex flex-col font-sans"
      style={{
        left: `${leftPos}px`,
        width: `${tooltipWidth}px`,
        maxHeight: 'calc(100% - 2px)',
      }}
      onMouseEnter={onMouseEnterTooltip}
      onMouseLeave={onMouseLeaveTooltip}
    >
      <section className="tooltip-section w-[324px] flex flex-col h-full overflow-hidden text-[14.5px] font-bold">
        {/* 1. Header Bar: Sector - Subsector */}
        <div
          className="bg-black text-white px-[11px] py-[3px] text-[14.5px] font-bold truncate shrink-0"
          style={{ padding: '3px 7px 3px 11px' }}
        >
          {sector} - {subsector}
        </div>

        {/* 2. Top Selected Item Card */}
        <div
          className="tooltip-item tooltip-top-item flex items-center justify-between px-[10px] text-white shrink-0"
          style={{
            background: topBg,
            height: '56px',
            fontSize: '18px',
            color: '#ffffff',
          }}
        >
          <div className="w-[78px] truncate font-bold text-[18px]">
            {activeStock.name}
          </div>
          <img
            src={getSparklineUrl(activeStock.symbol)}
            alt={activeStock.name}
            className="w-[74px] h-[33px] object-contain"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="w-[58px] text-right font-mono font-bold text-[18px]">
            {activeStock.price.toFixed(2)}
          </div>
          <div className="w-[67px] text-right font-mono font-bold text-[18px]">
            {sign}{activeStock.change.toFixed(2)}%
          </div>
        </div>

        {/* 3. Daily K-line Chart Image */}
        <div className="w-[324px] h-[174px] bg-white overflow-hidden shrink-0 flex items-center justify-center border-b border-[#bababa]">
          <img
            className="tooltip-top-img w-[330px] h-[174px] -ml-[3px] object-fill"
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

        {/* 4. Component Stocks List */}
        <div className="flex-1 overflow-y-auto bg-white scrollbar-thin scrollbar-thumb-zinc-400 scrollbar-track-zinc-100">
          {sortedStocks.map((st) => {
            const stSign = st.change > 0 ? '+' : '';
            const textColor = getTooltipTextColor(st.change);
            const isRowSelected = st.symbol === activeStock.symbol;

            return (
              <div
                key={st.symbol}
                className={`tooltip-item flex items-center justify-between px-[10px] cursor-pointer transition-colors ${
                  isRowSelected ? 'bg-amber-50/80' : 'hover:bg-[#f5f5f5]'
                }`}
                style={{
                  height: '38px',
                  borderBottom: '0.5px solid rgb(186, 186, 186)',
                  fontWeight: 500,
                }}
                onMouseEnter={() => setActiveStock(st)}
                onDoubleClick={() => onStockDoubleClick?.(st)}
              >
                <div
                  className="w-[78px] truncate text-[14.5px] font-semibold text-black"
                  title={`${st.name} (${st.symbol})`}
                >
                  {st.name}
                </div>

                <img
                  src={getSparklineUrl(st.symbol)}
                  alt="分时"
                  className="w-[74px] h-[33px] object-contain"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />

                <div
                  className="w-[58px] text-right font-mono font-bold text-[14.5px]"
                  style={{ color: textColor }}
                >
                  {st.price.toFixed(2)}
                </div>

                <div
                  className="w-[67px] text-right font-mono font-bold text-[14.5px]"
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
