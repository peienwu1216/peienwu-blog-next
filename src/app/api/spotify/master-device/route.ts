import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

const MASTER_DEVICE_KEY = 'spotify:master_device';

// ✨ 可配置的主控裝置過期時間（秒）
// 測試時可以設定為 20 秒，正式環境建議設定為 300 秒（5 分鐘）
const MASTER_DEVICE_EXPIRATION_SECONDS = 20;

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
 * 設定一個新的主控裝置 ID
 */
export async function POST(req: NextRequest) {
  try {
    const { deviceId } = await req.json();
    if (!deviceId) {
      return NextResponse.json({ error: 'deviceId is required' }, { status: 400 });
    }
    // 設定主控裝置 ID，並給予可配置的過期時間
    // 這是一個保險機制，防止裝置斷線後，主控權永遠被鎖住
    await kv.set(MASTER_DEVICE_KEY, deviceId, { ex: MASTER_DEVICE_EXPIRATION_SECONDS }); 
    return NextResponse.json({ success: true, masterDeviceId: deviceId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set master device ID' }, { status: 500 });
  }
} 