import { useState, useEffect, useCallback, useRef } from 'react';
import { useMusicStore } from '@/store/music';
import { MasterDeviceService } from '@/lib/spotify/masterDeviceService';
import { useCountdownTimer } from './useCountdownTimer';

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
  
  // 使用 service 實例來處理業務邏輯
  const masterDeviceService = useRef(new MasterDeviceService());

  // 使用自定義的倒計時 hook
  useCountdownTimer({
    countdown,
    onCountdownUpdate: setCountdown,
  });

  // 檢查當前設備是否可控制
  const isControllable = !masterDeviceId || masterDeviceId === deviceId;

  // 初始化主控裝置配置和狀態
  useEffect(() => {
    const initializeMasterDevice = async () => {
      if (!deviceId) return;

      try {
        const result = await masterDeviceService.current.initializeMasterDevice(deviceId);
        
        setMasterDeviceId(result.masterDeviceId);
        setExpirationText(result.expirationText);
        setMasterInfo(result.state);
        setCountdown(result.state.ttl);
        
        // 智能重新聲明邏輯
        if (result.shouldAttemptReclaim) {
          console.log('Attempting to reclaim master device after page refresh (session-based)...');
          setTimeout(async () => {
            const success = await masterDeviceService.current.autoReclaimMasterDevice(deviceId);
            if (!success) {
              console.warn('Auto reclaim failed');
            }
          }, 2000); // 等待 2 秒讓播放器準備就緒
        }
      } catch (error) {
        console.error('Failed to initialize master device:', error);
        masterDeviceService.current.handleError(error);
      }
    };

    initializeMasterDevice();
  }, [deviceId, setMasterInfo, setCountdown]);

  // 更新主控裝置狀態
  const updateMasterDeviceStatus = useCallback(async () => {
    try {
      const result = await masterDeviceService.current.updateMasterDeviceStatus(
        masterDeviceId,
        deviceId
      );
      
      setMasterDeviceId(result.masterDeviceId);
      setMasterInfo(result.state);
      setCountdown(result.state.ttl);
      
      // 如果需要清除記錄
      if (result.shouldClearRecords) {
        masterDeviceService.current.clearSessionRecords();
      }
    } catch (error) {
      console.warn('Failed to update master device status:', error);
      
      // 只有在非認證錯誤時才顯示錯誤通知
      if (error instanceof Error && !error.message.includes('401')) {
        console.error('Master device status update failed:', error.message);
      }
    }
  }, [masterDeviceId, deviceId, setMasterInfo, setCountdown]);

  // 定期狀態檢查
  useEffect(() => {
    const interval = setInterval(updateMasterDeviceStatus, 7000);
    return () => clearInterval(interval);
  }, [updateMasterDeviceStatus]);

  // 聲明主控裝置所有權
  const claimMasterDevice = useCallback(async (): Promise<boolean> => {
    if (!deviceId) return false;

    try {
      const result = await masterDeviceService.current.claimMasterDevice(deviceId);
      
      setMasterDeviceId(result.masterDeviceId);
      setMasterInfo(result.state);
      setCountdown(result.state.ttl);
      
      // 立即更新其他設備的狀態
      setTimeout(() => updateMasterDeviceStatus(), 500);
      
      return result.success;
    } catch (error) {
      console.error('Failed to claim master device:', error);
      masterDeviceService.current.handleError(error);
      return false;
    }
  }, [deviceId, updateMasterDeviceStatus, setMasterInfo, setCountdown]);

  // 檢查設備是否有執行操作的權限
  const checkPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const result = await masterDeviceService.current.checkDevicePermissions(
        deviceId,
        masterDeviceId
      );
      
      // 更新本地狀態
      if (result.state.ttl > 0) {
        setMasterInfo(result.state);
        setCountdown(result.state.ttl);
      }
      
      return result.hasPermission;
    } catch (error) {
      console.error('Permission check failed:', error);
      masterDeviceService.current.handleError(error);
      return false;
    }
  }, [deviceId, masterDeviceId, setMasterInfo, setCountdown]);

  return {
    masterDeviceId,
    isControllable,
    expirationText,
    claimMasterDevice,
    checkPermissions,
    updateMasterDeviceStatus,
  };
} 