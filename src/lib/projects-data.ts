export interface Project {
  title: string;
  description: string[];
  techStack: string[];
  repoUrl: string;
  liveDemoUrl?: string;
  category: '團隊合作與軟體工程' | '遊戲開發' | '個人品牌與網頁開發' | '物件導向與版本控制';

  // 動態 GitHub stats（稍後由前端注入）
  stars?: number;
  forks?: number;
  issues?: number;
  commits?: number;
}

export const projectsData: Project[] = [
  {
    title: '🏆 Pycade Bomber: 完整軟體工程實踐',
    description: [
      '在三人團隊中，我們打造了《Pycade Bomber》，一個從開發到部署都採用專業工作流程的專案。',
      '**智慧型 AI 設計：** 運用有限狀態機 (FSM) 設計了四種不同策略的 AI 對手，並結合 A*/BFS 演算法進行路徑規劃。',
      '**實現 CI/CD 流程：** 建立 CI/CD 自動化流程，包含自動化測試 (Pytest, flake8) 與部署，讓最新版本能直接在線上遊玩。',
      '**導入業界標準流程：** 嚴格執行 Git 工作流程，包含分支保護、Pull Request 與 Code Review，確保程式碼品質。'
    ],
    techStack: ['Python', 'Pygame', 'OOP', 'FSM', 'CI/CD', 'GitHub Actions', 'Pytest'],
    repoUrl: 'https://github.com/peienwu1216/oop-2025-proj-pycade',
    category: '團隊合作與軟體工程',
  },
  {
    title: "💡 Code Lab: 我的 Next.js 技術實驗室",
    description: [
      "這是目前此個人網站（Code Lab）的專案原始碼，也是我探索現代網頁技術的實驗場。我正使用 Next.js (App Router)、React、TypeScript 等最新技術重新打造它。",
      "這個專案不僅是我分享演算法、資料結構筆記的平台，也是我主動學習並掌握新工具與框架的證明。",
      
    ],
    techStack: ['Next.js', 'React', 'TypeScript', 'Contentlayer', 'Tailwind CSS'],
    repoUrl: 'https://github.com/peienwu1216/peienwu-blog-next',
    liveDemoUrl: 'https://peienwu-blog-next.vercel.app/',
    category: '個人品牌與網頁開發',
  },
  {
    title: '🎮 CrazyArcade-CPP: C++ 遊戲開發實戰',
    description: [
      '這款以 C++ 打造的類炸彈超人遊戲，是一個完整的期末專案，展現了我從設計、實作到交付一款遊戲的綜合能力。',
      '專案內容涵蓋了核心遊戲機制、邏輯設計，並在實戰中應用了 C++ 的基礎程式設計原則。',
      '**奠定基礎：** 作為大一上的 C++ 核心專案，它不僅讓我熟悉了遊戲開發的完整流程，也為大一下的 Pycade Bomber 團隊專案奠定了扎實的技術基礎。'
    ],
    techStack: ['C++'],
    repoUrl: 'https://github.com/peienwu1216/CrazyArcade-CPP-Game',
    category: '遊戲開發',
  },
  {
    title: '📝 Peienwu-Blog: 我的 Hexo 技術部落格',
    description: [
      '我的主要部落格，使用 Hexo 框架搭建，累積了超過 280 篇文章，主題涵蓋技術、演算法與資料結構筆記。',
      '這個網站不僅吸引了穩定的讀者群，也體現了我長期堅持學習與知識分享的熱情。',
    ],
    techStack: ['Hexo', 'Stylus', 'Markdown'],
    repoUrl: 'https://github.com/peienwu1216/peienwu-blog',
    liveDemoUrl: 'https://peienwu.com/',
    category: '個人品牌與網頁開發',
  },
  {
    title: '🐍 OOP in Python (NYCU)',
    description: [
      '在陽明交大的物件導向課程中，不僅展現了我的 Python 與 OOP 技能，更是一次寶貴的 Git 協作經驗。',
      '所有課堂練習都透過 Pull Request 提交至課程專案，讓我們在實作中熟悉了版本控制與團隊合作的流程。'
    ],
    techStack: ['Python', 'OOP', 'Git'],
    repoUrl: 'https://github.com/peienwu1216/oop-python-nycu',
    category: '物件導向與版本控制',
  },
]; 