import Image from 'next/image'; // 如果你想放個人圖片
import IconLink from '@/components/IconLink';
import { Globe, Book, Mail } from 'lucide-react';

export default function AboutPage() {
  const blogTitle = "Peienwu's Code Lab";

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-3xl">
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
        
        {/* 社群與聯繫徽章 */}
        <div className="flex flex-wrap justify-center gap-4 my-8">
          <IconLink
            href="https://peienwu.com/"
            text="個人網站"
            icon={Globe}
            className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
          />
          <IconLink
            href="https://github.com/peienwu1216"
            text="GitHub"
            icon={Book}
            className="bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          />
          <IconLink
            href="mailto:peien.wu1216@gmail.com"
            text="電子郵件"
            icon={Mail}
            className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
          />
        </div>

        <h2>我是誰？ (About Me)</h2>

        <p>
          我目前就讀於<strong>國立陽明交通大學 (NYCU) 電機工程學系</strong>（大一上校級書卷獎、系排名前 4%）。雖主修電機，但我對軟體工程抱有強烈的熱情，並專注於<strong>演算法、資料結構與軟體架構</strong>的學習與實踐。
        </p>

        <p>
          我致力於將課堂所學的理論應用於解決實際問題。一個關鍵的經驗是，我將「邏輯設計」課程中的有限狀態機 (FSM) 理論，成功應用於遊戲專案中，設計出具備多種策略模式的 AI。這個過程讓我確信，我的興趣在於透過優雅的軟體邏輯來建構複雜且高效的系統。
        </p>

        <p>
          這個 GitHub 記錄了我的專案、程式碼以及在技術路上的學習軌跡。
        </p>

        <hr />

        {/* Spotlight Projects */}
        <h2>🚀 代表專案 (Spotlight Projects)</h2>

        <table>
          <tbody>
            <tr>
              <td style={{ width: '50%', verticalAlign: 'top' }}>
                <h3>🏆 Pycade Bomber: AI、CI/CD 與專業開發流程</h3>
                <p>
                  在一個<strong>三人團隊</strong>中，我們嘗試業界標準的開發流程，完成一個功能完整的遊戲專案。
                </p>
                <ul>
                  <li>
                    <strong>智慧化 AI 設計：</strong>運用<strong>有限狀態機 (FSM)</strong> 設計了四種行為模式各異的 AI，並結合 <strong>A*/BFS 演算法</strong>實現高效的路徑規劃。
                  </li>
                  <li>
                    <strong>導入自動化 CI/CD：</strong>以 GitHub Actions 建立持續整合與部署流程，自動執行 Pytest, flake8，並將最新版本部署至 GitHub Pages 供<strong>線上即時遊玩</strong>。
                  </li>
                  <li>
                    <strong>實踐業界協作流程：</strong>嚴格執行 Git 工作流，包含分支保護、<strong>Pull Request</strong> 與 <strong>Code Review</strong>，確保程式碼品質與團隊協作效率。
                  </li>
                </ul>
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
                  為了深化對現代網頁開發的理解，並建立一個分享<strong>演算法與資料結構</strong>學習心得的平台，我正以最新的技術棧重構我的個人部落格。
                </p>
                <p>
                  <em>這個專案體現了我對新技術的自學能力，以及將所學應用於實際產品的熱情。</em>
                </p>
                <p>
                  <strong>技術棧：</strong> Next.js (App Router), React, TypeScript, Tailwind CSS, Contentlayer
                </p>
                <p>
                  🔗{' '}
                  <a href="https://github.com/peienwu1216/peienwu-blog-next" target="_blank" rel="noopener noreferrer"><strong>查看進行中的專案</strong></a>
                  <br />🚀{' '}
                  <a href="https://peienwu-blog-next.vercel.app/" target="_blank" rel="noopener noreferrer"><strong>Vercel 線上預覽</strong></a>
                </p>
              </td>
            </tr>
            <tr>
              <td style={{ width: '50%', verticalAlign: 'top' }}>
                <h3>🎮 CrazyArcade-CPP: C++ 核心能力實證</h3>
                <p>
                  一個從零開始、以 C++ 打造的完整遊戲專案。這個專案驗證了我管理大型專案、實現核心遊戲機制，以及運用 C++ 基礎來交付一個完整產品的能力。
                </p>
                <p>
                  <em>這個專案是我 C++ 程式設計與大型專案執行能力的堅實證明。</em>
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
                  我高中時期架設的主要技術部落格（<a href="https://peienwu.com" target="_blank" rel="noopener noreferrer">peienwu.com</a>），以 Hexo 框架搭建，累積了超過 280 篇文章。它是我長期堅持學習、紀錄與分享知識的證明，並吸引了穩定的讀者群。
                </p>
                <p>
                  <strong>技術棧：</strong> Hexo, JavaScript, Stylus, Markdown
                </p>
                <p>
                  🔗{' '}
                  <a href="https://github.com/peienwu1216/peienwu-blog" target="_blank" rel="noopener noreferrer"><strong>查看專案原始碼</strong></a>
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* Core Competency Table */}
        <h2>🛠️ 核心技術棧 (Technical Skills)</h2>

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
            <strong>網頁開發：</strong>
            <ul>
              <li><strong>前端：</strong> Next.js, HTML, CSS</li>
              <li><strong>內容管理：</strong> MDX, Hexo</li>
            </ul>
          </li>
          <li>
            <strong>遊戲開發基礎：</strong> C++ 遊戲邏輯與機制
          </li>
        </ul>

      <p>
        我對高效能演算法與軟體解決方案的結合抱有濃厚興趣。在臺大「<strong>資訊之芽培訓計畫算法班</strong>」的經驗，奠定了我於<strong>演算法與資料結構</strong>領域的穩固基礎，我也持續在個人部落格中應用並記錄相關所學。
      </p>
      
      <hr />

        {/* Exploration & Community */}
        <h2>📖 技術探索與社群參與</h2>

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
            <strong>自主學習：</strong> 持續探索新技術，包含以 Next.js 進行全端開發、用 Manim 製作數學動畫等。
          </li>
        </ul>

        <hr />

        {/* Future Direction */}
        <h2>🎯 未來方向 (Future Direction)</h2>

        <p>
          我希望能持續在資訊工程領域深耕，目前的學習重點是建立更穩固的 CS 核心基礎。我對<strong>機器學習</strong>與<strong>計算機系統</strong>等領域抱有濃厚興趣，並計劃在未來尋求相關的專題研究與實習機會，將所學應用於更具挑戰性的真實世界問題中。
        </p>

        <p>感謝您閱讀我的檔案。我樂於討論技術、專案或任何合作的可能性。</p>
      </article>
    </div>
  );
}