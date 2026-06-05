import React from 'react';
import { IndexData, ColorTheme, Language } from '../types';
import { translations } from '../locales';

interface Props {
  indices: IndexData[];
  theme: ColorTheme;
  lang: Language;
}

export const MarketIndices: React.FC<Props> = ({ indices, theme, lang }) => {
  const t = translations[lang];

  if (!indices || indices.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {indices.map(idx => {
        const isPositive = idx.change > 0;
        const isNegative = idx.change < 0;
        
        let colorClass = 'text-slate-400';
        let bgClass = 'bg-white/5 border-white/10';

        if (isPositive) {
          colorClass = 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]';
          bgClass = 'bg-red-500/10 border-red-500/20';
        } else if (isNegative) {
          colorClass = 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]';
          bgClass = 'bg-emerald-500/10 border-emerald-500/20';
        }

        const name = (t.indices as Record<string, string>)?.[idx.nameKey] || idx.nameKey;

        return (
          <div key={idx.symbol} className={`px-4 py-2 rounded-xl border backdrop-blur-xl shadow-lg flex flex-col min-w-[130px] ${bgClass} transition-all duration-300 transform hover:-translate-y-0.5`}>
            <span className="text-[11px] font-black text-slate-300 tracking-wider uppercase opacity-90">{name}</span>
            <div className="flex items-end justify-between mt-1 gap-3">
              <span className={`text-base font-mono font-black ${colorClass}`}>
                {idx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-[11px] font-bold mb-0.5 ${colorClass}`}>
                {isPositive ? '+' : ''}{idx.change.toFixed(2)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
