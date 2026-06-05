# Milestone 1: Scaffold Setup Analysis & Recommendations

This report contains the recommended setup requirements, directory structure, configurations, and boilerplate templates for Milestone 1 (Scaffold Setup) of the Stock Market Cloud visualization dashboard.

---

## 1. Executive Summary

We recommend initializing a **React (v18.3.1) + TypeScript + Vite (v5) + Tailwind CSS (v3)** project using **Vitest (v1.6.0)** for fast unit/integration testing and **jsdom** for browser simulation. To support the stock treemap sizing math (R1), we also include **d3-hierarchy** for robust treemap layout calculations.

---

## 2. Directory Layout Recommendation

We recommend the following project layout. This structure follows clean-architecture guidelines:
- Custom components, services, and hooks are located under `src/`.
- Unit/integration tests are co-located next to their source files inside `src/` to follow best practices.
- E2E testing files (for Playwright/Cypress) are placed in a dedicated top-level `tests/e2e/` directory to avoid cluttering `src/`.

```text
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
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.test.tsx
│   ├── index.css
│   ├── setupTests.ts
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Legend.tsx
│   │   ├── MarketToggle.tsx
│   │   ├── SearchBar.tsx
│   │   ├── Tooltip.tsx
│   │   └── Treemap.tsx
│   ├── hooks/
│   │   └── useStockData.ts
│   ├── services/
│   │   ├── api.ts
│   │   └── mockData.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── treemapLayout.ts
└── tests/
    └── e2e/
        └── smoke.spec.ts (For future Playwright E2E testing)
```

---

## 3. Dependency Recommendations (`package.json`)

To prevent dependency version mismatches, we have carefully aligned the libraries:
1. **React v18.3.1**: Standard, stable framework version.
2. **React Testing Library (RTL) v15.0.7**: Pinned to v15 because **RTL v16 is designed for React 19** and causes peer dependency conflicts and test runner errors when used with React 18.
3. **d3-hierarchy v3.1.2**: Provides squarified treemap sizing algorithms, which are crucial for rendering tiles dynamically sized by market cap (R1).
4. **lucide-react v0.450.0**: Provides lightweight, modern icons for search, trends, and market toggles.

### Proposed `package.json`
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
    "jsdom": "^24.1.0",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.4.5",
    "vite": "^5.2.11",
    "vitest": "^1.6.0"
  }
}
```

---

## 4. Configuration Templates

### 4.1. Vite & Vitest Configuration (`vite.config.ts`)
This configuration consolidates building and testing configurations in a single file for simplicity, using path aliases `@/*` mapping to `src/*` and referencing Vitest test parameters.

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
    css: true,
  },
});
```

*(Note: If the project requires separating Vite and Vitest, you can move the `test` block to a separate `vitest.config.ts` extending `vite.config.ts` via `mergeConfig` from `vitest/config`.)*

### 4.2. PostCSS Configuration (`postcss.config.js`)
Configured in ESM format to load Tailwind CSS and Autoprefixer.

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 4.3. Tailwind Configuration (`tailwind.config.js`)
Specifies the path scanner to search for classes in the HTML and source React components.

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

### 4.4. TSConfig Configuration Files

#### Root Configuration (`tsconfig.json`)
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

#### Application Configuration (`tsconfig.app.json`)
```json
{
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
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
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Path Aliases */
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

#### Node Configuration (`tsconfig.node.json`)
```json
{
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["vite.config.ts"]
}
```

---

## 5. Entry & Boilerplate Files

### HTML Entry Point (`index.html`)
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

### CSS Entry Point (`src/index.css`)
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

### Vite TS Definitions (`src/vite-env.d.ts`)
```typescript
/// <reference types="vite/client" />
```

### Main Entry Point (`src/main.tsx`)
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### Coordinator Component (`src/App.tsx`)
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

---

## 6. Testing Setup & Smoke Test

### Test Setup File (`src/setupTests.ts`)
Ensures Jest-DOM matchers are integrated with Vitest.
```typescript
import '@testing-library/jest-dom';
```

### Smoke Test Case (`src/App.test.tsx`)
Verifies TypeScript, React, and Testing Library rendering capabilities.
```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Smoke Test', () => {
  it('renders stock market cloud header title', () => {
    render(<App />);
    const headingElement = screen.getByText(/Stock Market Cloud/i);
    expect(expect.stringMatching(headingElement.textContent || '')).toBeDefined();
    expect(headingElement).toBeInTheDocument();
  });
});
```

---

## 7. Synthesis & Resolution of Conflicts

We reconciled the two primary sources of input (Explorer 1 and Explorer 3 reports) to form this unified scaffold setup:

### Consensus
- **Core Technology Stack**: Consistent agreement on using React 18, Vite 5, Tailwind CSS 3, and Vitest.
- **TSConfig Reference Model**: Agreement on using the standard 3-file TS Config delegation framework.
- **Tailwind Config**: Unanimous choice of standard Tailwind CSS utility config.

### Resolved Conflicts
1. **Testing Library Versions**: Explorer 1 recommended `@testing-library/react: ^16.0.0` but Explorer 3 recommended `^15.0.7`. We resolved this by selecting `^15.0.7` because React Testing Library v16 assumes React 19 environment, which causes dependency errors when combined with React 18.3.1.
2. **Directory Structure & Co-Location**: Explorer 1 placed test files under a top-level `tests/` directory, whereas Explorer 3 co-located tests inside `src/`. We resolved this by establishing a clear distinction: unit and integration tests (such as component tests) are co-located next to their source files within `src/` to follow system instructions and layout compliance guidelines, while end-to-end (E2E) tests are mapped to a dedicated top-level `tests/e2e/` directory.
3. **Treemap Mathematics**: We explicitly included `d3-hierarchy` inside dependencies to provide the required layout calculation framework, as it is standard and high-performance.

---

## 8. Verification Plan

Once files are generated in the implementation step, the setup can be verified by running:
1. `npm install`
2. `npm run test` (Asserts 1 test passes)
3. `npm run dev` (Starts dev web server)
