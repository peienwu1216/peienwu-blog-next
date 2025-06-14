import { allPosts } from 'contentlayer/generated';
import { compareDesc } from 'date-fns';
import Link from 'next/link';
import PostCard from '../../components/PostCard'; // 我們將創建一個卡片組件來美化列表

export default function PostsPage() {
  // 根據日期降序排序所有文章
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          所有文章
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          探索我的所有技術文章、筆記與想法。
        </p>
      </header>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
} 