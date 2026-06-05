
import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App Smoke Test', () => {
  it('renders stock market cloud header title', () => {
    render(<App />);
    const headingElement = screen.getByText(/股票行情云图/i);
    expect(headingElement).toBeInTheDocument();
  });
});
