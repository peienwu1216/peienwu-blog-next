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

  // Initialize master device config and status
  useEffect(() => {
    const initializeMasterDevice = async () => {
      try {
        const [masterData, configData] = await Promise.all([
          spotifyApiService.getMasterDevice(),
          spotifyApiService.getMasterDeviceConfig()
        ]);
        
        setMasterDeviceId(masterData.masterDeviceId);
        setExpirationText(configData.expirationText);
        
        // Update music store state
        setMasterInfo({
          isMaster: !!deviceId && masterData.masterDeviceId === deviceId,
          isLocked: !!masterData.masterDeviceId && masterData.masterDeviceId !== deviceId,
          ttl: masterData.ttl,
        });
        
        setCountdown(masterData.ttl || 0);
      } catch (error) {
        console.error("Failed to initialize master device", error);
      }
    };

    initializeMasterDevice();
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

  // Update master device status and handle notifications
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
        // Master device expired
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
      console.error('Failed to update master device status:', error);
    }
  }, [masterDeviceId, deviceId, setMasterInfo, setCountdown]);

  // Periodic status check
  useEffect(() => {
    const interval = setInterval(updateMasterDeviceStatus, 7000);
    return () => clearInterval(interval);
  }, [updateMasterDeviceStatus]);

  // Claim master device ownership
  const claimMasterDevice = useCallback(async (): Promise<boolean> => {
    if (!deviceId) return false;

    try {
      const data = await spotifyApiService.claimMasterDevice(deviceId);
      
      if (data.success) {
        setMasterDeviceId(data.masterDeviceId);
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
        setTimeout(() => updateMasterDeviceStatus(), 500);
        
        return false;
      }
    } catch (error) {
      console.error('Failed to claim master device:', error);
      showHtmlToast("取得播放主控權失敗。", { type: 'error' });
      return false;
    }
  }, [deviceId, updateMasterDeviceStatus]);

  // Check if device has permissions to perform actions
  const checkPermissions = useCallback(async (): Promise<boolean> => {
    if (!deviceId) return false;

    // If we're already the master device, we have permissions
    if (masterDeviceId === deviceId) {
      return true;
    }

    // If there's another master device, check if it's still valid
    if (masterDeviceId && masterDeviceId !== deviceId) {
      try {
        const data = await spotifyApiService.getMasterDevice();
        
        if (!data.masterDeviceId) {
          // Master device expired, clear local state
          setMasterDeviceId(null);
          
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
          if (!notificationState.current.hasShownLocked) {
            showHtmlToast("目前由其他裝置控制中，無法播放。", { type: 'error' });
            notificationState.current.hasShownLocked = true;
            notificationState.current.hasShownExpired = false;
          }
          return false;
        } else {
          // We are the master device, update local state
          setMasterDeviceId(data.masterDeviceId);
          notificationState.current.hasShownLocked = false;
          notificationState.current.hasShownExpired = false;
          return true;
        }
      } catch (error) {
        console.error('Failed to check permissions:', error);
        showHtmlToast('檢查播放權限失敗，請稍後再試。', { type: 'error' });
        return false;
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