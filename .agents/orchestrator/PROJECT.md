# Project: Stock Market Cloud Visualization

## Architecture
The application is a web-based, responsive dashboard for stock market visualization.
- **Frontend Framework**: React + TypeScript + Vite.
- **Styling**: Tailwind CSS (for modern UI components, flexbox, grid, and custom styling).
- **Visualization Library**: Custom SVG-based Squarified Treemap component or D3-hierarchy.
- **Data Layer**:
  - `StockDataService`: Fetches current quotes, change percentages, and market caps from a public Stock API (e.g. Yahoo Finance, Finnhub, or Alpha Vantage).
  - `MockDataFallback`: Comprehensive fallback datasets for US (50-100 stocks) and HK (50-100 stocks) markets organized by industry sectors (Technology, Finance, Consumer, Healthcare, Energy, Industrials, Utilities, etc.) to ensure seamless operation if the API fails or is rate-limited.
  - `State Management`: Context API or custom hooks to manage selected market, data, loading state, error state, color mode, hover details, and search/highlight queries.

## Code Layout
- `src/components/`: React components (Treemap, MarketToggle, Tooltip, SearchBar, Header, Legend).
- `src/services/`: Stock data fetcher and mock data provider.
- `src/types/`: TypeScript definitions for stock, sector, and application state.
- `src/styles/`: CSS/Tailwind styles.
- `src/App.tsx`: Main dashboard coordinator.
- `tests/`: Unit and integration test suites.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 1 | Scaffold Setup | Project scaffold (React, TS, Vite, Tailwind CSS, Jest/Vitest, E2E test infra) | None | PLANNED |
| 2 | Data Integration | Mock data fallbacks and live API connectivity with status indicator | M1 | PLANNED |
| 3 | Treemap Component | Squarified treemap rendering grouped by sectors, sized by cap | M2 | PLANNED |
| 4 | Market Toggle | Support switching between US (50-100) and HK (50-100) markets | M3 | PLANNED |
| 5 | Interactivity | Search bar highlighting, hover tooltips, and Chinese/International color style toggling | M4 | PLANNED |
| 6 | E2E Testing | E2E and unit test suites passing | M5 | PLANNED |
| 7 | Adversarial Hardening | Edge cases, large datasets, and forensic audit verification | M6 | PLANNED |

## Interface Contracts
### `Stock` Schema
```typescript
interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;       // Change percentage, e.g., +1.5 or -0.8
  marketCap: number;    // Market cap in USD or HKD
  sector: string;       // Sector/Industry group, e.g., 'Technology'
}
```

### `MarketData` Schema
```typescript
interface MarketData {
  market: 'US' | 'HK';
  stocks: Stock[];
  isMock: boolean;
  lastUpdated: string;
}
```

### `ColorTheme` Schema
- `international`: Up is Green, Down is Red.
- `chinese`: Up is Red, Down is Green.
