import React, { useState } from 'react';
import { Download, Copy, Check, X } from 'lucide-react';

export interface ScreenshotModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ScreenshotModal: React.FC<ScreenshotModalProps> = ({ imageUrl, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!imageUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(
      now.getHours()
    )}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    a.download = `大盘云图_${timeStr}.png`;
    a.href = imageUrl;
    a.click();
  };

  const handleCopy = async () => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Clipboard copy failed, downloading instead:', e);
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      <div className="bg-[#0c101c] border border-slate-700/80 rounded-2xl max-w-4xl w-full flex flex-col max-h-[90vh] shadow-2xl shadow-black/80 overflow-hidden ring-1 ring-white/10">
        {/* Header */}
        <div className="h-12 px-5 border-b border-slate-800/80 flex items-center justify-between bg-[#101626] flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-100">大盘云图 · 盘面快照导出</span>
            <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 font-mono">
              超清渲染
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Image Preview Container */}
        <div className="flex-1 overflow-auto p-5 flex items-center justify-center bg-[#07090f]">
          <img
            src={imageUrl}
            alt="大盘云图高清快照"
            className="max-w-full max-h-[65vh] object-contain rounded-xl border border-slate-800 shadow-2xl"
          />
        </div>

        {/* Footer Actions */}
        <div className="h-14 px-6 border-t border-slate-800/80 bg-[#101626] flex items-center justify-end space-x-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            className="h-9 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-slate-950 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-amber-950/40"
          >
            <Download size={14} />
            <span>下载保存</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="h-9 px-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 active:scale-[0.98] text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-sky-950/40"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? '已复制图片！' : '复制图片'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-slate-700/60"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
