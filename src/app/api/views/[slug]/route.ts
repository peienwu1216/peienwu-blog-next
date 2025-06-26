import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

// 設置API路由的快取策略，每60秒重新驗證一次
export const revalidate = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;
  if (!slug) {
    return new NextResponse('Slug is required', { status: 400 });
  }
  
  try {
    // 使用 kv.incr 來原子性地增加計數器
    // 鍵值的格式為 "views:文章的slug"
    const views = await kv.incr(`views:${slug}`);
    return NextResponse.json({ slug, views });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;
  if (!slug) {
    return new NextResponse('Slug is required', { status: 400 });
  }

  try {
    // 使用 kv.get 來獲取計數器
    const views = await kv.get(`views:${slug}`) || 0;
    return NextResponse.json({ slug, views });
  } catch (error) {
    console.error('Error fetching view count:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 