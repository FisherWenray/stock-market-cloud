# Milestone 1 (Scaffold Setup) Analysis & Recommendations

This document outlines the detailed setup requirements and configuration templates for the React + TypeScript + Vite + Tailwind CSS + Vitest project scaffold.

---

## 1. Recommended Project Structure

We recommend the following project directory layout. It maps directly to the structure outlined in `PROJECT.md` and provides dedicated directories for components, data services, global types, custom styles, and tests.

```text
stock_market_cloud/
├── .gitignore
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── MarketToggle.tsx
│   │   ├── SearchBar.tsx
│   │   ├── Legend.tsx
│   │   ├── Tooltip.tsx
│   │   └── Treemap.tsx
│   ├── services/
│   │   ├── StockDataService.ts
│   │   └── MockDataFallback.ts
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       └── tailwind.css
└── tests/
    ├── setup.ts
    └── App.test.tsx
```

---

## 2. Dependencies to Install (`package.json`)

To ensure standard, robust, and stable performance, we pin core dependencies and configuration scripts. 

- **React & React DOM**: Pinned to stable `v18.3.1` to ensure compatibility with all standard UI tools and testing library utilities.
- **Lucide React**: For icon assets (search, trends, toggle arrows).
- **Vite & plugins**: For build speed and TypeScript hot module replacement.
- **Vitest & Testing Library**: For ultra-fast test execution leveraging the same module configuration as Vite.

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
    "lucide-react": "^0.400.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.6",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/node": "^20.14.2",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "jsdom": "^24.1.0",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.4.5",
    "vite": "^5.3.1",
    "vitest": "^1.6.0"
  }
}
```

---

## 3. Configuration Files

### 3.1. Vite Configuration (`vite.config.ts`)
This configuration enables the React plugin and sets up `@/*` path mapping to simplify internal imports.

```typescript
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
  server: {
    port: 3000,
    open: true,
  },
});
```

### 3.2. Vitest Configuration (`vitest.config.ts`)
This configuration file extends the base Vite configuration to ensure aliases and build settings align perfectly in test environments. It sets up `jsdom` and pre-loads the custom setup script.

```typescript
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './tests/setup.ts',
      css: true,
    },
  })
);
```

---

## 4. Tailwind and PostCSS Configuration

### 4.1. Tailwind Configuration (`tailwind.config.js`)
Configured to look for utility classes in all source and markup files.

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

### 4.2. PostCSS Configuration (`postcss.config.js`)
Configured to register the Tailwind v3 engine and autoprefixer rules.

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## 5. TypeScript Configuration Files

To align with Vite's module boundary guidelines, the workspace relies on three TypeScript configs: a root delegator `tsconfig.json`, an application config `tsconfig.app.json`, and a bundler/utility config `tsconfig.node.json`.

### 5.1. Root Configuration (`tsconfig.json`)
Delegates parsing responsibilities to specific configuration files.

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### 5.2. Application Configuration (`tsconfig.app.json`)
Supports modern bundler-based module resolution, maps paths matching Vite aliases, and compiles both `src/` and `tests/` directories.

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

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src", "tests"]
}
```

### 5.3. Node Configuration (`tsconfig.node.json`)
Strict compile targets dedicated to the bundler config files.

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": [
    "vite.config.ts",
    "vitest.config.ts",
    "tailwind.config.js",
    "postcss.config.js"
  ]
}
```

---

## 6. Boilerplate Application Files

### 6.1. HTML Entry Point (`index.html`)
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stock Market Cloud</title>
  </head>
  <body class="bg-gray-900 text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 6.2. Styles Entry Point (`src/index.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 6.3. Main Root Element (`src/main.tsx`)
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 6.4. Coordinator Component (`src/App.tsx`)
Provides a simple title rendering and dark theme class to verify tailwind setup.

```typescript
import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-blue-500">
        Stock Market Cloud
      </h1>
      <p className="text-gray-400 mt-2">
        Milestone 1 Scaffold Setup
      </p>
    </div>
  );
}

export default App;
```

---

## 7. Testing Setup & Smoke Test

### 7.1. Test Environment Setup (`tests/setup.ts`)
Hooks DOM-assertion helpers from `@testing-library/jest-dom` for easy assertion syntax (e.g. `toBeInTheDocument()`).

```typescript
import '@testing-library/jest-dom';
```

### 7.2. Smoke Test Case (`tests/App.test.tsx`)
A minimal render smoke test checking if the title displays correctly.

```typescript
import { render, screen } from '@testing-library/react';
import App from '../src/App';
import { expect, test } from 'vitest';

test('renders dashboard heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Stock Market Cloud/i);
  expect(headingElement).toBeInTheDocument();
});
```

---

## 8. Verification Commands

To verify the setup, run the following commands in the workspace root directory:

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Run tests to check test framework integration**:
   ```bash
   npm run test:run
   ```
3. **Launch the development server to check bundling, Tailwind compiler, and layout**:
   ```bash
   npm run dev
   ```
