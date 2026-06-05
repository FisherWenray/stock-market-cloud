# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: t1_feature_coverage.spec.ts >> Tier 1 - Feature Coverage >> T1.2: Verify sector grouping headings are displayed
- Location: tests\e2e\specs\t1_feature_coverage.spec.ts:63:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="treemap-sector-title-technology"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-testid="treemap-sector-title-technology"]')

```

```yaml
- banner:
  - heading "Stock Market Cloud" [level=1]
  - paragraph: Real-time heat-map visualization · Auto-refreshes every 10s
  - text: "Live Mode Success. Last Updated: 11:27:31 PM"
  - button "Refresh"
- text: Market
- button "US Market"
- button "HK Market"
- text: Color System
- 'button "Theme Style: chinese (Red Up)"'
- text: Up (Red) Down (Green) Flat (Gray) Language
- button "中文"
- button "English"
- text: Search Ticker or Name
- textbox "Search e.g. AAPL, Tencent..."
- main:
  - img: Information Technology AAPL +2.50% Financials JPM -1.20% Energy XOM -2.10% Health Care JNJ -0.30%
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { StockMarketPage } from '../page-objects/StockMarketPage';
  3   | 
  4   | test.describe('Tier 1 - Feature Coverage', () => {
  5   |   let pageObj: StockMarketPage;
  6   | 
  7   |   test.beforeEach(async ({ page }) => {
  8   |     pageObj = new StockMarketPage(page);
  9   |     // Standard mock for successful API calls
  10  |     await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
  11  |       const reqUrl = route.request().url();
  12  |       const isHk = reqUrl.includes('type=HK') || reqUrl.toLowerCase().includes('hk');
  13  |       const stocksList = isHk ? [
  14  |         { symbol: '0700.HK', name: 'Tencent', regularMarketPrice: 380.0, regularMarketChangePercent: 1.85, marketCap: 3580000000000, sector: 'Technology' },
  15  |         { symbol: '9988.HK', name: 'Alibaba', regularMarketPrice: 78.0, regularMarketChangePercent: -0.9, marketCap: 1620000000000, sector: 'Technology' },
  16  |         { symbol: '0005.HK', name: 'HSBC', regularMarketPrice: 68.0, regularMarketChangePercent: 0.5, marketCap: 1280000000000, sector: 'Finance' },
  17  |         { symbol: '9633.HK', name: 'Nongfu', regularMarketPrice: 42.0, regularMarketChangePercent: -1.15, marketCap: 470000000000, sector: 'Consumer' },
  18  |         { symbol: '2269.HK', name: 'Wuxi', regularMarketPrice: 12.0, regularMarketChangePercent: -3.8, marketCap: 53000000000, sector: 'Healthcare' },
  19  |         { symbol: '0857.HK', name: 'PetroChina', regularMarketPrice: 7.2, regularMarketChangePercent: 1.65, marketCap: 1320000000000, sector: 'Energy' }
  20  |       ] : [
  21  |         { symbol: 'AAPL', name: 'Apple Inc.', regularMarketPrice: 150.0, regularMarketChangePercent: 2.5, marketCap: 3000000000000, sector: 'Technology' },
  22  |         { symbol: 'MSFT', name: 'Microsoft Corp.', regularMarketPrice: 400.0, regularMarketChangePercent: 1.8, marketCap: 2800000000000, sector: 'Technology' },
  23  |         { symbol: 'JPM', name: 'JPMorgan Chase & Co.', regularMarketPrice: 170.0, regularMarketChangePercent: -1.2, marketCap: 500000000000, sector: 'Finance' },
  24  |         { symbol: 'PG', name: 'Procter & Gamble Co.', regularMarketPrice: 150.0, regularMarketChangePercent: 0.5, marketCap: 350000000000, sector: 'Consumer' },
  25  |         { symbol: 'JNJ', name: 'Johnson & Johnson', regularMarketPrice: 160.0, regularMarketChangePercent: -0.3, marketCap: 400000000000, sector: 'Healthcare' },
  26  |         { symbol: 'XOM', name: 'Exxon Mobil Corp.', regularMarketPrice: 110.0, regularMarketChangePercent: -2.1, marketCap: 450000000000, sector: 'Energy' }
  27  |       ];
  28  | 
  29  |       let filteredStocks = stocksList;
  30  |       const qMatch = reqUrl.match(/q=([^&]+)/);
  31  |       if (qMatch) {
  32  |         const requested = qMatch[1].split(',').map(s => s.replace(/^us/, '').replace(/^hk/, ''));
  33  |         filteredStocks = stocksList.filter(s => {
  34  |           const numPart = s.symbol.split('.')[0];
  35  |           return requested.some(r => r === s.symbol || r === numPart || Number(r) === Number(numPart));
  36  |         });
  37  |       }
  38  | 
  39  |       await route.fulfill({
  40  |         status: 200,
  41  |         contentType: 'application/json',
  42  |         body: JSON.stringify({
  43  |           c: 150.0, dp: 2.5,
  44  |           quoteResponse: {
  45  |             result: filteredStocks
  46  |           }
  47  |         })
  48  |       });
  49  |     });
  50  |     await pageObj.navigate();
  51  |     // Wait for initial data load to avoid loading states during test runs
  52  |     await page.waitForSelector('[data-testid="data-status-indicator"]:has-text("Success")');
  53  |   });
  54  | 
  55  |   // T1.1-1.5: Treemap Render
  56  |   test('T1.1: Render sectors', async () => {
  57  |     for (const sector of ['technology', 'finance', 'consumer', 'healthcare', 'energy']) {
  58  |       const container = pageObj.getSectorContainer(sector);
  59  |       await expect(container).toBeVisible();
  60  |     }
  61  |   });
  62  | 
  63  |   test('T1.2: Verify sector grouping headings are displayed', async () => {
  64  |     for (const sector of ['technology', 'finance', 'consumer', 'healthcare', 'energy']) {
  65  |       const header = pageObj.getSectorHeader(sector);
> 66  |       await expect(header).toBeVisible();
      |                            ^ Error: expect(locator).toBeVisible() failed
  67  |       const text = await header.textContent();
  68  |       expect(text ? text.toLowerCase() : '').toContain(sector);
  69  |     }
  70  |   });
  71  | 
  72  |   test('T1.3: Verify relative size of tiles matches relative market cap', async () => {
  73  |     // AAPL cap is 3T, JPM is 500B, so AAPL tile should be larger than JPM tile
  74  |     const aaplTile = pageObj.getStockTile('AAPL');
  75  |     const jpmTile = pageObj.getStockTile('JPM');
  76  |     
  77  |     await expect(aaplTile).toBeVisible();
  78  |     await expect(jpmTile).toBeVisible();
  79  |     
  80  |     const aaplBox = await aaplTile.boundingBox();
  81  |     const jpmBox = await jpmTile.boundingBox();
  82  |     
  83  |     expect(aaplBox).not.toBeNull();
  84  |     expect(jpmBox).not.toBeNull();
  85  |     
  86  |     const aaplArea = aaplBox!.width * aaplBox!.height;
  87  |     const jpmArea = jpmBox!.width * jpmBox!.height;
  88  |     
  89  |     expect(aaplArea).toBeGreaterThan(jpmArea);
  90  |   });
  91  | 
  92  |   test('T1.4: Verify all tiles have symbol and change percentage text visible', async () => {
  93  |     const symbols = ['AAPL', 'MSFT', 'JPM'];
  94  |     for (const sym of symbols) {
  95  |       const symText = pageObj.getStockSymbolText(sym);
  96  |       const changeText = pageObj.getStockChangeText(sym);
  97  |       await expect(symText).toBeVisible();
  98  |       await expect(changeText).toBeVisible();
  99  |       // symbol text should contain the symbol name
  100 |       await expect(symText).toHaveText(sym);
  101 |     }
  102 |   });
  103 | 
  104 |   test('T1.5: Verify responsiveness of the treemap layout when resizing the container', async () => {
  105 |     const tile = pageObj.getStockTile('AAPL');
  106 |     const initialBox = await tile.boundingBox();
  107 |     expect(initialBox).not.toBeNull();
  108 | 
  109 |     // Resize viewport
  110 |     await pageObj.page.setViewportSize({ width: 600, height: 800 });
  111 |     // Wait briefly for layout re-render
  112 |     await pageObj.page.waitForTimeout(500);
  113 | 
  114 |     const resizedBox = await tile.boundingBox();
  115 |     expect(resizedBox).not.toBeNull();
  116 |     // Bounding box should change due to viewport resize
  117 |     expect(resizedBox!.width).not.toEqual(initialBox!.width);
  118 |   });
  119 | 
  120 |   // T1.6-1.10: Dual Market
  121 |   test('T1.6: Switch from US to HK', async () => {
  122 |     await pageObj.selectHkMarket();
  123 |     // HK market tab should be active/selected, and HK stocks visible (e.g. 0700.HK)
  124 |     await expect(pageObj.hkMarketTab).toHaveAttribute('data-active', 'true');
  125 |   });
  126 | 
  127 |   test('T1.7: Switch from HK to US', async () => {
  128 |     await pageObj.selectHkMarket();
  129 |     await pageObj.selectUsMarket();
  130 |     await expect(pageObj.usMarketTab).toHaveAttribute('data-active', 'true');
  131 |   });
  132 | 
  133 |   test('T1.8: Verify transition is seamless and does not reload the page', async () => {
  134 |     // Set a window property
  135 |     await pageObj.page.evaluate(() => {
  136 |       (window as any).notReloaded = true;
  137 |     });
  138 | 
  139 |     await pageObj.selectHkMarket();
  140 | 
  141 |     // Check if property is still set
  142 |     const notReloaded = await pageObj.page.evaluate(() => (window as any).notReloaded);
  143 |     expect(notReloaded).toBe(true);
  144 |   });
  145 | 
  146 |   test('T1.9: Verify correct symbols are displayed for US', async () => {
  147 |     await pageObj.selectUsMarket();
  148 |     await expect(pageObj.getStockTile('AAPL')).toBeVisible();
  149 |     await expect(pageObj.getStockTile('MSFT')).toBeVisible();
  150 |   });
  151 | 
  152 |   test('T1.10: Verify correct symbols are displayed for HK', async () => {
  153 |     await pageObj.selectHkMarket();
  154 |     // In HK market, check for HK symbols like 0700.HK or 9988.HK
  155 |     await expect(pageObj.getStockTile('0700.HK')).toBeVisible();
  156 |   });
  157 | 
  158 |   // T1.11-1.15: Data API & Fallback
  159 |   test('T1.11: Verify application handles successful API load', async () => {
  160 |     const statusText = await pageObj.getDataStatusText();
  161 |     expect(statusText.toLowerCase()).toContain('success');
  162 |   });
  163 | 
  164 |   test('T1.12: Verify application detects API failures and falls back to mock data', async ({ page }) => {
  165 |     // Force API failures
  166 |     await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
```