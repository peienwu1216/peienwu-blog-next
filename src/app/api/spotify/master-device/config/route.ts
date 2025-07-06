import { NextResponse } from 'next/server';

// ✨ 可配置的主控裝置過期時間（秒）
// 測試時可以設定為 20 秒，正式環境建議設定為 300 秒（5 分鐘）
const MASTER_DEVICE_EXPIRATION_SECONDS = 20;

/**
 * 取得主控裝置的配置資訊
 */
export async function GET() {
  try {
    const expirationMinutes = Math.ceil(MASTER_DEVICE_EXPIRATION_SECONDS / 60);
    return NextResponse.json({ 
      expirationSeconds: MASTER_DEVICE_EXPIRATION_SECONDS,
      expirationMinutes,
      expirationText: `${expirationMinutes} 分鐘`
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch master device config' }, { status: 500 });
  }
} 