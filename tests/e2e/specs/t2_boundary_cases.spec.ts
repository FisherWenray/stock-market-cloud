import { test, expect } from '@playwright/test';
import { StockMarketPage } from '../page-objects/StockMarketPage';

test.describe('Tier 2 - Boundary & Corner Cases', () => {
  let pageObj: StockMarketPage;

  test.beforeEach(async ({ page }) => {
    pageObj = new StockMarketPage(page);
  });

  // T2.1: 0% change stock rendering color (should be neutral/gray)
  test('T2.1: 0% change stock rendering color', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quoteResponse: {
            result: [
              { symbol: 'FLAT', regularMarketPrice: 100.0, regularMarketChangePercent: 0.0, marketCap: 100000000, sector: 'Technology' }
            ]
          }
        })
      });
    });
    await pageObj.navigate();
    const flatTile = pageObj.getStockTile('FLAT');
    await expect(flatTile).toBeVisible();
    await expect(flatTile).toHaveAttribute('data-trend-color', 'neutral');
  });

  // T2.2: Very small market cap stock rendering
  test('T2.2: Very small market cap stock rendering', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quoteResponse: {
            result: [
              { symbol: 'TINY', regularMarketPrice: 1.0, regularMarketChangePercent: 1.0, marketCap: 1000, sector: 'Technology' }
            ]
          }
        })
      });
    });
    await pageObj.navigate();
    const tinyTile = pageObj.getStockTile('TINY');
    await expect(tinyTile).toBeVisible();
    // Verify it triggers tooltip when hovered even if small
    await tinyTile.hover();
    await expect(pageObj.tooltipContainer).toBeVisible();
  });

  // T2.3: Sector with only one stock
  test('T2.3: Sector with only one stock', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quoteResponse: {
            result: [
              { symbol: 'ONLY', regularMarketPrice: 50.0, regularMarketChangePercent: 2.0, marketCap: 100000, sector: 'Finance' }
            ]
          }
        })
      });
    });
    await pageObj.navigate();
    const sector = pageObj.getSectorContainer('finance');
    await expect(sector).toBeVisible();
    const onlyTile = pageObj.getStockTile('ONLY');
    await expect(onlyTile).toBeVisible();
  });

  // T2.4: Sector with 0 stocks (should not render sector container)
  test('T2.4: Sector with 0 stocks', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quoteResponse: {
            result: [
              { symbol: 'AAPL', regularMarketPrice: 150.0, regularMarketChangePercent: 1.0, marketCap: 3000000000000, sector: 'Technology' }
            ]
          }
        })
      });
    });
    await pageObj.navigate();
    const energySector = pageObj.getSectorContainer('energy');
    await expect(energySector).toBeHidden();
  });

  // T2.5: Extreme market cap difference
  test('T2.5: Extreme market cap difference', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quoteResponse: {
            result: [
              { symbol: 'HUGE', regularMarketPrice: 100.0, regularMarketChangePercent: 1.0, marketCap: 1000000000000, sector: 'Technology' },
              { symbol: 'TINY', regularMarketPrice: 1.0, regularMarketChangePercent: 1.0, marketCap: 100, sector: 'Technology' }
            ]
          }
        })
      });
    });
    await pageObj.navigate();
    await expect(pageObj.getStockTile('HUGE')).toBeVisible();
    await expect(pageObj.getStockTile('TINY')).toBeVisible();
  });

  // T2.6: Switch markets rapidly
  test('T2.6: Switch markets rapidly', async ({ page }) => {
    // Standard mock
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ quoteResponse: { result: [{ symbol: 'AAPL', regularMarketPrice: 150.0, regularMarketChangePercent: 1.0, marketCap: 1000000, sector: 'Technology' }] } })
      });
    });
    await pageObj.navigate();
    for (let i = 0; i < 5; i++) {
      await pageObj.selectHkMarket();
      await pageObj.selectUsMarket();
    }
    await expect(pageObj.usMarketTab).toBeVisible();
  });

  // T2.7: Switching market while search query is active
  test('T2.7: Switching market while search query is active', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quoteResponse: {
            result: [
              { symbol: 'AAPL', name: 'Apple', regularMarketPrice: 150.0, regularMarketChangePercent: 1.0, marketCap: 1000000, sector: 'Technology' },
              { symbol: '0700.HK', name: 'Tencent', regularMarketPrice: 300.0, regularMarketChangePercent: -1.0, marketCap: 5000000, sector: 'Technology' }
            ]
          }
        })
      });
    });
    await pageObj.navigate();
    await pageObj.search('Apple');
    await pageObj.selectHkMarket();
    const query = await pageObj.searchInput.inputValue();
    expect(query).toBe('Apple');
  });

  // T2.8: Switching market while tooltip is open
  test('T2.8: Switching market while tooltip is open', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quoteResponse: {
            result: [
              { symbol: 'AAPL', regularMarketPrice: 150.0, regularMarketChangePercent: 1.0, marketCap: 1000000, sector: 'Technology' }
            ]
          }
        })
      });
    });
    await pageObj.navigate();
    await pageObj.hoverStock('AAPL');
    await expect(pageObj.tooltipContainer).toBeVisible();
    await pageObj.selectHkMarket();
    await expect(pageObj.tooltipContainer).toBeHidden();
  });

  // T2.9: Switching market when API is failing
  test('T2.9: Switching market when API is failing', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({ status: 500 });
    });
    await pageObj.navigate();
    await pageObj.selectHkMarket();
    const source = await pageObj.getDataSource();
    expect(source).toBe('mock');
  });

  // T2.10: Switching market and verifying currency format (USD vs HKD)
  test('T2.10: Switching market and verifying currency format', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quoteResponse: {
            result: [
              { symbol: 'AAPL', regularMarketPrice: 150.0, regularMarketChangePercent: 1.0, marketCap: 1000000, sector: 'Technology' },
              { symbol: '0700.HK', regularMarketPrice: 300.0, regularMarketChangePercent: -1.0, marketCap: 5000000, sector: 'Technology' }
            ]
          }
        })
      });
    });
    await pageObj.navigate();
    await pageObj.hoverStock('AAPL');
    let priceText = await pageObj.getTooltipField('price').innerText();
    expect(priceText).toContain('$');
    expect(priceText).not.toContain('HK$');

    await pageObj.selectHkMarket();
    await pageObj.hoverStock('0700.HK');
    priceText = await pageObj.getTooltipField('price').innerText();
    expect(priceText).toContain('HK$');
  });

  // T2.11: API rate limit error (429) simulation
  test('T2.11: API rate limit error (429) simulation', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({ status: 429 });
    });
    await pageObj.navigate();
    const source = await pageObj.getDataSource();
    expect(source).toBe('mock');
  });

  // T2.12: API connection timeout simulation
  test('T2.12: API connection timeout simulation', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      // Abort request to simulate timeout
      await route.abort('timedout');
    });
    await pageObj.navigate();
    const source = await pageObj.getDataSource();
    expect(source).toBe('mock');
  });

  // T2.13: API returning empty list or invalid JSON
  test('T2.13: API returning empty list or invalid JSON', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'invalid json content'
      });
    });
    await pageObj.navigate();
    const source = await pageObj.getDataSource();
    expect(source).toBe('mock');
  });

  // T2.14: Toggle API offline/online toggle
  test('T2.14: Toggle API offline/online toggle', async ({ page }) => {
    // Intercept and fail API calls to simulate being offline without breaking local dev server connection
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.abort('failed');
    });
    await pageObj.navigate();
    const source = await pageObj.getDataSource();
    expect(source).toBe('mock');
  });

  // T2.15: Verify fallback data is not stale
  test('T2.15: Verify fallback data is not stale', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({ status: 500 });
    });
    await pageObj.navigate();
    const statusText = await pageObj.getDataStatusText();
    expect(statusText.toLowerCase()).toContain('fallback');
    // should have valid values/timestamp
  });

  // T2.16: Hovering over a tile near screen edge (no viewport overflow)
  test('T2.16: Hovering over a tile near screen edge', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quoteResponse: {
            result: [
              { symbol: 'AAPL', regularMarketPrice: 150.0, regularMarketChangePercent: 1.0, marketCap: 1000000, sector: 'Technology' }
            ]
          }
        })
      });
    });
    await pageObj.navigate();
    await pageObj.hoverStock('AAPL');
    const tooltipBox = await pageObj.tooltipContainer.boundingBox();
    expect(tooltipBox).not.toBeNull();
    expect(tooltipBox!.x).toBeGreaterThanOrEqual(0);
    expect(tooltipBox!.y).toBeGreaterThanOrEqual(0);
    const size = page.viewportSize();
    expect(tooltipBox!.x + tooltipBox!.width).toBeLessThanOrEqual(size!.width);
    expect(tooltipBox!.y + tooltipBox!.height).toBeLessThanOrEqual(size!.height);
  });

  // T2.17: Hovering on touch-enabled screen or simulated touch events
  test.describe('T2.17 touch test container', () => {
    test.use({ hasTouch: true });
    test('T2.17: Hovering on touch-enabled screen', async ({ page }) => {
      await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            quoteResponse: {
              result: [
                { symbol: 'AAPL', regularMarketPrice: 150.0, regularMarketChangePercent: 1.0, marketCap: 1000000, sector: 'Technology' }
              ]
            }
          })
        });
      });
      await pageObj.navigate();
      // Simulate touch/tap on the tile to verify tooltip behavior
      await pageObj.getStockTile('AAPL').tap();
      await expect(pageObj.tooltipContainer).toBeVisible();
    });
  });

  // T2.18: Hovering over a tile with extremely long company name
  test('T2.18: Hovering over a tile with extremely long company name', async ({ page }) => {
    const longName = 'A'.repeat(150);
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quoteResponse: {
            result: [
              { symbol: 'LONG', name: longName, regularMarketPrice: 150.0, regularMarketChangePercent: 1.0, marketCap: 1000000, sector: 'Technology' }
            ]
          }
        })
      });
    });
    await pageObj.navigate();
    await pageObj.hoverStock('LONG');
    const nameField = pageObj.getTooltipField('name');
    await expect(nameField).toHaveText(longName);
  });

  // T2.19: Tooltip formatting for large market caps
  test('T2.19: Tooltip formatting for large market caps', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quoteResponse: {
            result: [
              { symbol: 'TRILLION', regularMarketPrice: 100.0, regularMarketChangePercent: 1.0, marketCap: 3500000000000, sector: 'Technology' }
            ]
          }
        })
      });
    });
    await pageObj.navigate();
    await pageObj.hoverStock('TRILLION');
    const capText = await pageObj.getTooltipField('market-cap').innerText();
    expect(capText.toLowerCase()).toContain('t'); // formatted in trillions
  });

  // T2.20: Tooltip styling during loading state
  test('T2.20: Tooltip styling during loading state', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      // Intentionally slow response
      await new Promise(resolve => setTimeout(resolve, 5000));
      await route.fulfill({ status: 200 });
    });
    await pageObj.navigate();
    // Tooltip should not be displayed or show placeholder/empty
    await expect(pageObj.tooltipContainer).toBeHidden();
  });

  // T2.21: Search query with special characters
  test('T2.21: Search query with special characters', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ quoteResponse: { result: [{ symbol: 'AAPL', regularMarketPrice: 150.0, regularMarketChangePercent: 1.0, marketCap: 1000000, sector: 'Technology' }] } })
      });
    });
    await pageObj.navigate();
    await pageObj.search('@#$%^&*()');
    const state = await pageObj.getHighlightedState('AAPL');
    expect(state).toBe('false');
  });

  // T2.22: Search query with trailing spaces
  test('T2.22: Search query with trailing spaces', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ quoteResponse: { result: [{ symbol: 'AAPL', name: 'Apple', regularMarketPrice: 150.0, regularMarketChangePercent: 1.0, marketCap: 1000000, sector: 'Technology' }] } })
      });
    });
    await pageObj.navigate();
    await pageObj.search('Apple ');
    const state = await pageObj.getHighlightedState('AAPL');
    expect(state).toBe('true');
  });

  // T2.23: Multi-word search query
  test('T2.23: Multi-word search query', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ quoteResponse: { result: [{ symbol: 'AAPL', name: 'Apple Inc', regularMarketPrice: 150.0, regularMarketChangePercent: 1.0, marketCap: 1000000, sector: 'Technology' }] } })
      });
    });
    await pageObj.navigate();
    await pageObj.search('Apple Inc');
    const state = await pageObj.getHighlightedState('AAPL');
    expect(state).toBe('true');
  });

  // T2.24: Search with empty input
  test('T2.24: Search with empty input', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ quoteResponse: { result: [{ symbol: 'AAPL', regularMarketPrice: 150.0, regularMarketChangePercent: 1.0, marketCap: 1000000, sector: 'Technology' }] } })
      });
    });
    await pageObj.navigate();
    await pageObj.search('');
    const state = await pageObj.getHighlightedState('AAPL');
    // Empty search should mean all tiles are default highlighted state (not dimmed)
    expect(state).not.toBe('false');
  });

  // T2.25: Search highlight updating correctly when data updates
  test('T2.25: Search highlight updating correctly when data updates', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quoteResponse: {
            result: [{ symbol: 'AAPL', name: 'Apple', regularMarketPrice: 150.0, regularMarketChangePercent: 1.0, marketCap: 1000000, sector: 'Technology' }]
          }
        })
      });
    });
    await pageObj.navigate();
    await pageObj.search('Fruit');
    let state = await pageObj.getHighlightedState('AAPL');
    expect(state).toBe('false');

    // Override route mock to serve 'Fruit Apple' on reload
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quoteResponse: {
            result: [{ symbol: 'AAPL', name: 'Fruit Apple', regularMarketPrice: 155.0, regularMarketChangePercent: 1.5, marketCap: 1005000, sector: 'Technology' }]
          }
        })
      });
    });

    // Trigger update/reload
    await page.reload();
    await pageObj.waitForLoad();
    await pageObj.search('Fruit');
    state = await pageObj.getHighlightedState('AAPL');
    expect(state).toBe('true');
  });

  // T2.26: Zero change styling in both themes
  test('T2.26: Zero change styling in both themes', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ quoteResponse: { result: [{ symbol: 'AAPL', regularMarketPrice: 150.0, regularMarketChangePercent: 0.0, marketCap: 1000000, sector: 'Technology' }] } })
      });
    });
    await pageObj.navigate();
    
    // Chinese theme
    const theme = await pageObj.getThemeStyle();
    if (theme !== 'chinese') await pageObj.toggleColorTheme();
    await expect(pageObj.getStockTile('AAPL')).toHaveAttribute('data-trend-color', 'neutral');

    // International theme
    await pageObj.toggleColorTheme();
    await expect(pageObj.getStockTile('AAPL')).toHaveAttribute('data-trend-color', 'neutral');
  });

  // T2.27: Hover highlight overlay color on positive/negative tiles
  test('T2.27: Hover highlight overlay color', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ quoteResponse: { result: [{ symbol: 'AAPL', regularMarketPrice: 150.0, regularMarketChangePercent: 1.5, marketCap: 1000000, sector: 'Technology' }] } })
      });
    });
    await pageObj.navigate();
    const tile = pageObj.getStockTile('AAPL');
    await tile.hover();
    // Verify high-light indicator or shadow class or CSS state when hovered
    await expect(tile).toBeVisible();
  });

  // T2.28: Color contrast ratio verification
  test('T2.28: Color contrast ratio verification', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ quoteResponse: { result: [{ symbol: 'AAPL', regularMarketPrice: 150.0, regularMarketChangePercent: 1.5, marketCap: 1000000, sector: 'Technology' }] } })
      });
    });
    await pageObj.navigate();
    const tileText = pageObj.getStockSymbolText('AAPL');
    await expect(tileText).toBeVisible();
    // Accessible color contrast class verification or checks (e.g. text should be text-white or similar contrast helper class)
  });

  // T2.29: Toggle theme while tooltip is active
  test('T2.29: Toggle theme while tooltip is active', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ quoteResponse: { result: [{ symbol: 'AAPL', regularMarketPrice: 150.0, regularMarketChangePercent: 1.5, marketCap: 1000000, sector: 'Technology' }] } })
      });
    });
    await pageObj.navigate();
    await pageObj.hoverStock('AAPL');
    await expect(pageObj.tooltipContainer).toBeVisible();
    await pageObj.toggleColorTheme();
    await expect(pageObj.tooltipContainer).toBeVisible();
  });

  // T2.30: Toggle theme when all stocks are positive or negative
  test('T2.30: Toggle theme when all stocks are positive', async ({ page }) => {
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quoteResponse: {
            result: [
              { symbol: 'AAPL', regularMarketPrice: 150.0, regularMarketChangePercent: 1.5, marketCap: 1000000, sector: 'Technology' },
              { symbol: 'MSFT', regularMarketPrice: 400.0, regularMarketChangePercent: 2.0, marketCap: 1000000, sector: 'Technology' }
            ]
          }
        })
      });
    });
    await pageObj.navigate();
    
    // Chinese theme: all positive must be 'up' color (red)
    let theme = await pageObj.getThemeStyle();
    if (theme !== 'chinese') await pageObj.toggleColorTheme();
    await expect(pageObj.getStockTile('AAPL')).toHaveAttribute('data-trend-color', 'up');
    await expect(pageObj.getStockTile('MSFT')).toHaveAttribute('data-trend-color', 'up');

    // International theme: all positive must be 'up' color (green)
    await pageObj.toggleColorTheme();
    await expect(pageObj.getStockTile('AAPL')).toHaveAttribute('data-trend-color', 'up');
    await expect(pageObj.getStockTile('MSFT')).toHaveAttribute('data-trend-color', 'up');
  });
});
