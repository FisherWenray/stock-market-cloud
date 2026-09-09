import React, { useEffect } from 'react';
import { Calendar, ChevronDown, Clock } from 'lucide-react';
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
    <footer className="h-[40px] bg-[#0b0f19] border-t border-slate-800/80 px-3 flex items-center justify-between text-white select-none z-20 flex-shrink-0 text-[12px] shadow-inner">
      {/* Left & Center: Replay Controls */}
      <div className="flex items-center space-x-2.5 overflow-x-auto scrollbar-none py-1">
        {/* History Date Picker Button */}
        <button
          type="button"
          onClick={onOpenHistoryCalendar}
          className="h-[27px] px-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-slate-950 rounded-lg font-bold flex items-center space-x-1.5 transition-all shadow-sm text-[11.5px]"
        >
          <Calendar size={13} />
          <span>{isHistoricalDate && selectedDateStr ? selectedDateStr : '日历回看'}</span>
          <ChevronDown size={12} />
        </button>

        {/* Current Replay Status Badge */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 text-slate-300 text-[11px] border border-slate-800">
          <Clock size={11} className="text-amber-400" />
          <span className="font-medium">{isHistoricalDate ? '历史盘面' : '当日盘面'}</span>
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
                className={`h-[25px] px-2 rounded-md text-[11px] font-mono transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-slate-950 shadow-md shadow-amber-500/20'
                    : available
                    ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800/80'
                    : 'bg-slate-900/30 text-slate-600 border border-slate-900 cursor-not-allowed'
                }`}
                title={available ? `回放 ${slot} 盘面 (支持键盘方向键)` : `${slot} 盘面尚未产生`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Modern FinTech Color Spectrum Legend */}
      <div className="hidden md:flex items-center space-x-1.5 flex-shrink-0 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800/80">
        <span className="text-[10px] text-emerald-400 font-medium mr-0.5">跌</span>
        <div className="flex items-center overflow-hidden rounded shadow-sm">
          <div className="h-[18px] px-1.5 bg-[#10b981] text-white flex items-center justify-center text-[10px] font-mono font-semibold">
            -4%
          </div>
          <div className="h-[18px] px-1.5 bg-[#059669] text-white flex items-center justify-center text-[10px] font-mono font-semibold">
            -3%
          </div>
          <div className="h-[18px] px-1.5 bg-[#047857] text-white flex items-center justify-center text-[10px] font-mono font-semibold">
            -2%
          </div>
          <div className="h-[18px] px-1.5 bg-[#064e3b] text-white flex items-center justify-center text-[10px] font-mono font-semibold">
            -1%
          </div>
          <div className="h-[18px] px-1.5 bg-[#1e293b] text-slate-300 flex items-center justify-center text-[10px] font-mono font-semibold">
            0%
          </div>
          <div className="h-[18px] px-1.5 bg-[#881337] text-white flex items-center justify-center text-[10px] font-mono font-semibold">
            +1%
          </div>
          <div className="h-[18px] px-1.5 bg-[#b91c1c] text-white flex items-center justify-center text-[10px] font-mono font-semibold">
            +2%
          </div>
          <div className="h-[18px] px-1.5 bg-[#dc2626] text-white flex items-center justify-center text-[10px] font-mono font-semibold">
            +3%
          </div>
          <div className="h-[18px] px-1.5 bg-[#e11d48] text-white flex items-center justify-center text-[10px] font-mono font-semibold">
            +4%
          </div>
        </div>
        <span className="text-[10px] text-rose-400 font-medium ml-0.5">涨</span>
      </div>
    </footer>
  );
};

