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
  
  // ✨ 開發環境調試開關
  private static readonly IS_DEV = process.env.NODE_ENV === 'development';

  /**
   * 生成唯一的會話 ID
   */
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 獲取或創建會話 ID
   * ✨ 增強版：開發環境使用localStorage提高穩定性
   */
  static getOrCreateSessionId(): string {
    // ✨ 開發環境優先使用localStorage，避免Hot Reload清除
    const storage = this.IS_DEV ? localStorage : sessionStorage;
    let sessionId = storage.getItem(this.SESSION_KEY);
    
    if (!sessionId) {
      sessionId = this.generateSessionId();
      storage.setItem(this.SESSION_KEY, sessionId);
      
      if (this.IS_DEV) {
        console.log('🔧 [DEV] 創建新的會話ID:', sessionId);
      }
    } else if (this.IS_DEV) {
      console.log('🔧 [DEV] 使用現有會話ID:', sessionId);
    }
    
    return sessionId;
  }

  /**
   * 記錄主控狀態
   * ✨ 增強版：增加詳細調試信息
   */
  static recordMasterStatus(deviceId: string, ttl: number): void {
    const sessionId = this.getOrCreateSessionId();
    const now = Date.now();
    const masterRecord: MasterRecord = {
      sessionId,
      deviceId,
      timestamp: now,
      ttl,
      expiresAt: now + (ttl * 1000)
    };
    
    try {
      localStorage.setItem(this.MASTER_RECORD_KEY, JSON.stringify(masterRecord));
      localStorage.setItem(this.WAS_MASTER_KEY, 'true');
      localStorage.setItem(this.MASTER_TIME_KEY, now.toString());
      
      if (this.IS_DEV) {
        console.log('🔧 [DEV] 記錄主控狀態:', {
          sessionId,
          deviceId,
          ttl,
          expiresIn: Math.round(ttl),
          expiresAt: new Date(masterRecord.expiresAt).toLocaleTimeString()
        });
      }
    } catch (error) {
      console.warn('Failed to record master status:', error);
    }
  }

  /**
   * 檢查是否應該嘗試重新獲得主控權
   * ✨ 增強版：增加詳細的調試信息和開發環境優化
   */
  static shouldAttemptReclaim(): boolean {
    const sessionId = this.getOrCreateSessionId();
    const masterRecord = localStorage.getItem(this.MASTER_RECORD_KEY);
    
    if (this.IS_DEV) {
      console.log('🔧 [DEV] 檢查是否需要重新聲明主控權...');
      console.log('🔧 [DEV] 當前會話ID:', sessionId);
      console.log('🔧 [DEV] 主控記錄存在:', !!masterRecord);
    }
    
    if (!masterRecord) {
      if (this.IS_DEV) {
        console.log('🔧 [DEV] ❌ 沒有主控記錄，不需要重新聲明');
      }
      return false;
    }
    
    try {
      const record: MasterRecord = JSON.parse(masterRecord);
      const now = Date.now();
      const timeSinceRecord = now - record.timestamp;
      const isExpired = record.expiresAt <= now;
      const isSameSession = record.sessionId === sessionId;
      const withinReclaimWindow = timeSinceRecord < this.RECLAIM_WINDOW_MS;
      
      if (this.IS_DEV) {
        console.log('🔧 [DEV] 主控記錄分析:', {
          記錄會話ID: record.sessionId,
          當前會話ID: sessionId,
          記錄時間: new Date(record.timestamp).toLocaleTimeString(),
          過期時間: new Date(record.expiresAt).toLocaleTimeString(),
          距離記錄: Math.round(timeSinceRecord / 1000) + '秒',
          是否過期: isExpired,
          是否同會話: isSameSession,
          是否在重聲明窗口內: withinReclaimWindow,
          重聲明窗口: Math.round(this.RECLAIM_WINDOW_MS / 1000) + '秒'
        });
      }
      
      // 檢查是否是同一個會話且未過期
      if (isSameSession && !isExpired && withinReclaimWindow) {
        if (this.IS_DEV) {
          console.log('🔧 [DEV] ✅ 滿足重新聲明條件！');
        }
        return true;
      } else {
        if (this.IS_DEV) {
          const reasons = [];
          if (!isSameSession) reasons.push('會話ID不匹配');
          if (isExpired) reasons.push('記錄已過期');
          if (!withinReclaimWindow) reasons.push('超出重聲明時間窗口');
          console.log('🔧 [DEV] ❌ 不滿足重新聲明條件:', reasons.join(', '));
        }
        return false;
      }
    } catch (error) {
      console.warn('Failed to parse master record:', error);
      if (this.IS_DEV) {
        console.log('🔧 [DEV] ❌ 主控記錄解析失敗');
      }
      return false;
    }
  }

  /**
   * 清除過期的記錄
   * ✨ 增強版：增加調試信息
   */
  static clearExpiredRecords(): void {
    const masterRecord = localStorage.getItem(this.MASTER_RECORD_KEY);
    if (masterRecord) {
      try {
        const record: MasterRecord = JSON.parse(masterRecord);
        const now = Date.now();
        const isExpired = record.expiresAt <= now;
        
        if (this.IS_DEV) {
          console.log('🔧 [DEV] 檢查過期記錄:', {
            過期時間: new Date(record.expiresAt).toLocaleTimeString(),
            當前時間: new Date(now).toLocaleTimeString(),
            是否過期: isExpired
          });
        }
        
        if (isExpired) {
          this.clearAllRecords();
          if (this.IS_DEV) {
            console.log('🔧 [DEV] 已清除過期記錄');
          }
        }
      } catch (error) {
        // 如果解析失敗，清除所有記錄
        console.warn('Failed to parse master record, clearing all records:', error);
        this.clearAllRecords();
        if (this.IS_DEV) {
          console.log('🔧 [DEV] 記錄解析失敗，已清除所有記錄');
        }
      }
    } else if (this.IS_DEV) {
      console.log('🔧 [DEV] 沒有需要檢查的記錄');
    }
  }

  /**
   * 清除所有記錄
   * ✨ 增強版：同時清除兩種存儲的會話ID
   */
  static clearAllRecords(): void {
    localStorage.removeItem(this.MASTER_RECORD_KEY);
    localStorage.removeItem(this.WAS_MASTER_KEY);
    localStorage.removeItem(this.MASTER_TIME_KEY);
    
    // ✨ 開發環境：同時清除兩種存儲的會話ID
    if (this.IS_DEV) {
      localStorage.removeItem(this.SESSION_KEY);
      sessionStorage.removeItem(this.SESSION_KEY);
      console.log('🔧 [DEV] 已清除所有記錄和會話ID');
    }
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

  /**
   * ✨ 新增：開發環境調試工具
   */
  static debugInfo(): void {
    if (!this.IS_DEV) return;
    
    console.group('🔧 [DEV] SessionPersistence 調試信息');
    
    const sessionId = this.getOrCreateSessionId();
    const masterRecord = this.getMasterRecord();
    const shouldReclaim = this.shouldAttemptReclaim();
    
    console.log('會話ID:', sessionId);
    console.log('主控記錄:', masterRecord);
    console.log('應該重新聲明:', shouldReclaim);
    
    if (masterRecord) {
      const now = Date.now();
      console.log('記錄詳情:', {
        設備ID: masterRecord.deviceId,
        記錄時間: new Date(masterRecord.timestamp).toLocaleString(),
        TTL: masterRecord.ttl + '秒',
        過期時間: new Date(masterRecord.expiresAt).toLocaleString(),
        剩餘時間: Math.max(0, Math.round((masterRecord.expiresAt - now) / 1000)) + '秒',
        距離記錄: Math.round((now - masterRecord.timestamp) / 1000) + '秒前',
        會話匹配: masterRecord.sessionId === sessionId
      });
    }
    
    console.groupEnd();
  }

  /**
   * ✨ 新增：設備比較調試工具
   */
  static debugDeviceComparison(currentDeviceId: string, masterDeviceId: string | null): void {
    if (!this.IS_DEV) return;
    
    console.group('🔧 [DEV] 設備比較調試');
    console.log('當前設備ID:', currentDeviceId);
    console.log('主控設備ID:', masterDeviceId || 'none');
    console.log('是否匹配:', currentDeviceId === masterDeviceId);
    
    const masterRecord = this.getMasterRecord();
    if (masterRecord) {
      console.log('記錄中的設備ID:', masterRecord.deviceId);
      console.log('與記錄是否匹配:', currentDeviceId === masterRecord.deviceId);
      console.log('記錄會話ID:', masterRecord.sessionId);
      console.log('當前會話ID:', this.getOrCreateSessionId());
      console.log('會話是否匹配:', masterRecord.sessionId === this.getOrCreateSessionId());
    }
    
    console.groupEnd();
  }

  /**
   * ✨ 開發環境測試工具
   */
  static devTools() {
    if (!this.IS_DEV) return;
    
    console.group('🔧 [DEV] SessionPersistence 測試工具');
    console.log('可用命令:');
    console.log('SessionPersistence.debugInfo() - 顯示調試信息');
    console.log('SessionPersistence.clearAllRecords() - 清除所有記錄');
    console.log('SessionPersistence.simulateRefresh() - 模擬頁面刷新測試');
    console.groupEnd();
  }

  /**
   * ✨ 開發環境：模擬頁面刷新測試
   */
  static simulateRefresh(): void {
    if (!this.IS_DEV) return;
    
    console.group('🔧 [DEV] 模擬頁面刷新測試');
    
    // 檢查當前狀態
    console.log('1. 刷新前狀態:');
    this.debugInfo();
    
    // 模擬創建新會話ID (但保留localStorage記錄)
    const storage = localStorage;
    const oldSessionId = storage.getItem(this.SESSION_KEY);
    
    // 清除會話ID但保留主控記錄
    storage.removeItem(this.SESSION_KEY);
    
    console.log('2. 清除會話ID後:');
    const newSessionId = this.getOrCreateSessionId();
    console.log('新會話ID:', newSessionId);
    console.log('舊會話ID:', oldSessionId);
    
    // 檢查是否應該重新聲明
    const shouldReclaim = this.shouldAttemptReclaim();
    console.log('3. 是否應該重新聲明:', shouldReclaim);
    
    if (!shouldReclaim) {
      console.log('❌ 測試失敗：不滿足重新聲明條件');
      console.log('可能原因:');
      console.log('- 會話ID不匹配 (開發環境正常，因為模擬了新會話)');
      console.log('- 記錄已過期');
      console.log('- 超出2分鐘重聲明窗口');
    } else {
      console.log('✅ 測試成功：滿足重新聲明條件');
    }
    
    console.groupEnd();
  }

  /**
   * ✨ 開發環境：手動觸發重新聲明測試
   */
  static async testAutoReclaim(): Promise<void> {
    if (!this.IS_DEV) return;
    
    console.group('🔧 [DEV] 手動觸發重新聲明測試');
    
    try {
      // 動態導入避免循環依賴
      const { useMasterDevice } = await import('@/hooks/useMasterDevice');
      console.log('測試功能需要在React組件中執行，請在瀏覽器控制台中直接測試頁面刷新');
      console.log('或者檢查Network標籤中的API調用');
    } catch (error) {
      console.warn('無法執行自動重新聲明測試:', error);
    }
    
    console.groupEnd();
  }

  /**
   * ✨ 新增：更新記錄中的設備ID（當重新聲明成功但設備ID變化時）
   */
  static updateRecordDeviceId(newDeviceId: string): void {
    const masterRecord = this.getMasterRecord();
    if (masterRecord) {
      const updatedRecord: MasterRecord = {
        ...masterRecord,
        deviceId: newDeviceId,
        timestamp: Date.now(), // 更新時間戳
      };
      
      localStorage.setItem(this.MASTER_RECORD_KEY, JSON.stringify(updatedRecord));
      
      if (this.IS_DEV) {
        console.log('🔧 [DEV] 已更新記錄中的設備ID:', {
          舊設備ID: masterRecord.deviceId,
          新設備ID: newDeviceId,
          更新時間: new Date().toLocaleTimeString()
        });
      }
    }
  }
}

// ✨ 開發環境：將工具掛載到全局對象
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).SessionPersistenceDebug = {
    debugInfo: () => SessionPersistence.debugInfo(),
    clearAll: () => SessionPersistence.clearAllRecords(),
    simulateRefresh: () => SessionPersistence.simulateRefresh(),
    testAutoReclaim: () => SessionPersistence.testAutoReclaim(),
    help: () => SessionPersistence.devTools()
  };
} 