// src/app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { allPosts, Post } from 'contentlayer/generated'; // Post 型別現在應該包含 url 和 slug
import { compareDesc, format, parseISO } from 'date-fns'; // 確保已安裝 date-fns

const authorInfo = {
  name: 'PeiEn Wu',
  avatar: '/images/avatar.png',
  bio: '歡迎來到我的部落格！在這裡我會分享關於技術、生活和學習的點滴。',
};

export default function HomePage() {
  const posts = allPosts.sort((a, b) =>
    compareDesc(parseISO(a.date), parseISO(b.date))
  );

  const featuredPostsCount = 5;
  const latestPosts = posts.slice(0, featuredPostsCount);

  const categories = Array.from(
    new Set(allPosts.map((post) => post.category).filter(Boolean))
  ) as string[];

  const tags = Array.from(
    new Set(allPosts.flatMap((post) => post.tags || []).filter(Boolean))
  ) as string[];

  return (
    <div className="container mx-auto px-4 py-8 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold dark:text-white">
          <Link href="/">Peienwu's Code Lab</Link>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
        這裡沒有魔法，只有還沒讀懂的 Source Code
        </p>
        <nav className="mt-6">
          <ul className="flex justify-center space-x-4 sm:space-x-6">
            <li><Link href="/" className="text-lg hover:text-blue-600 dark:hover:text-blue-400">首頁</Link></li>
            <li><Link href="/about" className="text-lg hover:text-blue-600 dark:hover:text-blue-400">關於我</Link></li>
            {categories.length > 0 && (
              <li><Link href="/categories" className="text-lg hover:text-blue-600 dark:hover:text-blue-400">分類</Link></li>
            )}
            {tags.length > 0 && (
              <li><Link href="/tags" className="text-lg hover:text-blue-600 dark:hover:text-blue-400">標籤</Link></li>
            )}
          </ul>
        </nav>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <main className="md:col-span-2">
          <section>
            <h2 className="text-3xl font-semibold mb-6 border-b pb-2 dark:text-white">最新文章</h2>
            {latestPosts.length > 0 ? (
              <div className="space-y-8">
                {latestPosts.map((post) => (
                  <article key={post._id} className="p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
                    <h3 className="text-2xl font-bold mb-2">
                      <Link href={post.url} className="hover:text-blue-700 dark:hover:text-blue-400 dark:text-white">
                        {post.title}
                      </Link>
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span>{format(parseISO(post.date), 'yyyy年MM月dd日')}</span>
                      {post.category && (
                        <>
                          <span className="mx-2">|</span>
                          <Link href={`/categories/${post.category.toLowerCase()}`} className="hover:underline">
                            {post.category}
                          </Link>
                        </>
                      )}
                    </div>
                    <Link href={post.url} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                      閱讀更多 &rarr;
                    </Link>
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-4">
                        {post.tags.map((tag) => (
                          <Link
                            key={tag}
                            href={`/tags/${tag.toLowerCase()}`}
                            className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full px-2 py-1 mr-2 hover:bg-gray-300 dark:hover:bg-gray-600"
                          >
                            #{tag}
                          </Link>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="dark:text-gray-300">目前還沒有文章喔！</p>
            )}
            {posts.length > featuredPostsCount && (
              <div className="mt-8 text-center">
                <Link href="/archive" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-md transition-colors">
                  查看所有文章
                </Link>
              </div>
            )}
          </section>
        </main>

        <aside className="md:col-span-1 space-y-8">
          <section className="p-6 rounded-lg shadow-md bg-white dark:bg-gray-800">
            <div className="flex flex-col items-center">
              {authorInfo.avatar && (
                <Image
                  src={authorInfo.avatar}
                  alt={authorInfo.name}
                  width={100}
                  height={100}
                  className="rounded-full mb-4"
                  priority
                />
              )}
              <h3 className="text-xl font-semibold mb-2 dark:text-white">{authorInfo.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center text-sm">{authorInfo.bio}</p>
              <Link href="/about" className="mt-4 text-blue-600 hover:underline dark:text-blue-400 text-sm">
                關於我
              </Link>
            </div>
          </section>

          <section className="p-6 rounded-lg shadow-md bg-white dark:bg-gray-800">
            <h3 className="text-xl font-semibold mb-3 dark:text-white">搜尋文章</h3>
            <form action="/search" method="GET">
              <input
                type="text"
                name="q"
                placeholder="輸入關鍵字..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button type="submit" className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                搜尋
              </button>
            </form>
          </section>

          {categories.length > 0 && (
            <section className="p-6 rounded-lg shadow-md bg-white dark:bg-gray-800">
              <h3 className="text-xl font-semibold mb-3 dark:text-white">文章分類</h3>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category}>
                    <Link href={`/categories/${category.toLowerCase()}`} className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                      {category}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {tags.length > 0 && (
            <section className="p-6 rounded-lg shadow-md bg-white dark:bg-gray-800">
              <h3 className="text-xl font-semibold mb-3 dark:text-white">熱門標籤</h3>
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 10).map((tag) => (
                  <Link
                    key={tag}
                    href={`/tags/${tag.toLowerCase()}`}
                    className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full px-3 py-1 mr-2 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>

      <footer className="mt-16 pt-8 border-t text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} {authorInfo.name}. 版權所有。</p>
      </footer>
    </div>
  );
}