# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: t1_feature_coverage.spec.ts >> Tier 1 - Feature Coverage >> T1.9: Verify correct symbols are displayed for US
- Location: tests\e2e\specs\t1_feature_coverage.spec.ts:146:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="stock-tile-MSFT"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-testid="stock-tile-MSFT"]')

```

```yaml
- banner:
  - heading "Stock Market Cloud" [level=1]
  - paragraph: Real-time heat-map visualization · Auto-refreshes every 10s
  - text: "Live Mode Success. Last Updated: 11:27:32 PM"
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
  66  |       await expect(header).toBeVisible();
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
> 149 |     await expect(pageObj.getStockTile('MSFT')).toBeVisible();
      |                                                ^ Error: expect(locator).toBeVisible() failed
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
  167 |       await route.fulfill({ status: 500 });
  168 |     });
  169 |     // Reload page to trigger failure
  170 |     await page.reload();
  171 |     const source = await pageObj.getDataSource();
  172 |     expect(source).toBe('mock');
  173 |   });
  174 | 
  175 |   test('T1.13: Verify mock data indicator is displayed when in fallback mode', async ({ page }) => {
  176 |     await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
  177 |       await route.fulfill({ status: 500 });
  178 |     });
  179 |     await page.reload();
  180 |     const source = await pageObj.getDataSource();
  181 |     expect(source).toBe('mock');
  182 |   });
  183 | 
  184 |   test('T1.14: Verify api indicator is displayed when in live mode', async () => {
  185 |     const source = await pageObj.getDataSource();
  186 |     expect(source).toBe('live');
  187 |   });
  188 | 
  189 |   test('T1.15: Verify mock data has valid values', async ({ page }) => {
  190 |     await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
  191 |       await route.fulfill({ status: 500 });
  192 |     });
  193 |     await page.reload();
  194 |     await pageObj.waitForLoad();
  195 |     // Hover a tile to check tooltip values
  196 |     await pageObj.hoverStock('AAPL');
  197 |     await expect(pageObj.tooltipContainer).toBeVisible();
  198 |     
  199 |     const priceText = await pageObj.getTooltipField('price').innerText();
  200 |     const capText = await pageObj.getTooltipField('market-cap').innerText();
  201 |     const changeText = await pageObj.getTooltipField('change').innerText();
  202 |     
  203 |     expect(parseFloat(priceText.replace(/[^0-9.-]/g, ''))).toBeGreaterThan(0);
  204 |     expect(parseFloat(capText.replace(/[^0-9.-]/g, ''))).toBeGreaterThan(0);
  205 |     expect(changeText).not.toBe('');
  206 |   });
  207 | 
  208 |   // T1.16-1.20: Hover Tooltip
  209 |   test('T1.16: Hover over US tile and verify tooltip appears', async () => {
  210 |     await pageObj.selectUsMarket();
  211 |     await pageObj.hoverStock('AAPL');
  212 |     await expect(pageObj.tooltipContainer).toBeVisible();
  213 |   });
  214 | 
  215 |   test('T1.17: Hover over HK tile and verify tooltip appears', async () => {
  216 |     await pageObj.selectHkMarket();
  217 |     await pageObj.hoverStock('0700.HK');
  218 |     await expect(pageObj.tooltipContainer).toBeVisible();
  219 |   });
  220 | 
  221 |   test('T1.18: Verify tooltip displays full company name, price, change %, market cap, symbol', async () => {
  222 |     await pageObj.hoverStock('AAPL');
  223 |     await expect(pageObj.getTooltipField('symbol')).toBeVisible();
  224 |     await expect(pageObj.getTooltipField('name')).toBeVisible();
  225 |     await expect(pageObj.getTooltipField('price')).toBeVisible();
  226 |     await expect(pageObj.getTooltipField('change')).toBeVisible();
  227 |     await expect(pageObj.getTooltipField('market-cap')).toBeVisible();
  228 |   });
  229 | 
  230 |   test('T1.19: Hover away from tile and verify tooltip disappears', async () => {
  231 |     await pageObj.hoverStock('AAPL');
  232 |     await expect(pageObj.tooltipContainer).toBeVisible();
  233 |     // Hover over legend or header to move mouse away
  234 |     await pageObj.colorLegend.hover();
  235 |     await expect(pageObj.tooltipContainer).toBeHidden();
  236 |   });
  237 | 
  238 |   test('T1.20: Move mouse from one tile to another and verify tooltip updates immediately', async () => {
  239 |     await pageObj.hoverStock('AAPL');
  240 |     const symbol1 = await pageObj.getTooltipField('symbol').innerText();
  241 |     expect(symbol1).toContain('AAPL');
  242 | 
  243 |     await pageObj.hoverStock('MSFT');
  244 |     const symbol2 = await pageObj.getTooltipField('symbol').innerText();
  245 |     expect(symbol2).toContain('MSFT');
  246 |   });
  247 | 
  248 |   // T1.21-1.25: Search Highlight
  249 |   test('T1.21: Enter query in search bar and verify matching tile is highlighted', async () => {
```