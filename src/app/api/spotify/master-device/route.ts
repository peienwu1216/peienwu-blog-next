import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { getPlayerState, playTrack } from '@/lib/spotifyService';

const MASTER_DEVICE_KEY = 'spotify:master_device';

// ✨ 可配置的主控裝置過期時間（秒）
// 測試時可以設定為 20 秒，正式環境建議設定為 300 秒（5 分鐘）
const MASTER_DEVICE_EXPIRATION_SECONDS = 120; // 建議使用 120 秒

/**
 * 取得目前的主控裝置 ID 及剩餘 TTL，並在非主控時回傳 Spotify 狀態
 */
export async function GET(req: NextRequest) {
  try {
    const masterDeviceId = await kv.get(MASTER_DEVICE_KEY);
    const ttl = await kv.ttl(MASTER_DEVICE_KEY);
    // 支援 deviceId 查詢
    const { searchParams } = new URL(req.url);
    const currentDeviceId = searchParams.get('deviceId');
    const isMaster = masterDeviceId && currentDeviceId && masterDeviceId === currentDeviceId;
    if (!masterDeviceId) {
      return NextResponse.json({ masterDeviceId: null, isMaster: false, isLocked: false, ttl: 0 });
    }
    if (!isMaster && ttl > 0) {
      try {
        const stateResult = await getPlayerState();
        return NextResponse.json({
          masterDeviceId,
          isMaster: false,
          isLocked: true,
          ttl,
          spectatorState: stateResult.success ? stateResult.data : null,
        });
      } catch (error) {
        return NextResponse.json({ masterDeviceId, isMaster: false, isLocked: true, ttl, spectatorState: null });
      }
    }
    return NextResponse.json({ masterDeviceId, isMaster: !!isMaster, isLocked: false, ttl });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch master device ID' }, { status: 500 });
  }
}

/**
 * 設定一個新的主控裝置 ID - 使用原子操作避免競爭條件
 * ✨ 升級為真正的「搶奪」能力
 */
export async function POST(req: NextRequest) {
  try {
    const { deviceId } = await req.json();
    if (!deviceId) {
      return NextResponse.json({ error: 'deviceId is required' }, { status: 400 });
    }

    // ✨ 先檢查當前的主控裝置
    const currentMaster = await kv.get(MASTER_DEVICE_KEY);

    // 如果當前裝置已經是主控裝置，直接成功並刷新過期時間
    if (currentMaster === deviceId) {
      await kv.expire(MASTER_DEVICE_KEY, MASTER_DEVICE_EXPIRATION_SECONDS);
      return NextResponse.json({ 
        success: true, 
        masterDeviceId: deviceId, 
        ttl: MASTER_DEVICE_EXPIRATION_SECONDS,
        message: 'Master device ownership refreshed'
      });
    }

    // ✨ 使用 setnx (Set if Not Exists) 進行原子操作
    // 如果 MASTER_DEVICE_KEY 不存在，則設定它並返回 1 (成功)
    // 如果 MASTER_DEVICE_KEY 已存在，則什麼都不做並返回 0 (失敗)
    const result = await kv.setnx(MASTER_DEVICE_KEY, deviceId);

    if (result === 1) {
      // 成功搶佔！設定過期時間
      await kv.expire(MASTER_DEVICE_KEY, MASTER_DEVICE_EXPIRATION_SECONDS);

      // --- ✨ 全新的搶權後同步邏輯 ---
      try {
        // 1. 立即獲取當前的播放狀態
        const stateResult = await getPlayerState();

        // 2. 如果有音樂正在播放，就發起一個新的播放指令到新裝置
        if (stateResult.success && stateResult.data && stateResult.data.is_playing) {
          const { item, progress_ms, context } = stateResult.data;
          
          await playTrack({
            // 優先使用 context_uri，如果沒有才用單曲 uri
            context_uri: context?.uri, 
            uris: context ? undefined : [item.uri],
            position_ms: progress_ms,
          }, deviceId);
        }
        // 如果沒有音樂播放，則不需要做任何事，因為控制權已轉移。
        
      } catch (syncError) {
        console.warn(`搶權成功，但同步播放狀態失敗:`, syncError);
        // 即使這一步失敗，KV 中的鎖已經成功設定，主控權仍在我們手中。
      }
      // --- 邏輯結束 ---

      return NextResponse.json({ success: true, masterDeviceId: deviceId, ttl: MASTER_DEVICE_EXPIRATION_SECONDS });
    } else {
      // 搶佔失敗！王位已經被佔據
      const ttl = await kv.ttl(MASTER_DEVICE_KEY);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to claim master device status, it is already taken.',
        currentMasterId: currentMaster,
        ttl
      }, { status: 409 }); // 409 Conflict 是一個很適合的 HTTP 狀態碼
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set master device ID' }, { status: 500 });
  }
} 