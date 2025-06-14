import { allPosts } from 'contentlayer/generated';
import PostCard from '@/components/PostCard';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { compareDesc } from 'date-fns';

// 預先為所有分類建立靜態頁面
export async function generateStaticParams() {
  const categories = [
    ...new Set(
      allPosts
        .map((p) => p.category)
        .filter((c): c is string => c !== null && c !== undefined)
    ),
  ];
  return categories.map((category) => ({
    // 直接回傳 slug （Next.js 會自動處理 URL encoding）
    category: category.toLowerCase().replace(/\s+/g, '-'),
  }));
}

// 動態生成頁面 metadata
export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  // 從 URL 中解碼分類名稱
  const categoryParam = params.category;
  const categoryName = decodeURIComponent(categoryParam);
  const formattedCategoryName =
    categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  return {
    title: `分類: ${formattedCategoryName}`,
    description: `所有關於 "${formattedCategoryName}" 分類的相關文章`,
  };
}

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  // 從 URL 中解碼分類名稱
  const categoryParam = params.category;
  const categoryName = decodeURIComponent(categoryParam);
  const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');

  // 根據分類名稱篩選文章，並按日期降序排列
  const posts = allPosts
    .filter(
      (post) =>
        post.category?.toLowerCase().replace(/\s+/g, '-') === categorySlug
    )
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

  // 雖然 generateStaticParams 會處理，但手動輸入 URL 可能導致找不到文章
  // 這裡可以選擇顯示 "找不到文章" 的訊息，而不是 404 頁面
  if (posts.length === 0) {
    // notFound(); // 如果希望顯示 404 頁面，可以取消註解此行
  }

  const formattedCategoryName =
    categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
      <header className="mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          分類: <span className="text-green-600 dark:text-green-400">{formattedCategoryName}</span>
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
          這個分類下還沒有文章。
        </p>
      )}
    </div>
  );
} 