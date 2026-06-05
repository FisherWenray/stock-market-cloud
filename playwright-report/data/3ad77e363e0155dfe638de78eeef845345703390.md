# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: t4_workflows.spec.ts >> Tier 4 - Real-World Application Scenarios (Workflows) >> T4.2: The Global Investor workflow
- Location: tests\e2e\specs\t4_workflows.spec.ts:53:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "live"
Received: "mock"
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - heading "Stock Market Cloud" [level=1] [ref=e6]:
        - generic [ref=e7]: Stock Market Cloud
      - paragraph [ref=e8]: Real-time heat-map visualization · Auto-refreshes every 10s
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: Mock Mode
        - generic [ref=e15]: ⚠️ Sync Error (Fallback Active)
      - button "Refresh" [ref=e16] [cursor=pointer]
  - generic [ref=e17]:
    - generic [ref=e18]:
      - generic [ref=e19]:
        - generic [ref=e20]: Market
        - generic [ref=e21]:
          - button "US Market" [ref=e22] [cursor=pointer]
          - button "HK Market" [ref=e23] [cursor=pointer]
      - generic [ref=e24]:
        - generic [ref=e25]: Color System
        - generic [ref=e26]:
          - 'button "Theme Style: chinese (Red Up)" [ref=e27] [cursor=pointer]'
          - generic [ref=e28]:
            - generic [ref=e31]: Up (Red)
            - generic [ref=e34]: Down (Green)
            - generic [ref=e37]: Flat (Gray)
      - generic [ref=e38]:
        - generic [ref=e39]: Language
        - generic [ref=e40]:
          - button "中文" [ref=e41] [cursor=pointer]
          - button "English" [ref=e42] [cursor=pointer]
    - generic [ref=e43]:
      - generic [ref=e44]: Search Ticker or Name
      - textbox "Search e.g. AAPL, Tencent..." [ref=e46]
  - main [ref=e47]:
    - img [ref=e50]:
      - generic [ref=e51]:
        - generic: Industrials
        - generic [ref=e52] [cursor=pointer]:
          - generic: LMT
        - generic [ref=e54] [cursor=pointer]:
          - generic: MMM
        - generic [ref=e56] [cursor=pointer]:
          - generic: NSC
        - generic [ref=e58] [cursor=pointer]:
          - generic: TT
        - generic [ref=e60] [cursor=pointer]:
          - generic: FTV
        - generic [ref=e62] [cursor=pointer]:
          - generic: WAB
        - generic [ref=e64] [cursor=pointer]:
          - generic: EMR
        - generic [ref=e66] [cursor=pointer]:
          - generic: BA
        - generic [ref=e68] [cursor=pointer]:
          - generic: PH
        - generic [ref=e70] [cursor=pointer]:
          - generic: GWW
        - generic [ref=e72] [cursor=pointer]:
          - generic: HII
        - generic [ref=e74] [cursor=pointer]:
          - generic: AAL
        - generic [ref=e76] [cursor=pointer]:
          - generic: TDG
        - generic [ref=e78] [cursor=pointer]:
          - generic: ODFL
        - generic [ref=e80] [cursor=pointer]:
          - generic: CSX
        - generic [ref=e82] [cursor=pointer]:
          - generic: MAS
        - generic [ref=e84] [cursor=pointer]:
          - generic: GD
        - generic [ref=e86] [cursor=pointer]:
          - generic: ITW
        - generic [ref=e88] [cursor=pointer]:
          - generic: NLSN
        - generic [ref=e90] [cursor=pointer]:
          - generic: EXPD
        - generic [ref=e92] [cursor=pointer]:
          - generic: DAL
      - generic [ref=e200]:
        - generic: Consumer Discretionary
        - generic [ref=e201] [cursor=pointer]:
          - generic: DRI
        - generic [ref=e203] [cursor=pointer]:
          - generic: EBAY
        - generic [ref=e205] [cursor=pointer]:
          - generic: BBY
        - generic [ref=e207] [cursor=pointer]:
          - generic: GPC
        - generic [ref=e209] [cursor=pointer]:
          - generic: ULTA
        - generic [ref=e211] [cursor=pointer]:
          - generic: AAP
        - generic [ref=e213] [cursor=pointer]:
          - generic: GPS
        - generic [ref=e215] [cursor=pointer]:
          - generic: POOL
        - generic [ref=e217] [cursor=pointer]:
          - generic: LEG
        - generic [ref=e219] [cursor=pointer]:
          - generic: HAS
        - generic [ref=e221] [cursor=pointer]:
          - generic: KMX
        - generic [ref=e223] [cursor=pointer]:
          - generic: DG
        - generic [ref=e225] [cursor=pointer]:
          - generic: ETSY
        - generic [ref=e227] [cursor=pointer]:
          - generic: DPZ
        - generic [ref=e229] [cursor=pointer]:
          - generic: CMG
        - generic [ref=e231] [cursor=pointer]:
          - generic: NVR
        - generic [ref=e233] [cursor=pointer]:
          - generic: RL
        - generic [ref=e235] [cursor=pointer]:
          - generic: CCL
      - generic [ref=e327]:
        - generic: Information Technology
        - generic [ref=e328] [cursor=pointer]:
          - generic: CDAY
        - generic [ref=e330] [cursor=pointer]:
          - generic: WU
        - generic [ref=e332] [cursor=pointer]:
          - generic: AVGO
        - generic [ref=e334] [cursor=pointer]:
          - generic: KEYS
        - generic [ref=e336] [cursor=pointer]:
          - generic: INTU
        - generic [ref=e338] [cursor=pointer]:
          - generic: GLW
        - generic [ref=e340] [cursor=pointer]:
          - generic: ANET
        - generic [ref=e342] [cursor=pointer]:
          - generic: CSCO
        - generic [ref=e344] [cursor=pointer]:
          - generic: SNPS
        - generic [ref=e346] [cursor=pointer]:
          - generic: ACN
        - generic [ref=e348] [cursor=pointer]:
          - generic: CDW
        - generic [ref=e350] [cursor=pointer]:
          - generic: PTC
        - generic [ref=e352] [cursor=pointer]:
          - generic: MSFT
        - generic [ref=e354] [cursor=pointer]:
          - generic: AKAM
      - generic [ref=e476]:
        - generic: Health Care
        - generic [ref=e477] [cursor=pointer]:
          - generic: GILD
        - generic [ref=e479] [cursor=pointer]:
          - generic: ABT
        - generic [ref=e481] [cursor=pointer]:
          - generic: OGN
        - generic [ref=e483] [cursor=pointer]:
          - generic: AMGN
        - generic [ref=e485] [cursor=pointer]:
          - generic: EW
        - generic [ref=e487] [cursor=pointer]:
          - generic: VRTX
        - generic [ref=e489] [cursor=pointer]:
          - generic: UHS
        - generic [ref=e491] [cursor=pointer]:
          - generic: WST
        - generic [ref=e493] [cursor=pointer]:
          - generic: MTD
        - generic [ref=e495] [cursor=pointer]:
          - generic: BMY
        - generic [ref=e497] [cursor=pointer]:
          - generic: DXCM
        - generic [ref=e499] [cursor=pointer]:
          - generic: LH
        - generic [ref=e515] [cursor=pointer]:
          - generic: IQV
        - generic [ref=e517] [cursor=pointer]:
          - generic: ISRG
        - generic [ref=e519] [cursor=pointer]:
          - generic: ABC
        - generic [ref=e521] [cursor=pointer]:
          - generic: HOLX
        - generic [ref=e523] [cursor=pointer]:
          - generic: HCA
        - generic [ref=e525] [cursor=pointer]:
          - generic: TMO
        - generic [ref=e527] [cursor=pointer]:
          - generic: COO
        - generic [ref=e529] [cursor=pointer]:
          - generic: CNC
      - generic [ref=e605]:
        - generic: Financials
        - generic [ref=e606] [cursor=pointer]:
          - generic: CB
        - generic [ref=e608] [cursor=pointer]:
          - generic: TFC
        - generic [ref=e610] [cursor=pointer]:
          - generic: NTRS
        - generic [ref=e612] [cursor=pointer]:
          - generic: MKTX
        - generic [ref=e614] [cursor=pointer]:
          - generic: WFC
        - generic [ref=e616] [cursor=pointer]:
          - generic: USB
        - generic [ref=e618] [cursor=pointer]:
          - generic: GS
        - generic [ref=e620] [cursor=pointer]:
          - generic: WLTW
        - generic [ref=e622] [cursor=pointer]:
          - generic: MCO
        - generic [ref=e624] [cursor=pointer]:
          - generic: MET
        - generic [ref=e626] [cursor=pointer]:
          - generic: SYF
        - generic [ref=e628] [cursor=pointer]:
          - generic: BEN
        - generic [ref=e630] [cursor=pointer]:
          - generic: TRV
        - generic [ref=e644] [cursor=pointer]:
          - generic: ICE
        - generic [ref=e646] [cursor=pointer]:
          - generic: AON
        - generic [ref=e648] [cursor=pointer]:
          - generic: ALL
        - generic [ref=e650] [cursor=pointer]:
          - generic: IVZ
        - generic [ref=e652] [cursor=pointer]:
          - generic: BRO
        - generic [ref=e654] [cursor=pointer]:
          - generic: AJG
      - generic [ref=e736]:
        - generic: Consumer Staples
        - generic [ref=e737] [cursor=pointer]:
          - generic: STZ
        - generic [ref=e739] [cursor=pointer]:
          - generic: TAP
        - generic [ref=e741] [cursor=pointer]:
          - generic: PM
        - generic [ref=e743] [cursor=pointer]:
          - generic: CPB
        - generic [ref=e745] [cursor=pointer]:
          - generic: TSN
        - generic [ref=e747] [cursor=pointer]:
          - generic: MKC
      - generic [ref=e801]:
        - generic: Communication Services
        - generic [ref=e802] [cursor=pointer]:
          - generic: ATVI
        - generic [ref=e804] [cursor=pointer]:
          - generic: LYV
        - generic [ref=e806] [cursor=pointer]:
          - generic: TTWO
        - generic [ref=e808] [cursor=pointer]:
          - generic: DISH
        - generic [ref=e810] [cursor=pointer]:
          - generic: NFLX
        - generic [ref=e812] [cursor=pointer]:
          - generic: EA
      - generic [ref=e856]:
        - generic: Utilities
      - generic [ref=e913]:
        - generic: Materials
      - generic [ref=e970]:
        - generic: Real Estate
        - generic [ref=e971] [cursor=pointer]:
          - generic: CBRE
        - generic [ref=e973] [cursor=pointer]:
          - generic: VTR
        - generic [ref=e975] [cursor=pointer]:
          - generic: PEAK
      - generic [ref=e1029]:
        - generic: Energy
        - generic [ref=e1030] [cursor=pointer]:
          - generic: FANG
        - generic [ref=e1036] [cursor=pointer]:
          - generic: OKE
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
  31  |     await expect(pageObj.getSectorContainer('technology')).toBeVisible();
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
> 79  |     expect(await pageObj.getDataSource()).toBe('live');
      |                                           ^ Error: expect(received).toBe(expected) // Object.is equality
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
  132 |   });
  133 | 
  134 |   // T4.4 (The High-Resolution Boardroom)
  135 |   test('T4.4: The High-Resolution Boardroom workflow', async ({ page }) => {
  136 |     await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
  137 |       await route.fulfill({
  138 |         status: 200,
  139 |         contentType: 'application/json',
  140 |         body: JSON.stringify({
  141 |           quoteResponse: {
  142 |             result: [
  143 |               { symbol: 'AAPL', regularMarketPrice: 150.0, regularMarketChangePercent: 1.5, marketCap: 3000000000000, sector: 'Technology' }
  144 |             ]
  145 |           }
  146 |         })
  147 |       });
  148 |     });
  149 | 
  150 |     // Rendered on large screen (4K)
  151 |     await page.setViewportSize({ width: 3840, height: 2160 });
  152 |     await pageObj.navigate();
  153 |     const containerBox4k = await pageObj.treemapContainer.boundingBox();
  154 |     expect(containerBox4k!.width).toBeGreaterThan(1200);
  155 | 
  156 |     // Simulated on mobile device (375px width)
  157 |     await page.setViewportSize({ width: 375, height: 667 });
  158 |     // Wait for the container to resize in the DOM
  159 |     await page.waitForFunction(() => {
  160 |       const el = document.querySelector('[data-testid="treemap-container"]');
  161 |       return el && el.getBoundingClientRect().width <= 375;
  162 |     }, null, { timeout: 5000 });
  163 |     // Verify layout adapts (responsive classes like flex-col or stack cleanly)
  164 |     const containerBoxMobile = await pageObj.treemapContainer.boundingBox();
  165 |     expect(containerBoxMobile!.width).toBeLessThanOrEqual(375);
  166 |   });
  167 | 
  168 |   // T4.5 (End-to-End Stress Test)
  169 |   test('T4.5: End-to-End Stress Test workflow', async ({ page }) => {
  170 |     // 1. Initial route mock (succeeds)
  171 |     await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
  172 |       await route.fulfill({
  173 |         status: 200,
  174 |         contentType: 'application/json',
  175 |         body: JSON.stringify({
  176 |           quoteResponse: {
  177 |             result: [
  178 |               { symbol: 'AAPL', regularMarketPrice: 150.0, regularMarketChangePercent: 1.5, marketCap: 3000000000000, sector: 'Technology' }
  179 |             ]
```