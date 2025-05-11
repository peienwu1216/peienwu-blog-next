import Link from 'next/link';
import { allPosts, Post } from 'contentlayer/generated'; // 假設你的 Post 類型已從 Contentlayer 匯出
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '文章標籤 | Peienwu\'s Code Lab',
  description: '依標籤瀏覽 Peienwu\'s Code Lab 的所有文章。',
};

interface TagWithCount {
  name: string;
  count: number;
}

// 輔助函數：從文章中提取所有唯一的標籤及其文章數量
function getTagsWithCount(posts: Post[]): TagWithCount[] {
  const tagCounts: Record<string, number> = {};
  posts.forEach(post => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  return Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count); // 可選：按文章數量降序排列
}


export default async function TagsPage() {
  const tags = getTagsWithCount(allPosts);

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-3xl">
      <header className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          文章標籤
        </h1>
      </header>

      {tags.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {tags.map(tag => (
            <Link
              key={tag.name}
              href={`/tags/${encodeURIComponent(tag.name.toLowerCase().replace(/\s+/g, '-'))}`}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-sm sm:text-base font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shadow-sm"
            >
              {tag.name} <span className="ml-1.5 text-xs opacity-75">({tag.count})</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-600 dark:text-slate-400 text-lg">
          目前還沒有任何標籤。
        </p>
      )}
    </div>
  );
}