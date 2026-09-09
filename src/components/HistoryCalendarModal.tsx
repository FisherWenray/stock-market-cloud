import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export interface HistoryCalendarModalProps {
  isOpen: boolean;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onClose: () => void;
}

interface DayItem {
  day: number;
  dateStr: string;
  isCurrentMonth: boolean;
  hasSnapshot: boolean;
  changePercent?: number;
}

export const HistoryCalendarModal: React.FC<HistoryCalendarModalProps> = ({
  isOpen,
  selectedDate,
  onSelectDate,
  onClose,
}) => {
  const [currentYear, setCurrentYear] = useState(() => {
    return selectedDate ? Number(selectedDate.split('-')[0]) : new Date().getFullYear();
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    return selectedDate ? Number(selectedDate.split('-')[1]) : new Date().getMonth() + 1;
  });

  if (!isOpen) return null;

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  // Build calendar matrix
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayWeekIndex = (new Date(currentYear, currentMonth - 1, 1).getDay() + 6) % 7; // Monday = 0

  const days: DayItem[] = [];

  // Padding days before
  for (let i = 0; i < firstDayWeekIndex; i++) {
    days.push({ day: 0, dateStr: '', isCurrentMonth: false, hasSnapshot: false });
  }

  // Days in this month
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(currentYear, currentMonth - 1, d);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isFuture = dateObj > today;
    const dateStr = `${currentYear}-${pad(currentMonth)}-${pad(d)}`;

    // Generate mock change % for past weekdays
    let hasSnapshot = !isWeekend && !isFuture;
    let changePercent: number | undefined = undefined;

    if (hasSnapshot) {
      // Deterministic change % based on date string
      const hash = d * 13 + currentMonth * 37 + currentYear * 101;
      changePercent = Number((((hash % 40) - 18) * 0.1).toFixed(2)); // range -1.8% to +2.1%
    }

    days.push({
      day: d,
      dateStr,
      isCurrentMonth: true,
      hasSnapshot,
      changePercent,
    });
  }

  const weekLabels = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      <div className="bg-[#0c101c] border border-slate-700/80 rounded-2xl max-w-sm w-full p-5 shadow-2xl shadow-black/80 text-white ring-1 ring-white/10">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <CalendarIcon size={18} className="text-amber-400" />
            <span className="text-base font-bold text-slate-100">历史盘面回看</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-[12px] text-slate-400 mt-2">
          点击交易日，立即查看当天 15:00 收盘全景云图快照
        </p>

        {/* Month Selector Bar */}
        <div className="flex items-center justify-between my-3 px-1">
          <span className="text-sm font-bold text-slate-200">
            {currentYear}年 {currentMonth}月
          </span>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Weekday Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 font-medium mb-1">
          {weekLabels.map(w => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((item, index) => {
            if (!item.isCurrentMonth) {
              return <div key={`empty-${index}`} className="h-10" />;
            }

            const isSelected = item.dateStr === selectedDate;
            const isUp = (item.changePercent ?? 0) > 0;
            const isDown = (item.changePercent ?? 0) < 0;
            const changeColor = isUp ? 'text-rose-400' : isDown ? 'text-emerald-400' : 'text-slate-400';
            const sign = isUp ? '+' : '';

            return (
              <button
                key={item.dateStr}
                type="button"
                disabled={!item.hasSnapshot}
                onClick={() => {
                  if (item.hasSnapshot) {
                    onSelectDate(item.dateStr);
                    onClose();
                  }
                }}
                className={`h-11 rounded-lg flex flex-col items-center justify-center text-xs transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : item.hasSnapshot
                    ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800/80 hover:border-slate-700'
                    : 'bg-transparent text-slate-600 cursor-not-allowed'
                }`}
              >
                <span className={isSelected ? 'text-slate-950 font-bold' : ''}>{item.day}</span>
                {item.changePercent !== undefined && (
                  <span className={`text-[10px] font-mono leading-none mt-0.5 ${isSelected ? 'text-slate-950 font-bold' : changeColor}`}>
                    {sign}{item.changePercent.toFixed(1)}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>灰色暂无快照</span>
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>涨</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>跌</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
