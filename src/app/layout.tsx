// src/app/layout.tsx
import Link from 'next/link';
import './globals.css'; // 確保你的全域 CSS 檔案路徑正確
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: "Peienwu's Code Lab",
    template: "%s | Peienwu's Code Lab",
  },
  description: "這裡沒有魔法，只有還沒讀懂的 Source Code",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const blogTitle = "Peienwu's Code Lab";
  const blogSubtitle = "這裡沒有魔法，只有還沒讀懂的 Source Code";

  return (
    <html lang="zh-TW">
      <body className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans antialiased">
        
        {/* 頁首和導覽列 - 調整垂直 padding 和字體大小 */}
        <header className="py-4 sm:py-5 bg-white dark:bg-slate-800 shadow-md sticky top-0 z-50 w-full"> {/* py 變小 */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100"> {/* 字體變小 */}
              <Link href="/" className="hover:opacity-80 transition-opacity">{blogTitle}</Link>
            </h1>
            <p className="mt-1 text-base sm:text-lg text-slate-600 dark:text-slate-400"> {/* 上邊距和字體變小 */}
              {blogSubtitle}
            </p>
            <nav className="mt-4 space-x-3 sm:space-x-4 text-sm sm:text-base"> {/* 上邊距和字體變小 */}
              <Link href="/" className="font-medium text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">首頁</Link>
              <Link href="/about" className="font-medium text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">關於我</Link>
              <Link href="/categories" className="font-medium text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">分類</Link>
              <Link href="/tags" className="font-medium text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">標籤</Link>
            </nav>
          </div>
        </header>

        <main className="flex-grow w-full">
          {children}
        </main>

        <footer className="py-6 px-4 sm:px-6 text-center bg-slate-200 dark:bg-slate-800 border-t border-slate-300 dark:border-slate-700 mt-auto"> {/* 頁尾 padding 也可調整 */}
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">&copy; {new Date().getFullYear()} {blogTitle}. 保留所有權利.</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
            Powered by Next.js & Contentlayer. Deployed on Vercel.
          </p>
        </footer>

      </body>
    </html>
  );
}