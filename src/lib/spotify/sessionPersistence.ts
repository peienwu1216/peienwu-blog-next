interface MasterRecord {
  sessionId: string;
  deviceId: string;
  timestamp: number;
  ttl: number;
  expiresAt: number;
}

/**
 * 會話持久化工具類
 * 負責管理 Spotify 主控裝置的會話狀態持久化
 */
export class SessionPersistence {
  private static readonly SESSION_KEY = 'spotify_session_id';
  private static readonly MASTER_RECORD_KEY = 'spotify_master_record';
  private static readonly WAS_MASTER_KEY = 'spotify_was_master';
  private static readonly MASTER_TIME_KEY = 'spotify_master_time';
  private static readonly RECLAIM_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

  /**
   * 生成唯一的會話 ID
   */
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 獲取或創建會話 ID
   */
  static getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem(this.SESSION_KEY);
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem(this.SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  /**
   * 記錄主控狀態
   */
  static recordMasterStatus(deviceId: string, ttl: number): void {
    const sessionId = this.getOrCreateSessionId();
    const masterRecord: MasterRecord = {
      sessionId,
      deviceId,
      timestamp: Date.now(),
      ttl,
      expiresAt: Date.now() + (ttl * 1000)
    };
    
    try {
      localStorage.setItem(this.MASTER_RECORD_KEY, JSON.stringify(masterRecord));
      localStorage.setItem(this.WAS_MASTER_KEY, 'true');
      localStorage.setItem(this.MASTER_TIME_KEY, Date.now().toString());
    } catch (error) {
      console.warn('Failed to record master status:', error);
    }
  }

  /**
   * 檢查是否應該嘗試重新獲得主控權
   */
  static shouldAttemptReclaim(): boolean {
    const sessionId = this.getOrCreateSessionId();
    const masterRecord = localStorage.getItem(this.MASTER_RECORD_KEY);
    
    if (!masterRecord) return false;
    
    try {
      const record: MasterRecord = JSON.parse(masterRecord);
      const now = Date.now();
      
      // 檢查是否是同一個會話且未過期
      if (record.sessionId === sessionId && record.expiresAt > now) {
        const timeSinceRecord = now - record.timestamp;
        // 如果記錄時間在重新聲明窗口內，可能是頁面重新整理
        return timeSinceRecord < this.RECLAIM_WINDOW_MS;
      }
    } catch (error) {
      console.warn('Failed to parse master record:', error);
    }
    
    return false;
  }

  /**
   * 清除過期的記錄
   */
  static clearExpiredRecords(): void {
    const masterRecord = localStorage.getItem(this.MASTER_RECORD_KEY);
    if (masterRecord) {
      try {
        const record: MasterRecord = JSON.parse(masterRecord);
        if (record.expiresAt <= Date.now()) {
          this.clearAllRecords();
        }
      } catch (error) {
        // 如果解析失敗，清除所有記錄
        console.warn('Failed to parse master record, clearing all records:', error);
        this.clearAllRecords();
      }
    }
  }

  /**
   * 清除所有記錄
   */
  static clearAllRecords(): void {
    localStorage.removeItem(this.MASTER_RECORD_KEY);
    localStorage.removeItem(this.WAS_MASTER_KEY);
    localStorage.removeItem(this.MASTER_TIME_KEY);
  }

  /**
   * 獲取主控記錄
   */
  static getMasterRecord(): MasterRecord | null {
    const masterRecord = localStorage.getItem(this.MASTER_RECORD_KEY);
    if (!masterRecord) return null;
    
    try {
      return JSON.parse(masterRecord);
    } catch (error) {
      console.warn('Failed to parse master record:', error);
      return null;
    }
  }
} 