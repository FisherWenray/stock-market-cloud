# Synthesized Analysis and Design: Milestone 3 (Treemap Component)

## 1. Consensus
- **Library Choice**: SVG-based squarified treemap using `d3-hierarchy`'s `.sum(d => d.marketCap)` and `.tile(treemapSquarify)`.
- **Nesting Structure**: Root -> Sectors -> Stocks. This ensures sectors are visually distinct.
- **Selector Mapping**:
  - Treemap Container: `[data-testid="treemap-container"]` on parent `<svg>`.
  - Sector Container: `[data-testid="treemap-sector-{sector_name}"]` on `<g>` where `sector_name` is lowercased.
  - Sector Title: `[data-testid="treemap-sector-title-{sector_name}"]` on `<text>` header.
  - Stock Tile: `[data-testid="stock-tile-{SYMBOL}"]` on `<g>`.
    - `data-highlighted="true" | "false"` attribute.
    - `data-trend-color="up" | "down" | "neutral"` attribute.
    - Inside tile: `[data-testid="stock-symbol-{SYMBOL}"]` and `[data-testid="stock-change-{SYMBOL}"]`.
- **Theme Color Mappings**:
  - Chinese: Up is Red, Down is Green.
  - International: Up is Green, Down is Red.
  - Zero Change: Neutral (`fill-slate-700`) in both themes.
  - Change magnitude scaled using Tailwind classes (emerald/red 600, 700, 900 or emerald-950).
- **Highlighting**: Non-matching search queries should dim tiles (e.g. `opacity-20`) but keep pointer events active to trigger tooltips.
- **Responsiveness**: A custom hook `useContainerSize` using `ResizeObserver` measures container width and height.

## 2. Key Decisions & Files to Create
1. **`src/hooks/useContainerSize.ts`**: Handles container dimension measurement dynamically.
2. **`src/components/Treemap.tsx`**: Renders the SVG treemap.
3. **Integration**: Import and render `<Treemap />` inside `src/App.tsx`.
4. **Verification**: Implement Vitest tests for the component to verify sector grouping, rendering, responsive sizing, theme coloring, and search filtering.

## 3. Worker Implementation Checklist
- [ ] Create `src/hooks/useContainerSize.ts`
- [ ] Create `src/components/Treemap.tsx`
- [ ] Connect `Treemap` in `src/App.tsx` (using state for theme, search query, data)
- [ ] Write unit tests for `useContainerSize` and `Treemap`
- [ ] Run `npm run test:run` and verify tests pass
- [ ] Run `npm run build` to verify type safety and compilation
