# Stock Market Cloud 📈🌩️

[English](#english) | [中文版](#中文版)

---

<a name="english"></a>
## 🇺🇸 English

> A real-time, interactive, and visually stunning Stock Market Treemap Visualization tool built with React, TypeScript, Tailwind CSS, and D3.js.

Stock Market Cloud allows you to monitor the pulse of both the **US Market (S&P 500, Dow Jones, Nasdaq)** and the **Hong Kong Market (Hang Seng, HS Tech, HSCEI)** simultaneously. By utilizing advanced D3 treemap algorithms, it perfectly visualizes the market capitalization and real-time fluctuations of up to 1000 stocks at a glance.

### ✨ Key Features
- **Real-Time Data Syncing**: Polling backend market APIs every 10 seconds for seamless, non-disruptive hot updates.
- **Top-tier Visual Design**: Premium dark mode with subtle glassmorphism UI panels and immersive radial gradients.
- **Dual Market Support**: Easily switch between US and HK stock markets with one click.
- **Interactive D3 Treemap**: Stocks are strictly categorized by their GICS/local sectors and displayed in a scalable mosaic layout. Hover for detailed tooltips.
- **Bi-Cultural Color Themes**: Support for both "International" (Green = Up, Red = Down) and "Chinese" (Red = Up, Green = Down) color systems.
- **Top Index Banner**: Keep track of overarching market trends with a sleek, sticky marquee of the top 3 corresponding indices.
- **Multi-language**: Fully localized in both English and Chinese.

### 🛠️ Tech Stack
- **Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (with arbitrary value capabilities and backdrop-blur utilities)
- **Data Visualization**: D3-Hierarchy (`d3-treemap`, `squarify`)
- **State Management**: React Hooks (`useState`, `useEffect`, `useRef`)

### 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone git@github.com:FisherWenray/stock-market-cloud.git
   cd stock-market-cloud
   ```

2. Install dependencies & Run:
   ```bash
   npm install
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`.

---

<a name="中文版"></a>
## 🇨🇳 中文版

> 一个基于 React、TypeScript、Tailwind CSS 和 D3.js 构建的实时、交互式、极具视觉冲击力的股票市场热力云图可视化工具。

“股票行情云图”可以帮助您同时监控**美股市场（标普500、道琼斯、纳斯达克）**和**港股市场（恒生指数、恒生科技、国企指数）**的实时脉搏。通过利用先进的 D3 Treemap 算法，系统能够将多达 1000 只股票的市值大小和实时涨跌幅，以精美的马赛克区块完美呈现。

### ✨ 核心功能
- **实时数据同步**：每 10 秒自动静默拉取一次最新市场行情，页面无缝热更新，彻底告别手动刷新。
- **顶级视觉体验**：采用了高级的暗黑深空渐变背景，搭配时下流行的毛玻璃 (Glassmorphism) UI 控制面板，视觉极其专业。
- **双市场支持**：一键在“美股”与“港股”之间无缝切换。
- **动态交互式 D3 云图**：所有股票严格按照真实行业板块进行分类与嵌套布局；鼠标悬停即刻展示股票详情与价格走势。
- **双文化色彩系统**：内置“国际样式（绿涨红跌）”与“中国样式（红涨绿跌）”两套独立的高对比度色彩体系。
- **顶部大盘指示器**：页面顶部自带三大核心指数的实时卡片指示器，全局市场动向一目了然。
- **完全国际化**：系统级支持中英文双语一键切换。

### 🛠️ 技术栈
- **核心框架**：React 18, TypeScript, Vite
- **样式方案**：Tailwind CSS (充分运用了 `backdrop-blur` 和自定义阴影等现代原子类特性)
- **数据可视化**：D3-Hierarchy (`d3-treemap`, `squarify` 算法)
- **状态管理**：React Hooks (`useState`, `useEffect`, `useRef`)

### 🚀 快速启动

1. 克隆项目到本地：
   ```bash
   git clone git@github.com:FisherWenray/stock-market-cloud.git
   cd stock-market-cloud
   ```

2. 安装依赖并启动本地开发服务器：
   ```bash
   npm install
   npm run dev
   ```

3. 在浏览器中打开 `http://localhost:5173` 即可体验。

## 📝 License
This project is open-sourced under the MIT License.
