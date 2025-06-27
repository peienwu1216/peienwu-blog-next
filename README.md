# Peienwu's Code Lab - 新一代個人技術部落格

[![Vercel Deployment](https://img.shields.io/github/deployments/peienwu1216/peienwu-blog-next/production?label=Vercel&logo=vercel&style=for-the-badge)](https://peienwu-blog-next.vercel.app/)

歡迎來到我的新一代技術部落格！這是一個使用 Next.js (App Router)、Contentlayer 和 Tailwind CSS 從零開始打造的現代化、高效能、且專注於閱讀體驗的個人網站。

這裡不僅是我記錄學習筆記、分享專案心得的地方，也是我實踐最新前端技術的實驗場。

**線上預覽:** [https://peienwu-blog-next.vercel.app/](https://peienwu-blog-next.vercel.app/)

![部落格文章頁面概覽](https://github.com/user-attachments/assets/a21066bb-b955-40bd-affb-c51798888f81)

## 🌟 專案亮點總結 (Key Highlights)

這個專案不僅僅是一個部落格，它是一個**精心設計的全端應用程式**，旨在展示現代化的工程實踐與極致的使用者體驗。以下是其核心所在：

1.  **🚀 應用程式級的互動體驗 (Application-Grade Experience)**
    * **`⌘+K` 指揮中心**: 實作了超越傳統搜尋的**巢狀指令面板**。它不僅能以毫秒級速度搜尋全站內容，更能**執行動作**（如切換主題）、**層級式導覽**，並**整合後端 API**。
    * **動態儀表板**: 專案頁面和指令面板能**即時**從 GitHub 拉取專案的星級、開發中任務等**動態數據**，並透過**智慧快取策略**兼顧即時性與效能，徹底擺脫靜態網站的限制。

2.  **🧠 專業級搜尋引擎架構 (Professional Search Engine Architecture)**
    * **建置時索引 (Build-Time Indexing)**: 在 `next build` 階段，透過自訂腳本將所有文章預先處理成一個**輕量、乾淨的 JSON 搜尋索引**，實現了前端的極速查詢。
    * **智慧型多重索引**: 將內容拆分為「純文字」、「程式碼」、「數學公式」等多重索引，並為**不同欄位設定不同權重**（`標題 > 標籤 > 內文 > 程式碼`），讓搜尋結果極其精準且符合使用者預期。
    * **上下文感知查詢**: 搜尋邏輯能**自動偵測**使用者輸入的是「自然語言」還是「程式碼/數學符號」，並**動態調整**最小搜尋長度與匹配模式，實現了真正的「智慧搜尋」。

3.  **🏗️ 現代化的全端工程實踐 (Modern Full-Stack Engineering)**
    * **API 路由與安全**: 透過 Next.js API Routes 建立後端服務，安全地在伺服器端處理如 **GitHub PAT (Personal Access Token)** 等敏感金鑰，實現與 GitHub 私有專案的通訊。
    * **效能優化策略**: 針對不同 API（`開發計畫` vs. `專案統計`）的特性，分別採用了 **60 秒**和 **24 小時**兩種不同的**伺服器端快取 (`revalidate`) 策略**，在效能、成本與即時性之間做出了精準的權衡。

> **總結來說，此專案完整地展示了我從前端互動設計、後端 API 開發、搜尋引擎架構，到 DevOps 自動化部署與效能優化的全端工程能力。**

## 📁 專案結構

```
.
├── content/
│   └── posts/              # .mdx 格式的部落格文章
├── public/
│   └── search-data.json    # ✨ FlexSearch 的預建置搜尋索引
├── scripts/
│   └── build-search.mjs    # ✨ 用於在建置時產生 `search-data.json` 的腳本
├── src/
│   ├── app/                # Next.js App Router: 頁面、API 路由與全域樣式
│   │   ├── api/            # 🔗 全端 API 路由 (GitHub 整合)
│   │   └── ...
│   ├── components/         # 共用的 React 元件
│   │   └── CommandPalette.tsx # 🧠 Cmd+K 指揮中心的核心 UI
│   └── lib/                # 輔助函式與客戶端工具
│       └── flexsearch.ts     # 🧠 FlexSearch 引擎的客戶端邏輯
├── contentlayer.config.ts  # 🛠️ Contentlayer 設定檔 (定義內容模型)
├── next.config.js          # Next.js 設定檔
├── package.json            # 專案依賴與腳本 (新增 `flexsearch`, `concurrently`)
└── tailwind.config.js      # Tailwind CSS 設定檔
```
**圖示說明 (Legend):**
* ✨ 核心亮點: 體現本專案「建置時索引」獨特架構的關鍵檔案。
* 🧠 智慧中樞: 驅動專業級搜尋與指令功能的核心邏輯。
* 🔗 全端橋樑: 連接前端與外部服務 (GitHub API) 的後端路由。
* 🛠️ 內容引擎: 定義內容如何被處理、驗證與轉換。

## ✨ 核心功能 (Features)

本專案不僅是一個部落格，更是一個從架構、體驗到內容管線都經過精心設計的全端應用。

### 🚀 現代化全端架構 (Modern Full-Stack Architecture)

採用業界前沿的技術棧，打造了一個高效、可擴充且易於維護的應用程式。

* **核心框架**: 以 **Next.js (App Router)** 為核心，充分利用 **React Server Components (RSC)** 的優勢，在伺服器端處理資料獲取與渲染，實現極致的載入效能與優良的開發體驗。
* **全端能力**: 透過 **Next.js API Routes** 建立後端服務，安全地在伺服器端處理 **GitHub API** 的驗證與請求，實現了**動態專案儀表板**和**即時開發狀態追蹤**等功能。
* **智慧快取策略**: 針對不同的 API，分別採用 **60 秒** (開發任務) 和 **24 小時** (專案統計) 的**伺服器端增量靜態再生 (ISR) 快取**，在數據即時性、效能與成本之間取得了精準的平衡。
* **型別安全**: 全站使用 **TypeScript**，並藉由 **Contentlayer** 實現了從內容 (`.mdx`) 到元件 (`.tsx`) 的端到端型別安全，大幅提升了程式碼的健壯性與可維護性。

### 🧠 專業級搜尋引擎 (Professional-Grade Search Engine)

從零開始設計並實作了一套媲美專業文件網站的、完全在前端運行的即時搜尋系統。

* **關聯性優先排序**: 整合 **`FlexSearch.js`**，利用 **TF-IDF** 演算法取代傳統的關鍵字比對，讓搜尋結果真正按照「相關程度」排序。
* **智慧型多重索引**: 在建置時 (`Build-Time`) 將內容預處理為「**純文字**」、「**程式碼**」和「**數學公式**」三個獨立索引，並為**不同欄位設定不同權重** (`標題 > 標籤 > 內文 > 程式碼`)，實現了極高的搜尋精準度。
* **上下文感知查詢**: 搜尋邏輯能**自動偵測**使用者輸入的是「自然語言」還是「技術符號」，並**動態調整**搜尋策略，例如允許對程式碼中的單一字母變數進行搜尋。

### 🎨 應用程式級使用者體驗 (Application-Level User Experience)

專注於打造流暢、直觀、且充滿細節的互動體驗，讓網站從「頁面」提升至「產品」。

* **`⌘+K` 指揮中心**: 網站的核心互動中樞。實作了**巢狀（子母）指令介面**，不僅提供全站內容的毫秒級搜尋，更能執行「切換主題」、「複製資訊」等**動作**，並整合 API **即時顯示 GitHub 開發中任務**。
* **動態目錄 (TOC)**: 使用 **`IntersectionObserver` API** 實現捲動監聽，**自動高亮**使用者正在閱讀的章節，並以**手風琴效果**保持介面清爽，極大提升了長篇文章的導航效率。
* **細緻的 UI/UX**: 從 HackMD 風格的 UI 元素、`next/font` 優化的字體載入，到尊重系統偏好且可手動覆寫的**智慧型主題切換**，每一個細節都旨在提供最佳的閱讀與互動體驗。

### 🛠️ 最佳化內容管線 (Optimized Content Pipeline)

為技術內容的呈現，建立了一套高效且高品質的處理流程。

* **MDX 驅動**: 所有文章均採用 MDX 格式，允許在 Markdown 中無縫嵌入**互動式 React 元件**，為未來的 p5.js 視覺化等功能打下基礎。
* **高效語法高亮**: 透過 `rehype-pretty-code` + `shiki` 在**伺服器端**完成程式碼高亮，避免了客戶端的效能損耗，並提供媲美 VS Code 的視覺效果。
* **優雅的數學公式**: 整合 **KaTeX**，確保所有 LaTeX 數學公式都能被快速、正確且美觀地渲染。

---

## 🔗 全端 API 整合 (Full-Stack API Integration)

本專案不僅僅是一個靜態網站，更透過 Next.js 的後端 API 路由，實現了與 GitHub 服務的深度整合，展現了全端開發的能力。

### 1. 開發計畫儀表板 (Command Palette)

-   **前端實作**: 在 `⌘+K` 指令面板中，透過 React `useState` 管理巢狀視圖，打造出流暢的子母選單切換體驗。
-   **後端 API**: 建立 `/api/github-issues/route.ts` 路由，使用 `Octokit` 與 GitHub GraphQL API 溝通。
-   **核心功能**:
    -   安全地在伺服器端驗證 Personal Access Token，讀取**私有 (Private) GitHub Project** 的開發狀態。
    -   後端負責解析 API 回傳的資料，並將 Issues 篩選、分類為「待辦」與「進行中」兩個類別。
-   **效能優化**: 採用 `revalidate = 60` 的快取策略，讓使用者在 60 秒內的重複操作能享受瞬時載入的體驗，同時確保資料的高度即時性。

### 2. 專案統計儀表板 (Projects Page)

-   **前端實作**: 在專案導覽頁上，透過客戶端 `fetch` 非同步載入統計數據，實現靜態頁面與動態資訊的結合。
-   **後端 API**: 建立 `/api/github-stats/route.ts` 路由，向 GitHub REST API 請求多個專案的統計資料。
-   **核心功能**:
    -   批次抓取指定專案的星級 (Stars)、Fork 數、總提交數 (Total Commits) 等即時數據。
    -   API 部署於 Vercel 的 Edge Network (`runtime = 'edge'`)，提供全球性的低延遲回應。
-   **效能優化**: 考量到統計數據變動頻率較低，採用 `revalidate = 86400` (24 小時) 的長效快取策略，最大化效能並節省 API 請求資源。

---
## 🚀 如何在本機運行 (Setup and Run Locally)

1.  **複製專案 (Clone the repository):**
    ```bash
    git clone https://github.com/peienwu1216/peienwu-blog-next.git
    cd peienwu-blog-next
    ```

2.  **安裝依賴 (Install dependencies):**
    ```bash
    npm install
    # 或者 yarn install / pnpm install
    ```

3.  **啟動開發伺服器 (Start the development server):**
    ```bash
    npm run dev
    ```
    > `npm run dev` 指令會同時啟動 `contentlayer dev` 監視內容變更，並啟動 Next.js 開發伺服器。

    打開瀏覽器訪問 [http://localhost:3000](http://localhost:3000)。

4.  **環境變數設定 (Environment Variables):**
    此專案需要串接 GitHub API 來獲取開發計畫與專案統計資料。請在專案根目錄建立一個 `.env.local` 檔案，並填入以下內容：

    ```env
    # 用於讀取 GitHub repo 與 project 資訊的 Personal Access Token
    # 需要具備 `repo` 和 `read:project` 權限
    GITHUB_PAT="ghp_xxxxxxxxxxxxxxxxxxxx"

    # 您的 GitHub 使用者名稱
    GITHUB_USERNAME="your-github-username"

    # 您要追蹤的 GitHub Project 的數字編號
    GITHUB_PROJECT_ID="your-project-number"
    ```
    > **注意**: 當您將專案部署至 Vercel 等平台時，也必須在該平台的後台設定這些環境變數。

5.  **建置生產版本 (Build for production):**
    ```bash
    npm run build
    ```
