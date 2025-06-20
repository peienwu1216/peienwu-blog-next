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

*   **強大的內容功能**:
    *   **支援 MDX**: 可在 Markdown 中無縫嵌入互動式 React 元件。
    *   **伺服器端語法高亮**: 透過 `rehype-pretty-code` 與 `shiki`，提供美觀且高效的程式碼區塊高亮。
    *   **支援 KaTeX**: 優雅地展示數學公式。
    *   **完整的內容組織**: 支援文章的分類與標籤，並提供獨立的列表頁面。

*   **分析與監控**: 整合 **Vercel Analytics** 與 **Speed Insights**，用於追蹤與改善網站效能。

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

4.  **建置生產版本 (Build for production):**
    ```bash
    npm run build
    ```
    > `npm run build` 指令會先執行 `contentlayer build` 確保所有內容都已生成。

5.  **在本機運行生產版本 (Start production server locally):**
    ```bash
    npm run start
    ```

## 🛠️ 主要技術與工具棧 (Tech & Tool Stack)

*   **框架**: Next.js, React
*   **語言**: TypeScript
*   **內容**: Contentlayer, MDX
*   **樣式**: Tailwind CSS, PostCSS
*   **MDX 處理**:
    *   `remark-gfm` (GitHub Flavored Markdown)
    *   `rehype-slug` & `rehype-autolink-headings` (自動為標題加上錨點連結)
    *   `rehype-pretty-code` & `shiki` (語法高亮)
    *   `remark-math` & `rehype-katex` (數學公式)
*   **部署與監控**: Vercel, Vercel Analytics, Vercel Speed Insights
*   **套件管理**: npm

## 🔮 未來展望 (Future Plans)

- [ ] **實作全站搜尋**: 提供快速、準確的文章內容搜尋功能。
- [ ] **產生 RSS Feed**: 讓讀者可以透過 RSS 閱讀器訂閱最新文章。
- [ ] **完善 SEO**: 自動生成 `sitemap.xml` 和 `robots.txt`，並為文章頁面加入結構化資料 (JSON-LD)。
- [ ] **優化圖片體驗**: 導入 `plaiceholder` 或類似技術，為圖片提供模糊佔位符，提升 LCP 表現。
- [ ] **增加互動性**: 整合 [Giscus](https://giscus.app/zh-TW) 留言系統，讓部落格成為一個可以交流的社群。
- [ ] **擴充 MDX 元件庫**: 開發更多實用的自訂元件，例如可收合的警告塊、互動式圖表等。
- [ ] **手動主題切換**: 除了根據系統偏好設定外，也提供手動切換淺色/深色模式的按鈕。

---
> This README is actively maintained. Last updated on 2025-06-21.
