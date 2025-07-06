import { showHtmlToast } from '@/lib/notify';
import { NotificationState } from '@/types/spotify';

export interface MasterDeviceNotificationContext {
  wasMaster: boolean;
  isNowMaster: boolean;
  isNowLocked: boolean;
  deviceId: string | null;
  masterDeviceId: string | null;
}

/**
 * 主控裝置通知處理器
 * 負責管理和顯示與主控裝置狀態相關的通知
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
   * 處理主控裝置狀態變化的通知
   */
  handleMasterDeviceStatusChange(context: MasterDeviceNotificationContext): void {
    const { wasMaster, isNowMaster, isNowLocked, deviceId, masterDeviceId } = context;

    // 如果沒有主控裝置（已過期）
    if (!masterDeviceId) {
      this.handleMasterDeviceExpired(wasMaster, deviceId);
      return;
    }

    // 如果現在被鎖定
    if (isNowLocked) {
      this.handleDeviceLocked();
      return;
    }

    // 如果成為主控裝置
    if (isNowMaster) {
      this.handleBecameMaster();
    }
  }

  /**
   * 處理主控裝置過期的通知
   */
  private handleMasterDeviceExpired(wasMaster: boolean, deviceId: string | null): void {
    if (!this.notificationState.hasShownExpired) {
      if (wasMaster) {
        showHtmlToast("您的播放控制權已過期，其他裝置現在可以取得控制權。");
      } else {
        showHtmlToast("主控裝置已過期，現在可以播放了！");
      }
      this.notificationState.hasShownExpired = true;
      this.notificationState.hasShownLocked = false;
    }
  }

  /**
   * 處理裝置被鎖定的通知
   */
  private handleDeviceLocked(): void {
    if (!this.notificationState.hasShownLocked) {
      showHtmlToast("目前由其他裝置控制中，無法播放。", { type: 'error' });
      this.notificationState.hasShownLocked = true;
      this.notificationState.hasShownExpired = false;
    }
  }

  /**
   * 處理成為主控裝置的狀態
   */
  private handleBecameMaster(): void {
    this.notificationState.hasShownLocked = false;
    this.notificationState.hasShownExpired = false;
  }

  /**
   * 顯示成功取得主控權的通知
   */
  showClaimSuccessNotification(): void {
    showHtmlToast("已取得播放主控權！點按播放鍵開始播放");
    this.resetNotificationState();
  }

  /**
   * 顯示取得主控權失敗的通知
   */
  showClaimFailedNotification(): void {
    showHtmlToast("哎呀！就在您點擊的瞬間，其他人搶先一步了！");
  }

  /**
   * 顯示自動重新取得主控權的通知
   */
  showAutoReclaimSuccessNotification(): void {
    showHtmlToast('已自動重新取得播放主控權！', { type: 'success' });
  }

  /**
   * 顯示錯誤通知
   */
  showErrorNotification(error: Error): void {
    if (error.message.includes('401') || error.message.includes('Authentication expired')) {
      showHtmlToast("Spotify 認證已過期，請重新整理頁面", { type: 'error' });
    } else {
      showHtmlToast(`操作失敗: ${error.message}`, { type: 'error' });
    }
  }

  /**
   * 顯示通用錯誤通知
   */
  showGenericErrorNotification(message: string): void {
    showHtmlToast(message, { type: 'error' });
  }
} 