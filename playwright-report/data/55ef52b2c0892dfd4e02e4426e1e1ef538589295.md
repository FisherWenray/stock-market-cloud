# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: t1_feature_coverage.spec.ts >> Tier 1 - Feature Coverage >> T1.20: Move mouse from one tile to another and verify tooltip updates immediately
- Location: tests\e2e\specs\t1_feature_coverage.spec.ts:238:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.hover: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-testid="stock-tile-MSFT"]')

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
        - generic [ref=e12]: Live Mode
        - generic [ref=e15]: "Success. Last Updated: 11:27:58 PM"
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
    - generic [ref=e48]:
      - img [ref=e50]:
        - generic [ref=e51]:
          - generic: Information Technology
          - generic [ref=e52] [cursor=pointer]:
            - generic: AAPL
            - generic: +2.50%
        - generic [ref=e54]:
          - generic: Financials
          - generic [ref=e55] [cursor=pointer]:
            - generic: JPM
            - generic: "-1.20%"
        - generic [ref=e57]:
          - generic: Energy
          - generic [ref=e58] [cursor=pointer]:
            - generic: XOM
            - generic: "-2.10%"
        - generic [ref=e60]:
          - generic: Health Care
          - generic [ref=e61] [cursor=pointer]:
            - generic: JNJ
            - generic: "-0.30%"
      - generic:
        - generic:
          - generic: AAPL
          - generic: Apple Inc.
        - generic:
          - generic:
            - generic: "Price:"
            - generic: $150.00
          - generic:
            - generic: "Change:"
            - generic: +2.50%
          - generic:
            - generic: "Market Cap:"
            - generic: $3.00T
          - generic:
            - generic: "Sector:"
            - generic: Information Technology
```

# Test source

```ts
  1   | import { Page, Locator } from '@playwright/test';
  2   | 
  3   | export class StockMarketPage {
  4   |   readonly page: Page;
  5   |   readonly usMarketTab: Locator;
  6   |   readonly hkMarketTab: Locator;
  7   |   readonly treemapContainer: Locator;
  8   |   readonly colorThemeToggle: Locator;
  9   |   readonly colorLegend: Locator;
  10  |   readonly searchInput: Locator;
  11  |   readonly tooltipContainer: Locator;
  12  |   readonly dataStatusIndicator: Locator;
  13  |   readonly dataSourceIndicator: Locator;
  14  | 
  15  |   constructor(page: Page) {
  16  |     this.page = page;
  17  |     this.usMarketTab = page.locator('[data-testid="market-tab-us"]');
  18  |     this.hkMarketTab = page.locator('[data-testid="market-tab-hk"]');
  19  |     this.treemapContainer = page.locator('[data-testid="treemap-container"]');
  20  |     this.colorThemeToggle = page.locator('[data-testid="theme-toggle"]');
  21  |     this.colorLegend = page.locator('[data-testid="color-legend"]');
  22  |     this.searchInput = page.locator('[data-testid="search-input"]');
  23  |     this.tooltipContainer = page.locator('[data-testid="stock-tooltip"]');
  24  |     this.dataStatusIndicator = page.locator('[data-testid="data-status-indicator"]');
  25  |     this.dataSourceIndicator = page.locator('[data-testid="data-source-indicator"]');
  26  |   }
  27  | 
  28  |   async navigate(wait = true) {
  29  |     await this.page.addInitScript(() => {
  30  |       window.localStorage.setItem('lang', 'en');
  31  |     });
  32  |     await this.page.goto('/');
  33  |     if (wait) {
  34  |       await this.waitForLoad();
  35  |     }
  36  |   }
  37  | 
  38  |   async selectUsMarket() {
  39  |     await this.usMarketTab.click();
  40  |     await this.waitForLoad();
  41  |   }
  42  | 
  43  |   async selectHkMarket() {
  44  |     await this.hkMarketTab.click();
  45  |     await this.waitForLoad();
  46  |   }
  47  | 
  48  |   async waitForLoad() {
  49  |     // 1. Wait for loading to start (status text contains 'Syncing')
  50  |     try {
  51  |       await this.page.waitForFunction(() => {
  52  |         const el = document.querySelector('[data-testid="data-status-indicator"]');
  53  |         return el && el.textContent && el.textContent.includes('Syncing');
  54  |       }, null, { timeout: 1000 });
  55  |     } catch (e) {
  56  |       // If loading is super fast and it never showed 'Syncing' in the DOM, ignore timeout
  57  |     }
  58  | 
  59  |     // 2. Wait for loading to complete (status text contains Success, Error, or Fallback and does not contain Syncing)
  60  |     await this.page.waitForFunction(() => {
  61  |       const el = document.querySelector('[data-testid="data-status-indicator"]');
  62  |       if (!el) return false;
  63  |       const text = el.textContent || '';
  64  |       return !text.includes('Syncing') && (text.includes('Success') || text.includes('Error') || text.includes('Fallback'));
  65  |     }, null, { timeout: 15000 });
  66  |   }
  67  | 
  68  |   async toggleColorTheme() {
  69  |     await this.colorThemeToggle.dispatchEvent('click');
  70  |   }
  71  | 
  72  |   async search(query: string) {
  73  |     await this.searchInput.fill(query);
  74  |     await this.page.waitForTimeout(150);
  75  |   }
  76  | 
  77  |   async clearSearch() {
  78  |     await this.searchInput.fill('');
  79  |     await this.page.waitForTimeout(150);
  80  |   }
  81  | 
  82  |   async hoverStock(symbol: string) {
  83  |     const tile = this.getStockTile(symbol);
> 84  |     await tile.hover();
      |                ^ Error: locator.hover: Test timeout of 30000ms exceeded.
  85  |   }
  86  | 
  87  |   async getThemeStyle(): Promise<'chinese' | 'international' | null> {
  88  |     // Check if there is an element with data-theme-style attribute
  89  |     const styleAttr = await this.page.locator('[data-theme-style]').first().getAttribute('data-theme-style');
  90  |     if (styleAttr === 'chinese' || styleAttr === 'international') {
  91  |       return styleAttr;
  92  |     }
  93  |     // Alternatively, verify text content of the theme indicator/toggle
  94  |     const toggleText = await this.colorThemeToggle.innerText();
  95  |     if (toggleText.toLowerCase().includes('chinese')) {
  96  |       return 'chinese';
  97  |     } else if (toggleText.toLowerCase().includes('international')) {
  98  |       return 'international';
  99  |     }
  100 |     return null;
  101 |   }
  102 | 
  103 |   getStockTile(symbol: string): Locator {
  104 |     return this.page.locator(`[data-testid="stock-tile-${symbol}"]`);
  105 |   }
  106 | 
  107 |   getStockSymbolText(symbol: string): Locator {
  108 |     return this.page.locator(`[data-testid="stock-symbol-${symbol}"]`);
  109 |   }
  110 | 
  111 |   getStockChangeText(symbol: string): Locator {
  112 |     return this.page.locator(`[data-testid="stock-change-${symbol}"]`);
  113 |   }
  114 | 
  115 |   getSectorContainer(sectorName: string): Locator {
  116 |     // sectorName should be lowercase (e.g. 'technology', 'finance', 'consumer', 'healthcare', 'energy')
  117 |     return this.page.locator(`[data-testid="treemap-sector-${sectorName.toLowerCase()}"]`);
  118 |   }
  119 | 
  120 |   getSectorHeader(sectorName: string): Locator {
  121 |     return this.page.locator(`[data-testid="treemap-sector-title-${sectorName.toLowerCase()}"]`);
  122 |   }
  123 | 
  124 |   getTooltipField(field: 'symbol' | 'name' | 'price' | 'change' | 'market-cap'): Locator {
  125 |     return this.page.locator(`[data-testid="tooltip-${field}"]`);
  126 |   }
  127 | 
  128 |   async getDataStatusText(): Promise<string> {
  129 |     return (await this.dataStatusIndicator.textContent()) || '';
  130 |   }
  131 | 
  132 |   async getDataSource(): Promise<'live' | 'mock' | null> {
  133 |     // First, check for the data-source attribute
  134 |     const attr = await this.dataSourceIndicator.getAttribute('data-source');
  135 |     if (attr === 'live' || attr === 'mock') {
  136 |       return attr;
  137 |     }
  138 |     // Next, check the text content
  139 |     const text = await this.dataSourceIndicator.textContent();
  140 |     if (text) {
  141 |       if (text.toLowerCase().includes('live')) return 'live';
  142 |       if (text.toLowerCase().includes('mock')) return 'mock';
  143 |     }
  144 |     return null;
  145 |   }
  146 | 
  147 |   async getHighlightedState(symbol: string): Promise<'true' | 'false' | null> {
  148 |     const tile = this.getStockTile(symbol);
  149 |     const val = await tile.getAttribute('data-highlighted');
  150 |     if (val === 'true' || val === 'false') {
  151 |       return val;
  152 |     }
  153 |     return null;
  154 |   }
  155 | }
  156 | 
```