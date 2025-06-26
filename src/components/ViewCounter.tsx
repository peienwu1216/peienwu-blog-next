'use client';

import { useEffect } from 'react';
import useSWR from 'swr';

interface ViewCounterProps {
  slug: string;
}

// 定義一個 fetcher 函數，swr 會用它來獲取數據
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);


export default function ViewCounter({ slug }: ViewCounterProps) {
  // 使用 SWR 來獲取閱覽次數
  // 它會自動處理快取、重新驗證等
  const { data, error } = useSWR(`/api/views/${slug}`, fetcher);

  // 在元件載入時，發送 POST 請求來增加計數
  useEffect(() => {
    fetch(`/api/views/${slug}`, {
      method: 'POST',
    });
  }, [slug]);

  const views = data?.views;

  if (error) {
    return <div className="text-sm text-slate-500">無法載入閱覽次數</div>;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
      <EyeIcon className="w-5 h-5" />
      <span>{views ? `${views.toLocaleString()} 次閱覽` : '--- 次閱覽'}</span>
    </div>
  );
} 