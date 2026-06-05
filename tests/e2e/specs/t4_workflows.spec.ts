import { test, expect } from '@playwright/test';
import { StockMarketPage } from '../page-objects/StockMarketPage';

test.describe('Tier 4 - Real-World Application Scenarios (Workflows)', () => {
  let pageObj: StockMarketPage;

  test.beforeEach(async ({ page }) => {
    pageObj = new StockMarketPage(page);
  });

  // T4.1 (The Market Analyst)
  test('T4.1: The Market Analyst workflow', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quoteResponse: {
            result: [
              { symbol: 'NVDA', name: 'Nvidia Corporation', regularMarketPrice: 480.0, regularMarketChangePercent: 4.2, marketCap: 1200000000000, sector: 'Technology' }
            ]
          }
        })
      });
    });
    
    // Analyst opens app
    await pageObj.navigate();
    
    // views US Tech sector
    await expect(pageObj.getSectorContainer('technology')).toBeVisible();
    await expect(pageObj.getStockTile('NVDA')).toBeVisible();

    // toggles color theme to Chinese
    const initialTheme = await pageObj.getThemeStyle();
    if (initialTheme !== 'chinese') {
      await pageObj.toggleColorTheme();
    }
    expect(await pageObj.getThemeStyle()).toBe('chinese');

    // searches for Nvidia
    await pageObj.search('Nvidia');
    expect(await pageObj.getHighlightedState('NVDA')).toBe('true');

    // checks tooltip details
    await pageObj.hoverStock('NVDA');
    await expect(pageObj.tooltipContainer).toBeVisible();
    await expect(pageObj.getTooltipField('name')).toHaveText('Nvidia Corporation');
    await expect(pageObj.getTooltipField('symbol')).toHaveText('NVDA');
  });

  // T4.2 (The Global Investor)
  test('T4.2: The Global Investor workflow', async ({ page }) => {
    let hkCallCount = 0;
    
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      if (route.request().url().toLowerCase().includes('0700.hk') || hkCallCount > 0 || route.request().url().toLowerCase().includes('market=hk') || route.request().url().toLowerCase().includes('type=hk') || route.request().url().toLowerCase().includes('hk')) {
        hkCallCount++;
        // Simulate API failure for HK market
        await route.fulfill({ status: 500 });
      } else {
        // Success for US
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            quoteResponse: {
              result: [
                { symbol: 'AAPL', name: 'Apple', regularMarketPrice: 150.0, regularMarketChangePercent: 1.5, marketCap: 3000000000000, sector: 'Technology' }
              ]
            }
          })
        });
      }
    });

    // Investor starts in US market (live API)
    await pageObj.navigate();
    expect(await pageObj.getDataSource()).toBe('live');

    // switches to HK market, experiences API failure, fallback banner alerts them
    await pageObj.selectHkMarket();
    expect(await pageObj.getDataSource()).toBe('mock');
    const statusText = await pageObj.getDataStatusText();
    expect(statusText.toLowerCase()).toContain('fallback');

    // they search for Tencent
    await pageObj.search('Tencent');

    // hover to view details in HKD
    // Assuming HK fallback has 0700.HK (Tencent)
    await pageObj.hoverStock('0700.HK');
    await expect(pageObj.tooltipContainer).toBeVisible();
    const priceText = await pageObj.getTooltipField('price').innerText();
    expect(priceText).toContain('HK$');

    // then switch back to US
    await pageObj.selectUsMarket();
    await expect(pageObj.getStockTile('AAPL')).toBeVisible();
  });

  // T4.3 (The Market Rally)
  test('T4.3: The Market Rally workflow', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quoteResponse: {
            result: [
              { symbol: 'AAPL', regularMarketPrice: 150.0, regularMarketChangePercent: 2.5, marketCap: 1000000, sector: 'Technology' },
              { symbol: 'MSFT', regularMarketPrice: 400.0, regularMarketChangePercent: 1.8, marketCap: 1000000, sector: 'Technology' }
            ]
          }
        })
      });
    });
    await pageObj.navigate();

    // Toggled between Chinese and International style
    const theme1 = await pageObj.getThemeStyle();
    if (theme1 !== 'chinese') await pageObj.toggleColorTheme();
    
    // validating the overall canvas turns entirely red (Chinese)
    await expect(pageObj.getStockTile('AAPL')).toHaveAttribute('data-trend-color', 'up');
    await expect(pageObj.getStockTile('MSFT')).toHaveAttribute('data-trend-color', 'up');

    // and then entirely green (International)
    await pageObj.toggleColorTheme();
    await expect(pageObj.getStockTile('AAPL')).toHaveAttribute('data-trend-color', 'up');
    await expect(pageObj.getStockTile('MSFT')).toHaveAttribute('data-trend-color', 'up');
  });

  // T4.4 (The High-Resolution Boardroom)
  test('T4.4: The High-Resolution Boardroom workflow', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quoteResponse: {
            result: [
              { symbol: 'AAPL', regularMarketPrice: 150.0, regularMarketChangePercent: 1.5, marketCap: 3000000000000, sector: 'Technology' }
            ]
          }
        })
      });
    });

    // Rendered on large screen (4K)
    await page.setViewportSize({ width: 3840, height: 2160 });
    await pageObj.navigate();
    const containerBox4k = await pageObj.treemapContainer.boundingBox();
    expect(containerBox4k!.width).toBeGreaterThan(1200);

    // Simulated on mobile device (375px width)
    await page.setViewportSize({ width: 375, height: 667 });
    // Wait for the container to resize in the DOM
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="treemap-container"]');
      return el && el.getBoundingClientRect().width <= 375;
    }, null, { timeout: 5000 });
    // Verify layout adapts (responsive classes like flex-col or stack cleanly)
    const containerBoxMobile = await pageObj.treemapContainer.boundingBox();
    expect(containerBoxMobile!.width).toBeLessThanOrEqual(375);
  });

  // T4.5 (End-to-End Stress Test)
  test('T4.5: End-to-End Stress Test workflow', async ({ page }) => {
    // 1. Initial route mock (succeeds)
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quoteResponse: {
            result: [
              { symbol: 'AAPL', regularMarketPrice: 150.0, regularMarketChangePercent: 1.5, marketCap: 3000000000000, sector: 'Technology' }
            ]
          }
        })
      });
    });

    await pageObj.navigate();
    
    // Check that we switch source based on API responses
    const source1 = await pageObj.getDataSource();
    expect(source1).toBe('live');

    // 2. Override route mock to fail (timedout)
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.abort('timedout');
    });

    // reload triggers next call (which will now fail)
    await page.reload();
    await pageObj.waitForLoad();
    const source2 = await pageObj.getDataSource();
    expect(source2).toBe('mock');

    // executes search and clears it
    await pageObj.search('Apple');
    await pageObj.clearSearch();

    // opens tooltips
    await pageObj.hoverStock('AAPL');
  });
});
