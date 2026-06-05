import { Page, Locator } from '@playwright/test';

export class StockMarketPage {
  readonly page: Page;
  readonly usMarketTab: Locator;
  readonly hkMarketTab: Locator;
  readonly treemapContainer: Locator;
  readonly colorThemeToggle: Locator;
  readonly colorLegend: Locator;
  readonly searchInput: Locator;
  readonly tooltipContainer: Locator;
  readonly dataStatusIndicator: Locator;
  readonly dataSourceIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usMarketTab = page.locator('[data-testid="market-tab-us"]');
    this.hkMarketTab = page.locator('[data-testid="market-tab-hk"]');
    this.treemapContainer = page.locator('[data-testid="treemap-container"]');
    this.colorThemeToggle = page.locator('[data-testid="theme-toggle"]');
    this.colorLegend = page.locator('[data-testid="color-legend"]');
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.tooltipContainer = page.locator('[data-testid="stock-tooltip"]');
    this.dataStatusIndicator = page.locator('[data-testid="data-status-indicator"]');
    this.dataSourceIndicator = page.locator('[data-testid="data-source-indicator"]');
  }

  async navigate(wait = true) {
    await this.page.addInitScript(() => {
      window.localStorage.setItem('lang', 'en');
    });
    await this.page.goto('/');
    if (wait) {
      await this.waitForLoad();
    }
  }

  async selectUsMarket() {
    await this.usMarketTab.click();
    await this.waitForLoad();
  }

  async selectHkMarket() {
    await this.hkMarketTab.click();
    await this.waitForLoad();
  }

  async waitForLoad() {
    // 1. Wait for loading to start (status text contains 'Syncing')
    try {
      await this.page.waitForFunction(() => {
        const el = document.querySelector('[data-testid="data-status-indicator"]');
        return el && el.textContent && el.textContent.includes('Syncing');
      }, null, { timeout: 1000 });
    } catch (e) {
      // If loading is super fast and it never showed 'Syncing' in the DOM, ignore timeout
    }

    // 2. Wait for loading to complete (status text contains Success, Error, or Fallback and does not contain Syncing)
    await this.page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="data-status-indicator"]');
      if (!el) return false;
      const text = el.textContent || '';
      return !text.includes('Syncing') && (text.includes('Success') || text.includes('Error') || text.includes('Fallback'));
    }, null, { timeout: 15000 });
  }

  async toggleColorTheme() {
    await this.colorThemeToggle.dispatchEvent('click');
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(150);
  }

  async clearSearch() {
    await this.searchInput.fill('');
    await this.page.waitForTimeout(150);
  }

  async hoverStock(symbol: string) {
    const tile = this.getStockTile(symbol);
    await tile.hover();
  }

  async getThemeStyle(): Promise<'chinese' | 'international' | null> {
    // Check if there is an element with data-theme-style attribute
    const styleAttr = await this.page.locator('[data-theme-style]').first().getAttribute('data-theme-style');
    if (styleAttr === 'chinese' || styleAttr === 'international') {
      return styleAttr;
    }
    // Alternatively, verify text content of the theme indicator/toggle
    const toggleText = await this.colorThemeToggle.innerText();
    if (toggleText.toLowerCase().includes('chinese')) {
      return 'chinese';
    } else if (toggleText.toLowerCase().includes('international')) {
      return 'international';
    }
    return null;
  }

  getStockTile(symbol: string): Locator {
    return this.page.locator(`[data-testid="stock-tile-${symbol}"]`);
  }

  getStockSymbolText(symbol: string): Locator {
    return this.page.locator(`[data-testid="stock-symbol-${symbol}"]`);
  }

  getStockChangeText(symbol: string): Locator {
    return this.page.locator(`[data-testid="stock-change-${symbol}"]`);
  }

  getSectorContainer(sectorName: string): Locator {
    // sectorName should be lowercase (e.g. 'technology', 'finance', 'consumer', 'healthcare', 'energy')
    return this.page.locator(`[data-testid="treemap-sector-${sectorName.toLowerCase()}"]`);
  }

  getSectorHeader(sectorName: string): Locator {
    return this.page.locator(`[data-testid="treemap-sector-title-${sectorName.toLowerCase()}"]`);
  }

  getTooltipField(field: 'symbol' | 'name' | 'price' | 'change' | 'market-cap'): Locator {
    return this.page.locator(`[data-testid="tooltip-${field}"]`);
  }

  async getDataStatusText(): Promise<string> {
    return (await this.dataStatusIndicator.textContent()) || '';
  }

  async getDataSource(): Promise<'live' | 'mock' | null> {
    // First, check for the data-source attribute
    const attr = await this.dataSourceIndicator.getAttribute('data-source');
    if (attr === 'live' || attr === 'mock') {
      return attr;
    }
    // Next, check the text content
    const text = await this.dataSourceIndicator.textContent();
    if (text) {
      if (text.toLowerCase().includes('live')) return 'live';
      if (text.toLowerCase().includes('mock')) return 'mock';
    }
    return null;
  }

  async getHighlightedState(symbol: string): Promise<'true' | 'false' | null> {
    const tile = this.getStockTile(symbol);
    const val = await tile.getAttribute('data-highlighted');
    if (val === 'true' || val === 'false') {
      return val;
    }
    return null;
  }
}
