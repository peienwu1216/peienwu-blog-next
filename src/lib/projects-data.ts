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
    title: '🏆 Pycade Bomber: 團隊協作與軟體工程實踐',
    description: [
      '在三人團隊中，作為專案的主要貢獻者，我主導了《Pycade Bomber》的開發。此專案在既有的 C++ 版本基礎上進行了全面重構，並學習了業界標準的軟體開發生命週期 (SDLC)。',
      '',
      '**智慧型 AI 設計：** 運用有限狀態機 (FSM) 進行行為決策，並結合 A*/BFS 演算法實現高效的動態路徑規劃。',
      '**CI/CD 自動化管線：** 透過 GitHub Actions 建立 CI/CD 管線，自動執行 Pytest 測試與 Flake8 風格檢查，並將最新穩定版本部署至線上遊玩。我們也實踐了觸控功能，提供行動裝置友善的遊戲體驗。',
      '**專業版控流程：** 執行 Git 工作流程，學習業界的開發標準，透過分支保護、強制性 Pull Request 與 Code Review，來保障主分支的穩定性與團隊的程式碼品質。'
    ],
    techStack: ['Python', 'Pygame', 'OOP', 'FSM', 'A* Algorithm', 'CI/CD', 'GitHub Actions', 'Pytest'],
    repoUrl: 'https://github.com/peienwu1216/oop-2025-proj-pycade',
    category: '團隊合作與軟體工程',
  },
  {
    title: "💡 Code Lab: 全端應用開發與現代網頁技術實踐",
    description: [
      "我將個人網站融合了現代網頁工程與 AI 技術，旨在打造一個能與使用者深度互動、持續進化的數位分身。",
        "**AI 數位分身：** 透過在執行時將我所有作品的綜合知識庫注入模型的上下文，我設計並實作了一個能精準回答複雜跨領域問題的對話式 AI。",
        "**共享音樂體驗：** 我從零到一地架構了一個基於 Spotify SDK 的即時「派對模式」。其後端使用 Vercel KV 執行原子操作來處理高併發下的競爭條件，確保了多使用者在搶佔控制權時的狀態一致性。",
        "**動態儀表板：** 我開發了具備智慧快取 (ISR) 的 Next.js API Routes，用以安全地串接 GitHub API，並將即時動態數據注入到 ⌘+K 指揮中心與專案儀表板，將網站從靜態頁面提升為可互動的智慧產品。"
    ],
    techStack: ['Next.js', 'React', 'TypeScript', 'Contentlayer', 'Tailwind CSS', 'FlexSearch.js', 'Google AI API'],
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