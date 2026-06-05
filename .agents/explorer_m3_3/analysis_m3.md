# Milestone 3 Exploration and Design: Treemap Component

This report presents the detailed design and implementation strategy for the SVG-based Squarified Treemap Component (`Treemap.tsx`) in the Stock Market Cloud application.

---

## 1. Executive Summary

The Treemap component is the primary data visualization interface for the Stock Market Cloud application. It displays real-time US and HK stock market equities grouped by their respective economic sectors. Each stock is represented by a rect tile, where:
- The **area** of the tile is proportional to the stock's market capitalization (`marketCap`).
- The **color** of the tile encodes the price change percentage (`change`), matching either the **Chinese** or **International** color system.
- The **layout** is computed dynamically using a squarified treemap algorithm from `d3-hierarchy` to maintain aspect ratios close to 1.
- The component is **fully responsive**, reacting to changes in window and container dimensions using a `ResizeObserver`-based custom hook.

---

## 2. Technology Stack & Dependencies

The design relies on the following packages already declared in the workspace's `package.json`:
- **React 18**: Frontend component model.
- **d3-hierarchy**: For hierarchical data grouping and layout calculations (`hierarchy`, `treemap`, `treemapSquarify`).
- **Tailwind CSS**: For styles, custom SVG fills, transitions, and text layouts.
- **TypeScript**: Typed props and nodes to guarantee compile-time safety.

---

## 3. Hierarchical Data Preparation & Layout

### 3.1 Data Hierarchy Structure
`d3.hierarchy` expects a single root node with a nested tree structure. Since stocks are flat array structures returned by the data API, they need to be grouped by their `sector` field.

The custom hierarchy node types are defined as follows:

```typescript
import { Stock } from '../types';

export interface TreemapNode {
  name: string;
  symbol?: string;
  price?: number;
  change?: number;
  marketCap?: number;
  sector?: string;
  children?: TreemapNode[];
}
```

### 3.2 Sector Grouping and D3 Hierarchy Mapping
The raw stock array is processed to build a 2-level hierarchy: `Root -> Sectors -> Stock Tiles`.

```typescript
const buildHierarchy = (stocks: Stock[]): TreemapNode => {
  const sectorsMap = new Map<string, Stock[]>();
  
  stocks.forEach(stock => {
    const list = sectorsMap.get(stock.sector) || [];
    list.push(stock);
    sectorsMap.set(stock.sector, list);
  });

  return {
    name: 'root',
    children: Array.from(sectorsMap.entries()).map(([sectorName, sectorStocks]) => ({
      name: sectorName,
      children: sectorStocks.map(stock => ({
        name: stock.name,
        symbol: stock.symbol,
        price: stock.price,
        change: stock.change,
        marketCap: stock.marketCap,
        sector: stock.sector,
      })),
    })),
  };
};
```

### 3.3 Layout Calculation
We use `d3.hierarchy` to calculate values for parent nodes based on the sum of their children's `marketCap`:

```typescript
import { hierarchy, treemap as d3Treemap, treemapSquarify } from 'd3-hierarchy';

const root = hierarchy<TreemapNode>(hierarchyData)
  .sum(d => d.marketCap || 0)
  .sort((a, b) => (b.value || 0) - (a.value || 0)); // Sort larger cap elements to top-left
```

We initialize the treemap layout engine:
- Size: set dynamically based on measured width and height.
- Squarified: use `treemapSquarify` to keep tile shapes readable.
- Padding:
  - `paddingOuter(4)` leaves spacing between sectors.
  - `paddingTop(20)` reserves space for the sector headers.
  - `paddingInner(2)` separates individual stock tiles.

```typescript
const layoutGenerator = d3Treemap<TreemapNode>()
  .size([width, height])
  .tile(treemapSquarify)
  .paddingOuter(4)
  .paddingTop(20)
  .paddingInner(2);

layoutGenerator(root);
```

---

## 4. Responsive SVG Component Design

To ensure layout precision and scalability, the treemap is rendered using native SVG elements. 

### 4.1 Measuring Container Size
A custom hook `useContainerSize` tracks the pixel width and height of the component's parent wrapper. This prevents visual overflow and allows the SVG viewport to resize smoothly on browser resize.

```typescript
import { useState, useEffect, RefObject } from 'react';

export function useContainerSize(elementRef: RefObject<HTMLElement>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef]);

  return size;
}
```

### 4.2 SVG Nesting Structure
The component renders:
- An outer `<svg>` wrapper.
- A `<g>` element per **Sector** mapping to depth 1 children.
- A `<g>` element per **Stock** tile mapping to depth 2 leaf nodes. This nested structure ensures sector containers match E2E test criteria.

```xml
<svg data-testid="treemap-container" width={width} height={height}>
  {/* Sector Containers */}
  <g data-testid="treemap-sector-{sector_name}">
    {/* Sector Header */}
    <text data-testid="treemap-sector-title-{sector_name}" />
    
    {/* Stock Tile */}
    <g data-testid="stock-tile-{SYMBOL}" data-highlighted="true|false">
      <rect />
      <text data-testid="stock-symbol-{SYMBOL}" />
      <text data-testid="stock-change-{SYMBOL}" />
    </g>
  </g>
</svg>
```

---

## 5. Component Props & API Design

The API is designed to support search highlighting, hover events (tooltips), and color theme toggles:

```typescript
export interface TreemapProps {
  stocks: Stock[];
  theme: 'international' | 'chinese';
  searchQuery?: string;
  onStockHover?: (stock: Stock | null, x: number, y: number) => void;
  onStockClick?: (stock: Stock) => void;
}
```

### 5.1 Search Query and Highlighting Implementation
Stock tiles evaluate whether they match the current `searchQuery` (if present). If they do not match, we set their `data-highlighted` attribute to `"false"` and apply a Tailwind opacity reduction.

```typescript
const isHighlighted = (stock: TreemapNode): boolean => {
  if (!searchQuery) return true;
  const q = searchQuery.toLowerCase();
  const symbolMatch = stock.symbol?.toLowerCase().includes(q) ?? false;
  const nameMatch = stock.name?.toLowerCase().includes(q) ?? false;
  return symbolMatch || nameMatch;
};
```
And inside the rendering phase:
```tsx
const highlighted = isHighlighted(stockNode.data);

return (
  <g
    key={stockNode.data.symbol}
    data-testid={`stock-tile-${stockNode.data.symbol}`}
    data-highlighted={highlighted ? "true" : "false"}
    className={`cursor-pointer transition-all duration-300 ${
      searchQuery && !highlighted ? 'opacity-25 saturate-50' : 'opacity-100'
    }`}
    ...
  />
);
```

### 5.2 Hover & Tooltip Callback Mechanism
To support floating tooltips (rendered as high-level HTML portals or overlays in Milestone 5), the hover callback reports the coordinates relative to the component container:

```typescript
const handleMouseEnter = (event: React.MouseEvent, node: TreemapNode) => {
  if (!onStockHover || !node.symbol) return;
  const stock: Stock = {
    symbol: node.symbol,
    name: node.name,
    price: node.price || 0,
    change: node.change || 0,
    marketCap: node.marketCap || 0,
    sector: node.sector || '',
  };
  
  // Calculate relative coordinates
  const rect = event.currentTarget.getBoundingClientRect();
  const parentRect = containerRef.current?.getBoundingClientRect();
  const x = rect.left - (parentRect?.left || 0) + rect.width / 2;
  const y = rect.top - (parentRect?.top || 0);

  onStockHover(stock, x, y);
};

const handleMouseLeave = () => {
  onStockHover?.(null, 0, 0);
};
```

---

## 6. Theme Integration & Color Encoding

### 6.1 Theme Rules
Color encoding represents the percentage change. We support two themes:
1. **International Theme**: Positive change is Green (Up), Negative change is Red (Down).
2. **Chinese Theme**: Positive change is Red (Up), Negative change is Green (Down).

### 6.2 Intensity Buckets
To provide immediate visual density, we segment price movements into intensity levels using Tailwind SVG `fill-*` classes:

| Change Range | Chinese Theme (Red Up) | International Theme (Green Up) |
|---|---|---|
| **≥ +3.0%** (Strong Up) | `fill-red-600` | `fill-emerald-600` |
| **[+1.0%, +3.0%)** (Moderate Up) | `fill-red-700` | `fill-emerald-700` |
| **(0.0%, +1.0%)** (Mild Up) | `fill-red-900` | `fill-emerald-950` |
| **0.0%** (Flat) | `fill-slate-700` | `fill-slate-700` |
| **(-1.0%, 0.0%)** (Mild Down) | `fill-emerald-950` | `fill-red-900` |
| **(-3.0%, -1.0%]** (Moderate Down) | `fill-emerald-700` | `fill-red-700` |
| **≤ -3.0%** (Strong Down) | `fill-emerald-600` | `fill-red-600` |

### 6.3 Code Implementation for Colors
```typescript
const getTileColor = (change: number, theme: 'international' | 'chinese'): string => {
  if (change === 0) return 'fill-slate-700 hover:fill-slate-600 transition-colors';

  const isPositive = change > 0;
  const absChange = Math.abs(change);
  const upColor = theme === 'chinese' ? 'red' : 'emerald';
  const downColor = theme === 'chinese' ? 'emerald' : 'red';
  const color = isPositive ? upColor : downColor;

  if (color === 'red') {
    if (absChange >= 3) return 'fill-red-600 hover:fill-red-500 transition-colors';
    if (absChange >= 1) return 'fill-red-700 hover:fill-red-600 transition-colors';
    return 'fill-red-900 hover:fill-red-800 transition-colors';
  } else {
    if (absChange >= 3) return 'fill-emerald-600 hover:fill-emerald-500 transition-colors';
    if (absChange >= 1) return 'fill-emerald-700 hover:fill-emerald-600 transition-colors';
    return 'fill-emerald-950 hover:fill-emerald-900 transition-colors';
  }
};
```

---

## 7. E2E Test Selectors & Layout Verification

Selectors specified in the requirements must be supported explicitly via `data-testid`:

1. **Treemap Container**: `[data-testid="treemap-container"]`
   - Placed directly on the parent `<svg>` tag.
2. **Sector Container**: `[data-testid="treemap-sector-{sector_name}"]`
   - Placed on the `<g>` wrapper that houses the sector's tiles. The sector name is converted to lower case.
3. **Sector Header**: `[data-testid="treemap-sector-title-{sector_name}"]`
   - Placed on the text element displaying the sector's label. The sector name is lower case.
4. **Stock Tile**: `[data-testid="stock-tile-{SYMBOL}"]`
   - Placed on the `<g>` element containing the rect and texts for that symbol.
5. **Stock Symbol Element**: `[data-testid="stock-symbol-{SYMBOL}"]`
   - Placed on the inner text displaying the stock ticker symbol (e.g. AAPL).
6. **Stock Change Element**: `[data-testid="stock-change-{SYMBOL}"]`
   - Placed on the inner text displaying the change percentage (e.g. +2.45% or -1.20%).

---

## 8. Proposed Code Structures

Below is the complete proposed implementation of the components.

### 8.1 Hook: `src/hooks/useContainerSize.ts`
```typescript
import { useState, useEffect, RefObject } from 'react';

export function useContainerSize(elementRef: RefObject<HTMLElement>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef]);

  return size;
}
```

### 8.2 Component: `src/components/Treemap.tsx`
```tsx
import React, { useRef } from 'react';
import { hierarchy, treemap as d3Treemap, treemapSquarify } from 'd3-hierarchy';
import { Stock } from '../types';
import { useContainerSize } from '../hooks/useContainerSize';

export interface TreemapNode {
  name: string;
  symbol?: string;
  price?: number;
  change?: number;
  marketCap?: number;
  sector?: string;
  children?: TreemapNode[];
}

export interface TreemapProps {
  stocks: Stock[];
  theme: 'international' | 'chinese';
  searchQuery?: string;
  onStockHover?: (stock: Stock | null, x: number, y: number) => void;
  onStockClick?: (stock: Stock) => void;
}

const getTileColor = (change: number, theme: 'international' | 'chinese'): string => {
  if (change === 0) return 'fill-slate-700 hover:fill-slate-600 transition-colors duration-200';

  const isPositive = change > 0;
  const absChange = Math.abs(change);
  const upColor = theme === 'chinese' ? 'red' : 'emerald';
  const downColor = theme === 'chinese' ? 'emerald' : 'red';
  const color = isPositive ? upColor : downColor;

  if (color === 'red') {
    if (absChange >= 3) return 'fill-red-600 hover:fill-red-500 transition-colors duration-200';
    if (absChange >= 1) return 'fill-red-700 hover:fill-red-600 transition-colors duration-200';
    return 'fill-red-900 hover:fill-red-800 transition-colors duration-200';
  } else {
    if (absChange >= 3) return 'fill-emerald-600 hover:fill-emerald-500 transition-colors duration-200';
    if (absChange >= 1) return 'fill-emerald-700 hover:fill-emerald-600 transition-colors duration-200';
    return 'fill-emerald-950 hover:fill-emerald-900 transition-colors duration-200';
  }
};

export const Treemap: React.FC<TreemapProps> = ({
  stocks,
  theme,
  searchQuery = '',
  onStockHover,
  onStockClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(containerRef);

  if (stocks.length === 0) {
    return (
      <div 
        ref={containerRef} 
        className="w-full h-full min-h-[500px] flex items-center justify-center bg-slate-900 text-slate-400 border border-slate-800 rounded-lg"
      >
        No stock market data available.
      </div>
    );
  }

  // 1. Group stocks by sector
  const sectorsMap = new Map<string, Stock[]>();
  stocks.forEach(stock => {
    const list = sectorsMap.get(stock.sector) || [];
    list.push(stock);
    sectorsMap.set(stock.sector, list);
  });

  const hierarchyData: TreemapNode = {
    name: 'root',
    children: Array.from(sectorsMap.entries()).map(([sectorName, sectorStocks]) => ({
      name: sectorName,
      children: sectorStocks.map(stock => ({
        name: stock.name,
        symbol: stock.symbol,
        price: stock.price,
        change: stock.change,
        marketCap: stock.marketCap,
        sector: stock.sector,
      })),
    })),
  };

  // 2. Generate layout if dimensions are valid
  const hasDimensions = width > 0 && height > 0;
  let sectorsLayout: any[] = [];

  if (hasDimensions) {
    const rootNode = hierarchy<TreemapNode>(hierarchyData)
      .sum(d => d.marketCap || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const layoutGenerator = d3Treemap<TreemapNode>()
      .size([width, height])
      .tile(treemapSquarify)
      .paddingOuter(4)
      .paddingTop(20)
      .paddingInner(2);

    layoutGenerator(rootNode);
    sectorsLayout = rootNode.children || [];
  }

  const isHighlighted = (node: TreemapNode): boolean => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const symbolMatch = node.symbol?.toLowerCase().includes(q) ?? false;
    const nameMatch = node.name?.toLowerCase().includes(q) ?? false;
    return symbolMatch || nameMatch;
  };

  const handleMouseEnter = (event: React.MouseEvent, node: TreemapNode) => {
    if (!onStockHover || !node.symbol) return;
    const stock: Stock = {
      symbol: node.symbol,
      name: node.name,
      price: node.price || 0,
      change: node.change || 0,
      marketCap: node.marketCap || 0,
      sector: node.sector || '',
    };

    const rect = event.currentTarget.getBoundingClientRect();
    const parentRect = containerRef.current?.getBoundingClientRect();
    const x = rect.left - (parentRect?.left || 0) + rect.width / 2;
    const y = rect.top - (parentRect?.top || 0);

    onStockHover(stock, x, y);
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[500px] bg-slate-950 border border-slate-800 rounded-lg p-1 overflow-hidden"
    >
      {hasDimensions && (
        <svg 
          data-testid="treemap-container" 
          width={width} 
          height={height}
          className="select-none font-sans"
        >
          {sectorsLayout.map(sectorNode => {
            const sectorName = sectorNode.data.name;
            const sectorNameLower = sectorName.toLowerCase();
            return (
              <g 
                key={sectorName} 
                data-testid={`treemap-sector-${sectorNameLower}`}
              >
                {/* Sector header text */}
                <text
                  data-testid={`treemap-sector-title-${sectorNameLower}`}
                  x={sectorNode.x0 + 4}
                  y={sectorNode.y0 + 14}
                  className="text-xs font-bold fill-slate-400 pointer-events-none uppercase tracking-wider"
                >
                  {sectorName}
                </text>

                {/* Stock tiles inside the sector */}
                {sectorNode.children?.map((stockNode: any) => {
                  const stock = stockNode.data;
                  const symbol = stock.symbol!;
                  const w = stockNode.x1 - stockNode.x0;
                  const h = stockNode.y1 - stockNode.y0;

                  if (w <= 0 || h <= 0) return null;

                  const highlighted = isHighlighted(stock);

                  return (
                    <g
                      key={symbol}
                      data-testid={`stock-tile-${symbol}`}
                      data-highlighted={highlighted ? "true" : "false"}
                      transform={`translate(${stockNode.x0}, ${stockNode.y0})`}
                      className={`cursor-pointer transition-opacity duration-300 ${
                        searchQuery && !highlighted ? 'opacity-20 saturate-50' : 'opacity-100'
                      }`}
                      onMouseEnter={(e) => handleMouseEnter(e, stock)}
                      onMouseLeave={() => onStockHover?.(null, 0, 0)}
                      onClick={() => onStockClick?.({
                        symbol,
                        name: stock.name,
                        price: stock.price || 0,
                        change: stock.change || 0,
                        marketCap: stock.marketCap || 0,
                        sector: stock.sector || '',
                      })}
                    >
                      {/* Colored Tile Rect */}
                      <rect
                        width={w}
                        height={h}
                        className={getTileColor(stock.change, theme)}
                        stroke="#090d16"
                        strokeWidth={1}
                      />

                      {/* Ticker Text - Render only if dimensions permit */}
                      {w > 36 && h > 24 && (
                        <text
                          data-testid={`stock-symbol-${symbol}`}
                          x={w / 2}
                          y={h > 36 ? h / 2 - 4 : h / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="font-bold text-xs fill-slate-50 pointer-events-none"
                        >
                          {symbol}
                        </text>
                      )}

                      {/* Change Percentage Text - Render only if height permits */}
                      {w > 48 && h > 36 && (
                        <text
                          data-testid={`stock-change-${symbol}`}
                          x={w / 2}
                          y={h / 2 + 10}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-[10px] font-medium fill-slate-200 pointer-events-none"
                        >
                          {stock.change >= 0 ? `+${stock.change.toFixed(2)}%` : `${stock.change.toFixed(2)}%`}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
};
```

---

## 9. Next Steps and Implementation Strategy

To successfully land Milestone 3, the following implementation sequence is recommended:
1. **Add useContainerSize Hook**: Implement in `src/hooks/useContainerSize.ts` to manage sizing events.
2. **Add Treemap Component**: Implement in `src/components/Treemap.tsx` following the layout and prop APIs designed here.
3. **Verify Layout Elements**: Write Vitest unit tests in `src/components/Treemap.test.tsx` verifying:
   - Sector grouping logic.
   - Size-responsiveness mocks.
   - Text filtering integration.
   - Target attributes (`data-testid` and `data-highlighted`).
