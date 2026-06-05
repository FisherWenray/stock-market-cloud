# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: t4_workflows.spec.ts >> Tier 4 - Real-World Application Scenarios (Workflows) >> T4.1: The Market Analyst workflow
- Location: tests\e2e\specs\t4_workflows.spec.ts:12:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="treemap-sector-technology"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-testid="treemap-sector-technology"]')

```

```yaml
- banner:
  - heading "Stock Market Cloud" [level=1]
  - paragraph: Real-time heat-map visualization · Auto-refreshes every 10s
  - text: "Live Mode Success. Last Updated: 11:28:11 PM"
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
  - img: Information Technology NVDA +4.20%
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { StockMarketPage } from '../page-objects/StockMarketPage';
  3   | 
  4   | test.describe('Tier 4 - Real-World Application Scenarios (Workflows)', () => {
  5   |   let pageObj: StockMarketPage;
  6   | 
  7   |   test.beforeEach(async ({ page }) => {
  8   |     pageObj = new StockMarketPage(page);
  9   |   });
  10  | 
  11  |   // T4.1 (The Market Analyst)
  12  |   test('T4.1: The Market Analyst workflow', async ({ page }) => {
  13  |     await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
  14  |       await route.fulfill({
  15  |         status: 200,
  16  |         contentType: 'application/json',
  17  |         body: JSON.stringify({
  18  |           quoteResponse: {
  19  |             result: [
  20  |               { symbol: 'NVDA', name: 'Nvidia Corporation', regularMarketPrice: 480.0, regularMarketChangePercent: 4.2, marketCap: 1200000000000, sector: 'Technology' }
  21  |             ]
  22  |           }
  23  |         })
  24  |       });
  25  |     });
  26  |     
  27  |     // Analyst opens app
  28  |     await pageObj.navigate();
  29  |     
  30  |     // views US Tech sector
> 31  |     await expect(pageObj.getSectorContainer('technology')).toBeVisible();
      |                                                            ^ Error: expect(locator).toBeVisible() failed
  32  |     await expect(pageObj.getStockTile('NVDA')).toBeVisible();
  33  | 
  34  |     // toggles color theme to Chinese
  35  |     const initialTheme = await pageObj.getThemeStyle();
  36  |     if (initialTheme !== 'chinese') {
  37  |       await pageObj.toggleColorTheme();
  38  |     }
  39  |     expect(await pageObj.getThemeStyle()).toBe('chinese');
  40  | 
  41  |     // searches for Nvidia
  42  |     await pageObj.search('Nvidia');
  43  |     expect(await pageObj.getHighlightedState('NVDA')).toBe('true');
  44  | 
  45  |     // checks tooltip details
  46  |     await pageObj.hoverStock('NVDA');
  47  |     await expect(pageObj.tooltipContainer).toBeVisible();
  48  |     await expect(pageObj.getTooltipField('name')).toHaveText('Nvidia Corporation');
  49  |     await expect(pageObj.getTooltipField('symbol')).toHaveText('NVDA');
  50  |   });
  51  | 
  52  |   // T4.2 (The Global Investor)
  53  |   test('T4.2: The Global Investor workflow', async ({ page }) => {
  54  |     let hkCallCount = 0;
  55  |     
  56  |     await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
  57  |       if (route.request().url().toLowerCase().includes('0700.hk') || hkCallCount > 0 || route.request().url().toLowerCase().includes('market=hk') || route.request().url().toLowerCase().includes('type=hk') || route.request().url().toLowerCase().includes('hk')) {
  58  |         hkCallCount++;
  59  |         // Simulate API failure for HK market
  60  |         await route.fulfill({ status: 500 });
  61  |       } else {
  62  |         // Success for US
  63  |         await route.fulfill({
  64  |           status: 200,
  65  |           contentType: 'application/json',
  66  |           body: JSON.stringify({
  67  |             quoteResponse: {
  68  |               result: [
  69  |                 { symbol: 'AAPL', name: 'Apple', regularMarketPrice: 150.0, regularMarketChangePercent: 1.5, marketCap: 3000000000000, sector: 'Technology' }
  70  |               ]
  71  |             }
  72  |           })
  73  |         });
  74  |       }
  75  |     });
  76  | 
  77  |     // Investor starts in US market (live API)
  78  |     await pageObj.navigate();
  79  |     expect(await pageObj.getDataSource()).toBe('live');
  80  | 
  81  |     // switches to HK market, experiences API failure, fallback banner alerts them
  82  |     await pageObj.selectHkMarket();
  83  |     expect(await pageObj.getDataSource()).toBe('mock');
  84  |     const statusText = await pageObj.getDataStatusText();
  85  |     expect(statusText.toLowerCase()).toContain('fallback');
  86  | 
  87  |     // they search for Tencent
  88  |     await pageObj.search('Tencent');
  89  | 
  90  |     // hover to view details in HKD
  91  |     // Assuming HK fallback has 0700.HK (Tencent)
  92  |     await pageObj.hoverStock('0700.HK');
  93  |     await expect(pageObj.tooltipContainer).toBeVisible();
  94  |     const priceText = await pageObj.getTooltipField('price').innerText();
  95  |     expect(priceText).toContain('HK$');
  96  | 
  97  |     // then switch back to US
  98  |     await pageObj.selectUsMarket();
  99  |     await expect(pageObj.getStockTile('AAPL')).toBeVisible();
  100 |   });
  101 | 
  102 |   // T4.3 (The Market Rally)
  103 |   test('T4.3: The Market Rally workflow', async ({ page }) => {
  104 |     await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
  105 |       await route.fulfill({
  106 |         status: 200,
  107 |         contentType: 'application/json',
  108 |         body: JSON.stringify({
  109 |           quoteResponse: {
  110 |             result: [
  111 |               { symbol: 'AAPL', regularMarketPrice: 150.0, regularMarketChangePercent: 2.5, marketCap: 1000000, sector: 'Technology' },
  112 |               { symbol: 'MSFT', regularMarketPrice: 400.0, regularMarketChangePercent: 1.8, marketCap: 1000000, sector: 'Technology' }
  113 |             ]
  114 |           }
  115 |         })
  116 |       });
  117 |     });
  118 |     await pageObj.navigate();
  119 | 
  120 |     // Toggled between Chinese and International style
  121 |     const theme1 = await pageObj.getThemeStyle();
  122 |     if (theme1 !== 'chinese') await pageObj.toggleColorTheme();
  123 |     
  124 |     // validating the overall canvas turns entirely red (Chinese)
  125 |     await expect(pageObj.getStockTile('AAPL')).toHaveAttribute('data-trend-color', 'up');
  126 |     await expect(pageObj.getStockTile('MSFT')).toHaveAttribute('data-trend-color', 'up');
  127 | 
  128 |     // and then entirely green (International)
  129 |     await pageObj.toggleColorTheme();
  130 |     await expect(pageObj.getStockTile('AAPL')).toHaveAttribute('data-trend-color', 'up');
  131 |     await expect(pageObj.getStockTile('MSFT')).toHaveAttribute('data-trend-color', 'up');
```