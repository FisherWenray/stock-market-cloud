## 2026-06-05T01:01:27Z
Context: Milestone 3 (Treemap Component) Bug Fixes
Objective: Address the critical and major bugs identified in the Milestone 3 review. Ensure absolute conformance with E2E selector specifications.
Working directory: C:\Users\fisher\.gemini\antigravity\scratch\stock_market_cloud\.agents\worker_m3_fix
Identity: worker_m3_fix (teamwork_preview_worker)

Tasks to implement:
1. **Fix ResizeObserver bug**:
   Modify `src/components/Treemap.tsx` to return a single, persistent outer wrapper `div` ref-ed to `containerRef` under all circumstances (even when `stocks` array is empty or sizing is not yet determined). Conditionally render empty status text or the `<svg>` component within this persistent wrapper.
2. **Implement ColorLegend**:
   Create a new component `src/components/ColorLegend.tsx` with:
   - Container attribute: `data-testid="color-legend"`
   - Displays indicators for Up, Down, and Flat trend colors based on the current theme.
3. **Integrate Components in App.tsx**:
   - Import and render `ColorLegend` near the theme toggles.
   - Import and render `DataStatusIndicator` in place of the manual header status display. Provide props: `isMock`, `lastUpdated`, `loading`, `error`, `onRefresh`.
4. **Fix App.tsx E2E Selectors**:
   Ensure the following selectors are explicitly assigned:
   - US Market Button: `data-testid="market-tab-us"` and `data-active={selectedMarket === 'US' ? 'true' : 'false'}`
   - HK Market Button: `data-testid="market-tab-hk"` and `data-active={selectedMarket === 'HK' ? 'true' : 'false'}`
   - Theme Toggle Button: `data-testid="theme-toggle"`, `data-theme-style={theme}`, and ensure the button innerText explicitly includes the theme keyword (e.g. "chinese" or "international").
   - Search input element: `data-testid="search-input"`
   - Tooltip Container: `data-testid="stock-tooltip"`
     - Tooltip symbol text: `data-testid="tooltip-symbol"`
     - Tooltip name text: `data-testid="tooltip-name"`
     - Tooltip price text: `data-testid="tooltip-price"`
     - Tooltip change text: `data-testid="tooltip-change"`
     - Tooltip market cap text: `data-testid="tooltip-market-cap"`
5. **Implement Trillion Market Cap formatting**:
   Write a utility or helper in `App.tsx` to format stock market cap in tooltip. If market cap is in trillion range (>= 1e12), format it as `T` (e.g., `3.5T` or `3.50T`). If in billion (>= 1e9), format as `B`. If in million (>= 1e6), format as `M`.
6. **Unit Tests**:
   Update unit tests if needed. Verify all tests pass with mock setup. Try to run builds and test verification.
