import { showHtmlToast } from '@/lib/notify';
import { NotificationState, DJStatus } from '@/types/spotify';

// ✨ 透明化升級：豐富的通知上下文
export interface TransparentMasterDeviceNotificationContext {
  wasMaster: boolean;
  isNowMaster: boolean;
  isNowLocked: boolean;
  deviceId: string | null;
  masterDeviceId: string | null;
  // ✨ 新增的透明化信息
  djStatus: DJStatus | null;
  previousDJStatus: DJStatus | null;
  transitionType?: 'CLAIMED' | 'RELEASED' | 'EXPIRED' | 'TTL_RESET';
  actionDetails?: string;
}

/**
 * ✨ 透明化升級：主控裝置通知處理器
 * 負責管理和顯示與透明化 DJ 狀態相關的豐富通知
 */
export class MasterDeviceNotificationHandler {
  private notificationState: NotificationState = {
    hasShownLocked: false,
    hasShownExpired: false,
  };

  /**
   * 重置通知狀態
   */
  resetNotificationState(): void {
    this.notificationState = {
      hasShownLocked: false,
      hasShownExpired: false,
    };
  }

  /**
   * ✨ 透明化升級：處理主控裝置狀態變化的豐富通知
   */
  handleMasterDeviceStatusChange(context: TransparentMasterDeviceNotificationContext): void {
    const { 
      wasMaster, 
      isNowMaster, 
      isNowLocked, 
      deviceId, 
      masterDeviceId,
      djStatus,
      previousDJStatus,
      transitionType 
    } = context;

    // ✨ 處理 TTL 重置通知
    if (transitionType === 'TTL_RESET' && djStatus) {
      this.handleTTLResetNotification(djStatus);
      return;
    }

    // 如果沒有主控裝置（已過期）
    if (!masterDeviceId) {
      this.handleMasterDeviceExpired(wasMaster, deviceId, previousDJStatus);
      return;
    }

    // 如果現在被鎖定
    if (isNowLocked) {
      this.handleDeviceLocked(djStatus);
      return;
    }

    // 如果成為主控裝置
    if (isNowMaster) {
      this.handleBecameMaster(djStatus);
    }
  }

  /**
   * ✨ 透明化升級：處理 TTL 重置通知
   */
  private handleTTLResetNotification(djStatus: DJStatus): void {
    const actionType = djStatus.lastAction?.type || 'USER_ACTION';
    const actionName = this.getActionDisplayName(actionType);
    
    // 只在非當前用戶的重置時顯示通知，避免干擾自己的操作
    if (djStatus.ownerName !== '您') {
      showHtmlToast(
        `🎵 ${djStatus.ownerName} ${actionName}<br/>播放權延長 2 分鐘`, 
        { type: 'info' }
      );
    }
  }

  /**
   * ✨ 透明化升級：處理主控裝置過期的通知
   */
  private handleMasterDeviceExpired(
    wasMaster: boolean, 
    deviceId: string | null, 
    previousDJStatus: DJStatus | null
  ): void {
    if (!this.notificationState.hasShownExpired) {
      if (wasMaster) {
        showHtmlToast("🎭 您的 DJ 控制權已釋放<br/>因閒置超時");
      } else {
        const previousDJName = previousDJStatus?.ownerName || '前任 DJ';
        const sessionDuration = previousDJStatus 
          ? Math.floor((Date.now() - previousDJStatus.sessionStartAt) / 60000)
          : 0;
        
        showHtmlToast(
          `🎉 ${previousDJName} 已離開 DJ 台<br/>播放了 ${sessionDuration} 分鐘，快來搶控制權！`,
          { type: 'success' }
        );
      }
      this.notificationState.hasShownExpired = true;
      this.notificationState.hasShownLocked = false;
    }
  }

  /**
   * ✨ 透明化升級：處理裝置被鎖定的通知
   */
  private handleDeviceLocked(djStatus: DJStatus | null): void {
    if (!this.notificationState.hasShownLocked) {
      const djName = djStatus?.ownerName || '其他用戶';
      const lastAction = djStatus?.lastAction?.details || '未知操作';
      const actionCount = djStatus?.actionCount || 0;
      
      showHtmlToast(
        `🔒 ${djName} 正在控制播放<br/>已操作 ${actionCount} 次 • ${lastAction}`,
        { type: 'error' }
      );
      this.notificationState.hasShownLocked = true;
      this.notificationState.hasShownExpired = false;
    }
  }

  /**
   * ✨ 透明化升級：處理成為主控裝置的狀態
   */
  private handleBecameMaster(djStatus: DJStatus | null): void {
    this.notificationState.hasShownLocked = false;
    this.notificationState.hasShownExpired = false;
    
    if (djStatus) {
      const sessionTime = new Date(djStatus.sessionStartAt).toLocaleTimeString();
      showHtmlToast(
        `👑 歡迎 DJ ${djStatus.ownerName}！<br/>控制開始於 ${sessionTime}`,
        { type: 'success' }
      );
    }
  }

  /**
   * ✨ 透明化升級：顯示成功取得主控權的通知
   */
  showClaimSuccessNotification(djStatus?: DJStatus): void {
    if (djStatus) {
      showHtmlToast(
        `🎉 已成為 DJ ${djStatus.ownerName}！<br/>點按播放鍵開始音樂控制`,
        { type: 'success' }
      );
    } else {
      showHtmlToast("已取得播放主控權！<br/>點按播放鍵開始播放");
    }
    this.resetNotificationState();
  }

  /**
   * ✨ 透明化升級：顯示取得主控權失敗的通知
   */
  showClaimFailedNotification(currentDJ?: DJStatus): void {
    if (currentDJ) {
      showHtmlToast(
        `😅 ${currentDJ.ownerName} 搶先一步了！<br/>已操作 ${currentDJ.actionCount} 次`,
        { type: 'warning' }
      );
    } else {
      showHtmlToast("😅 其他人搶先一步了！<br/>請稍後再試");
    }
  }

  /**
   * ✨ 透明化升級：顯示自動重新取得主控權的通知
   */
  showAutoReclaimSuccessNotification(djStatus?: DJStatus): void {
    if (djStatus) {
      showHtmlToast(
        `🔄 自動奪回 DJ 控制權<br/>歡迎回來，${djStatus.ownerName}！`,
        { type: 'success' }
      );
    } else {
      showHtmlToast('🔄 自動奪回主控權<br/>可以繼續播放音樂', { type: 'success' });
    }
  }

  /**
   * ✨ 工具方法：將操作類型轉換為用戶友善的顯示名稱
   */
  private getActionDisplayName(actionType: string): string {
    const actionMap: Record<string, string> = {
      'PLAY': '播放',
      'PAUSE': '暫停',
      'NEXT_TRACK': '下一首',
      'PREVIOUS_TRACK': '上一首',
      'VOLUME_CHANGE': '調整音量',
      'SEEK': '拖拽進度',
      'PLAY_RANDOM': '隨機播放',
      'TRACK_SELECT': '選擇歌曲',
      'CONTROL_CLAIM': '取得控制權',
      'CONTROL_REFRESH': '刷新控制權',
      'USER_ACTION': '用戶操作',
    };
    
    return actionMap[actionType] || '未知操作';
  }

  /**
   * ✨ 透明化升級：顯示錯誤通知
   */
  showErrorNotification(error: Error, djStatus?: DJStatus): void {
    if (error.message.includes('401') || error.message.includes('Authentication expired')) {
      showHtmlToast("🔑 Spotify 認證已過期<br/>請重新整理頁面", { type: 'error' });
    } else {
      const context = djStatus ? `<br/>當前 DJ: ${djStatus.ownerName}` : '';
      showHtmlToast(`❌ 操作失敗<br/>${error.message}${context}`, { type: 'error' });
    }
  }

  /**
   * ✨ 透明化升級：顯示通用錯誤通知
   */
  showGenericErrorNotification(message: string, djStatus?: DJStatus): void {
    const context = djStatus ? `<br/>當前 DJ: ${djStatus.ownerName}` : '';
    showHtmlToast(`⚠️ ${message}${context}`, { type: 'error' });
  }

  /**
   * ✨ 透明化升級：顯示 DJ 統計通知
   */
  showSessionStatsNotification(djStatus: DJStatus): void {
    const sessionDuration = Math.floor((Date.now() - djStatus.sessionStartAt) / 60000);
    const avgActionsPerMinute = sessionDuration > 0 ? Math.round(djStatus.actionCount / sessionDuration) : 0;
    
    showHtmlToast(
              `📊 您的 DJ 統計<br/>${djStatus.actionCount} 次操作，${sessionDuration} 分鐘，平均 ${avgActionsPerMinute}/分`,
      { type: 'info' }
    );
  }

  /**
   * ✨ 透明化升級：顯示 DJ 權限轉移通知
   */
  showDJTransferNotification(fromDJ: DJStatus, toDJ: DJStatus): void {
    showHtmlToast(
      `🎭 DJ 權限轉移：${fromDJ.ownerName} → ${toDJ.ownerName}`,
      { type: 'info' }
    );
  }
} 