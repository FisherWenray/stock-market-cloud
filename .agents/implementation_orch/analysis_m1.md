# Milestone 1: Scaffold Setup - Synthesized Plan

## 1. Project Directory Layout
We will establish a standard React + TypeScript + Vite + Tailwind CSS + Vitest setup. Test files will be co-located next to their source files under `src/`.

```
stock_market_cloud/
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── src/
    ├── App.css
    ├── App.test.tsx
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── setupTests.ts
    ├── vite-env.d.ts
    ├── components/
    │   ├── Legend.tsx
    │   ├── MarketToggle.tsx
    │   ├── SearchBar.tsx
    │   ├── SectorGroup.tsx
    │   ├── StockTile.tsx
    │   ├── Tooltip.tsx
    │   └── Treemap.tsx
    ├── hooks/
    │   └── useStockData.ts
    ├── services/
    │   ├── api.ts
    │   └── mockData.ts
    ├── types/
    │   └── index.ts
    └── utils/
        └── treemapLayout.ts
```

## 2. Dependencies (`package.json`)
```json
{
  "name": "stock-market-cloud",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.450.0",
    "d3-hierarchy": "^3.1.2"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.5",
    "@testing-library/react": "^15.0.7",
    "@testing-library/user-event": "^14.5.2",
    "@types/d3-hierarchy": "^3.1.7",
    "@types/node": "^20.12.12",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "jsdom": "^24.0.0",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.4.5",
    "vite": "^5.2.11",
    "vitest": "^1.6.0"
  }
}
```

## 3. Configuration Files

### `vite.config.ts`
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
```

### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### `postcss.config.js`
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### TypeScript Configurations
We will use the multi-file tsconfig setup (tsconfig.json, tsconfig.app.json, tsconfig.node.json) recommended by Vite.

#### `tsconfig.json`
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

#### `tsconfig.app.json`
```json
{
  "compilerOptions": {
    "composite": true,
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Path Alias */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

#### `tsconfig.node.json`
```json
{
  "compilerOptions": {
    "composite": true,
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

## 4. Entrypoint and Verification Files

### `index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stock Market Cloud Dashboard</title>
  </head>
  <body class="bg-slate-900 text-slate-50">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  background-color: #0f172a; /* Slate 900 */
  color: #f8fafc; /* Slate 50 */
}
```

### `src/vite-env.d.ts`
```typescript
/// <reference types="vite/client" />
```

### `src/main.tsx`
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### `src/App.tsx`
```tsx
import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col items-center justify-center p-4">
      <header className="text-center">
        <h1 className="text-4xl font-bold mb-4 tracking-tight text-emerald-400">Stock Market Cloud</h1>
        <p className="text-lg text-slate-400 max-w-md">
          A real-time treemap visualization of US & HK markets. Scaffold setup successfully loaded!
        </p>
      </header>
    </div>
  );
}

export default App;

```

### `src/setupTests.ts`
```typescript
import '@testing-library/jest-dom';
```

### `src/App.test.tsx`
```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App Smoke Test', () => {
  it('renders stock market cloud header title', () => {
    render(<App />);
    const headingElement = screen.getByText(/Stock Market Cloud/i);
    expect(headingElement).toBeInTheDocument();
  });
});
```
