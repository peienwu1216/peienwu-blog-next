// src/app/[slug]/page.tsx
import { allPosts, Post } from 'contentlayer/generated'; // 確保 Post 型別已包含 computedFields
import { useMDXComponent } from 'next-contentlayer/hooks';
import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns'; // 用於格式化日期
import Link from 'next/link'; // 用於標籤連結
import Note from '@/components/Note'; // 假設你已設定 @/ 指向 src/
import TableOfContents from '@/components/TableOfContents'; // Import the new component
import Slugger from 'github-slugger';
import Pre from '@/components/Pre'; // 引入新的 Pre 元件
import { Metadata } from 'next';

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

  const MDXContent = useMDXComponent(post.body.code);
  const components = { Note, pre: Pre }; // 將 Pre 元件註冊到 pre 標籤

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:flex lg:space-x-8">
      <TableOfContents headings={headings} />
      <div className="min-w-0">
        <article className="prose lg:prose-lg mx-auto dark:prose-invert max-w-3xl">
      {/* 文章標題 */}
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
        {post.title}
      </h1>

      {/* 文章元數據：日期和分類 */}
      <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <time dateTime={post.date}>
          {format(parseISO(post.date), 'yyyy年MM月dd日')}
        </time>
        {post.category && (
          <>
            <span className="mx-2">&bull;</span>
            <Link href={`/categories/${post.category.toLowerCase()}`} className="hover:underline">
              {post.category}
            </Link>
          </>
        )}
      </div>

      {/* MDX 內容 */}
         <MDXContent components={components} />

      {/* 文章標籤 */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">標籤:</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: string) => ( // 明確標註 tag 的型別
              <Link
                key={tag}
                href={`/tags/${tag.toLowerCase()}`}
                className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-3 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 可以添加相關文章、留言區等 */}
    </article>
      </div>
    </div>
  );
}