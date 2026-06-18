# Stock Market Cloud 📈☁️

[English](#english) | [中文版](#中文版)

---

<a name="english"></a>
## 🇺🇸 English

> A real-time stock market treemap dashboard for US, Hong Kong, and A-share equities, built with React, TypeScript, Tailwind CSS, and D3.

**Live Demo:** [https://stock.wenyaoyefei.com/](https://stock.wenyaoyefei.com/)

Stock Market Cloud is a market-screen style heatmap for tracking **A-share**, **Hong Kong**, and **US** equities from one interface. It combines a high-density treemap, market indices, sector aggregation, search, and stock detail panels so you can scan breadth, leadership, and drawdowns quickly without jumping between multiple quote pages.

### Project Summary

- **Three-market coverage**: A-share, Hong Kong, and US market views in one dashboard
- **Treemap-first workflow**: Sector-grouped market cap heatmap for fast visual scanning
- **Chinese market semantics**: Red for up, green for down in all price-change related views
- **Refreshed brand system**: New logo and a red-gold editorial style without using green as the global brand color
- **Local free-data backend**: Optional cached backend for larger symbol universes and more stable local development

### ✨ Key Features

- **Auto-refresh market dashboard**: The app refreshes quotes on a 10-second cadence and shows a circular progress countdown in the status panel.
- **A-share / HK / US market switcher**: One-click switching between the three supported market groups, with local preference persistence.
- **Sector-based treemap navigation**: Stocks are grouped by sector, and sector headers can be clicked to zoom into a focused view.
- **Two color metrics**: Switch treemap coloring between **Price Change %** and **P/E Ratio** depending on whether you want momentum or valuation context.
- **Weighted sector performance labels**: Each sector header shows its market-cap weighted average change so you can spot strength and weakness faster.
- **Search with direct drill-in**: Search by ticker or company name and jump straight into the stock details panel from autocomplete suggestions.
- **Stock details sidebar**: View open, high, low, previous close, estimated volume, market cap, and a multi-period SVG trend chart.
- **Deterministic tooltip sparklines**: Hover tooltips render stable mini trendlines derived from symbol-based seeds, avoiding visual flicker.
- **Redesigned identity**: Updated logo, warmer red-led accent system, and stronger “market terminal” visual tone while keeping down moves green.
- **Bilingual UI**: Chinese and English interface support.

### 🛠️ Tech Stack
- **Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Data Visualization**: D3-Hierarchy (`d3-treemap`, `squarify`), SVG Area Generators
- **Testing**: Vitest, JSDOM, Playwright E2E

### 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone git@github.com:FisherWenray/stock-market-cloud.git
   cd stock-market-cloud
   ```

2. Install dependencies and run the frontend:
   ```bash
   npm install
   npm run dev
   ```

3. Open `http://localhost:5173`.

4. For the optional local market backend, run this in another terminal:
   ```bash
   npm run dev:market
   ```

### 🧪 Running Tests

* Run unit and component tests:
  ```bash
  npm run test:run
  ```
* Run End-to-End browser specs:
  ```bash
  npm run test:e2e
  ```

### Free Market Backend V1

This project can run a lightweight local backend that refreshes free market data once, caches it on disk, and lets the React app read `/api/market` instead of asking every browser tab to call quote providers directly.

Run the backend and frontend in two terminals:

```bash
npm run dev:market
npm run dev
```

Useful environment variables:

```bash
MARKET_SERVER_PORT=8787
MARKET_REFRESH_MS=300000
MARKET_UNIVERSE_REFRESH_MS=43200000
MARKET_MAX_STOCKS=1500
MARKET_HK_FULL_SCAN=true
VITE_MARKET_LIMIT=1500
VITE_USE_MARKET_BACKEND=true
```

V1 data behavior:

- US universe is refreshed from Nasdaq Trader symbol directory files.
- HK universe defaults to scanning `00001.HK` through `09999.HK` and keeps symbols that return valid quotes.
- CN market currently prioritizes the bundled A-share dataset and fallback flow for reliability.
- Quotes are fetched through Tencent's free quote endpoint and cached in `.market-cache`.
- The frontend falls back to the previous client-side fetch path if the backend is not running.
- Free data sources are best-effort and may be delayed, rate-limited, incomplete, or unavailable. This is suitable for a personal/free delayed heatmap, not a guaranteed real-time market-data service.

---

<a name="中文版"></a>
## 🇨🇳 中文版

> 一个基于 React、TypeScript、Tailwind CSS 和 D3 构建的三市场股票热力云图看盘面板，覆盖 A 股、港股和美股。

**线上体验:** [https://stock.wenyaoyefei.com/](https://stock.wenyaoyefei.com/)

“股票行情云图”现在是一个更完整的三市场看盘工具：你可以在同一套界面里查看 **A 股、港股、美股** 的热力分布、指数表现、板块强弱、个股详情和搜索结果。它采用以热力图为核心的浏览方式，适合快速扫盘、观察板块轮动以及定位领涨领跌方向。

### 项目简介

- **三市场统一看盘**：A 股、港股、美股集中在一个面板里切换查看
- **热力图优先的信息结构**：按板块聚合的市值热力图，适合快速扫盘
- **符合中文市场习惯的涨跌语义**：所有和涨跌直接相关的视图都采用红涨绿跌
- **全新品牌视觉**：Logo 和主品牌色重做为偏红金的行情终端风格，但不拿绿色做全站品牌色
- **本地免费数据后端**：支持本地缓存与扩展股票池，更适合持续开发和自用部署

### ✨ 核心功能

- **自动刷新行情面板**：每 10 秒刷新一次行情，状态区带有环形倒计时进度。
- **A 股 / 港股 / 美股切换**：支持在三大市场之间一键切换，并记住上次选择。
- **板块聚焦热力图**：股票按行业板块分组，点击板块头部即可放大查看该板块内部结构。
- **两种热力染色维度**：支持在 **涨跌幅** 与 **市盈率** 两种视角之间切换。
- **板块加权涨跌表现**：板块标题直接显示按市值加权后的平均涨跌幅，方便快速判断强弱。
- **搜索联想直达详情**：可按股票代码或名称搜索，并从联想结果直接打开个股详情面板。
- **个股详情侧边栏**：展示开盘、最高、最低、昨收、估算成交量、市值，以及多周期 SVG 趋势图。
- **稳定的悬停迷你走势图**：Tooltip 中的 Sparkline 采用确定性算法生成，避免反复悬停时抖动闪烁。
- **全新品牌与配色**：新版 Logo、偏红金的品牌层视觉，以及更明确的行情终端气质。
- **中英文双语界面**：支持中文与英文切换。

### 🛠️ 技术栈
- **核心框架**：React 18, TypeScript, Vite
- **样式方案**：Tailwind CSS (充分运用了现代原子类及渐变背景)
- **数据可视化**：D3-Hierarchy (`d3-treemap`, `squarify` 算法), 自定义 SVG 路径生成器
- **测试框架**：Vitest, JSDOM, Playwright 浏览器端 E2E 测试

### 🚀 快速启动

1. 克隆项目到本地：
   ```bash
   git clone git@github.com:FisherWenray/stock-market-cloud.git
   cd stock-market-cloud
   ```

2. 安装依赖并启动前端开发服务器：
   ```bash
   npm install
   npm run dev
   ```

3. 在浏览器中打开 `http://localhost:5173`。

4. 如果你希望同时启用本地行情后端，再开一个终端运行：
   ```bash
   npm run dev:market
   ```

### 免费行情后端 V1

这个项目支持一个轻量级本地后端：它会定时刷新免费行情数据、把结果缓存到磁盘，并让前端通过 `/api/market` 读取整理后的数据。

双终端启动方式：

```bash
npm run dev:market
npm run dev
```

常用环境变量：

```bash
MARKET_SERVER_PORT=8787
MARKET_REFRESH_MS=300000
MARKET_UNIVERSE_REFRESH_MS=43200000
MARKET_MAX_STOCKS=1500
MARKET_HK_FULL_SCAN=true
VITE_MARKET_LIMIT=1500
VITE_USE_MARKET_BACKEND=true
```

V1 数据说明：

- 美股股票池来自 Nasdaq Trader 的目录文件刷新
- 港股默认扫描 `00001.HK` 到 `09999.HK` 并保留有效行情代码
- A 股目前以内置股票池和 fallback 路径为主，保证稳定性
- 行情通过腾讯免费接口抓取，并缓存到 `.market-cache`
- 若本地后端未启动，前端会回退到浏览器侧抓取路径
- 免费数据源可能有延迟、限流、缺失或不可用，更适合个人看盘与自用部署，不适合作为严格实时行情基础设施

### 🧪 测试运行

* 运行单元与组件测试：
  ```bash
  npm run test:run
  ```
* 运行 Playwright 浏览器端 E2E 整体功能测试：
  ```bash
  npm run test:e2e
  ```

## 📝 License
This project is open-sourced under the MIT License.
