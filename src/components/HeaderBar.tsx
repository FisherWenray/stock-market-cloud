import React, { useEffect, useState } from 'react';
import { Maximize, Minimize, RotateCcw, TrendingUp } from 'lucide-react';
import { MarketIndexItem } from '../types';

export interface HeaderBarProps {
  indices?: MarketIndexItem[];
  onTitleClick?: () => void;
}

export const DEFAULT_INDICES: MarketIndexItem[] = [
  { name: '上证指数', code: '000001', point: 3946.68, changePercent: 0.35 },
  { name: '深证成指', code: '399001', point: 13793.13, changePercent: 0.13 },
  { name: '创业板指', code: '399006', point: 3397.01, changePercent: -0.05 },
  { name: '中证全指', code: '000985', point: 5916.40, changePercent: 0.40 },
  { name: '上证50', code: '000016', point: 2914.93, changePercent: 0.11 },
  { name: '沪深300', code: '000300', point: 4579.43, changePercent: 0.10 },
  { name: '中证500', code: '000905', point: 7804.13, changePercent: 0.58 },
];

export const HeaderBar: React.FC<HeaderBarProps> = ({
  indices = DEFAULT_INDICES,
  onTitleClick,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live Clock (Format: YYYY-MM-DD HH:mm:ss)
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      const seconds = pad(d.getSeconds());
      setTimeStr(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="h-[54px] flex items-center justify-between px-4 bg-[#0d121f]/95 backdrop-blur-md border-b border-slate-800/80 text-white select-none z-20 flex-shrink-0 shadow-lg shadow-black/20">
      {/* Left: Refined Brand Identity */}
      <div
        className="flex items-center space-x-3 cursor-pointer group min-w-[210px]"
        onClick={onTitleClick}
        title="点击重置全景缩放"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 p-[1.5px] shadow-md shadow-rose-950/40 flex-shrink-0 group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-[#0d121f] rounded-[7px] flex items-center justify-center">
            <TrendingUp size={16} className="text-amber-400" />
          </div>
        </div>

        <div className="flex flex-col leading-none">
          <div className="flex items-center space-x-2">
            <h1 className="text-[16px] font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              大盘云图
            </h1>
            <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
              PRO
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">
            全景看盘 · 实时多维热力终端
          </span>
        </div>
      </div>

      {/* Center: Real-time Index Cards */}
      <div className="hidden lg:flex items-center space-x-2.5 overflow-x-auto py-1 px-2 scrollbar-none">
        {indices.map(idx => {
          const isUp = idx.changePercent > 0;
          const isDown = idx.changePercent < 0;
          const sign = isUp ? '+' : '';

          const pillBg = isUp
            ? 'bg-rose-500/10 border-rose-500/25 text-rose-400'
            : isDown
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
            : 'bg-slate-800/40 border-slate-700/40 text-slate-400';

          return (
            <div
              key={idx.name}
              className="flex items-center space-x-2 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-slate-700/80 px-2.5 py-1 rounded-lg transition-all"
            >
              <span className="text-[11px] text-slate-300 font-medium whitespace-nowrap">
                {idx.name}
              </span>
              <span className="text-[12px] font-mono font-bold text-slate-100">
                {idx.point.toFixed(2)}
              </span>
              <span className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded border ${pillBg}`}>
                {isUp ? '▲' : isDown ? '▼' : ''} {sign}{idx.changePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Right: Clock & Actions */}
      <div className="flex items-center space-x-3 min-w-[220px] justify-end">
        {/* Live heartbeat indicator */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2 py-1 rounded-md bg-slate-900/70 border border-slate-800/80 text-[11px] text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-emerald-400 font-semibold text-[10px]">LIVE</span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-[11px] text-slate-300 tracking-tight">
            {timeStr || '--:--:--'}
          </span>
        </div>

        {/* Reset View Button */}
        {onTitleClick && (
          <button
            type="button"
            onClick={onTitleClick}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
            title="重置缩放与平移"
          >
            <RotateCcw size={15} />
          </button>
        )}

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
          title={isFullscreen ? '退出全屏' : '进入全屏'}
        >
          {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
        </button>
      </div>
    </header>
  );
};

