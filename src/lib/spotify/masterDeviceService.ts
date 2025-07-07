import { spotifyApiService } from '@/services/spotifyApiService';
import { SessionPersistence } from './sessionPersistence';
import { MasterDeviceNotificationHandler, TransparentMasterDeviceNotificationContext } from './masterDeviceNotificationHandler';

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
  
  // ✨ 防濫用機制：記錄上次 TTL 重置時間
  private lastResetTime: number = 0;
  // ✨ TTL 重置冷卻時間（毫秒）- 防止過於頻繁的重置請求
  private static readonly TTL_RESET_COOLDOWN = 30000; // 30 秒

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
        
        const isMaster = !!deviceId && masterData.isMaster;
        const isLocked = masterData.isLocked;
        
        const state: MasterDeviceState = {
          isMaster,
          isLocked,
          ttl: masterData.ttl || 0,
        };
        
        const shouldAttemptReclaim = !masterData.djStatus && SessionPersistence.shouldAttemptReclaim();
        
        return {
          masterDeviceId: masterData.djStatus?.deviceId || null,
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
    const isNowMaster = data.isMaster;
    const isNowLocked = data.isLocked;
    
    const state: MasterDeviceState = {
      isMaster: isNowMaster,
      isLocked: isNowLocked,
      ttl: data.ttl || 0,
    };
    
    // 處理通知
    const notificationContext: TransparentMasterDeviceNotificationContext = {
      wasMaster,
      isNowMaster,
      isNowLocked,
      deviceId,
      masterDeviceId: data.djStatus?.deviceId || null,
      djStatus: data.djStatus,
      previousDJStatus: null,
    };
    
    this.notificationHandler.handleMasterDeviceStatusChange(notificationContext);
    
    return {
      masterDeviceId: data.djStatus?.deviceId || null,
      state,
      shouldClearRecords: !data.djStatus,
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
        masterDeviceId: data.djStatus?.deviceId || null,
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
          
          if (!data.djStatus) {
            // 主控裝置已過期
            const state: MasterDeviceState = { isMaster: false, isLocked: false, ttl: 0 };
            
            const notificationContext: TransparentMasterDeviceNotificationContext = {
              wasMaster: deviceId === currentMasterDeviceId,
              isNowMaster: false,
              isNowLocked: false,
              deviceId,
              masterDeviceId: null,
              djStatus: null,
              previousDJStatus: null,
            };
            
            this.notificationHandler.handleMasterDeviceStatusChange(notificationContext);
            
            return { hasPermission: true, state };
          } else if (data.djStatus.deviceId !== deviceId) {
            // 被其他裝置鎖定
            const state: MasterDeviceState = { isMaster: false, isLocked: true, ttl: data.ttl || 0 };
            
            const notificationContext: TransparentMasterDeviceNotificationContext = {
              wasMaster: false,
              isNowMaster: false,
              isNowLocked: true,
              deviceId,
              masterDeviceId: data.djStatus.deviceId,
              djStatus: data.djStatus,
              previousDJStatus: null,
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
   * ✨ 方案 B：閒置重置制 - 重置主控裝置的 TTL
   * 在每次有效操作後調用，實現活躍使用者的主控權延續
   * 包含防濫用機制，限制重置頻率
   */
  async resetTTL(deviceId: string): Promise<boolean> {
    const now = Date.now();
    
    // ✨ 防濫用檢查：檢查是否在冷卻時間內
    if (now - this.lastResetTime < MasterDeviceService.TTL_RESET_COOLDOWN) {
      console.log(`🛡️ TTL reset rate limited. Next reset available in ${Math.ceil((MasterDeviceService.TTL_RESET_COOLDOWN - (now - this.lastResetTime)) / 1000)}s`);
      return false;
    }
    
    try {
      const result = await spotifyApiService.resetMasterDeviceTTL(deviceId);
      
      // 只有成功重置時才更新冷卻時間
      if (result.success) {
        this.lastResetTime = now;
        console.log('✅ TTL reset successful with rate limiting');
      }
      
      return result.success || false;
    } catch (error) {
      console.warn('Failed to reset master device TTL:', error);
      return false;
    }
  }

  /**
   * ✨ 方案 B：閒置重置制 - 創建帶有自動 TTL 重置的操作包裝器
   * 這是核心的攔截器，會在每次有效操作後自動重置計時器
   * 包含智能的防濫用處理
   */
  createIdleResetAction<T extends any[]>(
    action: (...args: T) => Promise<void>,
    deviceId: string | null,
    actionName: string = 'Unknown Action'
  ): (...args: T) => Promise<void> {
    return async (...args: T) => {
      try {
        // 執行原始操作
        await action(...args);
        
        // 如果操作成功且有 deviceId，嘗試重置 TTL
        if (deviceId) {
          const resetSuccess = await this.resetTTL(deviceId);
          if (resetSuccess) {
            console.log(`✨ TTL reset successful after ${actionName}`);
          } else {
            // 不是錯誤，可能只是被限制了
            const now = Date.now();
            const timeSinceLastReset = now - this.lastResetTime;
            
            if (timeSinceLastReset < MasterDeviceService.TTL_RESET_COOLDOWN) {
              console.log(`🛡️ TTL reset skipped due to rate limiting (${actionName})`);
            } else {
              console.warn(`⚠️ TTL reset failed after ${actionName}`);
            }
          }
        }
      } catch (error) {
        // 如果原始操作失敗，不進行 TTL 重置
        console.error(`❌ ${actionName} failed:`, error);
        throw error; // 重新拋出錯誤以保持原有的錯誤處理邏輯
      }
    };
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