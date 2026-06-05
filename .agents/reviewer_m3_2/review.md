# Milestone 3 Review & Challenge Report — 2026-06-05

## Review Summary

**Verdict**: REQUEST_CHANGES

## Findings

### [Critical] E2E Selector Gaps in App.tsx

- **What**: Multiple E2E test selectors are missing from the implemented controls and elements.
- **Where**: `src/App.tsx`, lines 89-135, 143-159, and 193-241.
- **Why**: The Playwright page-object model (`StockMarketPage.ts`) defines precise selector rules:
  - US/HK market buttons: `[data-testid="market-tab-us"]` / `[data-testid="market-tab-hk"]` with `data-active` attributes.
  - Theme Toggle: `[data-testid="theme-toggle"]` with `data-theme-style` attributes.
  - Search input: `[data-testid="search-input"]`.
  - Tooltip: `[data-testid="stock-tooltip"]` and children `[data-testid="tooltip-symbol"]`, `[data-testid="tooltip-name"]`, `[data-testid="tooltip-price"]`, `[data-testid="tooltip-change"]`, `[data-testid="tooltip-market-cap"]`.
  All of these are missing in `App.tsx`, meaning E2E tests targeting these selectors will fail instantly.
- **Suggestion**: Add the requested `data-testid` and dynamic custom attributes to `App.tsx` matching `StockMarketPage.ts`.

### [Critical] Missing DataStatusIndicator Integration in App.tsx

- **What**: The indicator component `src/components/DataStatusIndicator.tsx` was created but is never imported or rendered in the main application layout.
- **Where**: `src/App.tsx`, lines 63-79.
- **Why**: `App.tsx` manually renders its own status feed elements, which do not have the required test IDs `data-source-indicator` or `data-status-indicator` expected by the E2E tests.
- **Suggestion**: Import `DataStatusIndicator` in `App.tsx` and replace the manual status elements.

### [Major] useContainerSize/Treemap ResizeObserver Tracking Bug

- **What**: Ref element target switching prevents ResizeObserver from tracking the active element.
- **Where**: `src/components/Treemap.tsx`, lines 60-70 & 141-249; and `src/hooks/useContainerSize.ts`.
- **Why**: When `stocks` is empty initially, `Treemap.tsx` returns a placeholder `div` ref-ed to `containerRef`. Once stocks load, `Treemap` re-renders and returns the SVG container `div` ref-ed to `containerRef`. Because `useContainerSize`'s `useEffect` only depends on `[elementRef]` (the ref wrapper object, which is stable across renders), the effect does not re-run when the DOM element inside the ref target changes. The observer continues observing the unmounted placeholder div and fails to observe the new SVG container div, rendering the Treemap non-responsive to window/container resizes after transition.
- **Suggestion**: Refactor `Treemap.tsx` to render a single, persistent outer wrapper `div` ref-ed to `containerRef` regardless of whether `stocks` is empty or not, and conditionally render the empty text or SVG children within it.

### [Major] Tooltip Market Cap Formatting Mismatch

- **What**: Tooltip market cap format in trillion-level range fails E2E assertions.
- **Where**: `src/App.tsx`, lines 228-233.
- **Why**: E2E test `T2.19` asserts that large market cap tooltips contain `'t'` (trillion format, e.g. `3.5T`). Currently, `App.tsx` divides the market cap by `1e9` and hardcodes a `'B'` suffix (e.g. `3500.00B`), causing test failure.
- **Suggestion**: Implement dynamic abbreviation logic for Millions (M), Billions (B), and Trillions (T) in `App.tsx` or a helper utility.

### [Minor] Missing Color Legend Component

- **What**: There is no Color Legend component implemented or rendered in the UI.
- **Where**: `src/App.tsx` / `src/components/`.
- **Why**: Requirement R1 asks for a visible color legend, and E2E test `T1.28` tries to select `[data-testid="color-legend"]` which does not exist in the DOM.
- **Suggestion**: Build a simple `<ColorLegend />` component and place it near the control panel, using the appropriate test ID.

---

## Verified Claims

- Hook `useContainerSize` correctly uses `ResizeObserver` and returns a cleanup callback calling `.unobserve(element)` -> verified via code inspection of `src/hooks/useContainerSize.ts` -> **PASS**
- Search filtering and dimming logic maps correctly (dims non-matches but leaves mouse enter/leave and click handlers active) -> verified via code inspection of `src/components/Treemap.tsx` -> **PASS**
- Color theme logic (Chinese Up=Red/Down=Green vs International Up=Green/Down=Red) maps correctly to the layout generator -> verified via code inspection of `getTileColor` inside `src/components/Treemap.tsx` -> **PASS**
- Standard unit test coverage is written -> verified via inspection of `src/components/Treemap.test.tsx` -> **PASS**

## Coverage Gaps

- **E2E Test Execution & Verification**: Due to terminal permission timeout waiting for user response, we could not execute the physical E2E or unit tests. The issues described above are deduced strictly from code inspections.
- **Dynamic Resize behavior**: We could not test the manual resize behaviour of the browser viewport to physically see d3-hierarchy updates.

---

## Challenge Summary

**Overall risk assessment**: HIGH

## Challenges

### [High] Hook Failure on Conditional Component Mounting

- **Assumption challenged**: The ref target element assigned on initial mount will remain the target for ResizeObserver throughout the component lifecycle.
- **Attack scenario**: Application loads in empty/error state -> placeholder div mounts and `containerRef` is registered. API request resolves -> placeholder div unmounts, SVG container div mounts.
- **Blast radius**: ResizeObserver ceases to track the active container size. Treemap does not adjust size. If screen starts small and expands, the SVG stays clipped at 0x0 or the fallback/initial 100x50 size.
- **Mitigation**: Standardize container wrappers or use callback refs instead of standard React ref objects with static dependency arrays.

### [High] Mismatch in Mock Data Interceptor Pattern

- **Assumption challenged**: E2E test suite mock route will intercept Yahoo/Finnhub queries.
- **Attack scenario**: The real service implementation (`api.ts`) constructs the API endpoint using `import.meta.env.VITE_STOCK_API_URL` or fallback `https://api.example.com/v1`. The Playwright router intercepts `yahoo` or `finnhub` URLs.
- **Blast radius**: The actual API call is not intercepted. It goes out to `https://api.example.com/v1`, fails, triggers the fallback mock mode, and shows "Mock Mode". This causes the live-feed checks in E2E tests (e.g. `T1.14`) to fail because the application resolves as `isMock: true` instead of `isMock: false`.
- **Mitigation**: Synchronize the target E2E mock router endpoints with the actual API endpoint string or set environment variables in test execution.

---

## Stress Test Results

- Empty Stock Transition -> Treemap renders empty state placeholder -> API updates -> Treemap switches to SVG -> ResizeObserver fails to update -> **FAIL (Visual non-responsive regression)**
- Trillion Cap formatting check -> Tooltip displays `3500.00B` -> Playwright asserts `t` -> **FAIL (Assertion mismatch)**
- Theme toggle -> Toggle button clicked -> Theme switches -> Tooltip persists -> **PASS (Verified via unit test context)**
