import { test, expect } from '@playwright/test';
import { StockMarketPage } from '../page-objects/StockMarketPage';

test.describe('Tier 5 - Advanced Features', () => {
  let pageObj: StockMarketPage;

  test.beforeEach(async ({ page }) => {
    pageObj = new StockMarketPage(page);
    // Standard mock for successful API calls
    await page.route(url => url.href.includes('yahoo') || url.href.includes('finnhub'), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quoteResponse: {
            result: [
              { symbol: 'AAPL', name: 'Apple Inc.', regularMarketPrice: 150.0, regularMarketChangePercent: 2.5, marketCap: 3000000000000, sector: 'Technology' },
              { symbol: 'MSFT', name: 'Microsoft Corp.', regularMarketPrice: 400.0, regularMarketChangePercent: -1.8, marketCap: 2800000000000, sector: 'Technology' },
              { symbol: 'JPM', name: 'JPMorgan Chase & Co.', regularMarketPrice: 170.0, regularMarketChangePercent: -1.2, marketCap: 500000000000, sector: 'Finance' },
            ]
          }
        })
      });
    });
    await pageObj.navigate();
    // Wait for initial data load
    await page.waitForSelector('[data-testid="data-status-indicator"]:has-text("Success")');
  });

  // Test 1: Color metric switching and average performance headers
  test('Metric switching and sector performance headers', async ({ page }) => {
    // 1. Sector header check: should display sector name and weighted average percentage
    const header = pageObj.getSectorHeader('Information Technology');
    await expect(header).toBeVisible();
    const headerText = await header.textContent();
    // AAPL: 3T (+2.5%), MSFT: 2.8T (-1.8%) -> average is positive, so it should have '+'
    expect(headerText).toContain('Information Technology');
    expect(headerText).toContain('%');

    // 2. Metric toggling PE
    const metricPeBtn = page.locator('[data-testid="metric-pe"]');
    await expect(metricPeBtn).toBeVisible();
    await metricPeBtn.click();
    
    // Check if AAPL stock change text displays "PE: ..."
    const aaplChangeText = pageObj.getStockChangeText('AAPL');
    await expect(aaplChangeText).toContainText('PE:');
  });

  // Test 2: Search Auto-complete suggestions dropdown
  test('Search autocomplete suggestions', async ({ page }) => {
    // Type a query that matches MSFT
    await pageObj.search('Micro');

    const suggestions = page.locator('[data-testid="search-suggestions"]');
    await expect(suggestions).toBeVisible();

    const suggestionItem = page.locator('[data-testid="suggestion-item-msft"]');
    await expect(suggestionItem).toBeVisible();
    await expect(suggestionItem.locator('.font-mono').first()).toHaveText('MSFT');

    // Click suggestion item and check if details panel opens
    await suggestionItem.click();
    await expect(suggestions).not.toBeVisible();

    const detailsPanel = page.locator('[data-testid="stock-details-panel"]');
    await expect(detailsPanel).toBeVisible();
    await expect(detailsPanel.locator('text=Microsoft Corp.')).toBeVisible();

    // Verify search input is cleared
    await expect(pageObj.searchInput).toHaveValue('');
  });

  // Test 3: Dismiss search suggestions on click outside
  test('Dismiss autocomplete suggestions on click outside', async ({ page }) => {
    await pageObj.search('Ap');
    const suggestions = page.locator('[data-testid="search-suggestions"]');
    await expect(suggestions).toBeVisible();

    // Click on app title to dismiss
    await page.locator('h1').click();
    await expect(suggestions).not.toBeVisible();
  });

  // Test 4: Detail sidebar periods toggling
  test('Detail sidebar multi-period chart toggling', async ({ page }) => {
    // Click on JPM tile to open sidebar
    const jpmTile = pageObj.getStockTile('JPM');
    await jpmTile.click();

    const detailsPanel = page.locator('[data-testid="stock-details-panel"]');
    await expect(detailsPanel).toBeVisible();

    const period24h = page.locator('[data-testid="period-tab-24h"]');
    const period5d = page.locator('[data-testid="period-tab-5d"]');
    const period1m = page.locator('[data-testid="period-tab-1m"]');

    await expect(period24h).toBeVisible();
    await expect(period5d).toBeVisible();
    await expect(period1m).toBeVisible();

    // Verify period clicks
    await period5d.click();
    await expect(period5d).toHaveClass(/bg-slate-800/);

    await period1m.click();
    await expect(period1m).toHaveClass(/bg-slate-800/);
  });
});
