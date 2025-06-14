// src/app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { allPosts, Post } from 'contentlayer/generated'; // 確保 Post 型別已從 Contentlayer 正確匯出或定義
import { compareDesc, format, parseISO } from 'date-fns'; // 確保已安裝 date-fns

// 作者資訊可以保留，因為側邊欄會用到
const authorInfo = {
  name: 'Pei-En Wu',
  avatar: '/images/avatar.jpeg', // 確認這個圖片路徑在 public/images/ 下存在
  bio: '歡迎來到我的部落格！在這裡我會分享關於技術、生活和學習的點滴。',
};

export default function HomePage() {
  // 文章排序和篩選邏輯保留
  const posts = allPosts.sort((a, b) =>
    compareDesc(parseISO(a.date), parseISO(b.date))
  );

  const featuredPostsCount = 5;
  const latestPosts = posts.slice(0, featuredPostsCount);

  // 分類和標籤的提取邏輯保留，因為側邊欄和導覽列可能會用到
  // 注意：如果 layout.tsx 中的導覽列是靜態的，這裡的 categories 和 tags 提取
  // 主要是為了頁面內側邊欄的顯示。
  const categories = Array.from(
    new Set(allPosts.map((post) => post.category).filter(Boolean))
  ) as string[];

  const tags = Array.from(
    new Set(allPosts.flatMap((post) => post.tags || []).filter(Boolean))
  ) as string[];

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      
      {/* 移除了原本在這裡的 <header>...</header> 區塊。
        網站的標題、副標題和主要導覽列現在由 src/app/layout.tsx 提供。
      */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"> {/* gap 可以稍微調整 */}
        {/* 主要內容區 (最新文章) */}
        <main className="md:col-span-2">
          <section>
            <h2 className="text-3xl font-semibold mb-6 border-b pb-3 dark:text-white dark:border-slate-700"> {/* 調整了 pb 和 border */}
              最新文章
            </h2>
            {latestPosts.length > 0 ? (
              <div className="space-y-8">
                {latestPosts.map((post) => (
                  <article key={post._id} className="p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-slate-800"> {/* 調整了 shadow */}
                    <h3 className="text-2xl font-bold mb-2">
                      <Link href={post.url || `/posts/${post.slug}`} className="text-slate-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors">
                        {post.title}
                      </Link>
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span>{format(parseISO(post.date), 'yyyy年MM月dd日')}</span>
                      {post.category && (
                        <>
                          <span className="mx-2">|</span>
                          <Link href={`/categories/${encodeURIComponent(post.category.toLowerCase().replace(/\s+/g, '-'))}`} className="hover:underline">
                            {post.category}
                          </Link>
                        </>
                      )}
                    </div>
                    {/* 這裡可以加上文章摘要 (excerpt)，如果你的 Post 類型有這個欄位 */}
                    {/* <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{post.excerpt}</p> */}
                    <Link href={post.url || `/posts/${post.slug}`} className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium inline-flex items-center group">
                      閱讀更多 
                      <svg className="ml-1 w-4 h-4 transform transition-transform duration-200 group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                    </Link>
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <Link
                            key={tag}
                            href={`/tags/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}`}
                            className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full px-2.5 py-1 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
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
            {posts.length > featuredPostsCount && ( // 假設你的 Post 類型有 slug 或 url 欄位
              <div className="mt-10 text-center"> {/* 調整了 mt */}
                <Link href="/posts" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-md transition-colors shadow-md hover:shadow-lg"> {/* 調整了顏色和 padding */}
                  查看所有文章
                </Link>
              </div>
            )}
          </section>
        </main>

        {/* 側邊欄 */}
        <aside className="md:col-span-1 space-y-8">
          {/* 作者簡介卡片 */}
          <section className="p-6 rounded-lg shadow-lg bg-white dark:bg-slate-800">
            <div className="flex flex-col items-center text-center">
              {authorInfo.avatar && (
                <Image
                  src={authorInfo.avatar}
                  alt={authorInfo.name}
                  width={100} // 可以調整大小
                  height={100}
                  className="rounded-full mb-4 shadow-md"
                  priority // 如果是首頁重要圖片
                />
              )}
              <h3 className="text-xl font-semibold mb-2 dark:text-white">{authorInfo.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{authorInfo.bio}</p>
              <Link href="/about" className="mt-4 text-green-600 hover:underline dark:text-green-400 text-sm font-medium">
                關於我 &rarr;
              </Link>
            </div>
          </section>

          {/* 搜尋文章卡片 - 注意：這個表單的 action="/search" 需要你有對應的搜尋頁面或 API 路由來處理 */}
          <section className="p-6 rounded-lg shadow-lg bg-white dark:bg-slate-800">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">搜尋文章</h3>
            <form action="/search" method="GET"> {/* 你可能需要一個 /search 頁面來顯示結果 */}
              <input
                type="text"
                name="q"
                placeholder="輸入關鍵字..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button type="submit" className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                搜尋
              </button>
            </form>
          </section>

          {/* 文章分類卡片 */}
          {categories.length > 0 && (
            <section className="p-6 rounded-lg shadow-lg bg-white dark:bg-slate-800">
              <h3 className="text-xl font-semibold mb-4 dark:text-white">文章分類</h3>
              <ul className="space-y-2">
                {categories.slice(0, 5).map((category) => ( // 例如，只顯示前5個分類
                  <li key={category}>
                    <Link href={`/categories/${encodeURIComponent(category.toLowerCase().replace(/\s+/g, '-'))}`} className="text-gray-700 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors">
                      {category}
                    </Link>
                  </li>
                ))}
                {categories.length > 5 && (
                   <li><Link href="/categories" className="text-sm text-green-600 hover:underline dark:text-green-400">查看所有分類...</Link></li>
                )}
              </ul>
            </section>
          )}

          {/* 熱門標籤卡片 */}
          {tags.length > 0 && (
            <section className="p-6 rounded-lg shadow-lg bg-white dark:bg-slate-800">
              <h3 className="text-xl font-semibold mb-4 dark:text-white">熱門標籤</h3>
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 10).map((tag) => ( // 例如，只顯示前10個標籤
                  <Link
                    key={tag}
                    href={`/tags/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}`}
                    className="text-xs sm:text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full px-3 py-1 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
                 {tags.length > 10 && (
                   <Link href="/tags" className="text-xs sm:text-sm text-green-600 hover:underline dark:text-green-400 mt-2 block">查看所有標籤...</Link>
                )}
              </div>
            </section>
          )}
        </aside>
      </div>

      {/* 移除了原本在這裡的 <footer>...</footer> 區塊。
        網站的頁尾現在由 src/app/layout.tsx 提供。
      */}
    </div>
  );
}