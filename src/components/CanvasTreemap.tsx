import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { hierarchy, treemap as d3Treemap, treemapSquarify } from 'd3-hierarchy';
import { Stock, MarketScope } from '../types';
import { enrichStocksWithTaxonomy } from '../services/taxonomy';

export interface CanvasTreemapRef {
  captureScreenshot: () => string | null;
  resetZoom: () => void;
}

export interface CanvasTreemapProps {
  stocks: Stock[];
  scope: MarketScope;
  searchQuery?: string;
  onStockHover?: (stock: Stock | null, x: number, y: number, sectorInfo?: { sector: string; subsector: string }) => void;
  onStockClick?: (stock: Stock, sectorInfo: { sector: string; subsector: string }) => void;
  onStockDoubleClick?: (stock: Stock) => void;
  onSubsectorClick?: (sector: string, subsector: string, stock?: Stock) => void;
}

interface StockNode {
  name: string;
  stock?: Stock;
  sector?: string;
  subsector?: string;
  value?: number;
  children?: StockNode[];
}

export interface LayoutStockRect {
  x: number;
  y: number;
  w: number;
  h: number;
  stock: Stock;
  sector: string;
  subsector: string;
}

export interface LayoutSubsectorRect {
  x: number;
  y: number;
  w: number;
  h: number;
  sector: string;
  subsector: string;
}

export interface LayoutSectorRect {
  x: number;
  y: number;
  w: number;
  h: number;
  sector: string;
}

// 9-step Chinese standard color palette (Red up, Green down, Slate flat)
export function getStockFillColor(change: number): string {
  if (change >= 4.0) return '#e63538';   // +4%
  if (change >= 3.0) return '#ce3d41';   // +3%
  if (change >= 2.0) return '#a5424a';   // +2%
  if (change >= 0.5) return '#784551';   // +1%
  if (change > -0.5) return '#3a3e4c';   // 0%
  if (change > -2.0) return '#36684e';   // -1%
  if (change > -3.0) return '#31894e';   // -2%
  if (change > -4.0) return '#2faa51';   // -3%
  return '#30cc5a';                      // -4%
}

export const CanvasTreemap = forwardRef<CanvasTreemapRef, CanvasTreemapProps>(({
  stocks,
  scope: _scope,
  searchQuery = '',
  onStockHover,
  onStockClick,
  onStockDoubleClick,
  onSubsectorClick,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [hoveredStockItem, setHoveredStockItem] = useState<LayoutStockRect | null>(null);

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialTx: 0, initialTy: 0 });
  const didDragRef = useRef(false);

  // Stored layout rects for fast hit-testing
  const layoutRectsRef = useRef<{
    sectors: LayoutSectorRect[];
    subsectors: LayoutSubsectorRect[];
    stocks: LayoutStockRect[];
  }>({ sectors: [], subsectors: [], stocks: [] });

  // Handle container resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
      }
    };

    updateSize();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateSize);
      observer.observe(el);
      return () => observer.disconnect();
    }
  }, []);

  // Compute 2-tier Treemap layout
  const computeLayout = useCallback((width: number, height: number, stockList: Stock[]) => {
    if (width <= 0 || height <= 0 || stockList.length === 0) {
      return { sectors: [], subsectors: [], stocks: [] };
    }

    const enriched = enrichStocksWithTaxonomy(stockList);

    // Filter by search query if any
    const filtered = searchQuery.trim()
      ? enriched.filter(
          s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : enriched;

    if (filtered.length === 0) {
      return { sectors: [], subsectors: [], stocks: [] };
    }

    // Group stocks: Sector -> Subsector -> Stocks
    const sectorMap = new Map<string, Map<string, Stock[]>>();
    for (const stock of filtered) {
      const sec = stock.sector || '其他';
      const sub = stock.subsector || sec;
      if (!sectorMap.has(sec)) {
        sectorMap.set(sec, new Map());
      }
      const subMap = sectorMap.get(sec)!;
      if (!subMap.has(sub)) {
        subMap.set(sub, []);
      }
      subMap.get(sub)!.push(stock);
    }

    // Build hierarchy data tree
    const rootData: StockNode = {
      name: 'root',
      children: Array.from(sectorMap.entries()).map(([secName, subMap]) => ({
        name: secName,
        sector: secName,
        children: Array.from(subMap.entries()).map(([subName, sList]) => ({
          name: subName,
          sector: secName,
          subsector: subName,
          children: sList.map(stock => ({
            name: stock.name,
            stock,
            sector: secName,
            subsector: subName,
            value: Math.max(1e8, stock.marketCap || 1e9),
          })),
        })),
      })),
    };

    const rootHierarchy = hierarchy<StockNode>(rootData)
      .sum(d => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = d3Treemap<StockNode>()
      .size([width, height])
      .paddingOuter(3)
      .paddingTop(d => (d.depth === 1 ? 22 : d.depth === 2 ? 18 : 1))
      .paddingInner(1.5)
      .tile(treemapSquarify.ratio(1.3));

    treemapLayout(rootHierarchy);

    const sectors: LayoutSectorRect[] = [];
    const subsectors: LayoutSubsectorRect[] = [];
    const layoutStocks: LayoutStockRect[] = [];

    rootHierarchy.each(node => {
      const x = (node as any).x0;
      const y = (node as any).y0;
      const w = Math.max(0, (node as any).x1 - x);
      const h = Math.max(0, (node as any).y1 - y);

      if (node.depth === 1) {
        sectors.push({ x, y, w, h, sector: node.data.name });
      } else if (node.depth === 2) {
        subsectors.push({
          x,
          y,
          w,
          h,
          sector: node.data.sector || '',
          subsector: node.data.name,
        });
      } else if (node.depth === 3 && node.data.stock) {
        layoutStocks.push({
          x,
          y,
          w,
          h,
          stock: node.data.stock,
          sector: node.data.sector || '',
          subsector: node.data.subsector || '',
        });
      }
    });

    return { sectors, subsectors, stocks: layoutStocks };
  }, [searchQuery]);

  // Update layout ref
  useEffect(() => {
    const layout = computeLayout(dimensions.width, dimensions.height, stocks);
    layoutRectsRef.current = layout;
    renderCanvas();
  }, [dimensions, stocks, computeLayout]);

  // Main Canvas Rendering Function
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;
    if (width <= 0 || height <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = '#1e212b';
    ctx.fillRect(0, 0, width, height);

    // Apply Pan & Zoom Transform
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);

    const { sectors, subsectors, stocks: stockRects } = layoutRectsRef.current;

    // 1. Draw Sector Containers & Headers
    for (const sec of sectors) {
      ctx.fillStyle = '#262935';
      ctx.fillRect(sec.x, sec.y, sec.w, sec.h);
      ctx.strokeStyle = '#43495b';
      ctx.lineWidth = 1.2 / transform.scale;
      ctx.strokeRect(sec.x, sec.y, sec.w, sec.h);

      // Sector Header Text
      if (sec.w > 28 && sec.h > 20) {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(sec.sector, sec.x + 5, sec.y + 11);
      }
    }

    // 2. Draw Subsector Containers & Headers
    for (const sub of subsectors) {
      ctx.fillStyle = '#292d3a';
      ctx.fillRect(sub.x, sub.y, sub.w, sub.h);
      ctx.strokeStyle = '#383e4e';
      ctx.lineWidth = 0.8 / transform.scale;
      ctx.strokeRect(sub.x, sub.y, sub.w, sub.h);

      // Subsector Header Text
      if (sub.w > 30 && sub.h > 18) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const label = sub.subsector.length > 6 && sub.w < 50 ? sub.subsector.slice(0, 4) + '..' : sub.subsector;
        ctx.fillText(label, sub.x + 4, sub.y + 9);
      }
    }

    // 3. Draw Stock Tiles
    for (const s of stockRects) {
      if (s.w <= 0 || s.h <= 0) continue;

      // Tile fill
      ctx.fillStyle = getStockFillColor(s.stock.change);
      ctx.fillRect(s.x, s.y, s.w, s.h);

      // Border between stock tiles
      ctx.strokeStyle = '#222530';
      ctx.lineWidth = 0.6 / transform.scale;
      ctx.strokeRect(s.x, s.y, s.w, s.h);

      // Stock Label
      const tileArea = s.w * s.h;
      if (tileArea > 350 && s.w >= 28 && s.h >= 22) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(s.x, s.y, s.w, s.h);
        ctx.clip();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';

        const cx = s.x + s.w / 2;
        const cy = s.y + s.h / 2;

        if (s.w >= 44 && s.h >= 36) {
          // Name + Change %
          const nameFontSize = Math.min(15, Math.max(11, Math.floor(s.w / 4.8)));
          ctx.font = `600 ${nameFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
          ctx.textBaseline = 'bottom';
          ctx.fillText(s.stock.name, cx, cy - 1);

          const changeFontSize = Math.max(10, Math.min(13, nameFontSize - 1));
          ctx.font = `normal ${changeFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
          ctx.textBaseline = 'top';
          const sign = s.stock.change > 0 ? '+' : '';
          ctx.fillText(`${sign}${s.stock.change.toFixed(2)}%`, cx, cy + 1);
        } else {
          // Just stock name (compact)
          const nameFontSize = Math.min(12, Math.max(9, Math.floor(s.w / 4.2)));
          ctx.font = `500 ${nameFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
          ctx.textBaseline = 'middle';
          ctx.fillText(s.stock.name, cx, cy);
        }

        ctx.restore();
      }
    }

    // 4. Highlight Hovered Tile
    if (hoveredStockItem) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.0 / transform.scale;
      ctx.strokeRect(
        hoveredStockItem.x,
        hoveredStockItem.y,
        hoveredStockItem.w,
        hoveredStockItem.h
      );
    }

    ctx.restore();
  }, [dimensions, transform, hoveredStockItem]);

  // Re-render when transform or hovered item changes
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Wheel zoom centered on cursor
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setTransform(prev => {
      const newScale = Math.min(8.0, Math.max(1.0, prev.scale * zoomFactor));
      if (newScale === prev.scale) return prev;

      // Adjust transform.x and transform.y so the point under cursor remains fixed
      const ratio = newScale / prev.scale;
      const newX = mouseX - (mouseX - prev.x) * ratio;
      const newY = mouseY - (mouseY - prev.y) * ratio;

      return {
        scale: newScale,
        x: newScale === 1.0 ? 0 : newX,
        y: newScale === 1.0 ? 0 : newY,
      };
    });
  };

  // Drag pan
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    didDragRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialTx: transform.x,
      initialTy: transform.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    if (isDraggingRef.current) {
      const dx = clientX - dragStartRef.current.x;
      const dy = clientY - dragStartRef.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        didDragRef.current = true;
      }
      setTransform(prev => ({
        ...prev,
        x: dragStartRef.current.initialTx + dx,
        y: dragStartRef.current.initialTy + dy,
      }));
      return;
    }

    // Hit-testing hovered stock
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const canvasX = (mouseX - transform.x) / transform.scale;
    const canvasY = (mouseY - transform.y) / transform.scale;

    const { stocks: stockList } = layoutRectsRef.current;
    let found: LayoutStockRect | null = null;

    for (let i = stockList.length - 1; i >= 0; i--) {
      const item = stockList[i];
      if (
        canvasX >= item.x &&
        canvasX <= item.x + item.w &&
        canvasY >= item.y &&
        canvasY <= item.y + item.h
      ) {
        found = item;
        break;
      }
    }

    setHoveredStockItem(found);

    if (found) {
      onStockHover?.(found.stock, clientX, clientY, {
        sector: found.sector,
        subsector: found.subsector,
      });
    } else {
      onStockHover?.(null, clientX, clientY);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // If it was a click (not a drag)
    if (!didDragRef.current) {
      handleClick(e);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const canvasX = (e.clientX - rect.left - transform.x) / transform.scale;
    const canvasY = (e.clientY - rect.top - transform.y) / transform.scale;

    const { stocks: stockList, subsectors } = layoutRectsRef.current;

    // 1. Check if clicked on a stock
    for (let i = stockList.length - 1; i >= 0; i--) {
      const item = stockList[i];
      if (
        canvasX >= item.x &&
        canvasX <= item.x + item.w &&
        canvasY >= item.y &&
        canvasY <= item.y + item.h
      ) {
        onStockClick?.(item.stock, { sector: item.sector, subsector: item.subsector });
        onSubsectorClick?.(item.sector, item.subsector, item.stock);
        return;
      }
    }

    // 2. Check if clicked on a subsector header/area
    for (const sub of subsectors) {
      if (
        canvasX >= sub.x &&
        canvasX <= sub.x + sub.w &&
        canvasY >= sub.y &&
        canvasY <= sub.y + sub.h
      ) {
        onSubsectorClick?.(sub.sector, sub.subsector);
        return;
      }
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const canvasX = (e.clientX - rect.left - transform.x) / transform.scale;
    const canvasY = (e.clientY - rect.top - transform.y) / transform.scale;

    const { stocks: stockList } = layoutRectsRef.current;

    for (let i = stockList.length - 1; i >= 0; i--) {
      const item = stockList[i];
      if (
        canvasX >= item.x &&
        canvasX <= item.x + item.w &&
        canvasY >= item.y &&
        canvasY <= item.y + item.h
      ) {
        onStockDoubleClick?.(item.stock);
        return;
      }
    }

    // Double click on empty space resets zoom
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    setHoveredStockItem(null);
    onStockHover?.(null, 0, 0);
  };

  // Expose Imperative Methods (Screenshot & Reset)
  useImperativeHandle(ref, () => ({
    captureScreenshot: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      // Render a high-resolution snapshot on an offscreen canvas
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return null;

      // Draw current canvas content
      ctx.drawImage(canvas, 0, 0);

      // Draw watermark & branding overlay on top-left
      const dpr = window.devicePixelRatio || 1;
      ctx.fillStyle = 'rgba(15, 18, 24, 0.85)';
      ctx.fillRect(16 * dpr, 16 * dpr, 280 * dpr, 44 * dpr);
      ctx.strokeStyle = '#3b4252';
      ctx.lineWidth = 1 * dpr;
      ctx.strokeRect(16 * dpr, 16 * dpr, 280 * dpr, 44 * dpr);

      const now = new Date();
      const dateStr = now.toISOString().replace('T', ' ').slice(0, 19);

      ctx.fillStyle = '#f59e0b';
      ctx.font = `bold ${14 * dpr}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('大盘云图 · A股热力图', 28 * dpr, 23 * dpr);

      ctx.fillStyle = '#94a3b8';
      ctx.font = `${11 * dpr}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText(`${dateStr}  本地看盘终端`, 28 * dpr, 43 * dpr);

      return exportCanvas.toDataURL('image/png');
    },
    resetZoom: () => {
      setTransform({ x: 0, y: 0, scale: 1 });
    },
  }));

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-0 select-none overflow-hidden bg-[#1e212b]"
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
      />
    </div>
  );
});

CanvasTreemap.displayName = 'CanvasTreemap';
