import React, { useEffect, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';
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

  // Live Clock (Format: YYYY-MM-DD HH:mm)
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      setTimeStr(`${year}-${month}-${day} ${hours}:${minutes}`);
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
    <header className="h-[56px] flex items-center justify-between px-4 bg-[#232732] border-b border-[#3b4152] text-white select-none z-20 flex-shrink-0">
      {/* Left: Branding */}
      <div
        className="flex items-center space-x-3 cursor-pointer min-w-[200px]"
        onClick={onTitleClick}
        title="重置视图"
      >
        <div className="flex items-baseline space-x-2">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
            <span className="text-amber-500 mr-1.5">📈</span>
            大盘云图
          </h1>
          <span className="text-[11px] text-zinc-400 font-medium bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700">
            A股热力图
          </span>
        </div>
      </div>

      {/* Center: Real-time Index Strip */}
      <div className="hidden lg:flex items-center space-x-5 overflow-x-auto py-1 px-3 scrollbar-none">
        {indices.map(idx => {
          const isUp = idx.changePercent > 0;
          const isDown = idx.changePercent < 0;
          const colorClass = isUp ? 'text-[#f63538]' : isDown ? 'text-[#30cc5a]' : 'text-zinc-300';
          const sign = isUp ? '+' : '';

          return (
            <div key={idx.name} className="flex flex-col items-center leading-tight">
              <span className="text-[11px] text-zinc-400 font-normal">{idx.name}</span>
              <div className="flex items-center space-x-1.5 text-[12px] font-semibold mt-0.5">
                <span className={colorClass}>{idx.point.toFixed(2)}</span>
                <span className={`${colorClass} text-[11px] font-medium`}>
                  {sign}{idx.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: Clock & Fullscreen */}
      <div className="flex items-center space-x-4 min-w-[180px] justify-end">
        <span className="text-[13px] font-mono text-zinc-300 tracking-wide">
          {timeStr}
        </span>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-1.5 rounded hover:bg-zinc-700/60 text-zinc-300 hover:text-white transition-colors"
          title={isFullscreen ? '退出全屏' : '进入全屏'}
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </div>
    </header>
  );
};
