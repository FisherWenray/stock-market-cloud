import React from 'react';
import { Stock } from '../types';

export interface StockHoverTooltipProps {
  stock: Stock;
  x: number;
  y: number;
  sectorInfo?: { sector: string; subsector: string };
}

export const StockHoverTooltip: React.FC<StockHoverTooltipProps> = ({
  stock,
  x,
  y,
  sectorInfo,
}) => {
  const isUp = stock.change > 0;
  const isDown = stock.change < 0;
  const sign = isUp ? '+' : '';
  const changeColor = isUp ? 'text-[#f63538]' : isDown ? 'text-[#30cc5a]' : 'text-zinc-300';

  // Format nid for eastmoney intraday sparkline
  const [code, exchange] = stock.symbol.split('.');
  const nid = exchange?.toLowerCase() === 'sh' || code.startsWith('6') ? `1.${code}` : `0.${code}`;
  const sparklineUrl = `https://webquotepic.eastmoney.com/GetPic.aspx?nid=${nid}&imageType=RJY`;

  // Clamp position so tooltip stays within screen viewport
  const tooltipWidth = 210;
  const tooltipHeight = 120;
  const clampedX = Math.min(window.innerWidth - tooltipWidth - 20, Math.max(10, x + 15));
  const clampedY = Math.min(window.innerHeight - tooltipHeight - 40, Math.max(60, y - 20));

  return (
    <div
      className="fixed z-50 pointer-events-none bg-[#1a1d27]/95 backdrop-blur border border-[#3b4255] rounded-lg shadow-2xl p-3 text-white text-xs select-none w-[210px] animate-in fade-in duration-100"
      style={{ left: `${clampedX}px`, top: `${clampedY}px` }}
    >
      {/* Category */}
      {sectorInfo && (
        <div className="text-[10px] text-zinc-400 font-medium truncate mb-1">
          {sectorInfo.sector} · {sectorInfo.subsector}
        </div>
      )}

      {/* Stock Name & Symbol */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-zinc-100">{stock.name}</span>
        <span className="text-[11px] font-mono text-zinc-400">{stock.symbol}</span>
      </div>

      {/* Price & Change */}
      <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-zinc-800">
        <span className="text-base font-bold font-mono text-zinc-100">
          ¥{stock.price.toFixed(2)}
        </span>
        <span className={`text-xs font-bold font-mono ${changeColor}`}>
          {sign}{stock.change.toFixed(2)}%
        </span>
      </div>

      {/* Eastmoney Intraday Mini Sparkline */}
      <div className="mt-2 h-[34px] w-full bg-[#11131a] rounded overflow-hidden flex items-center justify-center border border-zinc-800/80">
        <img
          src={sparklineUrl}
          alt="分时图"
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    </div>
  );
};
