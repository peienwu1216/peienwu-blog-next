import { useEffect } from 'react';

interface UseCountdownTimerProps {
  countdown: number;
  onCountdownUpdate: (newCountdown: number) => void;
}

/**
 * 倒計時 Hook
 * 處理倒計時邏輯，每秒更新一次
 */
export function useCountdownTimer({ countdown, onCountdownUpdate }: UseCountdownTimerProps): void {
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        onCountdownUpdate(countdown - 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [countdown, onCountdownUpdate]);
} 