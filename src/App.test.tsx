
import { render, screen } from '@testing-library/react';
import App from './App';
import { beforeEach, describe, it, expect, vi } from 'vitest';

describe('App Smoke Test', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    vi.restoreAllMocks();
    storage.clear();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: vi.fn((key: string) => storage.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => {
          storage.set(key, value);
        }),
      },
    });
  });

  it('renders stock market cloud header title', () => {
    render(<App />);
    const headingElement = screen.getByText(/股票行情云图/i);
    expect(headingElement).toBeInTheDocument();
  });

  it('restores the selected HK market after refresh', () => {
    storage.set('selected-market', 'HK');

    render(<App />);

    expect(screen.getByTestId('market-tab-hk')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('market-tab-us')).toHaveAttribute('data-active', 'false');
  });

  it('restores the selected CN market after refresh', () => {
    storage.set('selected-market', 'CN');

    render(<App />);

    expect(screen.getByTestId('market-tab-cn')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('market-tab-us')).toHaveAttribute('data-active', 'false');
  });
});
