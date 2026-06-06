import { test, expect } from '@playwright/test';
import { StockMarketPage } from '../page-objects/StockMarketPage';

test.describe('Tier 1 - Feature Coverage', () => {
  let pageObj: StockMarketPage;

  test.beforeEach(async ({ page }) => {
    pageObj = new StockMarketPage(page);
    // Standard mock for successful API calls
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      const reqUrl = route.request().url();
      const isHk = reqUrl.includes('type=HK') || reqUrl.includes('hk0');
      const stocksList = isHk ? [
        { symbol: '00700.HK', name: 'Tencent', regularMarketPrice: 380.0, regularMarketChangePercent: 1.85, marketCap: 3580000000000, sector: 'Technology' },
        { symbol: '9988.HK', name: 'Alibaba', regularMarketPrice: 78.0, regularMarketChangePercent: -0.9, marketCap: 1620000000000, sector: 'Technology' },
        { symbol: '0005.HK', name: 'HSBC', regularMarketPrice: 68.0, regularMarketChangePercent: 0.5, marketCap: 1280000000000, sector: 'Finance' },
        { symbol: '9633.HK', name: 'Nongfu', regularMarketPrice: 42.0, regularMarketChangePercent: -1.15, marketCap: 470000000000, sector: 'Consumer' },
        { symbol: '2269.HK', name: 'Wuxi', regularMarketPrice: 12.0, regularMarketChangePercent: -3.8, marketCap: 53000000000, sector: 'Healthcare' },
        { symbol: '0857.HK', name: 'PetroChina', regularMarketPrice: 7.2, regularMarketChangePercent: 1.65, marketCap: 1320000000000, sector: 'Energy' }
      ] : [
        { symbol: 'AAPL', name: 'Apple Inc.', regularMarketPrice: 150.0, regularMarketChangePercent: 2.5, marketCap: 3000000000000, sector: 'Technology' },
        { symbol: 'MSFT', name: 'Microsoft Corp.', regularMarketPrice: 400.0, regularMarketChangePercent: 1.8, marketCap: 2800000000000, sector: 'Technology' },
        { symbol: 'JPM', name: 'JPMorgan Chase & Co.', regularMarketPrice: 170.0, regularMarketChangePercent: -1.2, marketCap: 500000000000, sector: 'Finance' },
        { symbol: 'PG', name: 'Procter & Gamble Co.', regularMarketPrice: 150.0, regularMarketChangePercent: 0.5, marketCap: 350000000000, sector: 'Consumer' },
        { symbol: 'JNJ', name: 'Johnson & Johnson', regularMarketPrice: 160.0, regularMarketChangePercent: -0.3, marketCap: 400000000000, sector: 'Healthcare' },
        { symbol: 'XOM', name: 'Exxon Mobil Corp.', regularMarketPrice: 110.0, regularMarketChangePercent: -2.1, marketCap: 450000000000, sector: 'Energy' }
      ];

      let filteredStocks = stocksList;
      const qMatch = reqUrl.match(/q=([^&]+)/);
      if (qMatch) {
        const requested = qMatch[1].split(',').map(s => s.replace(/^us/, '').replace(/^hk/, ''));
        filteredStocks = stocksList.filter(s => {
          const numPart = s.symbol.split('.')[0];
          return requested.some(r => r === s.symbol || r === numPart || Number(r) === Number(numPart));
        });
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          c: 150.0, dp: 2.5,
          quoteResponse: {
            result: filteredStocks
          }
        })
      });
    });
    await pageObj.navigate();
    // Wait for initial data load to avoid loading states during test runs
    await page.waitForSelector('[data-testid="data-status-indicator"]:has-text("Success")');
  });

  // T1.1-1.5: Treemap Render
  test('T1.1: Render sectors', async () => {
    for (const sector of ['information technology', 'financials', 'consumer staples', 'health care', 'energy']) {
      const container = pageObj.getSectorContainer(sector);
      await expect(container).toBeVisible();
    }
  });

  test('T1.2: Verify sector grouping headings are displayed', async () => {
    for (const sector of ['information technology', 'financials', 'consumer staples', 'health care', 'energy']) {
      const header = pageObj.getSectorHeader(sector);
      await expect(header).toBeVisible();
      const text = await header.textContent();
      expect(text ? text.toLowerCase() : '').toContain(sector);
    }
  });

  test('T1.3: Verify relative size of tiles matches relative market cap', async () => {
    // AAPL cap is 3T, JPM is 500B, so AAPL tile should be larger than JPM tile
    const aaplTile = pageObj.getStockTile('AAPL');
    const jpmTile = pageObj.getStockTile('JPM');
    
    await expect(aaplTile).toBeVisible();
    await expect(jpmTile).toBeVisible();
    
    const aaplBox = await aaplTile.boundingBox();
    const jpmBox = await jpmTile.boundingBox();
    
    expect(aaplBox).not.toBeNull();
    expect(jpmBox).not.toBeNull();
    
    const aaplArea = aaplBox!.width * aaplBox!.height;
    const jpmArea = jpmBox!.width * jpmBox!.height;
    
    expect(aaplArea).toBeGreaterThan(jpmArea);
  });

  test('T1.4: Verify all tiles have symbol and change percentage text visible', async () => {
    const symbols = ['AAPL', 'MSFT', 'JPM'];
    for (const sym of symbols) {
      const symText = pageObj.getStockSymbolText(sym);
      const changeText = pageObj.getStockChangeText(sym);
      await expect(symText).toBeVisible();
      await expect(changeText).toBeVisible();
      // symbol text should contain the symbol name
      await expect(symText).toHaveText(sym);
    }
  });

  test('T1.5: Verify responsiveness of the treemap layout when resizing the container', async () => {
    const tile = pageObj.getStockTile('AAPL');
    const initialBox = await tile.boundingBox();
    expect(initialBox).not.toBeNull();

    // Resize viewport
    await pageObj.page.setViewportSize({ width: 600, height: 800 });
    // Wait briefly for layout re-render
    await pageObj.page.waitForTimeout(500);

    const resizedBox = await tile.boundingBox();
    expect(resizedBox).not.toBeNull();
    // Bounding box should change due to viewport resize
    expect(resizedBox!.width).not.toEqual(initialBox!.width);
  });

  // T1.6-1.10: Dual Market
  test('T1.6: Switch from US to HK', async () => {
    await pageObj.selectHkMarket();
    // HK market tab should be active/selected, and HK stocks visible (e.g. 00700.HK)
    await expect(pageObj.hkMarketTab).toHaveAttribute('data-active', 'true');
  });

  test('T1.7: Switch from HK to US', async () => {
    await pageObj.selectHkMarket();
    await pageObj.selectUsMarket();
    await expect(pageObj.usMarketTab).toHaveAttribute('data-active', 'true');
  });

  test('T1.8: Verify transition is seamless and does not reload the page', async () => {
    // Set a window property
    await pageObj.page.evaluate(() => {
      (window as any).notReloaded = true;
    });

    await pageObj.selectHkMarket();

    // Check if property is still set
    const notReloaded = await pageObj.page.evaluate(() => (window as any).notReloaded);
    expect(notReloaded).toBe(true);
  });

  test('T1.9: Verify correct symbols are displayed for US', async () => {
    await pageObj.selectUsMarket();
    await expect(pageObj.getStockTile('AAPL')).toBeVisible();
    await expect(pageObj.getStockTile('MSFT')).toBeVisible();
  });

  test('T1.10: Verify correct symbols are displayed for HK', async () => {
    await pageObj.selectHkMarket();
    // In HK market, check for HK symbols like 00700.HK or 9988.HK
    await expect(pageObj.getStockTile('00700.HK')).toBeVisible();
  });

  // T1.11-1.15: Data API & Fallback
  test('T1.11: Verify application handles successful API load', async () => {
    const statusText = await pageObj.getDataStatusText();
    expect(statusText.toLowerCase()).toContain('success');
  });

  test('T1.12: Verify application detects API failures and falls back to mock data', async ({ page }) => {
    // Force API failures
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({ status: 500 });
    });
    // Reload page to trigger failure
    await page.reload();
    const source = await pageObj.getDataSource();
    expect(source).toBe('mock');
  });

  test('T1.13: Verify mock data indicator is displayed when in fallback mode', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({ status: 500 });
    });
    await page.reload();
    const source = await pageObj.getDataSource();
    expect(source).toBe('mock');
  });

  test('T1.14: Verify api indicator is displayed when in live mode', async () => {
    const source = await pageObj.getDataSource();
    expect(source).toBe('live');
  });

  test('T1.15: Verify mock data has valid values', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({ status: 500 });
    });
    await page.reload();
    await pageObj.waitForLoad();
    // Hover a tile to check tooltip values
    await pageObj.hoverStock('AAPL');
    await expect(pageObj.tooltipContainer).toBeVisible();
    
    const priceText = await pageObj.getTooltipField('price').innerText();
    const capText = await pageObj.getTooltipField('market-cap').innerText();
    const changeText = await pageObj.getTooltipField('change').innerText();
    
    expect(parseFloat(priceText.replace(/[^0-9.-]/g, ''))).toBeGreaterThan(0);
    expect(parseFloat(capText.replace(/[^0-9.-]/g, ''))).toBeGreaterThan(0);
    expect(changeText).not.toBe('');
  });

  // T1.16-1.20: Hover Tooltip
  test('T1.16: Hover over US tile and verify tooltip appears', async () => {
    await pageObj.selectUsMarket();
    await pageObj.hoverStock('AAPL');
    await expect(pageObj.tooltipContainer).toBeVisible();
  });

  test('T1.17: Hover over HK tile and verify tooltip appears', async () => {
    await pageObj.selectHkMarket();
    await pageObj.hoverStock('00700.HK');
    await expect(pageObj.tooltipContainer).toBeVisible();
  });

  test('T1.18: Verify tooltip displays full company name, price, change %, market cap, symbol', async () => {
    await pageObj.hoverStock('AAPL');
    await expect(pageObj.getTooltipField('symbol')).toBeVisible();
    await expect(pageObj.getTooltipField('name')).toBeVisible();
    await expect(pageObj.getTooltipField('price')).toBeVisible();
    await expect(pageObj.getTooltipField('change')).toBeVisible();
    await expect(pageObj.getTooltipField('market-cap')).toBeVisible();
  });

  test('T1.19: Hover away from tile and verify tooltip disappears', async () => {
    await pageObj.hoverStock('AAPL');
    await expect(pageObj.tooltipContainer).toBeVisible();
    // Hover over legend or header to move mouse away
    await pageObj.colorLegend.hover();
    await expect(pageObj.tooltipContainer).toBeHidden();
  });

  test('T1.20: Move mouse from one tile to another and verify tooltip updates immediately', async () => {
    await pageObj.hoverStock('AAPL');
    const symbol1 = await pageObj.getTooltipField('symbol').innerText();
    expect(symbol1).toContain('AAPL');

    await pageObj.hoverStock('MSFT');
    const symbol2 = await pageObj.getTooltipField('symbol').innerText();
    expect(symbol2).toContain('MSFT');
  });

  // T1.21-1.25: Search Highlight
  test('T1.21: Enter query in search bar and verify matching tile is highlighted', async () => {
    await pageObj.search('AAPL');
    const state = await pageObj.getHighlightedState('AAPL');
    expect(state).toBe('true');
    const otherState = await pageObj.getHighlightedState('MSFT');
    expect(otherState).toBe('false');
  });

  test('T1.22: Clear search bar and verify highlight is removed', async () => {
    await pageObj.search('AAPL');
    await pageObj.clearSearch();
    const state = await pageObj.getHighlightedState('AAPL');
    expect(state).not.toBe('true');
  });

  test('T1.23: Enter non-matching query and verify no tiles are highlighted', async () => {
    await pageObj.search('XYZNONMATCHING');
    const stateAAPL = await pageObj.getHighlightedState('AAPL');
    expect(stateAAPL).toBe('false');
    const stateMSFT = await pageObj.getHighlightedState('MSFT');
    expect(stateMSFT).toBe('false');
  });

  test('T1.24: Test case-insensitivity of search', async () => {
    await pageObj.search('aapl');
    const state = await pageObj.getHighlightedState('AAPL');
    expect(state).toBe('true');
  });

  test('T1.25: Test search by company name', async () => {
    // If AAPL name is Apple
    await pageObj.search('Apple');
    const state = await pageObj.getHighlightedState('AAPL');
    expect(state).toBe('true');
  });

  // T1.26-1.30: Color Scheme Toggle
  test('T1.26: Toggle to Chinese style', async () => {
    // Ensure we are in Chinese style
    const initialTheme = await pageObj.getThemeStyle();
    if (initialTheme !== 'chinese') {
      await pageObj.toggleColorTheme();
    }
    const theme = await pageObj.getThemeStyle();
    expect(theme).toBe('chinese');
    
    // Positive AAPL (+2.5) should be red background, negative JPM (-1.2) should be green background
    const aaplTile = pageObj.getStockTile('AAPL');
    const jpmTile = pageObj.getStockTile('JPM');
    
    // Check that style contains red / green colors (e.g. background classes or styling)
    await expect(aaplTile).toHaveAttribute('data-trend-color', 'up');
    await expect(jpmTile).toHaveAttribute('data-trend-color', 'down');
  });

  test('T1.27: Toggle to International style', async () => {
    // Ensure we are in International style
    const initialTheme = await pageObj.getThemeStyle();
    if (initialTheme !== 'international') {
      await pageObj.toggleColorTheme();
    }
    const theme = await pageObj.getThemeStyle();
    expect(theme).toBe('international');

    const aaplTile = pageObj.getStockTile('AAPL');
    const jpmTile = pageObj.getStockTile('JPM');
    
    await expect(aaplTile).toHaveAttribute('data-trend-color', 'up');
    await expect(jpmTile).toHaveAttribute('data-trend-color', 'down');
  });

  test('T1.28: Verify Legend updates its labels/colors accordingly', async () => {
    const initialTheme = await pageObj.getThemeStyle();
    const legendText = await pageObj.colorLegend.innerText();
    
    await pageObj.toggleColorTheme();
    const newLegendText = await pageObj.colorLegend.innerText();
    
    // The legend should have updated text/colors representing the new theme
    expect(newLegendText).not.toEqual(legendText);
  });

  test('T1.29: Switch markets and verify selected color style is preserved', async () => {
    await pageObj.toggleColorTheme();
    const themeBefore = await pageObj.getThemeStyle();
    
    await pageObj.selectHkMarket();
    const themeAfter = await pageObj.getThemeStyle();
    
    expect(themeAfter).toEqual(themeBefore);
  });

  test('T1.30: Reload page or toggle multiple times to check persistence/correctness', async () => {
    const initialTheme = await pageObj.getThemeStyle();
    
    await pageObj.toggleColorTheme();
    const toggledTheme = await pageObj.getThemeStyle();
    expect(toggledTheme).not.toEqual(initialTheme);
    
    await pageObj.page.reload();
    const reloadedTheme = await pageObj.getThemeStyle();
    expect(reloadedTheme).toEqual(toggledTheme);
  });
});
