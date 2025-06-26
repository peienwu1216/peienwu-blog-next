# Peienwu's Code Lab - 新一代個人技術部落格

[![Vercel Deployment](https://img.shields.io/github/deployments/peienwu1216/peienwu-blog-next/production?label=Vercel&logo=vercel&style=for-the-badge)](https://peienwu-blog-next.vercel.app/)

歡迎來到我的新一代技術部落格！這是一個使用 Next.js (App Router)、Contentlayer 和 Tailwind CSS 從零開始打造的現代化、高效能、且專注於閱讀體驗的個人網站。

這裡不僅是我記錄學習筆記、分享專案心得的地方，也是我實踐最新前端技術的實驗場。

**線上預覽:** [https://peienwu-blog-next.vercel.app/](https://peienwu-blog-next.vercel.app/)

![部落格文章頁面概覽](https://github.com/user-attachments/assets/70176ba7-cf9d-4c6d-b445-515bf94658d4)

## 📁 專案結構

```
.
├── src/
│   ├── app/                # Next.js App Router: 頁面與佈局
│   ├── components/         # 共用的 React 元件 (TOC, Note, etc.)
│   ├── lib/                # 輔助函式與工具
│   └── styles/             # 全域樣式與字體
├── content/
│   └── posts/              # .mdx 格式的部落格文章
├── public/                 # 靜態資源 (圖片, favicons)
├── contentlayer.config.ts  # Contentlayer 設定檔
├── tailwind.config.ts      # Tailwind CSS 設定檔
└── next.config.mjs         # Next.js 設定檔
```

## ✨ 核心功能 (Features)

*   **現代化技術棧**:
    *   **Next.js (App Router)**: 採用最新的 React Server Components (RSC) 架構，實現極致效能與開發體驗。
    *   **Contentlayer**: 型別安全的內容管理，將 `.mdx` 檔案無縫轉換為可供 Next.js 使用的資料。
    *   **Tailwind CSS**: 搭配 `@tailwindcss/typography` 實現快速、一致且高度客製化的 UI 設計。
    *   **TypeScript**: 全站使用 TypeScript，確保程式碼的健壯性與可維護性。

*   **優化的閱讀體驗**:
    *   **雙欄佈局**: 長篇文章頁面採用雙欄設計，左側為文章內容，右側為動態目錄，提升資訊獲取效率。
    *   **動態目錄 (TOC)**:
        *   使用 `IntersectionObserver` API 實現 **捲動監聽**，自動高亮當前閱讀章節。
        *   **手風琴效果**，預設僅展開當前 H2 章節下的 H3 子項目，保持介面清爽。
        *   提供「全部展開/收合」、「回到頂部/前往底部」等快捷按鈕。
        *   目錄項目支援 **兩行截斷**，避免過長標題破壞版面。
    *   **HackMD 風格 UI**: 模仿 HackMD 的視覺風格，對引用區塊、連結、行內程式碼等元素進行了細緻的樣式調整。
    *   **高效字體載入**: 透過 `next/font` 整合 Google Fonts (Noto Sans TC, JetBrains Mono)，解決了本地託管的效能問題。
    *   **手動主題切換**: 除了根據系統偏好設定自動切換外，也提供手動按鈕，讓使用者能自由在淺色與深色模式間切換，並將偏好儲存於 `localStorage`。

*   **動態專案儀表板**:
    *   **混合資料獲取策略**: 專案頁面結合了靜態與動態資料。專案的核心資訊（如標題、描述）是靜態建置的，以達到最快的載入速度。
    *   **即時 GitHub 統計**: 透過後端 API (`/api/github-stats`) 從 GitHub 拉取每個專案的即時星級 (Stars)、Fork 數與提交數。
    *   **長效快取優化**: 為了兼顧效能與數據時效性，此 API 採用了 **24 小時**的長效快取策略 (`revalidate = 86400`)，確保數據每日更新的同時，避免對 API 的過度請求。

*   **強大的內容功能**:
    *   **支援 MDX**: 可在 Markdown 中無縫嵌入互動式 React 元件。
    *   **伺服器端語法高亮**: 透過 `rehype-pretty-code` 與 `shiki`，提供美觀且高效的程式碼區塊高亮。
    *   **支援 KaTeX**: 優雅地展示數學公式。
    *   **完整的內容組織**: 支援文章的分類與標籤，並提供獨立的列表頁面。

*   **進階搜尋引擎 (⌘+K & /search)**:
    *   **關聯性優先排序**: 整合 `FlexSearch.js` 函式庫，取代傳統的關鍵字比對。搜尋結果會根據 TF-IDF (詞頻-逆文件頻率) 演算法進行評分，將最相關的文章排在最前面。
    *   **自訂欄位權重**: 為不同欄位設定了不同的搜尋權重（`標題 > 標籤/分類 > 內文 > 技術內容`），確保搜尋結果的精準度。
    *   **純淨化的搜尋索引**:
        *   在建置階段 (`next build`) 自動生成一個乾淨的搜尋索引 (`plainText`)。
        *   此索引會預先移除所有 Markdown 語法、MDX 註解、程式碼區塊及 LaTeX 公式，避免語法噪音干擾搜尋結果。
        *   同時建立一個獨立的技術內容索引 (`technicalText`)，讓程式碼和公式也可被搜尋，但賦予較低權重。
    *   **建置時索引 (Build-Time Indexing)**: 整個搜尋索引會在建置時預先產生，並儲存為一個靜態 JSON 檔 (`public/search-data.json`)。前端只需載入此檔案即可，實現了極致的搜尋速度與零客戶端運算負擔。

*   **互動式指令面板 (⌘+K)**:
    *   **巢狀指令介面**: 實作了巢狀（或稱子母）指令面板，在提供豐富功能的同時，保持主介面的簡潔優雅。
    *   **動態 GitHub Projects 整合**:
        *   主面板提供「查看開發計畫」入口，點擊後會流暢切換至子選單。
        *   子選單透過後端 API (`/api/github-issues`) **即時抓取**一個私有 GitHub Project 的開發狀態。
        *   API 會解析並分類顯示「待辦 (Todo)」與「進行中 (In Progress)」的 Issues 列表。
    *   **智慧快取策略**: 後端 API 採用 Next.js 的 `revalidate` 機制，設定了 **60 秒**的快取時間，在即時性與效能之間取得絕佳平衡。

*   **分析與監控**: 整合 **Vercel Analytics** 與 **Speed Insights**，用於追蹤與改善網站效能。

## 🔗 全端 API 整合 (Full-Stack API Integration)

本專案不僅僅是一個靜態網站，更透過 Next.js 的後端 API 路由，實現了與 GitHub 服務的深度整合，展現了全端開發的能力。

### 1. 開發計畫儀表板 (Command Palette)

- **前端實作**: 在 `⌘+K` 指令面板中，透過 React `useState` 管理巢狀視圖，打造出流暢的子母選單切換體驗。
- **後端 API**: 建立 `/api/github-issues/route.ts` 路由，使用 `Octokit` 與 GitHub GraphQL API 溝通。
- **核心功能**:
    - 安全地在伺服器端驗證 Personal Access Token，讀取**私有 (Private) GitHub Project** 的開發狀態。
    - 後端負責解析 API 回傳的資料，並將 Issues 篩選、分類為「待辦」與「進行中」兩個類別。
- **效能優化**: 採用 `revalidate = 60` 的快取策略，讓使用者在 60 秒內的重複操作能享受瞬時載入的體驗，同時確保資料的高度即時性。

### 2. 專案統計儀表板 (Projects Page)

- **前端實作**: 在專案導覽頁上，透過客戶端 `fetch` 非同步載入統計數據，實現靜態頁面與動態資訊的結合。
- **後端 API**: 建立 `/api/github-stats/route.ts` 路由，向 GitHub REST API 請求多個專案的統計資料。
- **核心功能**:
    - 批次抓取指定專案的星級 (Stars)、Fork 數、總提交數 (Total Commits) 等即時數據。
    - API 部署於 Vercel 的 Edge Network (`runtime = 'edge'`)，提供全球性的低延遲回應。
- **效能優化**: 考量到統計數據變動頻率較低，採用 `revalidate = 86400` (24 小時) 的長效快取策略，最大化效能並節省 API 請求資源。

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