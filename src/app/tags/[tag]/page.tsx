import { allPosts } from 'contentlayer/generated';
import PostCard from '@/components/PostCard';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { compareDesc } from 'date-fns';

// 預先為所有標籤建立靜態頁面
export async function generateStaticParams() {
  const allTags = allPosts.flatMap((p) => p.tags || []);
  const uniqueTags = [...new Set(allTags)];

  return uniqueTags.map((tag) => ({
    // 直接回傳 slug，Next.js 會自動處理 URL encoding
    tag: tag.toLowerCase().replace(/\s+/g, '-'),
  }));
}

// 動態生成頁面 metadata
export async function generateMetadata({
  params,
}: {
  params: { tag:string };
}): Promise<Metadata> {
  // 從 URL 中解碼標籤名稱
  const tagParam = params.tag;
  const tagName = decodeURIComponent(tagParam);
  const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-');
  const formattedTagName = tagName.charAt(0).toUpperCase() + tagName.slice(1);

  return {
    title: `標籤: ${formattedTagName}`,
    description: `所有關於 "${formattedTagName}" 標籤的文章`,
  };
}

export default function TagPage({ params }: { params: { tag: string } }) {
  // 從 URL 中解碼標籤名稱
  const tagParam = params.tag;
  const tagName = decodeURIComponent(tagParam);
  const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-');

  // 根據標籤名稱篩選文章，並按日期降序排列
  const posts = allPosts
    .filter((post) =>
      post.tags?.some(
        (t) => t.toLowerCase().replace(/\s+/g, '-') === tagSlug
      )
    )
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

  // 雖然 generateStaticParams 會處理，但手動輸入 URL 可能導致找不到文章
  if (posts.length === 0) {
    // notFound(); // 如果希望顯示 404 頁面，可以取消註解此行
  }

  const formattedTagName = tagName.charAt(0).toUpperCase() + tagName.slice(1);

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
      <header className="mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          標籤: <span className="text-blue-600 dark:text-blue-400">{formattedTagName}</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          共有 {posts.length} 篇相關文章
        </p>
      </header>

      {posts.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-center text-lg text-slate-600 dark:text-slate-400">
          這個標籤下還沒有文章。
        </p>
      )}
    </div>
  );
} 