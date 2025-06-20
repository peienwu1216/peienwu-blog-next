import Image from 'next/image'; // 如果你想放個人圖片
import IconLink from '@/components/IconLink';
import { Book, Mail } from 'lucide-react';
import TableOfContents from '@/components/TableOfContents';
import Slugger from 'github-slugger';

export default function AboutPage() {
  const slugger = new Slugger();

  const headings = [
    { level: 2, text: '我是誰？ (About Me)', slug: slugger.slug('我是誰？ (About Me)') },
    { level: 2, text: '🚀 代表專案 (Spotlight Projects)', slug: slugger.slug('代表專案') },
    { level: 2, text: '🛠️ 核心技術棧 (Technical Skills)', slug: slugger.slug('核心技術棧') },
    { level: 2, text: '📖 技術探索與社群參與', slug: slugger.slug('技術探索與社群參與') },
    { level: 2, text: '🎯 未來方向 (Future Direction)', slug: slugger.slug('未來方向') },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:flex lg:space-x-8">
      {/* TOC */}
      <TableOfContents headings={headings} />

      <div className="min-w-0">
        <div className="container mx-auto px-0 max-w-3xl">
          <header className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-4">
              關於我
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
            
            {/* 社群與聯繫徽章 主要內容從這裡開始 */}
            <div className="flex flex-wrap justify-center gap-4 my-8">
              <IconLink
                href="https://github.com/peienwu1216"
                text="探索我的 GitHub"
                icon={Book}
                className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
              />
              <IconLink
                href="mailto:peien.wu1216@gmail.com"
                text="與我聯繫"
                icon={Mail}
                className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
              />
            </div>

            <h2 id={headings[0].slug}>我是誰？ (About Me)</h2>

            <p>
              我目前於<strong>國立陽明交通大學 (NYCU) 電機工程學系</strong>深耕技術基礎（大一上校級書卷獎、系排名前 4%），並專注於將熱情投入在<strong>演算法、資料結構與軟體架構</strong>的實踐上。
            </p>

            <p>
              我致力於將理論應用於解決實際問題。一個關鍵的經驗是，我將「邏輯設計」課程中的有限狀態機 (FSM) 理論，成功應用於大一上計概期末 C++ 的遊戲專案中，設計出具備多種策略模式的 AI 玩家。這個經驗啟發了我，我在下學期以 Python 和更進階的物件導向重構此專案，並導入自動化 CI/CD 流程，打造一個更穩健、更具智慧的遊戲系統。
            </p>

            <hr />

            {/* Spotlight Projects */}
            <h2 id={headings[1].slug}>🚀 代表專案 (Spotlight Projects)</h2>

            <table>
              <tbody>
                <tr>
                  <td style={{ width: '50%', verticalAlign: 'top' }}>
                  <h3>🏆 Pycade Bomber: FSM、CI/CD 與專業開發流程</h3>
                    <p>
                    作為<strong>三人團隊</strong>的核心開發者，我主導並負責兩大關鍵任務：在<strong>演算法層面</strong>，運用 <strong>FSM </strong>與 <strong>A*</strong> 演算法設計出策略多變的AI玩家；在<strong>工程實踐層面</strong>，則透過 GitHub Actions 建立 <strong>CI/CD </strong>自動化部署，並導入 Pull Request 與 Code Review 制度，確保了專案的開發品質與效率。
                    </p>
                    <p>
                      <em>這個專案完整體現了我在演算法設計、團隊協作與軟體工程實踐上的綜合能力。</em>
                    </p>
                    <p>
                      <strong>技術棧：</strong> Python, Pygame, OOP, FSM, CI/CD, GitHub Actions, Pytest
                    </p>
                    <p>
                      🔗{' '}
                      <a href="https://github.com/peienwu1216/oop-2025-proj-pycade" target="_blank" rel="noopener noreferrer"><strong>點此探索專案原始碼</strong></a>
                    </p>
                  </td>
                  <td style={{ width: '50%', verticalAlign: 'top' }}>
                    <h3>💡 Code Lab: 現代化網頁技術實踐</h3>
                    <p>
                      為了深入掌握現代網頁開發，我親手打造了這個技術部落格，將其視為一個完整的<strong>產品設計專案</strong>。從前端架構 (Next.js App Router)、內容處理 (MDX) 到使用者體驗 (響應式設計、深色模式、字體排版)，皆由我獨立規劃與實踐。
                    </p>
                    <p>
                      我特別在<strong>網頁視覺編排</strong>與<strong>內容呈現</strong>的細節上進行了優化，目標是打造一個兼具專業內涵與閱讀舒適度的個人品牌網站。
                    </p>
                    <p>
                      <strong>技術棧：</strong> Next.js (App Router), React, TypeScript, Tailwind CSS, Contentlayer
                    </p>
                    <p>
                      🔗{' '}
                      <a href="https://github.com/peienwu1216/peienwu-blog-next" target="_blank" rel="noopener noreferrer"><strong>點此探索專案原始碼</strong></a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style={{ width: '50%', verticalAlign: 'top' }}>
                    <h3>🎮 CrazyArcade-CPP: C++ 核心能力實證</h3>
                    <p>
                      一個從零開始、以 C++ 打造的完整遊戲專案。這個專案驗證了我管理較大的遊戲專案、實現核心遊戲機制，以及運用 C++ 基礎來交付一個完整產品的能力。
                    </p>
                    <p>
                      <strong>技術棧：</strong> C++
                    </p>
                    <p>
                      🔗{' '}
                      <a href="https://github.com/peienwu1216/CrazyArcade-CPP-Game" target="_blank" rel="noopener noreferrer"><strong>點此探索專案原始碼</strong></a>
                    </p>
                  </td>
                  <td style={{ width: '50%', verticalAlign: 'top' }}>
                    <h3>📝 個人部落格 (Hexo): 長期學習與分享</h3>
                    <p>
                      我高中時期架設的主要技術部落格（<a href="https://peienwu.com" target="_blank" rel="noopener noreferrer">peienwu.com</a>），以 Hexo 框架搭建，累積了超過 280 篇文章。它是我長期堅持學習、紀錄與分享知識的證明，並吸引讀者閱讀。
                    </p>
                    <p>
                      <strong>技術棧：</strong> Hexo, JavaScript, Stylus, Markdown
                    </p>
                    <p>
                      🔗{' '}
                      <a href="https://github.com/peienwu1216/peienwu-blog" target="_blank" rel="noopener noreferrer"><strong>點此探索專案原始碼</strong></a>
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            <hr />

            {/* Core Competency Table */}
            <h2 id={headings[2].slug}>🛠️ 核心技術棧 (Technical Skills)</h2>

            <p>
              目前主要探索以下技術：
            </p>
            
            <ul>
              <li>
                <strong>程式語言：</strong> C++, Python
              </li>
              <li>
                <strong>軟體工程概念：</strong> Object-Oriented Programming (OOP), Data Structures, Algorithms, Version Control (Git)
              </li>
              <li>
                <strong>工具與平台：</strong> GitHub, Vercel, VS Code, Linux Environment
              </li>
              <li>
                <strong>網頁開發：</strong>Next.js, HTML, CSS, MDX, Hexo
              </li>
              <li>
                <strong>遊戲開發基礎：</strong> C++, Python 遊戲邏輯與機制
              </li>
            </ul>

          <p>
            我對高效能演算法與軟體解決方案的結合抱有濃厚興趣。在臺大「<strong>資訊之芽培訓計畫算法班</strong>」的經驗，奠定了我於<strong>演算法與資料結構</strong>領域的穩固基礎，我也持續在個人部落格中應用並記錄相關所學。
          </p>
          
          <hr />

            {/* Exploration & Community */}
            <h2 id={headings[3].slug}>📖 技術探索與社群參與</h2>

            <ul>
              <li>
                <strong>演算法訓練：</strong> 完成臺大<strong>「資訊之芽培訓計畫算法班」</strong>兩階段培訓，並在線上解題平台累積超過 500 題的實戰經驗。
              </li>
              <li>
                <strong>程式競賽：</strong> 曾參與 NPSC 全國程式設計大賽並獲得佳作。
              </li>
              <li>
                <strong>知識分享：</strong> 曾擔任建國中學資訊讀書會講師（教授計算幾何），並長期經營兩個技術部落格，將學習心得轉化為系統性的文章。
              </li>
              <li>
                <strong>自主學習：</strong> 持續探索新技術，包含以 Next.js 進行全端開發等。
              </li>
            </ul>

            <hr />

            {/* Future Direction */}
            <h2 id={headings[4].slug}>🎯 未來方向 (Future Direction)</h2>

            <p>
              我希望能持續在資訊工程領域深耕，目前的學習重點是建立更穩固的 CS 核心基礎。我對<strong>機器學習</strong>與<strong>計算機系統</strong>等領域抱有濃厚興趣，並計劃在未來尋求相關的專題研究與實習機會，將所學應用於更具挑戰性的真實世界問題中。
            </p>

            <p>
              感謝您的閱讀。若您想探索我自高中以來完整的學習軌跡與超過兩百篇的文章存檔，歡迎參觀我的舊版個人網站：
              <IconLink
                href="https://peienwu.com"
                text="peienwu.com"
                icon={Book}
                className="bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              />
            </p>
          </article>
        </div>
      </div>{/* end content */}
    </div>
  );
}