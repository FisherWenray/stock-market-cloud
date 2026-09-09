import React, { useState } from 'react';
import { Camera, ChevronDown, Loader2, BarChart2, Zap, HelpCircle } from 'lucide-react';
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

  // Calculate breadth ratio percentages
  const totalStocks = marketBreadth.upCount + marketBreadth.flatCount + marketBreadth.downCount || 1;
  const upPercent = Math.round((marketBreadth.upCount / totalStocks) * 100);
  const downPercent = Math.round((marketBreadth.downCount / totalStocks) * 100);
  const flatPercent = 100 - upPercent - downPercent;

  return (
    <aside className="w-[168px] bg-[#0b0f19] border-r border-slate-800/80 flex flex-col items-center py-2.5 px-2 select-none text-slate-100 flex-shrink-0 z-10 overflow-y-auto scrollbar-none text-[13px]">
      {/* 1. Market Scope Tabs */}
      <div className="w-full flex flex-col space-y-1">
        <div className="text-[11px] font-semibold text-slate-400 px-1.5 flex items-center justify-between mb-0.5">
          <span className="flex items-center space-x-1">
            <BarChart2 size={12} className="text-amber-400" />
            <span>市场范围</span>
          </span>
          {isRefreshing && <Loader2 size={11} className="animate-spin text-amber-400" />}
        </div>

        <div className="w-full bg-[#101626]/80 rounded-xl border border-slate-800/80 overflow-hidden shadow-sm">
          {SCOPE_OPTIONS.map((opt, idx) => {
            const isActive = opt.id === currentScope;
            const changeVal = scopeChanges[opt.id] ?? 0;
            const isUp = changeVal > 0;
            const isDown = changeVal < 0;
            const changeColor = isUp ? 'text-rose-400' : isDown ? 'text-emerald-400' : 'text-slate-400';
            const sign = isUp ? '+' : '';

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectScope(opt.id)}
                className={`w-full h-[31px] px-2.5 flex items-center justify-between text-left transition-all text-[12.5px] ${
                  idx > 0 ? 'border-t border-slate-800/50' : ''
                } ${
                  isActive
                    ? 'bg-slate-800/90 font-bold text-white border-l-[3px] border-amber-400 pl-[7px]'
                    : 'hover:bg-slate-800/40 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-1 overflow-hidden">
                  <span className="truncate">{opt.name}</span>
                  {opt.badge && (
                    <span className="text-[9px] bg-slate-800 px-1 py-0.2 rounded text-slate-400 border border-slate-700/60 font-mono">
                      {opt.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1 flex-shrink-0">
                  <span className={`text-[11px] font-mono font-bold ${changeColor}`}>
                    {sign}{changeVal.toFixed(2)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Timeframe Selector Dropdown */}
      <div className="w-full mt-2.5 relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full h-[30px] px-2.5 bg-[#101626]/80 hover:bg-slate-800/60 rounded-lg border border-slate-800/80 flex items-center justify-between text-[12px] text-slate-200 transition-colors shadow-sm"
        >
          <span className="font-medium text-slate-200 truncate">{activeTimeframeLabel}</span>
          <ChevronDown
            size={13}
            className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute top-[34px] left-0 w-full bg-[#12192c] border border-slate-700/80 rounded-xl shadow-2xl py-1 z-30 backdrop-blur-xl">
            {TIMEFRAME_OPTIONS.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTimeframe(item.id);
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-[12px] transition-colors flex items-center justify-between ${
                  item.id === currentTimeframe
                    ? 'text-amber-400 font-bold bg-amber-500/10 border-l-2 border-amber-400 pl-2.5'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <span>{item.name}</span>
                {item.id === currentTimeframe && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Market Breadth Statistics with Visual Distribution Bar */}
      <div className="w-full mt-2.5 bg-[#101626]/80 rounded-xl border border-slate-800/80 p-2 text-center text-[12px] shadow-sm">
        <div className="text-[10.5px] font-semibold text-slate-400 mb-1.5 text-left flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <Zap size={11} className="text-amber-400" />
            <span>市场情绪与广度</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">{totalStocks}只</span>
        </div>

        {/* Visual Breadth Bar (Up / Flat / Down distribution) */}
        <div className="w-full h-[6px] rounded-full overflow-hidden flex bg-slate-800 mb-2 border border-slate-700/40">
          <div
            style={{ width: `${upPercent}%` }}
            className="bg-rose-500 transition-all duration-300"
            title={`上涨占比 ${upPercent}%`}
          />
          <div
            style={{ width: `${flatPercent}%` }}
            className="bg-slate-500 transition-all duration-300"
            title={`平盘占比 ${flatPercent}%`}
          />
          <div
            style={{ width: `${downPercent}%` }}
            className="bg-emerald-500 transition-all duration-300"
            title={`下跌占比 ${downPercent}%`}
          />
        </div>

        {/* Up / Flat / Down Counts */}
        <div className="grid grid-cols-3 gap-1 pb-2 border-b border-slate-800/60">
          <div className="bg-rose-950/20 rounded py-1 border border-rose-900/30">
            <div className="text-[10px] text-rose-300">涨 {upPercent}%</div>
            <div className="text-[12.5px] font-bold font-mono text-rose-400 mt-0.5">
              {marketBreadth.upCount}
            </div>
          </div>
          <div className="bg-slate-800/30 rounded py-1 border border-slate-700/30">
            <div className="text-[10px] text-slate-400">平</div>
            <div className="text-[12.5px] font-bold font-mono text-slate-300 mt-0.5">
              {marketBreadth.flatCount}
            </div>
          </div>
          <div className="bg-emerald-950/20 rounded py-1 border border-emerald-900/30">
            <div className="text-[10px] text-emerald-300">跌 {downPercent}%</div>
            <div className="text-[12.5px] font-bold font-mono text-emerald-400 mt-0.5">
              {marketBreadth.downCount}
            </div>
          </div>
        </div>

        {/* Turnover & Volume Diff */}
        <div className="grid grid-cols-2 gap-1 pt-2">
          <div>
            <div className="text-[10.5px] text-slate-400">总成交额</div>
            <div className="text-[11.5px] font-mono font-bold text-amber-300 mt-0.5">
              {(marketBreadth.totalTurnover / 10000).toFixed(2)}万亿
            </div>
          </div>
          <div>
            <div className="text-[10.5px] text-slate-400">
              较昨日<span className={marketBreadth.diffTurnover >= 0 ? 'text-rose-400' : 'text-emerald-400'}>
                {marketBreadth.diffTurnover >= 0 ? '放量' : '缩量'}
              </span>
            </div>
            <div
              className={`text-[11.5px] font-mono font-bold mt-0.5 ${
                marketBreadth.diffTurnover >= 0 ? 'text-rose-400' : 'text-emerald-400'
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
        className="w-full mt-2.5 h-[32px] bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 active:scale-[0.98] text-white rounded-lg font-medium text-[12px] flex items-center justify-center space-x-1.5 shadow-md shadow-sky-950/40 transition-all"
      >
        <Camera size={14} />
        <span>截图导出</span>
      </button>

      {/* 5. Operation Tips Panel */}
      <div className="w-full mt-2.5 p-2 rounded-xl border border-slate-800/80 bg-[#101626]/80 text-[11px] text-slate-300 space-y-1 shadow-sm">
        <div className="font-semibold text-slate-200 mb-1 flex items-center text-[11px]">
          <HelpCircle size={12} className="text-amber-400 mr-1" />
          <span>终端快捷交互</span>
        </div>
        <div className="text-slate-400">· 面积代表流通市值</div>
        <div className="text-slate-400">· 颜色代表涨跌幅度</div>
        <div className="text-slate-400">· 实时每 8 秒刷新行情</div>
        <div className="text-slate-400">· 双击色块查看雪球 K 线</div>
        <div className="text-slate-400">· 滚轮自由缩放与拖拽</div>
        <div className="text-slate-400">· 方向键 ← → 分钟复盘</div>
      </div>
    </aside>
  );
};

