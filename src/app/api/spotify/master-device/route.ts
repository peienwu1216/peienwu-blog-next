import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { getPlayerState, playTrack, transferPlayback } from '@/lib/spotifyService';
import { DJStatus, TransparentMasterDeviceResponse } from '@/types/spotify';

const MASTER_DEVICE_KEY = 'spotify:master_device';

// ✨ 方案 B：閒置重置制配置
// 主控權在無操作時的超時時間（秒）
const MASTER_DEVICE_EXPIRATION_SECONDS = 120; // 2 分鐘閒置重置制

/**
 * ✨ 透明化升級：生成友善的 DJ 名稱
 */
function generateDJName(deviceId: string, ip?: string): string {
  // 基於 deviceId 的最後 6 位生成名稱
  const deviceSuffix = deviceId.slice(-6);
  
  // 可愛的DJ名稱前綴
  const prefixes = ['音樂家', '節拍師', '旋律手', '混音達人', '播放大師'];
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  
  return `${randomPrefix} ${deviceSuffix}`;
}

/**
 * ✨ 透明化升級：創建完整的 DJ 狀態對象
 */
function createDJStatus(deviceId: string, req: NextRequest, existingStatus?: DJStatus): DJStatus {
  const now = Date.now();
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  return {
    deviceId,
    ownerName: existingStatus?.ownerName || generateDJName(deviceId, ip),
    lastActionAt: now,
    sessionStartAt: existingStatus?.sessionStartAt || now,
    actionCount: (existingStatus?.actionCount || 0) + 1,
    lastAction: {
      type: 'CONTROL_CLAIM',
      timestamp: now,
      details: '取得主控權'
    }
  };
}

/**
 * ✨ 透明化升級：取得目前的 DJ 狀態及剩餘 TTL
 */
export async function GET(req: NextRequest) {
  try {
    const djStatusData = await kv.get<DJStatus>(MASTER_DEVICE_KEY);
    const ttl = await kv.ttl(MASTER_DEVICE_KEY);
    
    // 支援 deviceId 查詢
    const { searchParams } = new URL(req.url);
    const currentDeviceId = searchParams.get('deviceId');
    
    const isMaster = djStatusData && currentDeviceId && djStatusData.deviceId === currentDeviceId;
    const isLocked = !!djStatusData && djStatusData.deviceId !== currentDeviceId;
    
    if (!djStatusData) {
      const response: TransparentMasterDeviceResponse = {
        djStatus: null,
        isMaster: false,
        isLocked: false,
        ttl: 0
      };
      return NextResponse.json(response);
    }
    
    if (!isMaster && ttl > 0) {
      try {
        const stateResult = await getPlayerState();
        const response: TransparentMasterDeviceResponse = {
          djStatus: djStatusData,
          isMaster: false,
          isLocked: true,
          ttl,
          currentMasterId: djStatusData.deviceId
        };
        return NextResponse.json(response);
      } catch (error) {
        const response: TransparentMasterDeviceResponse = {
          djStatus: djStatusData,
          isMaster: false,
          isLocked: true,
          ttl,
          currentMasterId: djStatusData.deviceId
        };
        return NextResponse.json(response);
      }
    }
    
    const response: TransparentMasterDeviceResponse = {
      djStatus: djStatusData,
      isMaster: !!isMaster,
      isLocked: false,
      ttl
    };
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch DJ status' }, { status: 500 });
  }
}

/**
 * ✨ 透明化升級：聲明主控權 - 創建完整的 DJ 狀態對象
 * ✨ 支援自動重新聲明（頁面刷新後）
 */
export async function POST(req: NextRequest) {
  try {
    const { deviceId, isAutoReclaim, sessionId } = await req.json();
    if (!deviceId) {
      return NextResponse.json({ error: 'deviceId is required' }, { status: 400 });
    }

    // ✨ 先檢查當前的 DJ 狀態
    const currentDJStatus = await kv.get<DJStatus>(MASTER_DEVICE_KEY);

    // 如果當前裝置已經是主控裝置，刷新 DJ 狀態並延長時間
    if (currentDJStatus && currentDJStatus.deviceId === deviceId) {
      const updatedStatus = createDJStatus(deviceId, req, currentDJStatus);
      updatedStatus.lastAction = {
        type: 'CONTROL_REFRESH',
        timestamp: Date.now(),
        details: '刷新主控權'
      };
      
      await kv.set(MASTER_DEVICE_KEY, updatedStatus);
      await kv.expire(MASTER_DEVICE_KEY, MASTER_DEVICE_EXPIRATION_SECONDS);
      
      const response: TransparentMasterDeviceResponse = {
        djStatus: updatedStatus,
        success: true,
        isMaster: true,
        isLocked: false,
        ttl: MASTER_DEVICE_EXPIRATION_SECONDS
      };
      return NextResponse.json(response);
    }

    // ✨ 自動重新聲明邏輯：檢查是否為同會話的自動重新聲明
    if (isAutoReclaim && sessionId && currentDJStatus) {
      // 檢查會話記錄（這裡我們需要一個簡單的會話驗證機制）
      // 由於我們使用設備ID作為主要標識，如果TTL還有效但設備ID不同，
      // 且前端明確說這是自動重新聲明，我們允許更新設備ID
      const ttl = await kv.ttl(MASTER_DEVICE_KEY);
      
      if (ttl > 0) {
        // 更新現有DJ狀態的設備ID（設備刷新後Spotify重新分配了ID）
        const updatedStatus = {
          ...currentDJStatus,
          deviceId: deviceId, // 更新為新的設備ID
          lastActionAt: Date.now(),
          actionCount: currentDJStatus.actionCount + 1,
          lastAction: {
            type: 'AUTO_RECLAIM',
            timestamp: Date.now(),
            details: '頁面刷新後自動重新聲明主控權'
          }
        };
        
        await kv.set(MASTER_DEVICE_KEY, updatedStatus);
        await kv.expire(MASTER_DEVICE_KEY, MASTER_DEVICE_EXPIRATION_SECONDS);
        
        const response: TransparentMasterDeviceResponse = {
          djStatus: updatedStatus,
          success: true,
          isMaster: true,
          isLocked: false,
          ttl: MASTER_DEVICE_EXPIRATION_SECONDS
        };
        return NextResponse.json(response);
      }
    }

    // ✨ 使用 setnx 進行原子操作檢查是否可以獲得控制權
    const newDJStatus = createDJStatus(deviceId, req);
    const result = await kv.setnx(MASTER_DEVICE_KEY, newDJStatus);

    if (result === 1) {
      // 成功搶佔！設定過期時間
      await kv.expire(MASTER_DEVICE_KEY, MASTER_DEVICE_EXPIRATION_SECONDS);

      // --- ✨ 搶權後的播放同步邏輯 ---
      try {
        const stateResult = await getPlayerState();
        if (stateResult.success && stateResult.data && stateResult.data.is_playing) {
          const { item, progress_ms, context } = stateResult.data;
          
          // 步驟 1: 先將播放權明確轉移到新設備
          const transferResult = await transferPlayback(deviceId, false);
          
          if (transferResult.success) {
            // 步驟 2: 等待播放權轉移完成
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 步驟 3: 在新設備上從正確進度繼續播放
            await playTrack({
              context_uri: context?.uri, 
              uris: context ? undefined : [item.uri],
              position_ms: progress_ms,
            }, deviceId);
          } else {
            console.warn('播放權轉移失敗，嘗試直接播放:', transferResult.error);
            // 如果轉移失敗，仍嘗試直接播放
            await playTrack({
              context_uri: context?.uri, 
              uris: context ? undefined : [item.uri],
              position_ms: progress_ms,
            }, deviceId);
          }
        }
      } catch (syncError) {
        console.warn(`搶權成功，但同步播放狀態失敗:`, syncError);
      }

      const response: TransparentMasterDeviceResponse = {
        djStatus: newDJStatus,
        success: true,
        isMaster: true,
        isLocked: false,
        ttl: MASTER_DEVICE_EXPIRATION_SECONDS
      };
      return NextResponse.json(response);
    } else {
      // 搶佔失敗！已有其他 DJ 在控制
      const ttl = await kv.ttl(MASTER_DEVICE_KEY);
      const response: TransparentMasterDeviceResponse = {
        djStatus: currentDJStatus,
        success: false,
        isMaster: false,
        isLocked: true,
        currentMasterId: currentDJStatus?.deviceId,
        ttl
      };
      return NextResponse.json(response, { status: 409 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to claim DJ control' }, { status: 500 });
  }
}

/**
 * ✨ 透明化升級：重置 DJ 狀態的 TTL
 * 記錄操作類型，讓所有用戶能看到 DJ 的活動
 */
export async function PATCH(req: NextRequest) {
  try {
    const { deviceId, actionType, actionDetails } = await req.json();
    if (!deviceId) {
      return NextResponse.json({ error: 'deviceId is required' }, { status: 400 });
    }

    // 檢查當前的 DJ 狀態
    const currentDJStatus = await kv.get<DJStatus>(MASTER_DEVICE_KEY);
    
    // 只有當前 DJ 才能重置 TTL
    if (!currentDJStatus) {
      const response: TransparentMasterDeviceResponse = {
        djStatus: null,
        success: false,
        isMaster: false,
        isLocked: false,
        ttl: 0
      };
      return NextResponse.json(response, { status: 404 });
    }

    if (currentDJStatus.deviceId !== deviceId) {
      const ttl = await kv.ttl(MASTER_DEVICE_KEY);
      const response: TransparentMasterDeviceResponse = {
        djStatus: currentDJStatus,
        success: false,
        isMaster: false,
        isLocked: true,
        currentMasterId: currentDJStatus.deviceId,
        ttl
      };
      return NextResponse.json(response, { status: 403 });
    }

    // ✨ 更新 DJ 狀態，記錄操作詳情 - 這是透明化的核心！
    const updatedDJStatus: DJStatus = {
      ...currentDJStatus,
      lastActionAt: Date.now(),
      actionCount: currentDJStatus.actionCount + 1,
      lastAction: {
        type: actionType || 'UNKNOWN_ACTION',
        timestamp: Date.now(),
        details: actionDetails || '用戶操作'
      }
    };

    // 原子更新 DJ 狀態並重置 TTL
    await kv.set(MASTER_DEVICE_KEY, updatedDJStatus);
    await kv.expire(MASTER_DEVICE_KEY, MASTER_DEVICE_EXPIRATION_SECONDS);
    
    const response: TransparentMasterDeviceResponse = {
      djStatus: updatedDJStatus,
      success: true,
      isMaster: true,
      isLocked: false,
      ttl: MASTER_DEVICE_EXPIRATION_SECONDS
    };
    return NextResponse.json(response);

  } catch (error) {
    console.error('Failed to reset DJ TTL:', error);
    return NextResponse.json({ 
      error: 'Failed to reset DJ TTL' 
    }, { status: 500 });
  }
} 