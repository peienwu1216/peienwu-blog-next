import { useState, useEffect, useCallback, useRef } from 'react';
import { useMusicStore } from '@/store/music';
import { MasterDeviceService } from '@/lib/spotify/masterDeviceService';
import { useCountdownTimer } from './useCountdownTimer';
import { DJStatus, TTLResetEvent } from '@/types/spotify';

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
  createIdleResetAction: <T extends any[]>(
    action: (...args: T) => Promise<void>,
    actionName?: string
  ) => (...args: T) => Promise<void>;
  currentDJ: DJStatus | null;
  djName: string | null;
}

export function useMasterDevice({ deviceId }: UseMasterDeviceProps): UseMasterDeviceReturn {
  const { 
    setMasterInfo, 
    setCountdown, 
    countdown,
    setDJStatus,
    triggerTTLResetAnimation,
    triggerDJTransition,
    djStatus
  } = useMusicStore();
  
  const [masterDeviceId, setMasterDeviceId] = useState<string | null>(null);
  const [expirationText, setExpirationText] = useState<string>('5 分鐘');
  
  // ✨ 透明化升級：追蹤上次操作時間，用於檢測 TTL 重置
  const lastActionTimeRef = useRef<number | null>(null);
  
  // 使用 service 實例來處理業務邏輯
  const masterDeviceService = useRef(new MasterDeviceService());

  // 使用自定義的倒計時 hook
  useCountdownTimer({
    countdown,
    onCountdownUpdate: setCountdown,
  });

  // 檢查當前設備是否可控制
  const isControllable = !masterDeviceId || masterDeviceId === deviceId;

  // ✨ 透明化升級：檢測 DJ 狀態變化並觸發動畫
  const detectDJStatusChanges = useCallback((newDJStatus: DJStatus | null, oldDJStatus: DJStatus | null) => {
    // 檢測 TTL 重置（操作時間戳變化）
    if (newDJStatus && oldDJStatus && newDJStatus.lastActionAt > oldDJStatus.lastActionAt) {
      const resetEvent: TTLResetEvent = {
        newTTL: 120, // 2 分鐘
        resetBy: newDJStatus.ownerName,
        actionType: newDJStatus.lastAction?.type || 'UNKNOWN',
        timestamp: newDJStatus.lastActionAt
      };
      
      console.log('🎯 檢測到 TTL 重置:', resetEvent);
      triggerTTLResetAnimation(resetEvent);
      
      // 3 秒後清除動畫
      setTimeout(() => {
        useMusicStore.getState().clearTTLResetAnimation();
      }, 3000);
    }
    
    // 檢測 DJ 轉換
    if (!oldDJStatus && newDJStatus) {
      // 新 DJ 上線
      triggerDJTransition('CLAIMED', newDJStatus.ownerName);
      setTimeout(() => {
        useMusicStore.getState().clearDJTransition();
      }, 4000);
    } else if (oldDJStatus && !newDJStatus) {
      // DJ 下線
      triggerDJTransition('RELEASED', oldDJStatus.ownerName);
      setTimeout(() => {
        useMusicStore.getState().clearDJTransition();
      }, 4000);
    } else if (oldDJStatus && newDJStatus && oldDJStatus.deviceId !== newDJStatus.deviceId) {
      // DJ 更換
      triggerDJTransition('EXPIRED', oldDJStatus.ownerName);
      setTimeout(() => {
        triggerDJTransition('CLAIMED', newDJStatus.ownerName);
        setTimeout(() => {
          useMusicStore.getState().clearDJTransition();
        }, 4000);
      }, 2000);
    }
  }, [triggerTTLResetAnimation, triggerDJTransition]);

  // ✨ 透明化升級：初始化 DJ 狀態管理
  useEffect(() => {
    const initializeDJStatus = async () => {
      if (!deviceId) return;

      try {
        // 直接調用透明化 API 獲取完整的 DJ 狀態
        const response = await fetch(`/api/spotify/master-device?deviceId=${deviceId}`);
        const result = await response.json();
        
        if (result.djStatus) {
          setMasterDeviceId(result.djStatus.deviceId);
          setDJStatus(result.djStatus);
          
          // 檢測狀態變化
          detectDJStatusChanges(result.djStatus, djStatus);
        } else {
          setMasterDeviceId(null);
          setDJStatus(null);
        }
        
        setMasterInfo({
          isMaster: result.isMaster || false,
          isLocked: result.isLocked || false,
          ttl: result.ttl || 0
        });
        setCountdown(result.ttl || 0);
        
        // 獲取配置信息
        try {
          const configResponse = await fetch('/api/spotify/master-device/config');
          const config = await configResponse.json();
          setExpirationText(config.expirationText || '2 分鐘');
        } catch (configError) {
          console.warn('Failed to load config:', configError);
          setExpirationText('2 分鐘');
        }
        
      } catch (error) {
        console.error('Failed to initialize DJ status:', error);
        // Fallback values
        setMasterDeviceId(null);
        setDJStatus(null);
        setMasterInfo({ isMaster: false, isLocked: false, ttl: 0 });
        setCountdown(0);
      }
    };

    initializeDJStatus();
  }, [deviceId, setMasterInfo, setCountdown, setDJStatus]);

  // ✨ 透明化升級：更新 DJ 狀態
  const updateMasterDeviceStatus = useCallback(async () => {
    if (!deviceId) return;
    
    try {
      const response = await fetch(`/api/spotify/master-device?deviceId=${deviceId}`);
      const result = await response.json();
      
      const oldDJStatus = djStatus;
      
      if (result.djStatus) {
        setMasterDeviceId(result.djStatus.deviceId);
        setDJStatus(result.djStatus);
        
        // 檢測狀態變化
        detectDJStatusChanges(result.djStatus, oldDJStatus);
      } else {
        setMasterDeviceId(null);
        setDJStatus(null);
      
        // 如果之前有 DJ 現在沒有，觸發離線動畫
        if (oldDJStatus) {
          detectDJStatusChanges(null, oldDJStatus);
        }
      }
      
      setMasterInfo({
        isMaster: result.isMaster || false,
        isLocked: result.isLocked || false,
        ttl: result.ttl || 0
      });
      setCountdown(result.ttl || 0);
      
    } catch (error) {
      console.warn('Failed to update DJ status:', error);
      
      if (error instanceof Error && !error.message.includes('401')) {
        console.error('DJ status update failed:', error.message);
      }
    }
  }, [deviceId, djStatus, setMasterInfo, setCountdown, setDJStatus, detectDJStatusChanges]);

  // 定期狀態檢查
  useEffect(() => {
    const interval = setInterval(updateMasterDeviceStatus, 7000);
    return () => clearInterval(interval);
  }, [updateMasterDeviceStatus]);

  // ✨ 透明化升級：聲明 DJ 控制權
  const claimMasterDevice = useCallback(async (): Promise<boolean> => {
    if (!deviceId) return false;

    try {
      const response = await fetch('/api/spotify/master-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });
      
      const result = await response.json();
      
      if (result.djStatus) {
        const oldDJStatus = djStatus;
        
        setMasterDeviceId(result.djStatus.deviceId);
        setDJStatus(result.djStatus);
        setMasterInfo({
          isMaster: result.isMaster || false,
          isLocked: result.isLocked || false,
          ttl: result.ttl || 0
        });
        setCountdown(result.ttl || 0);
        
        // 檢測並觸發 DJ 轉換動畫
        detectDJStatusChanges(result.djStatus, oldDJStatus);
      
      // 立即更新其他設備的狀態
      setTimeout(() => updateMasterDeviceStatus(), 500);
      
      return result.success;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to claim DJ control:', error);
      return false;
    }
  }, [deviceId, djStatus, updateMasterDeviceStatus, setMasterInfo, setCountdown, setDJStatus, detectDJStatusChanges]);

  // ✨ 透明化升級：檢查 DJ 權限
  const checkPermissions = useCallback(async (): Promise<boolean> => {
    if (!deviceId) return false;
    
    try {
      const response = await fetch(`/api/spotify/master-device?deviceId=${deviceId}`);
      const result = await response.json();
      
      // 更新本地狀態
      if (result.ttl > 0) {
        setMasterInfo({
          isMaster: result.isMaster || false,
          isLocked: result.isLocked || false,
          ttl: result.ttl || 0
        });
        setCountdown(result.ttl || 0);
      }
      
      // 如果有 DJ 狀態，檢測變化
      if (result.djStatus) {
        const oldDJStatus = djStatus;
        setDJStatus(result.djStatus);
        detectDJStatusChanges(result.djStatus, oldDJStatus);
      }
      
      return result.isMaster || !result.isLocked;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }, [deviceId, djStatus, setMasterInfo, setCountdown, setDJStatus, detectDJStatusChanges]);

  // ✨ 透明化升級：閒置重置制功能
  const createIdleResetAction = useCallback(<T extends any[]>(
    action: (...args: T) => Promise<void>,
    actionName?: string
  ) => {
    return async (...args: T) => {
      try {
        // 執行原始操作
        await action(...args);
        
        // 如果操作成功且有 deviceId，重置 TTL 並記錄操作詳情
        if (deviceId) {
          try {
            const response = await fetch('/api/spotify/master-device', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                deviceId, 
                actionType: actionName?.toUpperCase().replace(/\s+/g, '_') || 'USER_ACTION',
                actionDetails: actionName || '用戶操作'
              }),
            });
            
            const result = await response.json();
            
            if (result.success && result.djStatus) {
              const oldDJStatus = djStatus;
              setDJStatus(result.djStatus);
              setCountdown(result.ttl || 0);
              
              // 檢測並觸發 TTL 重置動畫
              detectDJStatusChanges(result.djStatus, oldDJStatus);
              
              console.log(`✨ TTL 重置成功: ${actionName}`);
            }
          } catch (resetError) {
            console.warn(`⚠️ TTL 重置失敗: ${actionName}`, resetError);
          }
        }
      } catch (error) {
        console.error(`❌ 操作失敗: ${actionName}`, error);
        throw error;
      }
    };
  }, [deviceId, djStatus, setDJStatus, setCountdown, detectDJStatusChanges]);

  return {
    masterDeviceId,
    isControllable,
    expirationText,
    claimMasterDevice,
    checkPermissions,
    updateMasterDeviceStatus,
    createIdleResetAction,
    currentDJ: djStatus,
    djName: djStatus?.ownerName || null,
  };
} 