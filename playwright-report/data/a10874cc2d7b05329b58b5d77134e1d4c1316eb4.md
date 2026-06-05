# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: t1_feature_coverage.spec.ts >> Tier 1 - Feature Coverage >> T1.23: Enter non-matching query and verify no tiles are highlighted
- Location: tests\e2e\specs\t1_feature_coverage.spec.ts:264:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.getAttribute: Test timeout of 30000ms exceeded.
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
        - generic [ref=e15]: "Success. Last Updated: 11:28:00 PM"
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
      - generic [ref=e45]:
        - textbox "Search e.g. AAPL, Tencent..." [active] [ref=e46]: XYZNONMATCHING
        - button "Clear" [ref=e47] [cursor=pointer]
  - main [ref=e48]:
    - img [ref=e51]:
      - generic [ref=e52]:
        - generic: Information Technology
        - generic [ref=e53] [cursor=pointer]:
          - generic: AAPL
          - generic: +2.50%
      - generic [ref=e55]:
        - generic: Financials
        - generic [ref=e56] [cursor=pointer]:
          - generic: JPM
          - generic: "-1.20%"
      - generic [ref=e58]:
        - generic: Energy
        - generic [ref=e59] [cursor=pointer]:
          - generic: XOM
          - generic: "-2.10%"
      - generic [ref=e61]:
        - generic: Health Care
        - generic [ref=e62] [cursor=pointer]:
          - generic: JNJ
          - generic: "-0.30%"
```

# Test source

```ts
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
  84  |     await tile.hover();
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
> 149 |     const val = await tile.getAttribute('data-highlighted');
      |                            ^ Error: locator.getAttribute: Test timeout of 30000ms exceeded.
  150 |     if (val === 'true' || val === 'false') {
  151 |       return val;
  152 |     }
  153 |     return null;
  154 |   }
  155 | }
  156 | 
```