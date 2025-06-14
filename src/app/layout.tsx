// src/app/layout.tsx
import { Inter, Fira_Code } from 'next/font/google'; // 引入新的字型
import './globals.css';
import { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader'; // 引入新的 Header 元件
import { Analytics } from '@vercel/analytics/next';

// 載入 Inter (主要內文)
const inter = Inter({
  weight: ['400', '500', '700'], // Inter 支援的字重
  subsets: ['latin', 'latin-ext'], // Inter 支援的子集
  variable: '--font-inter',      // 設定 CSS 變數
  display: 'swap',
});

// 載入 Fira Code (程式碼)
const firaCode = Fira_Code({
  weight: ['400', '700'], // Fira Code 支援的字重
  subsets: ['latin', 'latin-ext'], // Fira Code 支援的子集
  variable: '--font-fira-code',  // 設定 CSS 變數
  display: 'swap',
});

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

  return (
    <html lang="zh-TW" className={`${inter.variable} ${firaCode.variable}`}>
      <body className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 antialiased font-sans">
        
        <SiteHeader /> {/* 使用新的、可動態縮放的 Header */}

        <main className="flex-grow w-full">
          {children}
        </main>

        <footer className="py-6 px-4 sm:px-6 text-center bg-slate-200 dark:bg-slate-800 border-t border-slate-300 dark:border-slate-700 mt-auto">
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">&copy; {new Date().getFullYear()} {blogTitle}. 保留所有權利.</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
            Powered by Next.js & Contentlayer. Deployed on Vercel.
          </p>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}