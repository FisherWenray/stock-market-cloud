import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { Treemap } from './Treemap';
import { useContainerSize } from '../hooks/useContainerSize';
import { Stock } from '../types';

// Global variables for ResizeObserver mock
let observerCallback: ((entries: any[]) => void) | null = null;

class MockResizeObserver {
  constructor(callback: (entries: any[]) => void) {
    observerCallback = callback;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

const mockStocks: Stock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 180.0, change: 1.5, marketCap: 2000000000000, sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 400.0, change: -2.5, marketCap: 1500000000000, sector: 'Technology' },
  { symbol: 'JPM', name: 'JPMorgan Chase', price: 150.0, change: 0.0, marketCap: 1000000000000, sector: 'Finance' },
];

describe('useContainerSize hook', () => {
  beforeEach(() => {
    global.ResizeObserver = MockResizeObserver as any;
    observerCallback = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with 0 size and track size changes', () => {
    const div = document.createElement('div');
    const ref = { current: div };

    const { result } = renderHook(() => useContainerSize(ref));
    expect(result.current).toEqual({ width: 0, height: 0 });

    act(() => {
      if (observerCallback) {
        observerCallback([
          {
            contentRect: { width: 800, height: 600 },
          },
        ]);
      }
    });

    expect(result.current).toEqual({ width: 800, height: 600 });
  });
});

describe('Treemap component', () => {
  beforeEach(() => {
    global.ResizeObserver = MockResizeObserver as any;
    observerCallback = null;
    
    // Stub getBoundingClientRect for layout coordinate testing
    Element.prototype.getBoundingClientRect = vi.fn(function (this: any) {
      const isDiv = this && this.tagName === 'DIV';
      return {
        width: isDiv ? 0 : 100,
        height: isDiv ? 0 : 50,
        top: 10,
        left: 10,
        bottom: 60,
        right: 110,
        x: 10,
        y: 10,
        toJSON: () => {},
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const triggerContainerResize = (w: number, h: number) => {
    act(() => {
      if (observerCallback) {
        observerCallback([
          {
            contentRect: { width: w, height: h },
          },
        ]);
      }
    });
  };

  it('renders standard empty state message when stocks are empty', () => {
    render(<Treemap stocks={[]} theme="international" lang="en" />);
    expect(screen.getByText(/No stock market data available/i)).toBeInTheDocument();
  });

  it('renders correct sector groupings and stock tiles when container size is resolved', () => {
    const { container } = render(
      <Treemap stocks={mockStocks} theme="international" lang="en" />
    );

    // Initial render should not show SVG because width/height are 0
    expect(container.querySelector('svg')).toBeNull();

    // Trigger ResizeObserver
    triggerContainerResize(800, 600);

    // Now SVG should render
    const svg = screen.getByTestId('treemap-container');
    expect(svg).toBeInTheDocument();
    expect(svg.getAttribute('width')).toBe('800');
    expect(svg.getAttribute('height')).toBe('600');

    // Verify Sector Containers are present
    const techSector = screen.getByTestId('treemap-sector-technology');
    const financeSector = screen.getByTestId('treemap-sector-finance');
    expect(techSector).toBeInTheDocument();
    expect(financeSector).toBeInTheDocument();

    // Verify Sector Headers match contract
    const techHeader = screen.getByTestId('treemap-sector-title-technology');
    const financeHeader = screen.getByTestId('treemap-sector-title-finance');
    expect(techHeader).toHaveTextContent('Technology');
    expect(financeHeader).toHaveTextContent('Finance');

    // Verify Stock Tiles
    const aaplTile = screen.getByTestId('stock-tile-AAPL');
    const msftTile = screen.getByTestId('stock-tile-MSFT');
    const jpmTile = screen.getByTestId('stock-tile-JPM');
    expect(aaplTile).toBeInTheDocument();
    expect(msftTile).toBeInTheDocument();
    expect(jpmTile).toBeInTheDocument();

    // Verify Inner Stock Symbols & Changes
    expect(screen.getByTestId('stock-symbol-AAPL')).toHaveTextContent('AAPL');
    expect(screen.getByTestId('stock-change-AAPL')).toHaveTextContent('+1.50%');
    expect(screen.getByTestId('stock-symbol-MSFT')).toHaveTextContent('MSFT');
    expect(screen.getByTestId('stock-change-MSFT')).toHaveTextContent('-2.50%');

    // Verify attributes
    expect(aaplTile.getAttribute('data-highlighted')).toBeNull();
    expect(aaplTile.getAttribute('data-trend-color')).toBe('up');
    expect(msftTile.getAttribute('data-trend-color')).toBe('down');
    expect(jpmTile.getAttribute('data-trend-color')).toBe('neutral');
  });

  it('correctly sets data-highlighted to false for non-matching searchQuery', () => {
    render(<Treemap stocks={mockStocks} theme="international" lang="en" searchQuery="AAPL" />);
    triggerContainerResize(800, 600);

    const aaplTile = screen.getByTestId('stock-tile-AAPL');
    const msftTile = screen.getByTestId('stock-tile-MSFT');

    expect(aaplTile.getAttribute('data-highlighted')).toBe('true');
    expect(msftTile.getAttribute('data-highlighted')).toBe('false');

    // Verify non-highlighted has opacity-20 styling class
    expect(msftTile.getAttribute('class')).toContain('opacity-20');
  });

  it('maps correct fill colors based on international theme settings', () => {
    render(<Treemap stocks={mockStocks} theme="international" lang="en" />);
    triggerContainerResize(800, 600);

    const aaplRect = screen.getByTestId('stock-tile-AAPL').querySelector('rect');
    const msftRect = screen.getByTestId('stock-tile-MSFT').querySelector('rect');
    const jpmRect = screen.getByTestId('stock-tile-JPM').querySelector('rect');

    // International: AAPL (+1.5%) moderate up -> emerald-700
    expect(aaplRect?.className.baseVal).toContain('fill-emerald-700');
    // International: MSFT (-2.5%) moderate down -> red-700
    expect(msftRect?.className.baseVal).toContain('fill-red-700');
    // Neutral: JPM (0.0%) -> slate-700
    expect(jpmRect?.className.baseVal).toContain('fill-slate-700');
  });

  it('maps correct fill colors based on chinese theme settings (red up, green down)', () => {
    render(<Treemap stocks={mockStocks} theme="chinese" lang="en" />);
    triggerContainerResize(800, 600);

    const aaplRect = screen.getByTestId('stock-tile-AAPL').querySelector('rect');
    const msftRect = screen.getByTestId('stock-tile-MSFT').querySelector('rect');

    // Chinese: AAPL (+1.5%) moderate up -> red-700
    expect(aaplRect?.className.baseVal).toContain('fill-red-700');
    // Chinese: MSFT (-2.5%) moderate down -> emerald-700
    expect(msftRect?.className.baseVal).toContain('fill-emerald-700');
  });

  it('fires callbacks on hover and click events', () => {
    const handleHover = vi.fn();
    const handleClick = vi.fn();

    render(
      <Treemap 
        stocks={mockStocks} 
        theme="international" 
        lang="en"
        onStockHover={handleHover}
        onStockClick={handleClick}
      />
    );
    triggerContainerResize(800, 600);

    const aaplTile = screen.getByTestId('stock-tile-AAPL');

    // Trigger click
    fireEvent.click(aaplTile);
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(expect.objectContaining({
      symbol: 'AAPL',
      name: 'Apple Inc.',
    }));

    // Trigger hover enter
    fireEvent.mouseEnter(aaplTile);
    expect(handleHover).toHaveBeenCalledTimes(1);
    expect(handleHover).toHaveBeenCalledWith(
      expect.objectContaining({ symbol: 'AAPL' }),
      expect.any(Number),
      expect.any(Number)
    );

    // Trigger hover leave
    fireEvent.mouseLeave(aaplTile);
    expect(handleHover).toHaveBeenLastCalledWith(null, 0, 0);
  });

  it('renders sector header weighted average change percentage', () => {
    render(<Treemap stocks={mockStocks} theme="international" lang="en" />);
    triggerContainerResize(800, 600);

    const techHeader = screen.getByTestId('treemap-sector-title-technology');
    // Technology: AAPL (2T, +1.5%) and MSFT (1.5T, -2.5%) -> weighted average = -0.21%
    expect(techHeader).toHaveTextContent('-0.21%');
  });

  it('colors tiles correctly by P/E ratio metric', () => {
    const peStocks: Stock[] = [
      { symbol: 'LOWPE', name: 'Low PE Corp', price: 100.0, change: 1.0, marketCap: 100000000, sector: 'Technology', pe: 10 },
      { symbol: 'HIGHPE', name: 'High PE Corp', price: 100.0, change: 1.0, marketCap: 100000000, sector: 'Technology', pe: 60 },
      { symbol: 'MIDPE', name: 'Mid PE Corp', price: 100.0, change: 1.0, marketCap: 100000000, sector: 'Technology', pe: 30 },
    ];

    // Under International Theme: low PE (<15) should be Emerald, high PE (>50) should be Red, mid PE should be Slate
    const { rerender } = render(<Treemap stocks={peStocks} theme="international" lang="en" colorMetric="pe" />);
    triggerContainerResize(800, 600);

    const lowPeRect = screen.getByTestId('stock-tile-LOWPE').querySelector('rect');
    const highPeRect = screen.getByTestId('stock-tile-HIGHPE').querySelector('rect');
    const midPeRect = screen.getByTestId('stock-tile-MIDPE').querySelector('rect');

    expect(lowPeRect?.className.baseVal).toContain('fill-emerald');
    expect(highPeRect?.className.baseVal).toContain('fill-red');
    expect(midPeRect?.className.baseVal).toContain('fill-slate-700');

    // Under Chinese Theme: low PE (<15) should be Red, high PE (>50) should be Emerald
    rerender(<Treemap stocks={peStocks} theme="chinese" lang="en" colorMetric="pe" />);
    triggerContainerResize(800, 600);

    const lowPeRectCN = screen.getByTestId('stock-tile-LOWPE').querySelector('rect');
    const highPeRectCN = screen.getByTestId('stock-tile-HIGHPE').querySelector('rect');

    expect(lowPeRectCN?.className.baseVal).toContain('fill-red');
    expect(highPeRectCN?.className.baseVal).toContain('fill-emerald');
  });

});

