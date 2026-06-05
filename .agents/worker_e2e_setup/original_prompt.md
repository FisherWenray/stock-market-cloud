## 2026-06-04T15:27:04Z

You are an E2E Test Writer (worker). Your working directory is C:\Users\fisher\.gemini\antigravity\scratch\stock_market_cloud\.agents\worker_e2e_setup.
Your task is to set up the E2E testing infrastructure and implement all the E2E tests for the Stock Market Cloud Visualization application under the root directory C:\Users\fisher\.gemini\antigravity\scratch\stock_market_cloud.

Please perform the following steps:
1. Initialize/configure package.json in the project root C:\Users\fisher\.gemini\antigravity\scratch\stock_market_cloud. If package.json does not exist, create it. Add these dependencies if not present:
   - "@playwright/test": "^1.40.0"
   - "typescript": "^5.0.0"
   - "@types/node": "^20.0.0"
   - "ts-node": "^10.9.0"
   Define the script in package.json:
   - "test:e2e": "playwright test"

2. Install the dependencies using npm (e.g. `npm install` or `npm install --no-audit --no-fund`), and run `npx playwright install chromium` to ensure chromium browser is available.

3. Create C:\Users\fisher\.gemini\antigravity\scratch\stock_market_cloud\playwright.config.ts with a standard robust configuration:
   - testDir: './tests/e2e/specs'
   - use baseURL: process.env.BASE_URL || 'http://localhost:5173'
   - timeout: 30000
   - use chromium browser.

4. Create C:\Users\fisher\.gemini\antigravity\scratch\stock_market_cloud\tests\e2e\page-objects\StockMarketPage.ts containing a Page Object Model class. The POM must encapsulate all interactions with the page based on the following selector contract:
   - US Market tab/button: `data-testid="market-tab-us"`
   - HK Market tab/button: `data-testid="market-tab-hk"`
   - Treemap container: `data-testid="treemap-container"`
   - Sector container: `data-testid="treemap-sector-[sectorName]"` where sectorName is lowercase (e.g., 'technology', 'finance', 'consumer', 'healthcare', 'energy')
   - Sector header/title: `data-testid="treemap-sector-title-[sectorName]"`
   - Stock tile: `data-testid="stock-tile-[symbol]"` (e.g., AAPL, 0700.HK)
   - Stock symbol text inside tile: `data-testid="stock-symbol-[symbol]"`
   - Stock change percentage text inside tile: `data-testid="stock-change-[symbol]"`
   - Color theme toggle button/switch: `data-testid="theme-toggle"`
   - Theme container/toggle state: checking text, or `data-theme-style="chinese"` / `data-theme-style="international"`
   - Color legend: `data-testid="color-legend"`
   - Search input: `data-testid="search-input"`
   - Highlighted tiles: `data-highlighted="true"`. Non-highlighted: `data-highlighted="false"`
   - Tooltip container: `data-testid="stock-tooltip"`
   - Tooltip fields:
     - Symbol: `data-testid="tooltip-symbol"`
     - Name: `data-testid="tooltip-name"`
     - Price: `data-testid="tooltip-price"`
     - Change percentage: `data-testid="tooltip-change"`
     - Market cap: `data-testid="tooltip-market-cap"`
   - Data status indicator: `data-testid="data-status-indicator"`
   - Data source indicator: `data-testid="data-source-indicator"` with text containing "Live" or "Mock", or attribute `data-source="live"|"mock"`

5. Write the E2E test files in C:\Users\fisher\.gemini\antigravity\scratch\stock_market_cloud\tests\e2e\specs/:
   - t1_feature_coverage.spec.ts (Implement all 30 cases T1.1 - T1.30 as described in C:\Users\fisher\.gemini\antigravity\scratch\stock_market_cloud\.agents\orchestrator\TEST_INFRA.md)
   - t2_boundary_cases.spec.ts (Implement all 30 cases T2.1 - T2.30 as described in C:\Users\fisher\.gemini\antigravity\scratch\stock_market_cloud\.agents\orchestrator\TEST_INFRA.md)
   - t3_cross_feature.spec.ts (Implement all 6 cases T3.1 - T3.6 as described in C:\Users\fisher\.gemini\antigravity\scratch\stock_market_cloud\.agents\orchestrator\TEST_INFRA.md)
   - t4_workflows.spec.ts (Implement all 5 cases T4.1 - T4.5 as described in C:\Users\fisher\.gemini\antigravity\scratch\stock_market_cloud\.agents\orchestrator\TEST_INFRA.md)

   Make sure to mock external APIs (Yahoo Finance / Finnhub) inside your tests using Playwright's `page.route` to test success and failure scenarios for Feature 3.

6. Verify that the test files compile and can be loaded by Playwright: run `npx playwright test --list` and ensure there are no compilation or syntax errors.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Please document all files created, tests written, commands run, and results in your handoff report C:\Users\fisher\.gemini\antigravity\scratch\stock_market_cloud\.agents\worker_e2e_setup\handoff.md.
