import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

const MASTER_DEVICE_KEY = 'spotify:master_device';

// ✨ 可配置的主控裝置過期時間（秒）
// 測試時可以設定為 20 秒，正式環境建議設定為 300 秒（5 分鐘）
const MASTER_DEVICE_EXPIRATION_SECONDS = 30;

/**
 * 取得目前的主控裝置 ID
 */
export async function GET() {
  try {
    const masterDeviceId = await kv.get(MASTER_DEVICE_KEY);
    return NextResponse.json({ masterDeviceId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch master device ID' }, { status: 500 });
  }
}

/**
 * 設定一個新的主控裝置 ID - 使用原子操作避免競爭條件
 */
export async function POST(req: NextRequest) {
  try {
    const { deviceId } = await req.json();
    if (!deviceId) {
      return NextResponse.json({ error: 'deviceId is required' }, { status: 400 });
    }

    // ✨ 使用 setnx (Set if Not Exists) 進行原子操作
    // 如果 MASTER_DEVICE_KEY 不存在，則設定它並返回 1 (成功)
    // 如果 MASTER_DEVICE_KEY 已存在，則什麼都不做並返回 0 (失敗)
    const result = await kv.setnx(MASTER_DEVICE_KEY, deviceId);

    if (result === 1) {
      // 成功搶佔！設定過期時間
      await kv.expire(MASTER_DEVICE_KEY, MASTER_DEVICE_EXPIRATION_SECONDS);
      return NextResponse.json({ success: true, masterDeviceId: deviceId });
    } else {
      // 搶佔失敗！王位已經被佔據
      const currentMaster = await kv.get(MASTER_DEVICE_KEY);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to claim master device status, it is already taken.',
        currentMasterId: currentMaster // ✨ 告訴前端現在是誰在做主
      }, { status: 409 }); // 409 Conflict 是一個很適合的 HTTP 狀態碼
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set master device ID' }, { status: 500 });
  }
} 