# Stock Market Cloud 📈🌩️

[English](#english) | [中文版](#中文版)

---

<a name="english"></a>
## 🇺🇸 English

> A real-time, interactive, and visually stunning Stock Market Treemap Visualization tool built with React, TypeScript, Tailwind CSS, and D3.js.

**Live Demo:** [https://stock.wenyaoyefei.com/](https://stock.wenyaoyefei.com/)

Stock Market Cloud allows you to monitor the pulse of both the **US Market (S&P 500, Dow Jones, Nasdaq)** and the **Hong Kong Market (Hang Seng, HS Tech, HSCEI)** simultaneously. By utilizing advanced D3 treemap algorithms, it visualizes the market capitalization and real-time fluctuations of up to 1000 stocks at a glance.

### ✨ Key Features

- **Real-Time Data Syncing**: Polling backend market APIs every 10 seconds. Features an immersive **Auto-Refresh Circular Progress** timer inside the status bar tracking the 10s countdown.
- **Robust Production CORS Architecture**: Attempts a direct connection to Tencent's stock CDN (`https://qt.gtimg.cn`) first (taking `<200ms` with zero proxy rate-limits due to native CORS headers). If direct connection fails or times out after 6 seconds, it automatically falls back to the public `api.allorigins.win` CORS proxy. Uses cache-busting timestamp queries to prevent stale data.
- **Top-tier Visual Design**: Premium dark mode with subtle glassmorphism UI panels, immersive radial gradients, and fluid zoom transitions.
- **Dual Market Support**: Easily switch between US and HK stock markets with one click.
- **Interactive D3 Treemap (Focus Mode)**: Stocks are nested inside GICS/local industry sectors. Click a sector's header bar to zoom in to focus only on that sector (revealing labels for smaller stocks), and use the breadcrumb button to zoom back out.
- **Color Metric/Dimension Switching**: Toggle the treemap color mapping between:
  - **Price Change %**: Traditional red/green map representing market fluctuations.
  - **P/E Ratio**: Mapped such that P/E < 15 is colored with the bullish theme (undervalued) and P/E > 50 with the bearish theme (overvalued).
  - **Volume/Turnover**: Mapped to highlight stocks with high liquidity (turnover rate >= 0.03%).
- **Weighted Average Sector Performance**: Displays the market-cap weighted average change percentage for each sector directly inside the sector headers (e.g. `Information Technology +1.24%`).
- **Autocomplete Search Suggestions**: Typing inside the search bar reveals a matching glassmorphism suggestions dropdown. Click a stock suggestion to open its details panel immediately.
- **Detailed Sidebar Panel**: Slide-out panel presenting detailed stock financials (Open, High, Low, Volume, Market Cap) alongside a beautiful, smooth **SVG Area Trend Chart** with multi-period (24H, 5D, 1M) toggling.
- **Deterministic Sparklines in Tooltips**: Hovering over tiles displays a detailed tooltip containing a miniature SVG trend sparkline. To prevent flickering, the trend graph is calculated deterministically from the stock's ticker string hash.
- **Bi-Cultural Color Themes**: Support for both "International" (Green = Up, Red = Down) and "Chinese" (Red = Up, Green = Down) color styles.
- **Multi-language**: Fully localized in both English and Chinese.

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

2. Install dependencies & Run:
   ```bash
   npm install
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`.

### 🧪 Running Tests

* Run unit and component tests:
  ```bash
  npm run test:run
  ```
* Run End-to-End browser specs:
  ```bash
  npm run test:e2e
  ```

---

<a name="中文版"></a>
## 🇨🇳 中文版

> 一个基于 React、TypeScript、Tailwind CSS 和 D3.js 构建的实时、交互式、极具视觉冲击力的股票市场热力云图可视化工具。

**线上体验:** [https://stock.wenyaoyefei.com/](https://stock.wenyaoyefei.com/)

“股票行情云图”可以帮助您同时监控**美股市场（ S&P 500、道琼斯、纳斯达克）**和**港股市场（恒生指数、恒生科技、国企指数）**的实时脉搏。通过利用先进的 D3 Treemap 算法，系统能够将多达 1000 只股票的市值大小和实时涨跌幅，以精美的马赛克区块完美呈现。

### ✨ 核心功能

- **实时数据同步**：每 10 秒自动静默拉取一次最新市场行情。状态栏内置 **SVG 环形倒计时进度条**，实时显示自动刷新进度。
- **免代理 CORS 直连架构**：生产环境下默认首选直连腾讯股票接口（由于接口自带 CORS 头，直连 `<200ms`，且无任何代理频率限制）。若网络异常或直连超时（超过6秒），系统自动降级切换至 `api.allorigins.win` 代理进行兜底。带有 `_=${Date.now()}` 时间戳参数防止浏览器和代理缓存陈旧数据。
- **顶级视觉体验**：采用了高级的暗黑深空渐变背景，搭配时下流行的毛玻璃 (Glassmorphism) UI 控制面板与流畅的过渡动画。
- **双市场支持**：一键在“美股”与“港股”之间无缝切换。
- **Focus 缩放热力图（聚焦模式）**：所有股票按行业板块嵌套布局。点击板块头部可一键放大该板块（以便查看较小市值股票的代码），并提供浮动面包屑按钮返回全局。
- **多维度热力染色切换**：支持一键切换热力图块的填色规则：
  - **涨跌幅**：传统的红/绿变化，反映盘面涨跌。
  - **市盈率 (P/E)**：P/E < 15 染代表上涨的牛市色（估值偏低），P/E > 50 染代表下跌的熊市色（估值偏高）。
  - **成交量 (换手率)**：突出流动性高的异动个股（换手率 >= 0.03%）。
- **板块市值加权指标**：在板块头部实时显示该板块的市值加权平均涨跌幅表现（例如：`信息技术 +1.24%`）。
- **智能搜索联想下拉框**：搜索输入框支持实时过滤匹配的个股，并在毛玻璃下拉框中展示名称、代码和价格，点击可直接拉起个股详情。
- **侧边栏详情面板**：点击个股滑出侧边栏，展示详细财务指标（开盘、收盘、高、低、成交量、市值），并绘制支持多周期切换（24H, 5D, 1M）的平滑 **SVG 趋势面积图**。
- **悬停迷你折线图 (Sparkline)**：鼠标悬停在磁贴上，提示框内会绘制该股的小型 SVG 趋势线。为防止悬停闪烁，折线形状基于股号的哈希值做确定性生成。
- **双文化色彩系统**：内置“国际样式（绿涨红跌）”与“中国样式（红涨绿跌）”两套独立的高对比度色彩体系。
- **完全国际化**：系统级支持中英文双语一键切换。

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

2. 安装依赖并启动本地开发服务器：
   ```bash
   npm install
   npm run dev
   ```

3. 在浏览器中打开 `http://localhost:5173` 即可体验。

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
