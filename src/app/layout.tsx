// src/app/layout.tsx
import { Inter, Fira_Code } from 'next/font/google'; // 引入新的字型
import './globals.css';
import { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader'; // 引入新的 Header 元件
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '@/components/ThemeProvider'; // 引入 ThemeProvider
import { Toaster } from 'sonner'; // 引入 sonner
import { ProTipToast } from '@/components/ProTipToast'; // 引入 ProTipToast
import ConditionalAiButton from '@/components/ConditionalAiButton'; // 引入新的 AI 按鈕元件
import { SpotifyProvider } from '@/components/SpotifyProvider'; // 1. 匯入 SpotifyProvider
import Script from 'next/script'; // 1. 匯入 Script 元件

// 載入 Inter (主要內文)
const inter = Inter({
  subsets: ['latin', 'latin-ext'], // Inter 支援的子集
  variable: '--font-inter',      // 設定 CSS 變數
  display: 'swap',
});

// 載入 Fira Code (程式碼)
const firaCode = Fira_Code({
  subsets: ['latin', 'latin-ext'], // Fira Code 支援的子集
  variable: '--font-fira-code',  // 設定 CSS 變數
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://peienwu-blog-next.vercel.app'),
  title: {
    default: "Peienwu's Code Lab",
    template: "%s | Peienwu's Code Lab",
  },
  description: "這裡沒有魔法，只有還沒讀懂的 Source Code",
  openGraph: {
    title: "Peienwu's Code Lab",
    description: "這裡沒有魔法，只有還沒讀懂的 Source Code",
    url: 'https://peienwu-blog-next.vercel.app',
    siteName: "Peienwu's Code Lab",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Peienwu's Code Lab",
      },
    ],
    locale: "zh_TW",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const blogTitle = "Peienwu's Code Lab";

  return (
    <html lang="zh-TW" className={`${inter.variable} ${firaCode.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 antialiased font-sans">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          {/* 2. 將 SpotifyProvider 包裹在主要內容外層 */}
          <SpotifyProvider>
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
            <SpeedInsights />
            <Toaster 
              theme="system" 
              expand={true}
              position="bottom-right"
              closeButton={true}
              duration={4000}
              containerAriaLabel="Global Toaster"
              className="!bg-white dark:!bg-slate-800 !border !border-slate-200 dark:!border-slate-700 !shadow-lg"
              toastOptions={{
                style: {
                  background: 'var(--toast-background)',
                  color: 'var(--toast-color)',
                  border: '1px solid var(--toast-border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  marginRight: '6rem',
                  marginBottom: '1.5rem',
                },
                className: '!bg-white dark:!bg-slate-800 !border !border-slate-200 dark:!border-slate-700 !shadow-lg',
              }}
            />
            <ProTipToast />
            <ConditionalAiButton />
          </SpotifyProvider>
          <Script src="https://sdk.scdn.co/spotify-player.js" />
        </ThemeProvider>
      </body>
    </html>
  );
}