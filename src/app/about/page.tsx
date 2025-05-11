import Link from 'next/link';
import Image from 'next/image'; // 如果你想放個人圖片

export default function AboutPage() {
  const blogTitle = "Peienwu's Code Lab";

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-3xl">
      <header className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-4">
          關於 {blogTitle}
        </h1>
      </header>

      <article className="prose prose-slate dark:prose-invert lg:prose-lg mx-auto">
        {
          <div className="flex justify-center my-8">
            <Image
              src="/images/avatar.jpeg" // 將此替換為你的圖片路徑，放在 public/images/ 下
              alt="Peien Wu"
              width={150}
              height={150}
              className="rounded-full shadow-lg"
              priority
            />
          </div>
        }
        
        <h2>我是誰？</h2>
        <p>
          嗨，我是 Peien Wu！歡迎來到我的數位實驗室。和副標題說的一樣，我相信程式的世界裡沒有所謂的「魔法」——所有的奧秘都藏在那些我們尚未完全理解的原始碼之中。
        </p>
        <p>
          這個部落格是我探索、學習、並嘗試解開這些「魔法」的紀錄空間。我熱衷於深入研究技術的運作原理、解決棘手的問題，並將過程中的發現與心得分享出來。
        </p>

        <h2>這個 Code Lab 的目標</h2>
        <p>
          在 "Peienwu's Code Lab"，我主要會分享關於：
        </p>
        <ul>
          <li>軟體開發的技術筆記與實踐心得。</li>
          <li>對特定原始碼或演算法的分析與理解。</li>
          <li>學習新技術、新工具的過程與反思。</li>
          <li>任何能激發我好奇心並促使我「動手玩程式碼」的主題。</li>
        </ul>
        <p>
          我希望這裡的內容不僅能幫助我自己梳理知識、加深理解，也能為同樣走在學習路上的你帶來一些啟發或參考。
        </p>

        <h2>保持聯繫</h2>
        <p>
          如果你對我的文章有任何想法、建議，或想進一步交流，都非常歡迎！
        </p>
        <ul>
          <li>你可以在 <Link href="https://github.com/peienwu1216" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">GitHub</Link> 上找到我。</li>
          <li>也可以透過 <Link href="/" className="text-green-600 dark:text-green-400 hover:underline">部落格首頁</Link> 查看我的最新文章。</li>
        </ul>
        <p>
          感謝你的到訪，讓我們一起享受探索原始碼的樂趣吧！
        </p>
      </article>
    </div>
  );
}