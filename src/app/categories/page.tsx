import Link from 'next/link';
import { allPosts, Post } from 'contentlayer/generated'; // 假設你的 Post 類型已從 Contentlayer 匯出
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '文章分類 | Peienwu\'s Code Lab',
  description: '依分類瀏覽 Peienwu\'s Code Lab 的所有文章。',
};

interface CategoryWithCount {
  name: string;
  count: number;
}

// 輔助函數：從文章中提取所有唯一的分類及其文章數量
function getCategoriesWithCount(posts: Post[]): CategoryWithCount[] {
  const categoryCounts: Record<string, number> = {};
  posts.forEach(post => {
    if (post.category) {
      categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
    }
  });

  return Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count); // 可選：按文章數量降序排列
}

export default async function CategoriesPage() {
  const categories = getCategoriesWithCount(allPosts);

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-3xl">
      <header className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          文章分類
        </h1>
      </header>

      {categories.length > 0 ? (
        <ul className="space-y-4">
          {categories.map(category => (
            <li key={category.name} className="p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
              <Link 
                href={`/categories/${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, '-'))}`} 
                className="block group"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {category.name}
                  </h2>
                  <span className="text-sm sm:text-base bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-200 px-2.5 py-1 rounded-full font-medium">
                    {category.count} 篇
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-slate-600 dark:text-slate-400 text-lg">
          目前還沒有任何分類。
        </p>
      )}
    </div>
  );
}