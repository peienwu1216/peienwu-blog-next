'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useMediaQuery } from '@/lib/use-media-query';

// 自訂的提示框樣式
export function CustomToast({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg border border-slate-200/50 dark:border-slate-700/50">
      <div className="mt-0.5">
        {icon}
      </div>
      <div className="flex-1 text-sm text-slate-700 dark:text-slate-200" dangerouslySetInnerHTML={{ __html: message }}>
      </div>
    </div>
  );
}

// Pro Tip 圖示
const ProTipIcon = () => (
  <div className="text-yellow-500 dark:text-yellow-400">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  </div>
);

export function ProTipToast() {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    // 檢查 sessionStorage，確保提示只顯示一次
    if (sessionStorage.getItem('proTipShown')) {
      return;
    }

    const timer = setTimeout(() => {
      const desktopMessage = '<strong>Pro Tip:</strong> 按下 <strong>⌘+K</strong>，搜尋文章或執行指令！';
      const mobileMessage = '<strong>Pro Tip:</strong> 點擊頂部「搜尋」圖示，探索更多隱藏功能！';
      
      const message = isDesktop ? desktopMessage : mobileMessage;

      toast.custom(() => <CustomToast icon={<ProTipIcon />} message={message} />, {
        duration: 10000, // 10秒後自動消失
        position: 'bottom-right',
      });

      // 標記已顯示
      sessionStorage.setItem('proTipShown', 'true');
    }, 3000); // 頁面載入3秒後顯示

    return () => clearTimeout(timer);
  }, [isDesktop]);

  return null; // 這個元件本身不渲染任何東西
} 