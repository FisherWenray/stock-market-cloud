import React, { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Stock } from '../types';

export interface IndustryDrawerProps {
  sector: string;
  subsector: string;
  stocks: Stock[];
  initialStock?: Stock | null;
  onClose: () => void;
  onStockDoubleClick?: (stock: Stock) => void;
}

export const IndustryDrawer: React.FC<IndustryDrawerProps> = ({
  sector,
  subsector,
  stocks,
  initialStock,
  onClose,
  onStockDoubleClick,
}) => {
  const [selectedStock, setSelectedStock] = useState<Stock>(() => {
    return initialStock || stocks[0] || null;
  });

  if (!stocks || stocks.length === 0) return null;

  const current = selectedStock || stocks[0];
  const isUp = current.change > 0;
  const isDown = current.change < 0;
  const sign = isUp ? '+' : '';
  const topBgClass = isUp ? 'bg-[#c3343a]' : isDown ? 'bg-[#299949]' : 'bg-[#3b4152]';

  // Format sina ticker for K-line image
  const [code, exchange] = current.symbol.split('.');
  const prefix = exchange?.toLowerCase() === 'sh' || code.startsWith('6') ? 'sh' : 'sz';
  const klineImgUrl = `https://image.sinajs.cn/newchart/daily/n/${prefix}${code}.gif`;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[360px] bg-[#1a1d27] border-l border-[#343a4c] shadow-2xl z-30 flex flex-col select-none text-white animate-in slide-in-from-right duration-200">
      {/* 1. Header */}
      <div className="h-[46px] px-4 flex items-center justify-between border-b border-[#2d3242] bg-[#222634] flex-shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-[13px] font-semibold text-zinc-100">
            {sector} · {subsector}
          </span>
          <span className="text-[11px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
            {stocks.length} 只成分股
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded hover:bg-zinc-700/60 text-zinc-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* 2. Top Selected Stock Card */}
      <div className={`p-4 ${topBgClass} text-white transition-colors flex-shrink-0 shadow-md`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight">{current.name}</span>
              <span className="text-xs font-mono opacity-80">{current.symbol}</span>
            </div>
            <div className="flex items-baseline space-x-3 mt-1">
              <span className="text-2xl font-bold font-mono">
                {current.price.toFixed(2)}
              </span>
              <span className="text-base font-semibold font-mono">
                {sign}{current.change.toFixed(2)}%
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onStockDoubleClick?.(current)}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="新标签页打开详情"
          >
            <ExternalLink size={16} />
          </button>
        </div>

        {/* Daily K-line Chart */}
        <div className="mt-3 bg-[#111319] rounded p-1 border border-white/10 overflow-hidden min-h-[140px] flex items-center justify-center">
          <img
            src={klineImgUrl}
            alt={`${current.name} 日K线走势`}
            className="w-full h-auto object-contain rounded"
            onError={(e) => {
              // Fallback if Sina image is blocked or unavailable
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* 3. Component Stocks List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#252936] scrollbar-thin scrollbar-thumb-zinc-700">
        {stocks.map(st => {
          const itemUp = st.change > 0;
          const itemDown = st.change < 0;
          const itemSign = itemUp ? '+' : '';
          const itemColor = itemUp ? 'text-[#f63538]' : itemDown ? 'text-[#30cc5a]' : 'text-zinc-300';
          const isSelected = st.symbol === current.symbol;

          // Eastmoney sparkline image
          const [sCode, sEx] = st.symbol.split('.');
          const nid = sEx?.toLowerCase() === 'sh' || sCode.startsWith('6') ? `1.${sCode}` : `0.${sCode}`;
          const sparklineUrl = `https://webquotepic.eastmoney.com/GetPic.aspx?nid=${nid}&imageType=RJY`;

          return (
            <div
              key={st.symbol}
              onClick={() => setSelectedStock(st)}
              onDoubleClick={() => onStockDoubleClick?.(st)}
              className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                isSelected ? 'bg-[#292e3f]' : 'hover:bg-[#202431]'
              }`}
            >
              <div className="min-w-[90px]">
                <div className="text-[13px] font-medium text-zinc-200">{st.name}</div>
                <div className="text-[11px] font-mono text-zinc-400">{st.symbol}</div>
              </div>

              {/* Sparkline */}
              <div className="w-[80px] h-[26px] overflow-hidden flex items-center justify-center opacity-85">
                <img
                  src={sparklineUrl}
                  alt="分时"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="text-right min-w-[70px]">
                <div className="text-[13px] font-mono font-medium text-zinc-100">
                  {st.price.toFixed(2)}
                </div>
                <div className={`text-[12px] font-mono font-semibold ${itemColor}`}>
                  {itemSign}{st.change.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
