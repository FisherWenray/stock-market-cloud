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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none animate-in fade-in duration-200">
      <div className="bg-[#1e222d] border border-[#373e52] rounded-xl max-w-4xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-12 px-4 border-b border-[#2e3446] flex items-center justify-between bg-[#242836] flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-zinc-100">大盘云图 · 盘面截图</span>
            <span className="text-xs text-zinc-400">已生成高清快照</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-700/60 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Image Preview Container */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#151720]">
          <img
            src={imageUrl}
            alt="大盘云图高清快照"
            className="max-w-full max-h-[65vh] object-contain rounded border border-zinc-800 shadow-md"
          />
        </div>

        {/* Footer Actions */}
        <div className="h-14 px-6 border-t border-[#2e3446] bg-[#242836] flex items-center justify-end space-x-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            className="h-9 px-4 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Download size={14} />
            <span>下载保存</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="h-9 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? '已复制图片！' : '复制图片'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg text-xs font-medium transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
