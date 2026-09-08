import React, { useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { REPLAY_TIME_SLOTS, ReplayTimeSlot, getAvailableReplaySlots } from '../services/replayService';

export interface FooterBarProps {
  activeTimeSlot: ReplayTimeSlot | null;
  isHistoricalDate?: boolean;
  selectedDateStr?: string;
  onSelectTimeSlot: (slot: ReplayTimeSlot) => void;
  onOpenHistoryCalendar: () => void;
}

export const FooterBar: React.FC<FooterBarProps> = ({
  activeTimeSlot,
  isHistoricalDate = false,
  selectedDateStr,
  onSelectTimeSlot,
  onOpenHistoryCalendar,
}) => {
  const availableSlots = getAvailableReplaySlots(isHistoricalDate);

  // Keyboard navigation: ArrowLeft and ArrowRight to step through time slots
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input field
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const currentIndex = activeTimeSlot ? REPLAY_TIME_SLOTS.indexOf(activeTimeSlot) : REPLAY_TIME_SLOTS.length - 1;
        const delta = e.key === 'ArrowLeft' ? -1 : 1;
        const newIndex = Math.max(0, Math.min(REPLAY_TIME_SLOTS.length - 1, currentIndex + delta));
        const targetSlot = REPLAY_TIME_SLOTS[newIndex];
        const isAvailable = availableSlots.find(s => s.slot === targetSlot)?.available ?? true;
        if (isAvailable) {
          onSelectTimeSlot(targetSlot);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTimeSlot, availableSlots, onSelectTimeSlot]);

  return (
    <footer className="h-[38px] bg-[#1a1c24] border-t border-[#2d3240] px-3 flex items-center justify-between text-white select-none z-20 flex-shrink-0 text-[12px]">
      {/* Left & Center: Replay Controls */}
      <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
        {/* History Date Picker Button */}
        <button
          type="button"
          onClick={onOpenHistoryCalendar}
          className="h-[26px] px-2.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded font-medium flex items-center space-x-1 transition-colors shadow-sm"
        >
          <Calendar size={13} />
          <span>{isHistoricalDate && selectedDateStr ? selectedDateStr : '回看历史'}</span>
          <ChevronDown size={12} />
        </button>

        {/* Current Replay Status Badge */}
        <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 text-[11px] border border-zinc-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{isHistoricalDate ? '历史复盘' : '当日复盘'}</span>
        </div>

        {/* Intraday Time Slots */}
        <div className="flex items-center space-x-1">
          {availableSlots.map(({ slot, available }) => {
            const isSelected = activeTimeSlot === slot || (!activeTimeSlot && slot === '15:00');

            return (
              <button
                key={slot}
                type="button"
                disabled={!available}
                onClick={() => onSelectTimeSlot(slot)}
                className={`h-[24px] px-2 rounded text-[11px] font-mono transition-colors ${
                  isSelected
                    ? 'bg-amber-500 font-bold text-zinc-950 shadow'
                    : available
                    ? 'bg-[#2a2e3c] hover:bg-[#383d4f] text-zinc-200'
                    : 'bg-[#1e212b] text-zinc-600 cursor-not-allowed'
                }`}
                title={available ? `回放 ${slot} 盘面 (支持键盘方向键)` : `${slot} 盘面尚未产生`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: 9-step Color Legend */}
      <div className="hidden md:flex items-center space-x-0.5 flex-shrink-0">
        <div className="h-[22px] px-1.5 bg-[#30cc5a] text-white flex items-center justify-center text-[10px] font-mono rounded-l">
          -4%
        </div>
        <div className="h-[22px] px-1.5 bg-[#2faa51] text-white flex items-center justify-center text-[10px] font-mono">
          -3%
        </div>
        <div className="h-[22px] px-1.5 bg-[#31894e] text-white flex items-center justify-center text-[10px] font-mono">
          -2%
        </div>
        <div className="h-[22px] px-1.5 bg-[#38694f] text-white flex items-center justify-center text-[10px] font-mono">
          -1%
        </div>
        <div className="h-[22px] px-1.5 bg-[#414554] text-white flex items-center justify-center text-[10px] font-mono">
          0%
        </div>
        <div className="h-[22px] px-1.5 bg-[#784551] text-white flex items-center justify-center text-[10px] font-mono">
          +1%
        </div>
        <div className="h-[22px] px-1.5 bg-[#a5424a] text-white flex items-center justify-center text-[10px] font-mono">
          +2%
        </div>
        <div className="h-[22px] px-1.5 bg-[#ce3d41] text-white flex items-center justify-center text-[10px] font-mono">
          +3%
        </div>
        <div className="h-[22px] px-1.5 bg-[#f63538] text-white flex items-center justify-center text-[10px] font-mono rounded-r">
          +4%
        </div>
      </div>
    </footer>
  );
};
