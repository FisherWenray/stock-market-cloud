import React from 'react';

interface StatusIndicatorProps {
  isMock: boolean;
  isLoading: boolean;
  error?: string | null;
  lastUpdated?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isMock,
  isLoading,
  error,
  lastUpdated
}) => {
  let statusText = '';
  let sourceText = '';
  let sourceVal: 'live' | 'mock' = 'live';

  if (isLoading) {
    statusText = 'Loading market data...';
    sourceText = 'Connecting...';
    sourceVal = 'live';
  } else if (isMock) {
    statusText = 'Fallback: Using mock market data';
    sourceText = 'Mock';
    sourceVal = 'mock';
  } else {
    statusText = 'Data loaded successfully';
    sourceText = 'Live';
    sourceVal = 'live';
  }

  return (
    <div className="flex items-center gap-4 text-xs font-semibold px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
      <div className="flex items-center gap-2">
        <span className="text-slate-400">Status:</span>
        <span
          data-testid="data-status-indicator"
          className={
            isLoading
              ? 'text-yellow-400'
              : isMock
              ? 'text-orange-400'
              : 'text-emerald-400'
          }
        >
          {statusText}
        </span>
      </div>
      <div className="h-4 w-px bg-slate-700" />
      <div className="flex items-center gap-2">
        <span className="text-slate-400">Source:</span>
        <span
          data-testid="data-source-indicator"
          data-source={sourceVal}
          className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
            sourceVal === 'live'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
          }`}
        >
          {sourceText}
        </span>
      </div>
      {lastUpdated && (
        <>
          <div className="h-4 w-px bg-slate-700" />
          <span className="text-slate-500 font-mono text-[10px]">
            Updated: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        </>
      )}
    </div>
  );
};
