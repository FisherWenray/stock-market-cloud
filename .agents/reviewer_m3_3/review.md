# Milestone 3 Review & Challenge Report — 2026-06-05

## Review Summary

**Verdict**: REQUEST_CHANGES

The implementation of Milestone 3 fixes and components is very close to complete, correct, and matches E2E selector contracts. However, a major regression exists in theme style persistence which will cause the E2E test suite to fail.

---

## Findings

### [Major] Theme Style Persistence Bug in App.tsx

- **What**: The application reads the theme style from `localStorage` on initialization but never writes theme updates back to it.
- **Where**: `src/App.tsx`, lines 23-26 and lines 129-136.
- **Why**: The state initializer successfully loads from `localStorage`:
  ```typescript
  const [theme, setTheme] = useState<ColorTheme>(() => {
    const saved = localStorage.getItem('color-theme');
    return (saved === 'chinese' || saved === 'international') ? saved : 'international';
  });
  ```
  However, the theme toggle button only invokes `setTheme` state update:
  ```typescript
  onClick={() => setTheme(theme === 'international' ? 'chinese' : 'international')}
  ```
  Because there is no `useEffect` hook or click handler logic executing `localStorage.setItem('color-theme', theme)`, any theme switch is lost upon page reload. This directly causes E2E test `T1.30: Reload page or toggle multiple times to check persistence/correctness` to fail.
- **Suggestion**: Add a simple `useEffect` in `src/App.tsx` to automatically persist the theme when it changes:
  ```typescript
  useEffect(() => {
    localStorage.setItem('color-theme', theme);
  }, [theme]);
  ```

---

## Verified Claims

- **ResizeObserver Bug Fix in Treemap.tsx** → Verified via code inspection of `src/components/Treemap.tsx` (lines 134-251) → **PASS**
  - A single, persistent outer wrapper `div` is always returned and ref-ed to `containerRef` regardless of whether `stocks` data is empty, loading, or populated. This ensures that the tracked DOM element is never unmounted, preventing ResizeObserver tracking bugs and memory leaks.
- **ColorLegend Implementation** → Verified via code inspection of `src/components/ColorLegend.tsx` → **PASS**
  - `ColorLegend` contains the element `data-testid="color-legend"` and maps the colors correctly according to theme settings (Chinese: Red Up, Emerald Down, Slate Flat; International: Emerald Up, Red Down, Slate Flat).
- **Integration in App.tsx** → Verified via code inspection of `src/App.tsx` → **PASS**
  - `ColorLegend` is correctly rendered next to the theme toggle button.
  - E2E selector mappings match the contract: `market-tab-us`, `market-tab-hk`, `theme-toggle`, `search-input`, `stock-tooltip`, and nested tooltip fields (`tooltip-symbol`, `tooltip-name`, `tooltip-price`, `tooltip-change`, `tooltip-market-cap`) are correctly mapped.
- **Market Cap Tooltip Formatting** → Verified via code inspection of `src/App.tsx` (lines 8-19) → **PASS**
  - Trillion formatting correctly uses `toFixed(2)` and `T` suffix for values above `1e12` (e.g. `3.50T`), which matches the expected E2E checks.
- **.env Setup for E2E Interception** → Verified via code inspection of `.env` → **PASS**
  - Root `.env` file successfully specifies `VITE_STOCK_API_KEY=mock-api-key-for-e2e` and `VITE_STOCK_API_URL=https://api.example.com/v1/finnhub`, which ensures browser fetches target matching routes in Playwright interceptors.

---

## Coverage Gaps

- **Interactive Test Execution**: The environment is headless and command executions using `run_command` timed out waiting for user approval. Consequently, build compilation (`npm run build`), unit test suite (`npm run test:run`), and Playwright E2E tests (`npm run test:e2e`) could not be physically executed. All verification findings are based on static code inspections.

---

## Unverified Items

- **Unit tests execution status** — Reason not verified: Command permission timeout.
- **E2E tests execution status** — Reason not verified: Command permission timeout.

---

## Challenge Summary (Adversarial Review)

**Overall risk assessment**: MEDIUM

## Challenges

### [Medium] Theme Persistence Failure

- **Assumption challenged**: Theme preference switches are automatically persisted in `localStorage` by React state changes.
- **Attack scenario**: User switches to Chinese color system (Red Up), navigates around, and reloads/refreshes the page.
- **Blast radius**: The preference is lost, and the app resets back to the default International theme (Green Up). This breaks accessibility styling persistence for users who require Red Up styling.
- **Mitigation**: Add a `useEffect` hook in `App.tsx` to synchronise `theme` state updates to `localStorage.setItem('color-theme', theme)`.

### [Low] AbortController Timeout in fetchMarketData

- **Assumption challenged**: The browser client aborts standard slow API requests using `AbortController`.
- **Attack scenario**: `fetchMarketData` sets a 5000ms timeout. If a network call takes 6000ms, the request is aborted.
- **Blast radius**: Although this functions correctly, it defaults to the random fluctuated mock data. In very slow environments, this can cause data to flicker or display fallback warnings frequently.
- **Mitigation**: Consider exposing the timeout duration via config or environment variables if needed.
