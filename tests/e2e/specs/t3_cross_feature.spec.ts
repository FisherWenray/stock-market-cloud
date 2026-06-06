import { test, expect } from '@playwright/test';
import { StockMarketPage } from '../page-objects/StockMarketPage';

test.describe('Tier 3 - Cross-Feature Combinations', () => {
  let pageObj: StockMarketPage;
  const stocksList = [
    { symbol: 'AAPL', name: 'Apple', regularMarketPrice: 150.0, regularMarketChangePercent: 1.5, marketCap: 3000000000000, sector: 'Technology' },
    { symbol: 'JPM', name: 'JPMorgan', regularMarketPrice: 170.0, regularMarketChangePercent: -1.2, marketCap: 500000000000, sector: 'Finance' },
    { symbol: '00700.HK', name: 'Tencent', regularMarketPrice: 300.0, regularMarketChangePercent: -2.0, marketCap: 4000000000000, sector: 'Technology' }
  ];

  test.beforeEach(async ({ page }) => {
    pageObj = new StockMarketPage(page);
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      let filteredStocks = stocksList;
      const reqUrl = route.request().url();
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
  });

  // T3.1: Search highlight active + hover tooltip open + toggle color theme
  test('T3.1: Search active + hover tooltip open + toggle theme', async () => {
    await pageObj.search('Apple');
    await pageObj.hoverStock('AAPL');
    await expect(pageObj.tooltipContainer).toBeVisible();
    const styleBefore = await pageObj.getThemeStyle();
    
    await pageObj.toggleColorTheme();
    
    const styleAfter = await pageObj.getThemeStyle();
    expect(styleAfter).not.toEqual(styleBefore);
    await expect(pageObj.tooltipContainer).toBeVisible();
    expect(await pageObj.getHighlightedState('AAPL')).toBe('true');
  });

  // T3.2: Switch market + query search + check sector layout
  test('T3.2: Switch market + query search + check sector layout', async () => {
    await pageObj.search('Tencent');
    await pageObj.selectHkMarket();
    // In HK, Tencent should be highlighted, and sector Technology visible
    expect(await pageObj.getHighlightedState('00700.HK')).toBe('true');
    await expect(pageObj.getSectorContainer('technology')).toBeVisible();
  });

  // T3.3: Simulate API failure mid-session + switch market + check legend colors
  test('T3.3: Simulate API failure mid-session + switch market + check legend', async ({ page }) => {
    // First load is successful (from beforeEach)
    let source = await pageObj.getDataSource();
    expect(source).toBe('live');

    // Make future calls fail
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({ status: 500 });
    });

    await pageObj.selectHkMarket();
    // Falls back to mock data
    const newSource = await pageObj.getDataSource();
    expect(newSource).toBe('mock');
    await expect(pageObj.colorLegend).toBeVisible();
  });

  // T3.4: Search active + hover over highlighted vs non-highlighted tile
  test('T3.4: Search active + hover over highlighted vs non-highlighted tile', async () => {
    await pageObj.search('Apple');
    
    // Hover highlighted tile
    await pageObj.hoverStock('AAPL');
    await expect(pageObj.tooltipContainer).toBeVisible();
    await expect(pageObj.getTooltipField('symbol')).toHaveText('AAPL');

    // Hover non-highlighted tile (should still display tooltip!)
    await pageObj.hoverStock('JPM');
    await expect(pageObj.tooltipContainer).toBeVisible();
    await expect(pageObj.getTooltipField('symbol')).toHaveText('JPM');
  });

  // T3.5: Rapidly toggle market + color theme + search input
  test('T3.5: Rapidly toggle market + color theme + search input', async () => {
    await pageObj.selectHkMarket();
    await pageObj.toggleColorTheme();
    await pageObj.search('AAPL');
    await pageObj.selectUsMarket();
    await pageObj.toggleColorTheme();
    
    await expect(pageObj.usMarketTab).toBeVisible();
    expect(await pageObj.searchInput.inputValue()).toBe('AAPL');
  });

  // T3.6: Tooltip active at boundary screen position + resize window + change market
  test('T3.6: Tooltip at boundary + resize + change market', async ({ page }) => {
    await pageObj.hoverStock('AAPL');
    await expect(pageObj.tooltipContainer).toBeVisible();

    await page.setViewportSize({ width: 800, height: 600 });
    await pageObj.selectHkMarket();
    
    // Tooltip should be hidden or updated correctly
    await expect(pageObj.tooltipContainer).toBeHidden();
  });
});
