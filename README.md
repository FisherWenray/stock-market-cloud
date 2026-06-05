# Stock Market Cloud 📈🌩️

> A real-time, interactive, and visually stunning Stock Market Treemap Visualization tool built with React, TypeScript, Tailwind CSS, and D3.js.

Stock Market Cloud allows you to monitor the pulse of both the **US Market (S&P 500, Dow Jones, Nasdaq)** and the **Hong Kong Market (Hang Seng, HS Tech, HSCEI)** simultaneously. By utilizing advanced D3 treemap algorithms, it perfectly visualizes the market capitalization and real-time fluctuations of up to 1000 stocks at a glance.

---

## ✨ Key Features

- **Real-Time Data Syncing**: Polling backend market APIs every 10 seconds for seamless, non-disruptive hot updates.
- **Top-tier Visual Design**: Premium dark mode with subtle glassmorphism (毛玻璃) UI panels and immersive radial gradients.
- **Dual Market Support**: Easily switch between US and HK stock markets with one click.
- **Interactive D3 Treemap**: Stocks are strictly categorized by their GICS/local sectors and displayed in a scalable mosaic layout. Hover for detailed tooltips.
- **Bi-Cultural Color Themes**: Support for both "International" (Green = Up, Red = Down) and "Chinese" (Red = Up, Green = Down) color systems.
- **Top Index Banner**: Keep track of overarching market trends with a sleek, sticky marquee of the top 3 corresponding indices.
- **Multi-language**: Fully localized in both English and Chinese.

## 🛠️ Tech Stack

- **Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (with arbitrary value capabilities and backdrop-blur utilities)
- **Data Visualization**: D3-Hierarchy (`d3-treemap`, `squarify`)
- **State Management**: React Hooks (`useState`, `useEffect`, `useRef`)
- **Data Source**: Live polling from Yahoo Finance (US) and Tencent Finance (HK) via proxied Vite configurations.

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js (v16+) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:FisherWenray/stock-market-cloud.git
   cd stock-market-cloud
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## 🎨 UI Showcase

*(Add your screenshots here)*
- The massive 1800px vertical scrolling heat map.
- The premium frosted glass control panel.
- Hover states and responsive scaling.

## 📝 License

This project is open-sourced under the MIT License.
