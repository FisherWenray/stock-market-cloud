# Milestone 3 Exploration Report: SVG-based Squarified Treemap Component

This report explores the `stock_market_cloud` codebase and details the design and implementation strategy for the SVG-based squarified treemap component.

---

## 1. Context & Architectural Overview

The application is a stock market visualization dashboard for US & HK stocks. 
- **Workspace Directory**: `C:\Users\fisher\.gemini\antigravity\scratch\stock_market_cloud`
- **Dependencies**: The project is using React 18, TypeScript, and Vite.
  - `d3-hierarchy` is installed (`^3.1.2`) along with `@types/d3-hierarchy` (`^3.1.7`).
  - Tailwind CSS is set up (`^3.4.3`) for styling.
- **Stock Types**: Defined in `src/types/index.ts` containing key properties: `symbol`, `name`, `price`, `change`, `marketCap`, and `sector`.

The treemap component will be placed in `src/components/Treemap.tsx` (or similar) and will dynamically lay out stocks grouped by their sectors.

---

## 2. API Design for `Treemap.tsx`

To support responsiveness, color theme switching, hover tooltips, and search highlights, we design the `Treemap` component with the following properties:

```typescript
import React from 'react';
import { Stock, ColorTheme } from '../types';

export interface TreemapProps {
  /** Array of active stock quotes to visualize */
  stocks: Stock[];
  /** Current theme: 'chinese' (Red=Up, Green=Down) or 'international' (Green=Up, Red=Down) */
  theme: ColorTheme;
  /** Active search query from the search input */
  searchQuery?: string;
  /** Callback triggered when user hovers over a stock tile */
  onHoverStock?: (stock: Stock, event: React.MouseEvent<SVGElement>) => void;
  /** Callback triggered when user's mouse leaves a stock tile */
  onLeaveStock?: () => void;
}
```

---

## 3. Data Transformation & D3 Treemap Setup

To render a squarified hierarchical treemap, the list of stocks must be structured into a hierarchical format compatible with `d3-hierarchy`.

### A. Constructing the Hierarchy Node Structure
We group the flat stock list by their `sector` property and create a root-level node containing sector nodes, which in turn contain the individual stock leaf nodes:

```typescript
interface TreemapNode {
  name: string;
  children?: TreemapNode[];
  // Attributes present only on stock leaf nodes
  symbol?: string;
  price?: number;
  change?: number;
  marketCap?: number;
  sector?: string;
}

// Transform:
const sectorsMap = new Map<string, Stock[]>();
stocks.forEach(stock => {
  if (!sectorsMap.has(stock.sector)) {
    sectorsMap.set(stock.sector, []);
  }
  sectorsMap.get(stock.sector)!.push(stock);
});

const hierarchicalData: TreemapNode = {
  name: 'Market',
  children: Array.from(sectorsMap.entries()).map(([sectorName, stocksList]) => ({
    name: sectorName,
    children: stocksList as TreemapNode[],
  })),
};
```

### B. Configuring D3 Layout Engine
Using `d3-hierarchy`, we calculate the sum (based on `marketCap`), sort the entries, and apply the squarified layout:

```typescript
import { hierarchy, treemap, treemapSquarify } from 'd3-hierarchy';

// 1. Create hierarchy and sum the marketCap values
const rootNode = hierarchy<TreemapNode>(hierarchicalData)
  .sum(d => d.marketCap || 0)
  .sort((a, b) => (b.value || 0) - (a.value || 0));

// 2. Instantiate and configure treemap layout
const treemapLayout = treemap<TreemapNode>()
  .size([width, height])
  .tile(treemapSquarify)
  .paddingOuter(6)     // Gap between sector containers
  .paddingTop(28)      // Space reserved at the top of each sector for its title header
  .paddingInner(3);    // Gap between individual stock tiles
  
treemapLayout(rootNode);
```

---

## 4. Layout & Responsiveness Design

### A. Responsive Container Measuring
To make the treemap responsive to container resizing (e.g. mobile viewports or screen resizing as tested in `T1.5` and `T4.4`), we use a `ResizeObserver` on a wrapper `div` element:

```typescript
const containerRef = React.useRef<HTMLDivElement>(null);
const [dimensions, setDimensions] = React.useState({ width: 800, height: 600 });

React.useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      setDimensions({
        width: width || 800,
        height: height || 600,
      });
    }
  });

  observer.observe(container);
  return () => observer.disconnect();
}, []);
```

### B. SVG Hierarchy Drawing
The SVG contains two levels of nested elements:
1. **Sectors (Groups)**: Rendered as `<g>` elements with border/backgrounds.
2. **Stocks (Tiles)**: Rendered as `<g>` elements containing `<rect>` and `<text>` components.

```xml
<div ref={containerRef} className="w-full h-full min-h-[450px]" data-testid="treemap-container">
  <svg width={dimensions.width} height={dimensions.height} className="overflow-visible">
    {rootNode.children?.map((sectorNode) => {
      const sectorName = sectorNode.data.name;
      const sectorId = sectorName.toLowerCase();
      
      return (
        <g 
          key={sectorName}
          data-testid={`treemap-sector-${sectorId}`}
        >
          {/* Sector container visual border/backdrop */}
          <rect
            x={sectorNode.x0}
            y={sectorNode.y0}
            width={sectorNode.x1 - sectorNode.x0}
            height={sectorNode.y1 - sectorNode.y0}
            className="fill-slate-800/30 stroke-slate-700/50"
            rx={4}
          />
          
          {/* Sector Header Title */}
          <text
            data-testid={`treemap-sector-title-${sectorId}`}
            x={sectorNode.x0 + 8}
            y={sectorNode.y0 + 18}
            className="fill-slate-400 font-bold text-xs pointer-events-none select-none"
          >
            {sectorName}
          </text>
          
          {/* Stock tiles within this sector */}
          {sectorNode.children?.map((stockNode) => {
            const stock = stockNode.data as unknown as Stock;
            const w = stockNode.x1 - stockNode.x0;
            const h = stockNode.y1 - stockNode.y0;
            
            return (
              <StockTile
                key={stock.symbol}
                stock={stock}
                theme={theme}
                searchQuery={searchQuery}
                x={stockNode.x0}
                y={stockNode.y0}
                width={w}
                height={h}
                onHover={onHoverStock}
                onLeave={onLeaveStock}
              />
            );
          })}
        </g>
      );
    })}
  </svg>
</div>
```

---

## 5. Styling, Themes, and Search Highlighting

### A. Trend Colors & Color Schemes (Chinese vs International)
We determine `data-trend-color` using:
- `change > 0` $\rightarrow$ `"up"`
- `change < 0` $\rightarrow$ `"down"`
- `change === 0` $\rightarrow$ `"neutral"`

The theme prop determines what visual color class is rendered:
- **International (`theme === 'international'`)**:
  - `up` maps to green (e.g. `fill-emerald-600/500/700` based on magnitude)
  - `down` maps to red (e.g. `fill-rose-600/500/700` based on magnitude)
  - `neutral` maps to gray (e.g. `fill-slate-700`)
- **Chinese (`theme === 'chinese'`)**:
  - `up` maps to red (e.g. `fill-rose-600/500/700` based on magnitude)
  - `down` maps to green (e.g. `fill-emerald-600/500/700` based on magnitude)
  - `neutral` maps to gray (e.g. `fill-slate-700`)

```typescript
const getStockFillClass = (change: number, theme: ColorTheme): string => {
  if (change === 0) return 'fill-slate-700';
  const isUp = change > 0;
  const abs = Math.abs(change);
  
  if (theme === 'international') {
    if (isUp) {
      if (abs >= 3) return 'fill-emerald-500 hover:fill-emerald-400';
      if (abs >= 1.5) return 'fill-emerald-600 hover:fill-emerald-500';
      return 'fill-emerald-800 hover:fill-emerald-700';
    } else {
      if (abs >= 3) return 'fill-rose-500 hover:fill-rose-400';
      if (abs >= 1.5) return 'fill-rose-600 hover:fill-rose-500';
      return 'fill-rose-800 hover:fill-rose-700';
    }
  } else {
    if (isUp) {
      if (abs >= 3) return 'fill-rose-500 hover:fill-rose-400';
      if (abs >= 1.5) return 'fill-rose-600 hover:fill-rose-500';
      return 'fill-rose-800 hover:fill-rose-700';
    } else {
      if (abs >= 3) return 'fill-emerald-500 hover:fill-emerald-400';
      if (abs >= 1.5) return 'fill-emerald-600 hover:fill-emerald-500';
      return 'fill-emerald-800 hover:fill-emerald-700';
    }
  }
};
```

### B. Search Query Highlighting (`data-highlighted`)
The `data-highlighted` attribute has values `"true"` or `"false"`.
- If `searchQuery` is empty/undefined $\rightarrow$ all stock tiles have `data-highlighted="true"`.
- If `searchQuery` is provided $\rightarrow$ match using case-insensitive check against `symbol` and `name`. If matching, set to `"true"`. Otherwise, set to `"false"`.
- **Dimming Style**: Non-matching tiles (`data-highlighted="false"`) should have their opacity reduced to `0.3` (or similar) to make the matching tile pop out.

```typescript
const cleanQuery = (searchQuery || '').trim().toLowerCase();
const isHighlighted = cleanQuery === '' || 
  stock.symbol.toLowerCase().includes(cleanQuery) || 
  stock.name.toLowerCase().includes(cleanQuery);
```

---

## 6. E2E Selector Mapping Table

To pass the Playwright test suite, elements must have specific `data-testid` values:

| Component / Element | Selector Format / Attribute | Example / Value |
|---|---|---|
| Treemap Container | `[data-testid="treemap-container"]` | Outer container wrapping the SVG |
| Sector Container | `[data-testid="treemap-sector-{sector_name}"]` | `<g data-testid="treemap-sector-technology">` (lowercase) |
| Sector Header Title | `[data-testid="treemap-sector-title-{sector_name}"]` | `<text data-testid="treemap-sector-title-technology">` (lowercase) |
| Stock Tile | `[data-testid="stock-tile-{SYMBOL}"]` | `<g data-testid="stock-tile-AAPL">` |
| Tile Highlight Attribute | `data-highlighted="true" \| "false"` | `data-highlighted="true"` |
| Tile Trend Attribute | `data-trend-color="up" \| "down" \| "neutral"` | `data-trend-color="up"` |
| Stock Symbol text | `[data-testid="stock-symbol-{SYMBOL}"]` | `<text data-testid="stock-symbol-AAPL">` |
| Stock Change text | `[data-testid="stock-change-{SYMBOL}"]` | `<text data-testid="stock-change-AAPL">` |

---

## 7. Edge Cases Handling

1. **0% Price Change (`T2.1`, `T2.26`)**:
   - `data-trend-color="neutral"` attribute set.
   - Colored with a neutral background (e.g. `fill-slate-700`) in both themes.
2. **Tiny Market Cap Stocks / Small Tiles (`T2.2`, `T2.5`)**:
   - Small tiles may have dimensions too small to fit text.
   - We prevent text overlapping by dynamically checking tile width & height (`width > 40` and `height > 30`).
   - If too small, we set text font-size to `0px` and opacity to `0` instead of removing them from the DOM, so that selectors like `[data-testid="stock-symbol-{SYMBOL}"]` remain queryable by testing libraries.
3. **Sector with 0 Stocks (`T2.4`)**:
   - Empty sectors must be excluded completely. Since our hierarchy creation uses `sectorsMap` keys, only sectors that contain at least one stock will populate the map and thus are computed. Empty sectors are omitted naturally from layout.
4. **Sector with 1 Stock (`T2.3`)**:
   - Covered naturally by D3's layout partition sizing. The sector receives a single child, which inherits the full width/height of the sector block (adjusted by margins).

---

## 8. Step-by-Step Implementation Instructions for the Implementer

1. **Create Treemap.tsx**: Place the new component at `src/components/Treemap.tsx`.
2. **Import d3-hierarchy**: Use named imports `import { hierarchy, treemap, treemapSquarify } from 'd3-hierarchy';`.
3. **Set up responsive hook**: Implement `ResizeObserver` inside `Treemap.tsx` to compute container width and height.
4. **Build Hierarchy**: Transform the props `stocks` array to hierarchical form, run D3 `treemap()`, and compute coordinates.
5. **Render SVG**: Construct the nested `<g>` elements for sector containers and stock tiles using the exactly matched E2E selectors.
6. **Support Search & Theme**: Implement class toggles for `data-highlighted` and `data-trend-color`.
7. **Expose callbacks**: Wire up `onMouseEnter` and `onMouseLeave` on stock tile `<g>` elements to notify parent of hovered symbols.
8. **Integrate with App.tsx**: Connect Treemap state in `App.tsx` and pass parameters correctly.
