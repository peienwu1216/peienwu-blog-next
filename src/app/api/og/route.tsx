import { ImageResponse } from '@vercel/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || "Peienwu's Code Lab"
  const description = searchParams.get('description') || "這裡沒有魔法，只有還沒讀懂的 Source Code"

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: '#0f172a',
          color: '#f8fafc',
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px',
        }}
      >
        <div style={{ fontSize: 70, fontWeight: 800, textAlign: 'center', lineHeight: '1.2' }}>{title}</div>
        <div style={{ fontSize: 32, marginTop: 30, color: '#94a3b8', textAlign: 'center' }}>{description}</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
} 