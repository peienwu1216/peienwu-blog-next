import { spotifyApiService } from '@/services/spotifyApiService';
import { SessionPersistence } from './sessionPersistence';
import { MasterDeviceNotificationHandler, MasterDeviceNotificationContext } from './masterDeviceNotificationHandler';

export interface MasterDeviceData {
  masterDeviceId: string | null;
  ttl: number;
  currentMasterId?: string;
  success?: boolean;
}

export interface MasterDeviceConfig {
  expirationText: string;
}

export interface MasterDeviceState {
  isMaster: boolean;
  isLocked: boolean;
  ttl: number;
}

/**
 * 主控裝置服務
 * 封裝與主控裝置相關的 API 調用和業務邏輯
 */
export class MasterDeviceService {
  private notificationHandler: MasterDeviceNotificationHandler;

  constructor() {
    this.notificationHandler = new MasterDeviceNotificationHandler();
  }

  /**
   * 初始化主控裝置配置和狀態
   */
  async initializeMasterDevice(deviceId: string, retries = 2): Promise<{
    masterDeviceId: string | null;
    expirationText: string;
    state: MasterDeviceState;
    shouldAttemptReclaim: boolean;
  }> {
    // 首先清除過期的記錄
    SessionPersistence.clearExpiredRecords();
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const [masterData, configData] = await Promise.all([
          spotifyApiService.getMasterDevice(),
          spotifyApiService.getMasterDeviceConfig()
        ]);
        
        const isMaster = !!deviceId && masterData.masterDeviceId === deviceId;
        const isLocked = !!masterData.masterDeviceId && masterData.masterDeviceId !== deviceId;
        
        const state: MasterDeviceState = {
          isMaster,
          isLocked,
          ttl: masterData.ttl || 0,
        };
        
        const shouldAttemptReclaim = !masterData.masterDeviceId && SessionPersistence.shouldAttemptReclaim();
        
        return {
          masterDeviceId: masterData.masterDeviceId,
          expirationText: configData.expirationText,
          state,
          shouldAttemptReclaim,
        };
      } catch (error) {
        console.warn(`Master device initialization attempt ${attempt + 1} failed:`, error);
        
        if (attempt === retries - 1) {
          console.error("Failed to initialize master device after retries:", error);
          
          // 返回 fallback 值
          return {
            masterDeviceId: null,
            expirationText: '5 分鐘',
            state: { isMaster: false, isLocked: false, ttl: 0 },
            shouldAttemptReclaim: false,
          };
        }
        
        // 等待重試
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error('Initialization failed after all retries');
  }

  /**
   * 更新主控裝置狀態
   */
  async updateMasterDeviceStatus(currentMasterDeviceId: string | null, deviceId: string | null): Promise<{
    masterDeviceId: string | null;
    state: MasterDeviceState;
    shouldClearRecords: boolean;
  }> {
    const data = await spotifyApiService.getMasterDevice();
    const wasMaster = currentMasterDeviceId === deviceId;
    const isNowMaster = !!deviceId && data.masterDeviceId === deviceId;
    const isNowLocked = !!data.masterDeviceId && data.masterDeviceId !== deviceId;
    
    const state: MasterDeviceState = {
      isMaster: isNowMaster,
      isLocked: isNowLocked,
      ttl: data.ttl || 0,
    };
    
    // 處理通知
    const notificationContext: MasterDeviceNotificationContext = {
      wasMaster,
      isNowMaster,
      isNowLocked,
      deviceId,
      masterDeviceId: data.masterDeviceId,
    };
    
    this.notificationHandler.handleMasterDeviceStatusChange(notificationContext);
    
    return {
      masterDeviceId: data.masterDeviceId,
      state,
      shouldClearRecords: !data.masterDeviceId,
    };
  }

  /**
   * 聲明主控裝置
   */
  async claimMasterDevice(deviceId: string): Promise<{
    success: boolean;
    masterDeviceId: string | null;
    state: MasterDeviceState;
  }> {
    const data = await spotifyApiService.claimMasterDevice(deviceId);
    
    if (data.success) {
      const state: MasterDeviceState = {
        isMaster: true,
        isLocked: false,
        ttl: data.ttl || 0,
      };
      
      // 記錄主控狀態
      SessionPersistence.recordMasterStatus(deviceId, data.ttl || 0);
      
      // 顯示成功通知
      this.notificationHandler.showClaimSuccessNotification();
      
      return {
        success: true,
        masterDeviceId: data.masterDeviceId,
        state,
      };
    } else {
      const state: MasterDeviceState = {
        isMaster: false,
        isLocked: !!data.currentMasterId,
        ttl: data.ttl || 0,
      };
      
      // 顯示失敗通知
      this.notificationHandler.showClaimFailedNotification();
      
      return {
        success: false,
        masterDeviceId: data.currentMasterId || null,
        state,
      };
    }
  }

  /**
   * 自動重新聲明主控裝置
   */
  async autoReclaimMasterDevice(deviceId: string): Promise<boolean> {
    try {
      const result = await this.claimMasterDevice(deviceId);
      if (result.success) {
        this.notificationHandler.showAutoReclaimSuccessNotification();
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Auto reclaim failed:', error);
      return false;
    }
  }

  /**
   * 檢查設備權限
   */
  async checkDevicePermissions(
    deviceId: string | null,
    currentMasterDeviceId: string | null,
    maxRetries = 2
  ): Promise<{ hasPermission: boolean; state: MasterDeviceState }> {
    if (!deviceId) {
      return { hasPermission: false, state: { isMaster: false, isLocked: false, ttl: 0 } };
    }

    // 如果我們已經是主控裝置，有權限
    if (currentMasterDeviceId === deviceId) {
      return { hasPermission: true, state: { isMaster: true, isLocked: false, ttl: 0 } };
    }

    // 如果有其他主控裝置，檢查是否仍有效
    if (currentMasterDeviceId && currentMasterDeviceId !== deviceId) {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const data = await spotifyApiService.getMasterDevice();
          
          if (!data.masterDeviceId) {
            // 主控裝置已過期
            const state: MasterDeviceState = { isMaster: false, isLocked: false, ttl: 0 };
            
            const notificationContext: MasterDeviceNotificationContext = {
              wasMaster: deviceId === currentMasterDeviceId,
              isNowMaster: false,
              isNowLocked: false,
              deviceId,
              masterDeviceId: null,
            };
            
            this.notificationHandler.handleMasterDeviceStatusChange(notificationContext);
            
            return { hasPermission: true, state };
          } else if (data.masterDeviceId !== deviceId) {
            // 被其他裝置鎖定
            const state: MasterDeviceState = { isMaster: false, isLocked: true, ttl: data.ttl || 0 };
            
            const notificationContext: MasterDeviceNotificationContext = {
              wasMaster: false,
              isNowMaster: false,
              isNowLocked: true,
              deviceId,
              masterDeviceId: data.masterDeviceId,
            };
            
            this.notificationHandler.handleMasterDeviceStatusChange(notificationContext);
            
            return { hasPermission: false, state };
          } else {
            // 我們是主控裝置
            const state: MasterDeviceState = { isMaster: true, isLocked: false, ttl: data.ttl || 0 };
            this.notificationHandler.resetNotificationState();
            return { hasPermission: true, state };
          }
        } catch (error) {
          console.warn(`Permission check attempt ${attempt + 1} failed:`, error);
          
          if (attempt === maxRetries - 1) {
            if (error instanceof Error) {
              this.notificationHandler.showErrorNotification(error);
            } else {
              this.notificationHandler.showGenericErrorNotification('檢查播放權限失敗，請稍後再試。');
            }
            return { hasPermission: false, state: { isMaster: false, isLocked: false, ttl: 0 } };
          }
          
          // 等待重試
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    // 沒有主控裝置，權限可用
    return { hasPermission: true, state: { isMaster: false, isLocked: false, ttl: 0 } };
  }

  /**
   * 清除會話記錄
   */
  clearSessionRecords(): void {
    SessionPersistence.clearExpiredRecords();
  }

  /**
   * 處理錯誤
   */
  handleError(error: unknown): void {
    if (error instanceof Error) {
      this.notificationHandler.showErrorNotification(error);
    } else {
      this.notificationHandler.showGenericErrorNotification('發生未知錯誤');
    }
  }
} 