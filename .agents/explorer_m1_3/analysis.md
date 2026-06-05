# Milestone 1: Scaffold Setup Analysis & Recommendations

This report contains the recommended setup requirements, directory structure, configurations, and boilerplate templates for Milestone 1 (Scaffold Setup) of the Stock Market Cloud visualization dashboard.

---

## 1. Project Directory Structure

We recommend the following directory layout for the React + TypeScript + Vite project. This structure follows clean-architecture guidelines and keeps test files co-located next to their corresponding source code components.

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
    │   ├── Legend.test.tsx
    │   ├── SearchBar.tsx
    │   ├── SearchBar.test.tsx
    │   ├── SectorGroup.tsx
    │   ├── StockTile.tsx
    │   ├── Tooltip.tsx
    │   └── Treemap.tsx
    │       ├── Treemap.tsx
    │       └── Treemap.test.tsx
    ├── hooks/
    │   └── useStockData.ts
    ├── services/
    │   ├── api.ts
    │   ├── api.test.ts
    │   └── mockData.ts
    ├── types/
    │   └── index.ts
    └── utils/
        ├── treemapLayout.ts
        └── treemapLayout.test.ts
```

### Key Folders Description
- **`components/`**: House all UI components. Each component should have its implementation (`.tsx`) and testing file (`.test.tsx`) in the same directory (co-located).
- **`hooks/`**: Custom React hooks, specifically for fetching stock data, handling window resize, or managing the state of search and filtering.
- **`services/`**: Services to communicate with external APIs (e.g. Yahoo Finance) and the mock data fallback service.
- **`types/`**: Shared TypeScript types and interfaces (e.g. `StockData`, `Sector`, `MarketType`, `ThemeMode`).
- **`utils/`**: Helper files for treemap algorithms, currency formatting, color scales, etc.

---

## 2. Dependencies Setup (`package.json`)

Here are the recommended dependencies to install. We leverage **React 18** for stability and compatibility, **Vite 5** as the build tool, **Tailwind CSS v3** for responsive grid/treemap styling, and **Vitest** for testing (due to its native Vite integration and speed).

Create `package.json` with the following content:

```json
{
  "name": "stock-market-cloud",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
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
    "@typescript-eslint/eslint-plugin": "^7.11.0",
    "@typescript-eslint/parser": "^7.11.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.7",
    "jsdom": "^24.0.0",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.4.5",
    "vite": "^5.2.11",
    "vitest": "^1.6.0"
  }
}
```

*Note: `d3-hierarchy` is included because it provides excellent, highly optimized layout algorithms (like `d3.treemap()` and `d3.treemapSquarify()`) which are perfect for calculating sizes and positions of tiles in R1.*

---

## 3. Vite and Vitest Configuration

Configure Vite to build the application and Vitest to run unit/integration tests with `jsdom` (simulated browser environment) and standard test setups.

Create `vite.config.ts` in the project root:

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
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

---

## 4. Tailwind and PostCSS Configuration

Set up Tailwind CSS configuration to locate classes in both the HTML entry point and all TypeScript/JavaScript source files.

Create `postcss.config.js` in the project root:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

Create `tailwind.config.js` in the project root:

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

---

## 5. TypeScript Configuration

Vite standard layouts separate the browser compiler settings (`tsconfig.app.json`) from compiler settings for node-based configurations like `vite.config.ts` (`tsconfig.node.json`).

Create `tsconfig.json` in the project root:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

Create `tsconfig.app.json` in the project root:

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

    /* Path Alias */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src"]
}
```

Create `tsconfig.node.json` in the project root:

```json
{
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
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

---

## 6. Verification and Smoke Test Files

Create the following files in the `src/` directory to verify the scaffold setup and run the smoke test.

### Entry HTML (`index.html`)
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stock Market Cloud Dashboard</title>
  </head>
  <body class="bg-slate-900 text-slate-50">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Styles (`src/index.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #0f172a; /* Slate 900 */
  color: #f8fafc; /* Slate 50 */
}
```

### TypeScript Vite Environment Definitions (`src/vite-env.d.ts`)
```typescript
/// <reference types="vite/client" />
```

### Main Entry (`src/main.tsx`)
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

### Core Application Component (`src/App.tsx`)
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

### Test Setup file (`src/setupTests.ts`)
```typescript
import '@testing-library/jest-dom';
```

### Smoke Test Case (`src/App.test.tsx`)
This unit test renders the `App` component and asserts that the title renders successfully to check that Vitest, Testing Library, and TypeScript are configured correctly.

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Smoke Test', () => {
  it('renders stock market cloud header title', () => {
    render(<App />);
    const headingElement = screen.getByText(/Stock Market Cloud/i);
    expect(headingElement).toBeInTheDocument();
  });
});
```

---

## 7. How to Verify Setup

Once the project files are created, run the following commands to verify the scaffold installation:

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   Open the browser at `http://localhost:5173` to see if the page displays the title "Stock Market Cloud".
3. **Run Smoke Test**:
   ```bash
   npm run test
   ```
   Ensure the test runs and outputs: `1 passed`.
