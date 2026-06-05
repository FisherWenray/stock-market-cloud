# E2E Test Infra: Stock Market Cloud

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source | Tier 1 (Min 5) | Tier 2 (Min 5) | Tier 3 (Pairwise) | Tier 4 (Min 5) |
|---|---------|--------|:--------------:|:--------------:|:-----------------:|:--------------:|
| 1 | Treemap Render | R1 | 5 | 5 | ✓ | ✓ |
| 2 | Dual Market | R2 | 5 | 5 | ✓ | ✓ |
| 3 | Data API & Fallback | R3 | 5 | 5 | ✓ | ✓ |
| 4 | Hover Tooltip | R4 | 5 | 5 | ✓ | ✓ |
| 5 | Search Highlight | R4 | 5 | 5 | ✓ | ✓ |
| 6 | Color Scheme Toggle | R1 | 5 | 5 | ✓ | ✓ |

## Test Architecture
- **Test Runner**: Playwright, Cypress, or a custom lightweight Node E2E test runner (Puppeteer/Playwright-core) that is easy to setup. Let's design it using a very robust, zero-configuration framework like Playwright, or Cypress, or simple selenium-webdriver. Playwright is highly recommended for Windows because it is extremely fast and robust, or Puppeteer. Let's outline Playwright.
- **Test Cases Location**: `tests/e2e/`
- **Unit Tests Location**: `src/components/__tests__/` or similar.

## Test Case Tiers

### Tier 1 - Feature Coverage (30 Cases)
- **T1.1-1.5 (Treemap Render)**:
  - Render sectors (Technology, Finance, Consumer, Healthcare, Energy).
  - Verify sector grouping headings are displayed.
  - Verify relative size of tiles matches relative market cap.
  - Verify all tiles have symbol and change percentage text visible.
  - Verify responsiveness of the treemap layout when resizing the container.
- **T1.6-1.10 (Dual Market)**:
  - Switch from US to HK.
  - Switch from HK to US.
  - Verify transition is seamless and does not reload the page (URL doesn't change, state is kept).
  - Verify correct symbols are displayed for US (AAPL, MSFT, etc.).
  - Verify correct symbols are displayed for HK (0700.HK, 9988.HK, etc.).
- **T1.11-1.15 (Data API & Fallback)**:
  - Verify application handles successful API load.
  - Verify application detects API failures and falls back to mock data.
  - Verify mock data indicator is displayed when in fallback mode.
  - Verify api indicator is displayed when in live mode.
  - Verify mock data has valid values (non-zero price, cap, valid change %).
- **T1.16-1.20 (Hover Tooltip)**:
  - Hover over US tile and verify tooltip appears.
  - Hover over HK tile and verify tooltip appears.
  - Verify tooltip displays full company name, price, change %, market cap, symbol.
  - Hover away from tile and verify tooltip disappears.
  - Move mouse from one tile to another and verify tooltip updates immediately.
- **T1.21-1.25 (Search Highlight)**:
  - Enter query in search bar and verify matching tile is highlighted (different border or opacity).
  - Clear search bar and verify highlight is removed.
  - Enter non-matching query and verify no tiles are highlighted (all dimmed).
  - Test case-insensitivity of search (e.g. "aapl" matches "AAPL").
  - Test search by company name (e.g. "Apple" matches "AAPL").
- **T1.26-1.30 (Color Scheme Toggle)**:
  - Toggle to Chinese style: verify positive change tile has red background, negative has green.
  - Toggle to International style: verify positive change tile has green background, negative has red.
  - Verify Legend updates its labels/colors accordingly.
  - Switch markets and verify selected color style is preserved.
  - Reload page or toggle multiple times to check persistence/correctness.

### Tier 2 - Boundary & Corner Cases (30 Cases)
- **T2.1-2.5 (Treemap boundaries)**:
  - 0% change stock rendering color (should be neutral/gray).
  - Very small market cap stock rendering (very small tile, text truncated but tooltip still hoverable).
  - Sector with only one stock.
  - Sector with 0 stocks (should not render sector container).
  - Extreme market cap difference (max cap vs min cap).
- **T2.6-2.10 (Dual Market boundaries)**:
  - Switch markets rapidly (clicking tabs multiple times).
  - Switching market while search query is active.
  - Switching market while tooltip is open.
  - Switching market when API is failing.
  - Switching market and verifying currency format (USD vs HKD).
- **T2.11-2.15 (Data API boundaries)**:
  - API rate limit error (429) simulation.
  - API connection timeout simulation.
  - API returning empty list or invalid JSON.
  - Toggle API offline/online toggle if available in DevTools or config.
  - Verify fallback data is not stale.
- **T2.16-2.20 (Hover Tooltip boundaries)**:
  - Hovering over a tile near screen edge (tooltip doesn't overflow viewport).
  - Hovering on touch-enabled screen or simulated touch events.
  - Hovering over a tile with extremely long company name.
  - Tooltip formatting for large market caps (e.g., trillions vs billions).
  - Tooltip styling during loading state.
- **T2.21-2.25 (Search boundaries)**:
  - Search query with special characters.
  - Search query with trailing spaces.
  - Multi-word search query.
  - Search with empty input.
  - Search highlight updating correctly when data updates in background.
- **T2.26-2.30 (Color Theme boundaries)**:
  - Zero change styling in both themes.
  - Hover highlight overlay color on positive/negative tiles.
  - Color contrast ratio verification for accessibility.
  - Toggle theme while tooltip is active.
  - Toggle theme when all stocks are positive or all negative.

### Tier 3 - Cross-Feature Combinations (6 Cases)
- **T3.1**: Search highlight active + hover tooltip open + toggle color theme.
- **T3.2**: Switch market + query search + check sector layout.
- **T3.3**: Simulate API failure mid-session + switch market + check legend colors.
- **T3.4**: Search active + hover over highlighted vs non-highlighted tile.
- **T3.5**: Rapidly toggle market + color theme + search input.
- **T3.6**: Tooltip active at boundary screen position + resize window + change market.

### Tier 4 - Real-World Application Scenarios (5 Cases)
- **T4.1 (The Market Analyst)**: Analyst opens app, views US Tech sector, toggles color theme to Chinese, searches for Nvidia, checks tooltip details.
- **T4.2 (The Global Investor)**: Investor starts in US market (live API), switches to HK market, experiences API failure, fallback banner alerts them, they search for Tencent, hover to view details in HKD, then switch back to US.
- **T4.3 (The Market Rally)**: App is loaded with simulated dataset where all stocks are positive. Toggled between Chinese and International style, validating the overall canvas turns entirely red (Chinese) and then entirely green (International).
- **T4.4 (The High-Resolution Boardroom)**: Application rendered on large screen (4K), container sizes checked, then simulated on mobile device (375px width), verifying responsive layout converts sectors to scrollable or wraps cleanly.
- **T4.5 (End-to-End Stress Test)**: App fetches from API, experiences intermittent timeouts, toggles mock fallbacks, executes search and clears it, opens tooltips, and validates memory leak/performance bounds are kept under 60fps rendering.
