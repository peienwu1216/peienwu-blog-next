# 🚧 peienwu-blog-next: 我的新一代個人部落格 🚧

> Peienwu's Code Lab - Next.js 個人部落格

歡迎來到 "Peienwu's Code Lab"！這是一個使用 Next.js、Contentlayer 和 Tailwind CSS 打造的現代化個人部落格。
這是我的個人部落格 ([peienwu.com](https://peienwu.com/)) 的下一代版本，目前正在積極開發中。我使用 Next.js 和 React 這對現代網頁技術組合來建構這個專案，目標是打造一個效能更好、功能更豐富、更具現代感的部落格平台，同時藉此機會深入學習這些令人興奮的技術！

**線上預覽:** [https://peienwu-blog-next.vercel.app/](https://peienwu-blog-next.vercel.app/)

![部落格首頁概覽](https://github.com/user-attachments/assets/58a2d7c9-67eb-4e29-9989-b700b833a64a)

## ✨ 專案特色 (Features)

* **現代化技術棧:**
    * **Next.js (App Router):** 使用最新的 React Server Components 和 App Router 架構。
    * **Contentlayer:** 型別安全的內容管理，將 Markdown/MDX 檔案轉換為易於使用的資料。
    * **Tailwind CSS:** Utility-first 的 CSS 框架，用於快速建構美觀的介面。
    * **TypeScript:** 增強程式碼的健壯性和可維護性。
* **Markdown/MDX 支援:** 方便撰寫技術文章和筆記，支援嵌入 React 元件。
* **響應式設計:** 適應不同裝置的螢幕尺寸。
* **語法高亮:** 使用 `rehype-pretty-code` 和 Shiki 為程式碼區塊提供美觀的語法高亮。
* **主要頁面:**
    * 首頁 (展示個人簡介和最新文章)
    * 關於我頁面
    * 分類列表頁面
    * 標籤列表頁面
    * 單篇文章頁面
    * 404 找不到頁面
* **部署於 Vercel:** 實現 CI/CD，輕鬆部署和更新。

## 🚀 目前進度 (截至 2025-05-11)

* **基礎架構搭建：**
    * 成功初始化 Next.js 專案 (App Router)。
    * 整合 Contentlayer 管理 `.mdx` 格式的文章內容。
    * 設定 Tailwind CSS 進行樣式設計。
* **核心頁面實作：**
    * **全站佈局 (`layout.tsx`)：** 包含共享的頁首 (部落格標題、副標題、導覽列) 和頁尾。頁首已調整為較窄的固定樣式。
    * **首頁 (`page.tsx`)：** 展示個人簡介和最新文章列表，移除了與全站標題重複的頁面級 H1 標題。
    * **關於我頁面 (`about/page.tsx`)：** 介紹部落格主旨和作者。
    * **分類列表頁 (`categories/page.tsx`)：** 動態生成所有文章分類列表，並顯示各分類下的文章數量。
    * **標籤列表頁 (`tags/page.tsx`)：** 動態生成所有文章標籤列表，並顯示各標籤的使用次數。
    * **單篇文章頁面 (`[slug]/page.tsx`)：** 能夠正確渲染 MDX 文章內容，包含標題、日期、分類、標籤等元數據。
    * **404 頁面 (`not-found.tsx`)：** 提供使用者友善的「找不到頁面」提示。
* **內容與樣式：**
    * 實現了 MDX 文章中圖片的正確顯示 (例如個人頭像)。
    * 為 `.mdx` 中的程式碼區塊成功整合了 `rehype-pretty-code` 進行語法高亮 (例如使用 `github-dark` 主題)。
    * 初步完成了 Note 元件 (`Note.tsx`) 的建立與使用。
    * 選用並套用了新的全站字體 (Noto Sans TC 和 JetBrains Mono) 以提升閱讀體驗。
* **部署：**
    * 專案已成功部署到 Vercel，可透過上述連結公開訪問。

## 🛠️ 開發與除錯歷程摘要 (Highlights)

在開發過程中，我們一起解決了幾個有趣的問題：

1.  **`Module not found` (例如 `Note` 元件)：**
    * **原因：** 嘗試引入一個尚未建立或路徑不正確的元件。
    * **解決：** 建立了 `src/components/Note.tsx` 元件，並確保了引入路徑 (相對路徑或路徑別名 `@/`) 的正確性。同時討論了如何設定 `tsconfig.json` 中的路徑別名。

2.  **圖片路徑問題：**
    * **原因：** 在 Next.js `<Image />` 元件中，對於 `public` 資料夾下的靜態資源，`src` 路徑應以 `/` 開頭。
    * **解決：** 修正了圖片路徑，例如從 `public/images/avatar.jpeg` 改為在程式碼中使用 `/images/avatar.jpeg`。

3.  **程式碼區塊語法高亮：**
    * **挑戰：** 初步設定 `rehype-pretty-code` 後，高亮顏色未套用，或行號未出現。
    * **解決：**
        * 確認安裝了 `rehype-pretty-code` 和 `shiki`。
        * 在 `contentlayer.config.ts` 中正確設定 `rehypePrettyCode` 選項，包括選擇合適的 Shiki 主題 (例如 `github-dark`) 並設定 `keepBackground: false`。
        * 確保 MDX 程式碼區塊使用了正確的語言標識符 (例如 ` ```cpp `)。
        * 清除 Contentlayer 和 Next.js 的快取 (`.contentlayer`, `.next` 資料夾)。
        * 檢查 HTML 結構，確認 Shiki 產生的帶有顏色 style 的 `<span>` 元素確實存在。*(目前行號功能暫緩)*

4.  **Git 推送問題 (`Workspace first`, `divergent branches`)：**
    * **原因：** 本地分支落後於遠端分支，或本地與遠端有分叉的提交。
    * **解決：** 使用 `git pull origin main` (或 `git pull origin main --no-rebase`) 將遠端變更合併到本地，解決衝突 (如果有的話)，然後再 `git push`。

這個除錯歷程對於理解專案的演進和學習過程非常有價值。

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
    打開瀏覽器訪問 [http://localhost:3000](http://localhost:3000)。

4.  **建置生產版本 (Build for production):**
    ```bash
    npm run build
    ```

5.  **在本機運行生產版本 (Start production server locally):**
    ```bash
    npm run start
    ```

## 🛠️ 主要技術棧 (Tech Stack)

* [Next.js](https://nextjs.org/) - React 框架
* [React](https://reactjs.org/) - UI 函式庫
* [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集
* [Contentlayer](https://www.contentlayer.dev/) - 內容 SDK (MDX 管理)
* [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS 框架
* [MDX](https://mdxjs.com/) - Markdown 與 JSX 的結合
* [rehype-pretty-code](https://rehype-pretty-code.netlify.app/) & [Shiki](https://shiki.style/) - 伺服器端語法高亮
* [Vercel](https://vercel.com/) - 部署平台

## 🔮 未來展望 (Future Plans - 可選)

* [ ] 實作程式碼區塊行號顯示功能。
* [ ] 完成「分類」和「標籤」的動態內頁 (`/categories/[categoryName]` 和 `/tags/[tagName]`)。
* [ ] 加入搜尋文章功能。
* [ ] 搬運我的舊網站文章，優化並改成新格式。
* [ ] 優化圖片載入與處理。
* [ ] 完善 SEO 設定。
* [ ] 持續學習與創作。

---
