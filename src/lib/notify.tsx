import React from 'react';
import { toast } from 'sonner';

// --- (第一部分：圖示與設定檔，保持不變) ---
const NotificationIcons = {
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" 
        fill="#22C55E"
      />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM15 13.59L13.59 15L10 11.41L6.41 15L5 13.59L8.59 10L5 6.41L6.41 5L10 8.59L13.59 5L15 6.41L11.41 10L15 13.59Z" 
        fill="#EF4444"
      />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M10 0L0 18H20L10 0ZM11 15H9V13H11V15ZM11 11H9V7H11V11Z" 
        fill="#F59E0B"
      />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V9H11V15ZM11 7H9V5H11V7Z" 
        fill="#3B82F6"
      />
    </svg>
  ),
};

const NOTIFICATION_CONFIG = {
  MAX_TOASTS: 5,
} as const;

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationOptions {
  type?: NotificationType;
  duration?: number;
}

// --- (第二部分：智慧化邏輯核心) ---

// 1. 定義新的常數，用於計算停留時間
const BASE_DURATIONS: Record<NotificationType, number> = {
  success: 2500,
  info: 3000,
  warning: 6000,
  error: 8000,
};
const CHARS_PER_SECOND = 15; // 假設每秒可閱讀 15 個字元
const MIN_DURATION = 3000;
const MAX_DURATION = 15000; // 最長停留 15 秒

/**
 * 根據訊息內容，自動偵測最適合的通知類型
 */
function autoDetectType(message: string): NotificationType {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('成功') || lowerMsg.includes('已取得') || lowerMsg.includes('已開始') || 
      lowerMsg.includes('完成') || lowerMsg.includes('已複製') || lowerMsg.includes('已啟動') ||
      lowerMsg.includes('success') || lowerMsg.includes('completed') || lowerMsg.includes('saved')) {
    return 'success';
  }
  
  if (lowerMsg.includes('失敗') || lowerMsg.includes('錯誤') || lowerMsg.includes('無法') || 
      lowerMsg.includes('尚未準備') || lowerMsg.includes('檢查失敗') || lowerMsg.includes('為空') ||
      lowerMsg.includes('error') || lowerMsg.includes('failed') || lowerMsg.includes('cannot')) {
    return 'error';
  }
  
  if (lowerMsg.includes('警告') || lowerMsg.includes('注意') || lowerMsg.includes('小心') ||
      lowerMsg.includes('warning') || lowerMsg.includes('caution')) {
    return 'warning';
  }
  
  return 'info';
}

/**
 * ✨ 新的智慧型停留時間計算函式 ✨
 * @param message 訊息內容 (純文字或 HTML)
 * @param options 通知選項
 * @returns 計算後的停留時間 (毫秒)
 */
function getDynamicDuration(message: string, options?: NotificationOptions): number {
  // 優先權 1: 如果使用者明確指定了 duration，則直接使用
  if (options?.duration) {
    return options.duration;
  }
  
  const type = options?.type || autoDetectType(message);
  
  // 步驟 1: 根據通知類型取得基礎停留時間
  const baseDuration = BASE_DURATIONS[type];
  
  // 步驟 2: 計算閱讀所需時間
  // 為了處理 HTML，先移除所有 HTML 標籤來估算純文字長度
  const textContent = message.replace(/<[^>]*>/g, '');
  const additionalReadingTime = Math.ceil(textContent.length / CHARS_PER_SECOND) * 1000;
  
  // 步驟 3: 計算總時間 = 基礎時間 + 閱讀時間
  const totalDuration = baseDuration + additionalReadingTime;
  
  // 步驟 4: 套用上下限，確保時間在合理範圍內
  return Math.max(MIN_DURATION, Math.min(totalDuration, MAX_DURATION));
}


// --- (第三部分：主要的通知觸發函式，現在會使用新的智慧化邏輯) ---

/**
 * 統一的通知函式，顯示純文字訊息
 * @param message 通知訊息
 * @param options 可選的通知設定
 */
export function showToast(message: string, options?: NotificationOptions) {
  const type = options?.type || autoDetectType(message);
  const duration = getDynamicDuration(message, options); // ✨ 使用新的動態計算函式
  const icon = NotificationIcons[type];

  toast.custom(
    (t) => (
      <div
        className={`
          group relative overflow-hidden backdrop-blur-md bg-white/80 dark:bg-gray-900/80
          border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl
          w-fit min-w-[200px] max-w-[calc(100vw-2rem)] sm:max-w-md sm:w-96 p-4
          transition-all duration-200 ease-out
          ${t ? 'animate-in slide-in-from-bottom-2' : 'animate-out slide-out-to-bottom-2'}
        `}
        style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-gray-800/20 pointer-events-none" />
        <div className="relative flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">{icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-5 break-words">
              {message}
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t)}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    ),
    {
      duration,
      id: `toast-${Date.now()}`,
    }
  );
}

/**
 * 統一的通知函式，可顯示包含 HTML 的訊息
 * @param htmlMessage HTML 內容的字串
 * @param options 可選的通知設定
 */
export function showHtmlToast(htmlMessage: string, options?: NotificationOptions) {
  const type = options?.type || autoDetectType(htmlMessage);
  const duration = getDynamicDuration(htmlMessage, options); // ✨ 使用新的動態計算函式
  const icon = NotificationIcons[type];

  toast.custom(
    (t) => (
      <div
        className={`
          group relative overflow-hidden backdrop-blur-md bg-white/80 dark:bg-gray-900/80
          border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl
          w-fit min-w-[200px] max-w-[calc(100vw-2rem)] sm:max-w-md sm:w-96 p-4
          transition-all duration-200 ease-out
          ${t ? 'animate-in slide-in-from-bottom-2' : 'animate-out slide-out-to-bottom-2'}
        `}
        style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-gray-800/20 pointer-events-none" />
        <div className="relative flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">{icon}</div>
          <div 
            className="flex-1 min-w-0 text-sm font-medium text-gray-900 dark:text-gray-100 leading-5"
            dangerouslySetInnerHTML={{ __html: htmlMessage }}
          />
          <button
            onClick={() => toast.dismiss(t)}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    ),
    {
      duration,
      id: `html-toast-${Date.now()}`,
    }
  );
}

// --- (第四部分：輔助函式，保持不變) ---

export const toast_success = (message: string, options?: Omit<NotificationOptions, 'type'>) => 
  showToast(message, { ...options, type: 'success' });

export const toast_error = (message: string, options?: Omit<NotificationOptions, 'type'>) => 
  showToast(message, { ...options, type: 'error' });

export const toast_warning = (message: string, options?: Omit<NotificationOptions, 'type'>) => 
  showToast(message, { ...options, type: 'warning' });

export const toast_info = (message: string, options?: Omit<NotificationOptions, 'type'>) => 
  showToast(message, { ...options, type: 'info' });

// 為了相容性，保留舊的 notify 函式
/** @deprecated Use showToast instead */
export function notify(message: string, options?: NotificationOptions) {
  showToast(message, options);
}

/** @deprecated Use showHtmlToast instead */
export function notifyHtml(htmlMessage: string, options?: NotificationOptions) {
  showHtmlToast(htmlMessage, options);
}

export { NOTIFICATION_CONFIG };