// src/app/[slug]/page.tsx

import { allPosts } from 'contentlayer/generated'; // 確保 Post 型別已包含 computedFields
import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns'; // 用於格式化日期
import Link from 'next/link'; // 用於標籤連結
import Note from '@/components/Note'; // 假設你已設定 @/ 指向 src/
import TableOfContents from '@/components/TableOfContents'; // Import the new component
import Slugger from 'github-slugger';
import Pre from '@/components/Pre'; // 引入新的 Pre 元件
import { Metadata } from 'next';
import ViewCounter from '@/components/ViewCounter';
import ArticleClient from '@/components/ArticleClient'; // 引入新的 Client Component

// Params 型別保持不變
type Params = { slug: string }

// generateStaticParams 使用 Post 物件上由 computedFields 生成的 slug
export async function generateStaticParams(): Promise<Params[]> {
  return allPosts.map((post) => ({
    slug: post.slug, // 使用在 contentlayer.config.ts 中定義的 computed slug
  }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const post = allPosts.find((p) => p.slug === params.slug);

  if (!post) {
    return {};
  }

  const description = post.body.raw.substring(0, 150);

  const ogImage = post.image || `/api/og?title=${encodeURIComponent(post.title)}`;

  return {
    title: post.title,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      type: 'article',
      publishedTime: post.date,
      url: `https://peienwu-blog-next.vercel.app/${post.slug}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

export default function PostPage({ params }: { params: Params }) {
  // 使用 Post 物件上由 computedFields 生成的 slug 來查找文章
  const post = allPosts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  // Extract headings from the raw MDX content
  const slugger = new Slugger();
  const headings = Array.from(post.body.raw.matchAll(/\n(##|###)\s+(.*)/g)).map(
    (match) => {
      const flag = match[1];
      const content = match[2];
      return {
        level: flag.length,
        text: content,
        slug: slugger.slug(content),
      };
    }
  );

  return <ArticleClient post={post} headings={headings} />;
}