import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

const MASTER_DEVICE_KEY = 'spotify:master_device';

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
    // 設定主控裝置 ID，並給予 5 分鐘的過期時間
    // 這是一個保險機制，防止裝置斷線後，主控權永遠被鎖住
    await kv.set(MASTER_DEVICE_KEY, deviceId, { ex: 300 }); 
    return NextResponse.json({ success: true, masterDeviceId: deviceId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set master device ID' }, { status: 500 });
  }
} 