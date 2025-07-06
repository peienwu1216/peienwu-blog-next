import { useState, useEffect, useCallback, useRef } from 'react';
import { useMusicStore } from '@/store/music';
import { spotifyApiService } from '@/services/spotifyApiService';
import { showHtmlToast } from '@/lib/notify';
import { NotificationState } from '@/types/spotify';

interface UseMasterDeviceProps {
  deviceId: string | null;
}

interface UseMasterDeviceReturn {
  masterDeviceId: string | null;
  isControllable: boolean;
  expirationText: string;
  claimMasterDevice: () => Promise<boolean>;
  checkPermissions: () => Promise<boolean>;
  updateMasterDeviceStatus: () => Promise<void>;
}

// ✨ 會話持久化工具函數
const SessionPersistence = {
  // 生成唯一的會話 ID
  generateSessionId: (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
  
  // 獲取或創建會話 ID
  getOrCreateSessionId: (): string => {
    let sessionId = sessionStorage.getItem('spotify_session_id');
    if (!sessionId) {
      sessionId = SessionPersistence.generateSessionId();
      sessionStorage.setItem('spotify_session_id', sessionId);
    }
    return sessionId;
  },
  
  // 記錄主控狀態
  recordMasterStatus: (deviceId: string, ttl: number) => {
    const sessionId = SessionPersistence.getOrCreateSessionId();
    const masterRecord = {
      sessionId,
      deviceId,
      timestamp: Date.now(),
      ttl,
      expiresAt: Date.now() + (ttl * 1000)
    };
    
    localStorage.setItem('spotify_master_record', JSON.stringify(masterRecord));
    localStorage.setItem('spotify_was_master', 'true');
    localStorage.setItem('spotify_master_time', Date.now().toString());
  },
  
  // 檢查是否應該嘗試重新獲得主控權
  shouldAttemptReclaim: (): boolean => {
    const sessionId = SessionPersistence.getOrCreateSessionId();
    const masterRecord = localStorage.getItem('spotify_master_record');
    
    if (!masterRecord) return false;
    
    try {
      const record = JSON.parse(masterRecord);
      const now = Date.now();
      
      // 檢查是否是同一個會話且未過期
      if (record.sessionId === sessionId && record.expiresAt > now) {
        const timeSinceRecord = now - record.timestamp;
        // 如果記錄時間在 2 分鐘內，可能是頁面重新整理
        return timeSinceRecord < 2 * 60 * 1000;
      }
    } catch (error) {
      console.warn('Failed to parse master record:', error);
    }
    
    return false;
  },
  
  // 清除過期的記錄
  clearExpiredRecords: () => {
    const masterRecord = localStorage.getItem('spotify_master_record');
    if (masterRecord) {
      try {
        const record = JSON.parse(masterRecord);
        if (record.expiresAt <= Date.now()) {
          localStorage.removeItem('spotify_master_record');
          localStorage.removeItem('spotify_was_master');
          localStorage.removeItem('spotify_master_time');
        }
      } catch (error) {
        // 如果解析失敗，清除所有記錄
        localStorage.removeItem('spotify_master_record');
        localStorage.removeItem('spotify_was_master');
        localStorage.removeItem('spotify_master_time');
      }
    }
  }
};

export function useMasterDevice({ deviceId }: UseMasterDeviceProps): UseMasterDeviceReturn {
  const { setMasterInfo, setCountdown, countdown } = useMusicStore();
  
  const [masterDeviceId, setMasterDeviceId] = useState<string | null>(null);
  const [expirationText, setExpirationText] = useState<string>('5 分鐘');
  
  // Notification state management
  const notificationState = useRef<NotificationState>({
    hasShownLocked: false,
    hasShownExpired: false,
  });

  // Check if current device is controllable
  const isControllable = !masterDeviceId || masterDeviceId === deviceId;

  // Initialize master device config and status with retry and smart reclaim
  useEffect(() => {
    const initializeMasterDevice = async (retries = 2) => {
      // 首先清除過期的記錄
      SessionPersistence.clearExpiredRecords();
      
      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          const [masterData, configData] = await Promise.all([
            spotifyApiService.getMasterDevice(),
            spotifyApiService.getMasterDeviceConfig()
          ]);
          
          setMasterDeviceId(masterData.masterDeviceId);
          setExpirationText(configData.expirationText);
          
          const isMaster = !!deviceId && masterData.masterDeviceId === deviceId;
          const isLocked = !!masterData.masterDeviceId && masterData.masterDeviceId !== deviceId;
          
          // Update music store state
          setMasterInfo({
            isMaster,
            isLocked,
            ttl: masterData.ttl,
          });
          
          setCountdown(masterData.ttl || 0);
          
          // ✨ 智能重新聲明邏輯：使用會話持久化
          if (!masterData.masterDeviceId && deviceId) {
            if (SessionPersistence.shouldAttemptReclaim()) {
              console.log('Attempting to reclaim master device after page refresh (session-based)...');
              setTimeout(async () => {
                try {
                  const success = await claimMasterDevice();
                  if (success) {
                    showHtmlToast('已自動重新取得播放主控權！', { type: 'success' });
                  }
                } catch (error) {
                  console.warn('Auto reclaim failed:', error);
                }
              }, 2000); // Wait 2 seconds for player to be ready
            }
          }
          
          return; // Success, exit retry loop
        } catch (error) {
          console.warn(`Master device initialization attempt ${attempt + 1} failed:`, error);
          
          if (attempt === retries - 1) {
            // Last attempt failed
            console.error("Failed to initialize master device after retries:", error);
            
            // Set fallback values
            setMasterDeviceId(null);
            setExpirationText('5 分鐘');
            setMasterInfo({
              isMaster: false,
              isLocked: false,
              ttl: 0,
            });
            setCountdown(0);
          } else {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    };

    if (deviceId) {
      initializeMasterDevice();
    }
  }, [deviceId, setMasterInfo, setCountdown]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown, setCountdown]);

  // Update master device status and handle notifications with improved error handling
  const updateMasterDeviceStatus = useCallback(async () => {
    try {
      const data = await spotifyApiService.getMasterDevice();
      const wasMaster = masterDeviceId === deviceId;
      const isNowMaster = !!deviceId && data.masterDeviceId === deviceId;
      const isNowLocked = !!data.masterDeviceId && data.masterDeviceId !== deviceId;
      
      setMasterDeviceId(data.masterDeviceId);
      
      // Update music store state
      setMasterInfo({
        isMaster: isNowMaster,
        isLocked: isNowLocked,
        ttl: data.ttl,
      });
      
      setCountdown(data.ttl || 0);

      // Handle notifications based on state changes
      if (!data.masterDeviceId) {
        // Master device expired - clear all master records
        SessionPersistence.clearExpiredRecords();
        
        if (wasMaster && !notificationState.current.hasShownExpired) {
          showHtmlToast("您的播放控制權已過期，其他裝置現在可以取得控制權。");
          notificationState.current.hasShownExpired = true;
          notificationState.current.hasShownLocked = false;
        } else if (!wasMaster && !notificationState.current.hasShownExpired) {
          showHtmlToast("主控裝置已過期，現在可以播放了！");
          notificationState.current.hasShownExpired = true;
          notificationState.current.hasShownLocked = false;
        }
      } else if (isNowLocked && !notificationState.current.hasShownLocked) {
        // Device is now locked by another device
        showHtmlToast("目前由其他裝置控制中，無法播放。", { type: 'error' });
        notificationState.current.hasShownLocked = true;
        notificationState.current.hasShownExpired = false;
      } else if (isNowMaster) {
        // Became master device - reset notification states
        notificationState.current.hasShownLocked = false;
        notificationState.current.hasShownExpired = false;
      }
    } catch (error) {
      console.warn('Failed to update master device status:', error);
      
      // Only show error notification if it's not a token expiration issue
      // Token expiration will be handled by the retry mechanism in other methods
      if (error instanceof Error && !error.message.includes('401')) {
        // Silently handle non-auth errors to avoid spam
        console.error('Master device status update failed:', error.message);
      }
    }
  }, [masterDeviceId, deviceId, setMasterInfo, setCountdown]);

  // Periodic status check
  useEffect(() => {
    const interval = setInterval(updateMasterDeviceStatus, 7000);
    return () => clearInterval(interval);
  }, [updateMasterDeviceStatus]);

  // Claim master device ownership with enhanced error handling
  const claimMasterDevice = useCallback(async (): Promise<boolean> => {
    if (!deviceId) return false;

    try {
      const data = await spotifyApiService.claimMasterDevice(deviceId);
      
      if (data.success) {
        setMasterDeviceId(data.masterDeviceId);
        
        // ✨ 立即更新 music store 狀態
        setMasterInfo({
          isMaster: true,
          isLocked: false,
          ttl: data.ttl || 0,
        });
        setCountdown(data.ttl || 0);
        
        // ✨ 記錄主控狀態以支援智能重新聲明
        SessionPersistence.recordMasterStatus(deviceId, data.ttl || 0);
        
        showHtmlToast("已取得播放主控權！點按播放鍵開始播放");
        
        // Reset notification states
        notificationState.current.hasShownLocked = false;
        notificationState.current.hasShownExpired = false;
        
        // Immediately update status for other devices
        setTimeout(() => updateMasterDeviceStatus(), 500);
        
        return true;
      } else {
        showHtmlToast("哎呀！就在您點擊的瞬間，其他人搶先一步了！");
        setMasterDeviceId(data.currentMasterId || null);
        
        // ✨ 更新 music store 狀態
        setMasterInfo({
          isMaster: false,
          isLocked: !!data.currentMasterId,
          ttl: data.ttl || 0,
        });
        setCountdown(data.ttl || 0);
        
        setTimeout(() => updateMasterDeviceStatus(), 500);
        
        return false;
      }
    } catch (error) {
      console.error('Failed to claim master device:', error);
      
      // Enhanced error handling
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Authentication expired')) {
          showHtmlToast("Spotify 認證已過期，請重新整理頁面", { type: 'error' });
        } else {
          showHtmlToast(`取得播放主控權失敗: ${error.message}`, { type: 'error' });
        }
      } else {
        showHtmlToast("取得播放主控權失敗，請稍後再試", { type: 'error' });
      }
      
      return false;
    }
  }, [deviceId, updateMasterDeviceStatus]);

  // Check if device has permissions to perform actions with retry
  const checkPermissions = useCallback(async (maxRetries = 2): Promise<boolean> => {
    if (!deviceId) return false;

    // If we're already the master device, we have permissions
    if (masterDeviceId === deviceId) {
      return true;
    }

    // If there's another master device, check if it's still valid
    if (masterDeviceId && masterDeviceId !== deviceId) {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const data = await spotifyApiService.getMasterDevice();
          
          if (!data.masterDeviceId) {
            // Master device expired, clear local state
            setMasterDeviceId(null);
            
            // ✨ 更新 music store 狀態
            setMasterInfo({
              isMaster: false,
              isLocked: false,
              ttl: 0,
            });
            setCountdown(0);
            
            if (!notificationState.current.hasShownExpired) {
              if (deviceId === masterDeviceId) {
                showHtmlToast("您的播放控制權已過期，其他裝置現在可以取得控制權。");
              } else {
                showHtmlToast("主控裝置已過期，現在可以播放了！");
              }
              notificationState.current.hasShownExpired = true;
              notificationState.current.hasShownLocked = false;
            }
            
            return true; // Can now proceed
          } else if (data.masterDeviceId !== deviceId) {
            // ✨ 更新 music store 狀態
            setMasterInfo({
              isMaster: false,
              isLocked: true,
              ttl: data.ttl || 0,
            });
            setCountdown(data.ttl || 0);
            
            if (!notificationState.current.hasShownLocked) {
              showHtmlToast("目前由其他裝置控制中，無法播放。", { type: 'error' });
              notificationState.current.hasShownLocked = true;
              notificationState.current.hasShownExpired = false;
            }
            return false;
          } else {
            // We are the master device, update local state
            setMasterDeviceId(data.masterDeviceId);
            
            // ✨ 更新 music store 狀態
            setMasterInfo({
              isMaster: true,
              isLocked: false,
              ttl: data.ttl || 0,
            });
            setCountdown(data.ttl || 0);
            
            notificationState.current.hasShownLocked = false;
            notificationState.current.hasShownExpired = false;
            return true;
          }
        } catch (error) {
          console.warn(`Permission check attempt ${attempt + 1} failed:`, error);
          
          if (attempt === maxRetries - 1) {
            // Last attempt failed
            if (error instanceof Error && error.message.includes('401')) {
              showHtmlToast('Spotify 認證已過期，請重新整理頁面', { type: 'error' });
            } else {
              showHtmlToast('檢查播放權限失敗，請稍後再試。', { type: 'error' });
            }
            return false;
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    // No master device, permissions available
    return true;
  }, [deviceId, masterDeviceId]);

  return {
    masterDeviceId,
    isControllable,
    expirationText,
    claimMasterDevice,
    checkPermissions,
    updateMasterDeviceStatus,
  };
} 