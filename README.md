# 🚧 peienwu-blog-next: 我的新一代個人部落格 🚧

這是我的個人部落格 ([peienwu.com](https://peienwu.com/)) 的下一代版本，目前正在積極開發中。我使用 Next.js 和 React 這對現代網頁技術組合來建構這個專案，目標是打造一個效能更好、功能更豐富、更具現代感的部落格平台，同時藉此機會深入學習這些令人興奮的技術！

## ✨ 專案目標與學習重點

* **深入學習 Next.js**：探索 Next.js 的強大功能，例如 App Router、Server Components、路由機制、資料獲取策略等。
* **掌握 MDX**：利用 MDX (Markdown + JSX) 的能力，讓我可以用 Markdown 的簡潔語法撰寫文章，同時能無縫嵌入 React 元件，實現更豐富的內容呈現。
* **提升前端技能**：透過實戰，加強我在 React、TypeScript (如果有的話)、CSS Modules/Tailwind CSS (如果計畫使用) 等前端技術棧的應用能力。
* **打造現代化部落格**：計畫實現一個具有良好使用者體驗、快速載入速度以及易於維護的部落格。

## 🚀 目前進度

* **MDX 內容渲染**：已成功在本機開發環境中渲染 `.mdx` 格式的部落格文章。
* **單篇文章顯示**：目前能夠在本機伺服器上成功運行並顯示至少一篇完整的 MDX 文章。
* **基礎專案架構**：已使用 `create-next-app` 完成基礎專案的搭建。

## 🛠️ 主要技術棧

* **框架 (Framework)**: [Next.js](https://nextjs.org/)
* **UI 函式庫 (UI Library)**: [React](https://reactjs.org/)
* **內容格式 (Content Format)**: [MDX](https://mdxjs.com/)
* **字型 (Font)**: [next/font](https://nextjs.org/docs/basic-features/font-optimization) 與 Geist (Vercel 新字型)

## 🏃 如何在本機啟動 (Getting Started)

如果你想在本機運行這個專案的目前版本：

1.  **複製儲存庫 (Clone the repository):**
    ```bash
    git clone [https://github.com/peienwu1216/peienwu-blog-next.git](https://github.com/peienwu1216/peienwu-blog-next.git)
    cd peienwu-blog-next
    ```

2.  **安裝依賴 (Install dependencies):**
    ```bash
    npm install
    # 或者 yarn install / pnpm install / bun install
    ```

3.  **啟動開發伺服器 (Run the development server):**
    ```bash
    npm run dev
    # 或者 yarn dev / pnpm dev / bun dev
    ```

4.  **在瀏覽器中開啟 (Open your browser):**
    開啟 [http://localhost:3000](http://localhost:3000) 查看結果。

你可以開始透過修改 `app/page.tsx` (或其他相關檔案) 來編輯頁面。檔案修改後，頁面會自動更新。

## 🔮 未來計畫與展望

* **完整部落格功能**：
    * 文章列表與分頁
    * 分類與標籤系統
    * 站內搜尋功能
    * 留言系統整合
* **UI/UX 優化**：設計更美觀、更易用的使用者介面與互動體驗。
* **效能調校**：確保部落格載入快速，達到生產環境標準。
* **部署上線**：將部落格部署到線上平台 (例如 Vercel, Netlify)。
* **SEO 優化**：提升部落格在搜尋引擎的能見度。

## 📝 筆記與學習資源

在開發過程中，我參考了以下資源：

* [Next.js Documentation](https://nextjs.org/docs) - Next.js 的官方文件。
* [Learn Next.js](https://nextjs.org/learn) - Next.js 的互動式教學。
* [MDX Documentation](https://mdxjs.com/) - MDX 的官方文件。

---

這個專案對我來說是一個很棒的學習旅程，我會持續更新進度。如果你有任何建議或想法，也歡迎隨時提出！
