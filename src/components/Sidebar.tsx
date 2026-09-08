import React, { useState } from 'react';
import { Camera, ChevronDown, Loader2 } from 'lucide-react';
import { MarketScope, Timeframe, MarketBreadth } from '../types';
import { SCOPE_OPTIONS, TIMEFRAME_OPTIONS } from '../services/scopeManager';

export interface SidebarProps {
  currentScope: MarketScope;
  currentTimeframe: Timeframe;
  scopeChanges: Record<MarketScope, number>;
  marketBreadth: MarketBreadth;
  isRefreshing?: boolean;
  onSelectScope: (scope: MarketScope) => void;
  onSelectTimeframe: (timeframe: Timeframe) => void;
  onTriggerScreenshot: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScope,
  currentTimeframe,
  scopeChanges,
  marketBreadth,
  isRefreshing = false,
  onSelectScope,
  onSelectTimeframe,
  onTriggerScreenshot,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeTimeframeLabel =
    TIMEFRAME_OPTIONS.find(t => t.id === currentTimeframe)?.name || '当日涨跌幅';

  return (
    <aside className="w-[158px] bg-[#1a1c24] border-r border-[#2d3240] flex flex-col items-center py-2 px-1.5 select-none text-zinc-100 flex-shrink-0 z-10 overflow-y-auto scrollbar-none text-[13px]">
      {/* 1. Market Scope Tabs */}
      <div className="w-full bg-[#272a36] rounded border border-[#343a4a] overflow-hidden shadow-sm">
        {SCOPE_OPTIONS.map((opt, idx) => {
          const isActive = opt.id === currentScope;
          const changeVal = scopeChanges[opt.id] ?? 0;
          const isUp = changeVal > 0;
          const isDown = changeVal < 0;
          const changeColor = isUp ? 'text-[#f63538]' : isDown ? 'text-[#30cc5a]' : 'text-zinc-300';
          const sign = isUp ? '+' : '';

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectScope(opt.id)}
              className={`w-full h-[29px] px-2 flex items-center justify-between text-left transition-colors text-[13px] ${
                idx > 0 ? 'border-t border-[#313645]' : ''
              } ${
                isActive
                  ? 'bg-[#3b4152] font-semibold text-white shadow-inner'
                  : 'hover:bg-[#2e3342] text-zinc-300'
              }`}
            >
              <div className="flex items-center space-x-1 overflow-hidden">
                <span className="truncate">{opt.name}</span>
                {opt.badge && (
                  <span className="text-[9px] bg-zinc-700/80 px-1 py-0.2 rounded text-zinc-300">
                    {opt.badge}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1 flex-shrink-0">
                {isActive && isRefreshing ? (
                  <Loader2 size={12} className="animate-spin text-amber-400" />
                ) : (
                  <span className={`text-[11px] font-mono font-medium ${changeColor}`}>
                    {sign}{changeVal.toFixed(2)}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Timeframe Selector Dropdown */}
      <div className="w-full mt-2 relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full h-[28px] px-2 bg-[#272a36] hover:bg-[#313645] rounded border border-[#343a4a] flex items-center justify-between text-[12px] text-zinc-200 transition-colors"
        >
          <span>{activeTimeframeLabel}</span>
          <ChevronDown size={14} className={`text-zinc-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute top-[32px] left-0 w-full bg-[#272a36] border border-[#3b4152] rounded shadow-xl py-1 z-30">
            {TIMEFRAME_OPTIONS.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTimeframe(item.id);
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 text-[12px] hover:bg-[#3b4152] transition-colors ${
                  item.id === currentTimeframe ? 'text-amber-400 font-semibold bg-[#323746]' : 'text-zinc-300'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Market Breadth Statistics */}
      <div className="w-full mt-3 bg-[#20232e] rounded border border-[#2e3342] p-2 text-center text-[12px]">
        {/* Up / Flat / Down Counts */}
        <div className="grid grid-cols-3 gap-1 pb-2 border-b border-[#2d3240]">
          <div>
            <div className="text-[11px] text-zinc-400">上涨</div>
            <div className="text-[13px] font-bold text-[#f63538] mt-0.5">
              {marketBreadth.upCount}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-zinc-400">平盘</div>
            <div className="text-[13px] font-bold text-zinc-300 mt-0.5">
              {marketBreadth.flatCount}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-zinc-400">下跌</div>
            <div className="text-[13px] font-bold text-[#30cc5a] mt-0.5">
              {marketBreadth.downCount}
            </div>
          </div>
        </div>

        {/* Turnover & Diff */}
        <div className="grid grid-cols-2 gap-1 pt-2">
          <div>
            <div className="text-[11px] text-zinc-400">成交额</div>
            <div className="text-[12px] font-semibold text-amber-300 mt-0.5">
              {(marketBreadth.totalTurnover / 10000).toFixed(2)}万亿
            </div>
          </div>
          <div>
            <div className="text-[11px] text-zinc-400">
              较昨日<span className={marketBreadth.diffTurnover >= 0 ? 'text-[#f63538]' : 'text-[#30cc5a]'}>
                {marketBreadth.diffTurnover >= 0 ? '放量' : '缩量'}
              </span>
            </div>
            <div
              className={`text-[12px] font-semibold mt-0.5 ${
                marketBreadth.diffTurnover >= 0 ? 'text-[#f63538]' : 'text-[#30cc5a]'
              }`}
            >
              {Math.abs(marketBreadth.diffTurnover)}亿
            </div>
          </div>
        </div>
      </div>

      {/* 4. Screenshot Share Button */}
      <button
        type="button"
        onClick={onTriggerScreenshot}
        className="w-full mt-3 h-[30px] bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded font-medium text-[12px] flex items-center justify-center space-x-1.5 shadow transition-colors"
      >
        <Camera size={14} />
        <span>截图分享</span>
      </button>

      {/* 5. Operation Tips Panel */}
      <div className="w-full mt-3 p-2 rounded border border-[#3b4152] bg-[#222530] text-[11px] text-zinc-300 space-y-1">
        <div className="font-semibold text-zinc-200 mb-1 flex items-center">
          <span className="w-1 h-3 bg-amber-400 rounded-sm mr-1.5"></span>
          操作提示
        </div>
        <div>· 面积代表流通市值</div>
        <div>· 颜色代表涨跌幅度</div>
        <div>· 每8秒更新数据</div>
        <div>· 双击色块查看K线</div>
        <div>· 滚轮自由缩放/拖拽</div>
        <div>· 按方向键 ← → 复盘</div>
      </div>
    </aside>
  );
};
