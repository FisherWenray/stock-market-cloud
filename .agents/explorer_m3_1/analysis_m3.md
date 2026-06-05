# Milestone 3 - Treemap Component Rendering: Exploration & Design Report

This report presents the codebase exploration and design strategy for the SVG-based squarified treemap component, satisfying the requirements for Milestone 3 of the Stock Market Cloud application.

---

## 1. Context & Architecture

The application is built using React, TypeScript, Tailwind CSS, and Vite. The `d3-hierarchy` package is installed and provides the core layout engines.
The treemap will be introduced as a reusable React component `Treemap.tsx` located in `src/components/`. It will receive processed stock data, color theme configuration, search query parameters, and hover state handlers from its parent container (likely `App.tsx` or a market controller component).

### Component Props API Design

```typescript
import React from 'react';
import { Stock, ColorTheme } from '../types';

export interface TreemapProps {
  stocks: Stock[];
  theme: ColorTheme;
  searchQuery: string;
  hoveredStock: Stock | null;
  onHoverStock: (stock: Stock | null, event: React.MouseEvent<SVGElement> | null) => void;
}
```

---

## 2. D3 Hierarchy & Squarified Layout Strategy

To build the treemap, we construct a 3-level hierarchy:
- **Level 0 (Root)**: Representing the entire market.
- **Level 1 (Sectors)**: Node children of the root representing sector groupings.
- **Level 2 (Stocks)**: Leaf nodes representing individual stocks grouped under their respective sectors.

### Hierarchy Creation & Computation Flow

1. **Group by Sector**:
   We group the input stocks by their `sector` field. Empty sectors are automatically excluded because we construct the grouping dynamically from the active stock array:
   ```typescript
   const stocksBySector = new Map<string, Stock[]>();
   stocks.forEach(stock => {
     if (!stock.sector) return;
     if (!stocksBySector.has(stock.sector)) {
       stocksBySector.set(stock.sector, []);
     }
     stocksBySector.get(stock.sector)!.push(stock);
   });
   ```

2. **Construct Hierarchy Data Structure**:
   ```typescript
   interface HierarchyDatum {
     name: string;
     marketCap?: number;
     sector?: string;
     symbol?: string;
     price?: number;
     change?: number;
     children?: HierarchyDatum[];
   }

   const hierarchyData: HierarchyDatum = {
     name: 'market_root',
     children: Array.from(stocksBySector.entries()).map(([sector, sectorStocks]) => ({
       name: sector,
       children: sectorStocks.map(s => ({
         name: s.name,
         symbol: s.symbol,
         price: s.price,
         change: s.change,
         marketCap: s.marketCap,
         sector: s.sector,
       })),
     })),
   };
   ```

3. **Apply D3 Treemap Layout**:
   We invoke `d3-hierarchy` functions to build the tree, accumulate values based on market capitalization, sort them, and compute coordinates inside a bounding box of size `[width, height]`:
   ```typescript
   import { hierarchy, treemap, treemapSquarify } from 'd3-hierarchy';

   const root = hierarchy<HierarchyDatum>(hierarchyData)
     .sum(d => d.marketCap || 0)
     .sort((a, b) => (b.value || 0) - (a.value || 0)); // Sort descending for standard layout placement

   const treemapLayout = treemap<HierarchyDatum>()
     .size([width, height])
     .tile(treemapSquarify) // Apply squarified layout method
     .paddingOuter(4)       // Margins between sectors
     .paddingTop(24)        // Top padding in each sector to reserve space for the header title
     .paddingInner(2);      // Spacing between individual stock tiles within a sector

   treemapLayout(root);
   ```

This generates `x0`, `y0`, `x1`, `y1` absolute coordinates for all nodes. Thanks to `.paddingTop(24)` on the sectors, the leaf nodes will be automatically positioned below the top margin of their sector container, allowing us to safely render the sector title text.

---

## 3. Responsive Design Strategy

To satisfy responsive layout changes (such as window resizing or mobile vs. boardroom viewport dimensions), the treemap needs to adapt dynamically rather than scaling static SVGs, which would warp text and aspect ratios.

We design a wrapper container utilizing a `ResizeObserver` to track actual element dimensions:

```typescript
import { useState, useRef, useEffect } from 'react';

export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 800, height: 500 }); // Default fallback size

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries) || !entries.length) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setSize({ width, height });
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  return { ref, ...size };
}
```

By wrapping the SVG inside a container `div` with `ref` set to `ref` from `useElementSize`, we get live, layout-recalculating dimensions `width` and `height`, which are fed directly into the `d3.treemap().size([width, height])` call.

---

## 4. Theme Integration & Color Encoding

The component must handle the color coding representing price changes. There are two major themes:
1. **International**: Green is Up (Positive), Red is Down (Negative).
2. **Chinese**: Red is Up (Positive), Green is Down (Negative).
Both themes share a neutral color for zero change.

### Value and Trend Classification

We classify stock changes into:
- **Up (`change > 0`)**: Map to positive change colors.
- **Down (`change < 0`)**: Map to negative change colors.
- **Neutral (`change === 0`)**: Map to neutral color (Slate-800 or similar gray).

We also scale visual intensity based on the magnitude of the change to improve user intuition:
- **Tier 3 (Extreme)**: `|change| >= 3.0%`
- **Tier 2 (Moderate)**: `1.0% <= |change| < 3.0%`
- **Tier 1 (Mild)**: `0.0% < |change| < 1.0%`

### Color-Class Selection Mapping

```typescript
function getTileColors(change: number, theme: ColorTheme): { bgColorClass: string; trend: 'up' | 'down' | 'neutral' } {
  if (change === 0) {
    return { bgColorClass: 'bg-slate-800 text-slate-300 border-slate-700', trend: 'neutral' };
  }

  const absChange = Math.abs(change);
  const isUp = change > 0;

  // Determine standard color names based on theme
  // International: Up = Green (emerald), Down = Red (rose)
  // Chinese: Up = Red (rose), Down = Green (emerald)
  const upColor = theme === 'international' ? 'emerald' : 'rose';
  const downColor = theme === 'international' ? 'rose' : 'emerald';
  const colorName = isUp ? upColor : downColor;

  let bgClass = '';
  if (absChange >= 3.0) {
    bgClass = colorName === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500';
  } else if (absChange >= 1.0) {
    bgClass = colorName === 'emerald' ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-rose-700 hover:bg-rose-600';
  } else {
    bgClass = colorName === 'emerald' ? 'bg-emerald-900/60 hover:bg-emerald-900/85' : 'bg-rose-950/60 hover:bg-rose-950/85';
  }

  return {
    bgColorClass: `${bgClass} text-white border-black/10`,
    trend: isUp ? 'up' : 'down'
  };
}
```

---

## 5. Interaction Support: Search and Tooltips

### 5.1 Search Querying
The search query highlights matches case-insensitively across both the stock symbol and the company name.
- If `searchQuery` is empty, all tiles have `data-highlighted="true"`.
- If `searchQuery` is set, a stock is matched if:
  `symbol.toLowerCase().includes(query)` OR `name.toLowerCase().includes(query)`
  If matched: `data-highlighted="true"`.
  If not matched: `data-highlighted="false"`.

**Visual Treatment**:
Non-highlighted tiles are visually dimmed via CSS styling while still allowing hover interactions.
```css
[data-highlighted="false"] {
  opacity: 0.25;
  filter: saturate(50%) blur(0.2px);
  transition: opacity 0.3s ease, filter 0.3s ease;
}
```
*Design Note*: Do NOT set `pointer-events: none` on dimmed tiles. The E2E tests specifically require that non-highlighted tiles still trigger tooltips when hovered.

### 5.2 Tooltip Mechanics
The parent element will manage the single floating tooltip element `[data-testid="stock-tooltip"]`. The treemap provides hover callbacks with mouse event data so the parent can position it.

```typescript
const handleMouseEnter = (stock: Stock, event: React.MouseEvent<SVGElement>) => {
  onHoverStock(stock, event);
};

const handleMouseLeave = () => {
  onHoverStock(null, null);
};
```

**Positioning Strategy**:
To avoid layout overflow at the edges of the viewport (tested in `T2.16`), we position the tooltip dynamically based on the cursor position + offset, capped at the bounds of the window:
```typescript
const tooltipX = Math.min(clientX + 15, window.innerWidth - tooltipWidth - 15);
const tooltipY = Math.min(clientY + 15, window.innerHeight - tooltipHeight - 15);
```

---

## 6. JSX Component Layout Specification

The component structure maps directly to Playwright selectors:

```tsx
import React from 'react';
import * as d3 from 'd3-hierarchy';
import { useElementSize } from '../hooks/useElementSize'; // Custom size observer hook
import { Stock, ColorTheme } from '../types';
import { getTileColors } from '../utils/colors';

export const Treemap: React.FC<TreemapProps> = ({
  stocks,
  theme,
  searchQuery,
  hoveredStock,
  onHoverStock,
}) => {
  const { ref, width, height } = useElementSize<HTMLDivElement>();

  // 1. Group stocks by sector
  const stocksBySector = React.useMemo(() => {
    const groups = new Map<string, Stock[]>();
    stocks.forEach(s => {
      if (!s.sector) return;
      if (!groups.has(s.sector)) groups.set(s.sector, []);
      groups.get(s.sector)!.push(s);
    });
    return groups;
  }, [stocks]);

  // 2. Compute Hierarchy
  const root = React.useMemo(() => {
    if (stocksBySector.size === 0) return null;

    const data = {
      name: 'root',
      children: Array.from(stocksBySector.entries()).map(([sector, sectorStocks]) => ({
        name: sector,
        children: sectorStocks,
      })),
    };

    const hierarchyRoot = d3.hierarchy(data)
      .sum((d: any) => d.marketCap || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const layout = d3.treemap()
      .size([width, height])
      .tile(d3.treemapSquarify)
      .paddingOuter(4)
      .paddingTop(24) // Top padding for Sector Header
      .paddingInner(2);

    layout(hierarchyRoot);
    return hierarchyRoot;
  }, [stocksBySector, width, height]);

  if (!root || stocks.length === 0) {
    return (
      <div ref={ref} className="w-full h-full flex items-center justify-center text-slate-500">
        No stock data available.
      </div>
    );
  }

  const query = searchQuery.trim().toLowerCase();

  return (
    <div ref={ref} className="w-full h-full min-h-[400px] bg-slate-950 rounded-lg p-2 overflow-hidden shadow-inner">
      <svg 
        data-testid="treemap-container" 
        width={width} 
        height={height} 
        className="w-full h-full select-none"
      >
        {root.children?.map(sectorNode => {
          const sectorName = sectorNode.data.name;
          const sectorNameLower = sectorName.toLowerCase();
          const sectorWidth = sectorNode.x1 - sectorNode.x0;
          const sectorHeight = sectorNode.y1 - sectorNode.y0;

          if (sectorWidth <= 0 || sectorHeight <= 0) return null;

          return (
            <g 
              key={sectorName}
              data-testid={`treemap-sector-${sectorNameLower}`}
            >
              {/* Sector Header Box & Title */}
              <rect
                x={sectorNode.x0}
                y={sectorNode.y0}
                width={sectorWidth}
                height={sectorHeight}
                fill="none"
                stroke="#334155" // slate-700 boundary line
                strokeWidth={1}
                className="pointer-events-none"
              />
              <text
                data-testid={`treemap-sector-title-${sectorNameLower}`}
                x={sectorNode.x0 + 6}
                y={sectorNode.y0 + 16}
                className="text-[11px] font-bold fill-slate-400 uppercase tracking-wide cursor-default"
              >
                {sectorName}
              </text>

              {/* Stock Tiles in Sector */}
              {sectorNode.leaves().map(leafNode => {
                const stock = leafNode.data as Stock;
                const tileW = leafNode.x1 - leafNode.x0;
                const tileH = leafNode.y1 - leafNode.y0;

                if (tileW <= 0 || tileH <= 0) return null;

                const isHighlighted = query === '' 
                  ? true 
                  : stock.symbol.toLowerCase().includes(query) || stock.name.toLowerCase().includes(query);

                const { bgColorClass, trend } = getTileColors(stock.change, theme);

                return (
                  <g
                    key={stock.symbol}
                    data-testid={`stock-tile-${stock.symbol}`}
                    data-highlighted={isHighlighted ? "true" : "false"}
                    data-trend-color={trend}
                    transform={`translate(${leafNode.x0}, ${leafNode.y0})`}
                    onMouseEnter={(e) => onHoverStock(stock, e)}
                    onMouseMove={(e) => onHoverStock(stock, e)}
                    onMouseLeave={handleMouseLeave}
                    className="cursor-pointer transition-all duration-300 hover:z-10"
                  >
                    <rect
                      width={tileW}
                      height={tileH}
                      className={`transition-colors duration-200 border stroke-slate-900/10 ${bgColorClass}`}
                      rx={1.5}
                    />
                    
                    {/* Symbol Text */}
                    {tileW > 30 && tileH > 20 && (
                      <text
                        data-testid={`stock-symbol-${stock.symbol}`}
                        x={tileW / 2}
                        y={tileH / 2 + (tileH > 35 ? -3 : 4)}
                        textAnchor="middle"
                        className="text-[10px] sm:text-xs font-bold fill-white pointer-events-none select-none"
                      >
                        {stock.symbol}
                      </text>
                    )}

                    {/* Change Percentage Text */}
                    {tileW > 45 && tileH > 35 && (
                      <text
                        data-testid={`stock-change-${stock.symbol}`}
                        x={tileW / 2}
                        y={tileH / 2 + 10}
                        textAnchor="middle"
                        className="text-[9px] sm:text-[10px] fill-white/80 pointer-events-none select-none font-medium"
                      >
                        {stock.change > 0 ? `+${stock.change}%` : `${stock.change}%`}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
```

---

## 7. Boundary and Edge Cases Analysis

Our design accounts for the following corner-case behaviors required by Tier 2 and 3 E2E test scripts:

1. **Flat/0% change stocks (T2.1, T2.26)**:
   Classified as `'neutral'`, mapping to `data-trend-color="neutral"` and neutral styling (`bg-slate-800`), unaffected by theme toggling.
2. **Tiny Stocks & Clipping (T2.2, T2.5)**:
   Stocks with extreme market cap differences will result in small dimensions. We conditionally render labels to avoid overlaps, but keep `<g>` and `<rect>` elements in DOM so they remain hover-responsive.
3. **Empty Sectors (T2.4)**:
   Since sector groupings are computed dynamically based on the active market's stock list, sectors with 0 active stocks are excluded from the render array, avoiding empty visual containers.
4. **Market/Query Cross Interactions (T2.7, T2.8)**:
   - Tooltip hover coordinates are cleaned up on unmount or market change.
   - The search input persists in the parent context when toggling markets, so the matching logic is instantly applied to the incoming list of stocks.
