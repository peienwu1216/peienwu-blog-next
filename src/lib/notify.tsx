import React from 'react';
import { toast } from 'sonner';

// Custom high-quality icons for notifications
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

// Unified notification configuration
const NOTIFICATION_CONFIG = {
  DEFAULT_DURATION: 3000,
  LONG_DURATION: 5000,
  SHORT_DURATION: 2000,
  POSITION: 'bottom-right' as const,
  MAX_TOASTS: 5,
} as const;

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationOptions {
  type?: NotificationType;
  duration?: number;
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Auto-detect notification type based on message content
 */
function autoDetectType(message: string): NotificationType {
  const lowerMsg = message.toLowerCase();
  
  // Success keywords
  if (lowerMsg.includes('成功') || lowerMsg.includes('已取得') || lowerMsg.includes('已開始') || 
      lowerMsg.includes('完成') || lowerMsg.includes('已複製') || lowerMsg.includes('已啟動') ||
      lowerMsg.includes('success') || lowerMsg.includes('completed') || lowerMsg.includes('saved')) {
    return 'success';
  }
  
  // Error keywords
  if (lowerMsg.includes('失敗') || lowerMsg.includes('錯誤') || lowerMsg.includes('無法') || 
      lowerMsg.includes('尚未準備') || lowerMsg.includes('檢查失敗') || lowerMsg.includes('為空') ||
      lowerMsg.includes('error') || lowerMsg.includes('failed') || lowerMsg.includes('cannot')) {
    return 'error';
  }
  
  // Warning keywords
  if (lowerMsg.includes('警告') || lowerMsg.includes('注意') || lowerMsg.includes('小心') ||
      lowerMsg.includes('warning') || lowerMsg.includes('caution')) {
    return 'warning';
  }
  
  return 'info';
}

/**
 * Get duration based on priority
 */
function getDuration(options?: NotificationOptions): number {
  if (options?.duration) return options.duration;
  
  switch (options?.priority) {
    case 'high':
      return NOTIFICATION_CONFIG.LONG_DURATION;
    case 'low':
      return NOTIFICATION_CONFIG.SHORT_DURATION;
    default:
      return NOTIFICATION_CONFIG.DEFAULT_DURATION;
  }
}

/**
 * Unified notification function with consistent styling
 * @param message The notification message
 * @param options Optional notification configuration
 */
export function showToast(message: string, options?: NotificationOptions) {
  const type = options?.type || autoDetectType(message);
  const duration = getDuration(options);
  const icon = NotificationIcons[type];

  toast.custom(
    (t) => (
      <div
        className={`
          group relative overflow-hidden
          backdrop-blur-md bg-white/80 dark:bg-gray-900/80
          border border-gray-200/50 dark:border-gray-700/50
          rounded-xl shadow-xl
          w-fit min-w-[200px] max-w-[calc(100vw-2rem)]
          sm:max-w-md sm:w-96
          p-4
          transition-all duration-200 ease-out
          ${t ? 'animate-in slide-in-from-bottom-2' : 'animate-out slide-out-to-bottom-2'}
        `}
        style={{
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-gray-800/20 pointer-events-none" />
        
        {/* Content */}
        <div className="relative flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {icon}
          </div>
          
          {/* Message */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-5 break-words">
              {message}
            </p>
          </div>
          
          {/* Close button */}
          <button
            onClick={() => toast.dismiss(t)}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M12 4L4 12M4 4L12 12" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
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
 * Legacy compatibility function
 * @deprecated Use showToast instead
 */
export function notify(message: string, options?: NotificationOptions) {
  showToast(message, options);
}

/**
 * HTML notification function with unified styling
 * @param htmlMessage HTML content for the notification
 * @param options Optional notification configuration
 */
export function showHtmlToast(htmlMessage: string, options?: NotificationOptions) {
  const type = options?.type || autoDetectType(htmlMessage);
  const duration = getDuration(options);
  const icon = NotificationIcons[type];

  toast.custom(
    (t) => (
      <div
        className={`
          group relative overflow-hidden
          backdrop-blur-md bg-white/80 dark:bg-gray-900/80
          border border-gray-200/50 dark:border-gray-700/50
          rounded-xl shadow-xl
          w-fit min-w-[200px] max-w-[calc(100vw-2rem)]
          sm:max-w-md sm:w-96
          p-4
          transition-all duration-200 ease-out
          ${t ? 'animate-in slide-in-from-bottom-2' : 'animate-out slide-out-to-bottom-2'}
        `}
        style={{
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-gray-800/20 pointer-events-none" />
        
        {/* Content */}
        <div className="relative flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {icon}
          </div>
          
          {/* HTML Message */}
          <div 
            className="flex-1 min-w-0 text-sm font-medium text-gray-900 dark:text-gray-100 leading-5"
            dangerouslySetInnerHTML={{ __html: htmlMessage }}
          />
          
          {/* Close button */}
          <button
            onClick={() => toast.dismiss(t)}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M12 4L4 12M4 4L12 12" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
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

/**
 * Legacy compatibility function
 * @deprecated Use showHtmlToast instead
 */
export function notifyHtml(htmlMessage: string, options?: NotificationOptions) {
  showHtmlToast(htmlMessage, options);
}

// Convenience functions for specific notification types
export const toast_success = (message: string, options?: Omit<NotificationOptions, 'type'>) => 
  showToast(message, { ...options, type: 'success' });

export const toast_error = (message: string, options?: Omit<NotificationOptions, 'type'>) => 
  showToast(message, { ...options, type: 'error' });

export const toast_warning = (message: string, options?: Omit<NotificationOptions, 'type'>) => 
  showToast(message, { ...options, type: 'warning' });

export const toast_info = (message: string, options?: Omit<NotificationOptions, 'type'>) => 
  showToast(message, { ...options, type: 'info' });

// Export configuration for external use
export { NOTIFICATION_CONFIG }; 