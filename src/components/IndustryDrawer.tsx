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
  const heroBgClass = isUp
    ? 'bg-gradient-to-r from-rose-950/70 via-slate-900/90 to-[#0c101c] border-b border-rose-900/40'
    : isDown
    ? 'bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-[#0c101c] border-b border-emerald-900/40'
    : 'bg-slate-900/90 border-b border-slate-800';

  // Format sina ticker for K-line image
  const [code, exchange] = current.symbol.split('.');
  const prefix = exchange?.toLowerCase() === 'sh' || code.startsWith('6') ? 'sh' : 'sz';
  const klineImgUrl = `https://image.sinajs.cn/newchart/daily/n/${prefix}${code}.gif`;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[360px] bg-[#0c101c] border-l border-slate-800 shadow-2xl z-30 flex flex-col select-none text-slate-100 animate-in slide-in-from-right duration-200">
      {/* 1. Header */}
      <div className="h-[46px] px-4 flex items-center justify-between border-b border-slate-800/80 bg-[#111726] flex-shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-[13px] font-bold text-slate-100">
            {sector} · {subsector}
          </span>
          <span className="text-[11px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60 font-mono">
            {stocks.length} 只成分股
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* 2. Top Selected Stock Card */}
      <div className={`p-4 ${heroBgClass} text-white transition-colors flex-shrink-0 shadow-md`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white">{current.name}</span>
              <span className="text-xs font-mono text-slate-400">{current.symbol}</span>
            </div>
            <div className="flex items-baseline space-x-3 mt-1">
              <span className="text-2xl font-bold font-mono text-white">
                {current.price.toFixed(2)}
              </span>
              <span className={`text-base font-bold font-mono ${isUp ? 'text-rose-400' : isDown ? 'text-emerald-400' : 'text-slate-300'}`}>
                {sign}{current.change.toFixed(2)}%
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onStockDoubleClick?.(current)}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors border border-slate-700/60"
            title="新标签页在雪球打开详情"
          >
            <ExternalLink size={16} />
          </button>
        </div>

        {/* Daily K-line Chart */}
        <div className="mt-3 bg-[#07090f] rounded-lg p-1 border border-slate-800 overflow-hidden min-h-[140px] flex items-center justify-center">
          <img
            src={klineImgUrl}
            alt={`${current.name} 日K线走势`}
            className="w-full h-auto object-contain rounded"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* 3. Component Stocks List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50 scrollbar-thin scrollbar-thumb-slate-700">
        {stocks.map(st => {
          const itemUp = st.change > 0;
          const itemDown = st.change < 0;
          const itemSign = itemUp ? '+' : '';
          const itemColor = itemUp ? 'text-rose-400' : itemDown ? 'text-emerald-400' : 'text-slate-400';
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
              className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-all ${
                isSelected ? 'bg-amber-500/15 border-l-[3px] border-amber-400 pl-[13px] text-white' : 'hover:bg-slate-800/40 text-slate-300'
              }`}
            >
              <div className="min-w-[90px]">
                <div className="text-[13px] font-semibold text-slate-200">{st.name}</div>
                <div className="text-[10px] font-mono text-slate-500">{st.symbol}</div>
              </div>

              {/* Sparkline */}
              <div className="w-[80px] h-[28px] rounded bg-white/95 p-0.5 border border-slate-700/40 overflow-hidden flex items-center justify-center">
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
                <div className="text-[13px] font-mono font-bold text-slate-200">
                  {st.price.toFixed(2)}
                </div>
                <div className={`text-[12px] font-mono font-bold ${itemColor}`}>
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
