// src/app/not-found.tsx
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '頁面找不到 | Peienwu\'s Code Lab',
};

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]"> {/* 調整 min-h 以適應 Header/Footer */}
      <h1 className="text-6xl sm:text-8xl font-extrabold text-green-600 dark:text-green-400 mb-4">
        404
      </h1>
      <p className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
        噢噢！找不到你要的頁面
      </p>
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
        你所尋找的頁面可能已經被移動、刪除，或者它從來沒有存在過。請檢查網址是否正確，或回到首頁重新開始。
      </p>
      <Link
        href="/"
        className="inline-block px-8 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors text-lg"
      >
        回到首頁
      </Link>
    </div>
  );
}