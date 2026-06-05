import React from 'react';
import { Language } from '../types';
import { translations } from '../locales';

interface DataStatusIndicatorProps {
  isMock: boolean;
  lastUpdated: string;
  loading: boolean;
  error: string | null;
  onRefresh?: () => void;
  lang: Language;
}

export const DataStatusIndicator: React.FC<DataStatusIndicatorProps> = ({
  isMock,
  lastUpdated,
  loading,
  error,
  onRefresh,
  lang,
}) => {
  const t = translations[lang];
  const formattedTime = lastUpdated 
    ? new Date(lastUpdated).toLocaleTimeString() 
    : t.never;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 shadow-md">
      <div className="flex items-center gap-3">
        <div 
          data-testid="data-source-indicator"
          data-source={isMock ? 'mock' : 'live'}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
            isMock 
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
          }`}
        >
          <span className={`w-2 h-2 rounded-full animate-pulse ${isMock ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          {isMock ? t.mockMode : t.liveMode}
        </div>

        <div 
          data-testid="data-status-indicator" 
          className="text-sm font-medium text-slate-400"
        >
          {loading ? (
            <span className="text-blue-400 animate-pulse">{t.syncingQuotes}</span>
          ) : (error || isMock) ? (
            <span className="text-rose-400 flex items-center gap-1">
              {t.syncError}
            </span>
          ) : (
            <span>{t.successLastUpdated} {formattedTime}</span>
          )}
        </div>
      </div>

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 disabled:opacity-50 disabled:pointer-events-none rounded transition-all duration-200 hover:shadow"
        >
          {loading ? t.refreshing : t.refresh}
        </button>
      )}
    </div>
  );
};
