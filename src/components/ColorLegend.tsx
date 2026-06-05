import React from 'react';
import { ColorTheme, Language } from '../types';
import { translations } from '../locales';

interface ColorLegendProps {
  theme: ColorTheme;
  lang: Language;
}

export const ColorLegend: React.FC<ColorLegendProps> = ({ theme, lang }) => {
  const isChinese = theme === 'chinese';
  const upColorClass = isChinese ? 'bg-red-600' : 'bg-emerald-600';
  const downColorClass = isChinese ? 'bg-emerald-600' : 'bg-red-600';
  const flatColorClass = 'bg-slate-700';

  const t = translations[lang];
  const upLabel = isChinese ? t.upRed : t.upGreen;
  const downLabel = isChinese ? t.downGreen : t.downRed;
  const flatLabel = t.flatGray;

  return (
    <div
      data-testid="color-legend"
      className="flex items-center gap-4 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300"
    >
      <div className="flex items-center gap-1.5">
        <span className={`w-3 h-3 rounded ${upColorClass}`} />
        <span>{upLabel}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`w-3 h-3 rounded ${downColorClass}`} />
        <span>{downLabel}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`w-3 h-3 rounded ${flatColorClass}`} />
        <span>{flatLabel}</span>
      </div>
    </div>
  );
};
