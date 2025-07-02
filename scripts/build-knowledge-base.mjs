import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { remark } from 'remark';
import strip from 'strip-markdown';

// --- 常數定義 ---
const CWD = process.cwd();
const POSTS_DIR = path.join(CWD, 'content/posts');
const LEGACY_POSTS_DIR = path.join(CWD, 'legacy_posts');
const PERSONALITY_FILE = path.join(CWD, 'ai/personality.mdx');
const PROJECTS_FILE = path.join(CWD, 'src/lib/projects-data.ts');

const OUTPUT_PERSONALITY_FILE = path.join(CWD, 'public/ai_personality_core.json');
const OUTPUT_KNOWLEDGE_BASE_FILE = path.join(CWD, 'public/ai_knowledge_base.json');

/**
 * 清理 MDX 內容，移除所有非語意語法，只留下純文字。
 * @param {string} content - MDX 檔案內容.
 * @returns {Promise<string>} 清理後的純文字.
 */
async function cleanMdxContent(content) {
  const file = await remark().use(strip).process(content);
  return String(file).trim();
}

/**
 * 處理單一 MDX 檔案，分離 frontmatter 並清理內容。
 * @param {string} filePath - 檔案路徑.
 * @returns {Promise<string>} 清理後的純文字內容.
 */
async function processMdxFile(filePath) {
  const rawContent = await fs.readFile(filePath, 'utf-8');
  const { content, data } = matter(rawContent);
  const cleanedContent = await cleanMdxContent(content);
  return { cleanedContent, frontmatter: data };
}

/**
 * 解析 projects-data.ts 檔案，提取專案資訊。
 * 採用 new Function() 的方式來安全地執行並獲取 TS 檔案中的資料物件，
 * 避免了引入完整的 TS 編譯器作為依賴。
 * @returns {Promise<Array<{title: string, description: string}>>}
 */
async function parseProjectsData() {
  const content = await fs.readFile(PROJECTS_FILE, 'utf-8');
  const match = content.match(/export const projectsData: Project\[\] = (\[[\s\S]*?\]);/);
  if (!match || !match[1]) {
    throw new Error('Could not find or parse projectsData in projects-data.ts');
  }

  // 安全地將字串形式的陣列轉換為實際的 JavaScript 陣列物件
  const projects = new Function(`return ${match[1]}`)();

  return projects.map(p => ({
    title: p.title,
    description: Array.isArray(p.description) ? p.description.join('\n') : p.description,
  }));
}


/**
 * 建立「核心人格」知識庫。
 */
async function buildPersonalityCore() {
  console.log('🧠 Building AI Personality Core...');

  // 讀取 personality.mdx，解析 frontmatter 與內容
  const rawPersonality = await fs.readFile(PERSONALITY_FILE, 'utf-8');
  const { content: personalityBody, data: customBackgroundContent } = matter(rawPersonality);
  const aboutContent = await cleanMdxContent(personalityBody);
  const projectsContent = await parseProjectsData();

  const personalityCore = {
    about: aboutContent,
    projects: projectsContent,
    customBackground: customBackgroundContent,
  };

  await fs.writeFile(OUTPUT_PERSONALITY_FILE, JSON.stringify(personalityCore, null, 2));
  console.log(`✅ Personality Core saved to ${OUTPUT_PERSONALITY_FILE}`);
}

/**
 * 建立「外部知識」知識庫 (技術文章)。
 */
async function buildKnowledgeBase() {
  console.log('📚 Building AI Knowledge Base from posts...');
  const postPaths = await glob('**/*.{md,mdx}', {
    cwd: POSTS_DIR,
    absolute: true,
  });
  const legacyPostPaths = await glob('**/*.{md,mdx}', {
    cwd: LEGACY_POSTS_DIR,
    absolute: true,
  });

  const allPostPaths = [...postPaths, ...legacyPostPaths];
  console.log(`🔍 Found ${allPostPaths.length} articles.`);

  const knowledgeBase = [];
  const contentDirPath = path.join(CWD, 'content');

  // 1. 新增：讀取並處理 README.md
  try {
    console.log('📖 Processing README.md...');
    const readmePath = path.join(CWD, 'README.md');
    const readmeContent = await fs.readFile(readmePath, 'utf-8');
    // 我們假設 README 本身就是最重要的內容，不需要 frontmatter
    const cleanedReadme = await cleanMdxContent(readmeContent);
    knowledgeBase.push({
      title: '關於 Code Lab (本專案) 的技術細節與架構',
      url: 'https://github.com/peienwu1216/peienwu-blog-next',
      content: cleanedReadme,
    });
  } catch (error) {
    console.warn(`⚠️ Could not process README.md:`, error.message);
  }

  for (const postPath of allPostPaths) {
    try {
      const { cleanedContent, frontmatter } = await processMdxFile(postPath);
      
      // Replicate Contentlayer's URL generation logic
      const flattenedPath = path.relative(contentDirPath, postPath).replace(/\.mdx?$/, '');
      const url = `/${flattenedPath.replace(/^posts\/?/, '')}`;

      knowledgeBase.push({
        title: frontmatter.title || path.basename(postPath),
        url: url,
        content: cleanedContent,
      });
    } catch (error) {
       console.warn(`⚠️ Skipping file ${postPath} due to error:`, error.message);
    }
  }

  await fs.writeFile(OUTPUT_KNOWLEDGE_BASE_FILE, JSON.stringify(knowledgeBase, null, 2));
  console.log(`✅ Knowledge Base saved to ${OUTPUT_KNOWLEDGE_BASE_FILE}`);
}

/**
 * 主執行函式
 */
async function main() {
  try {
    console.time('Knowledge base build time');
    await fs.mkdir(path.dirname(OUTPUT_PERSONALITY_FILE), { recursive: true });

    await buildPersonalityCore();
    await buildKnowledgeBase();

    console.timeEnd('Knowledge base build time');
    console.log('\n✨ AI Knowledge Base build complete! ✨');
  } catch (error) {
    console.error('\n❌ An error occurred during the build process:');
    console.error(error);
    process.exit(1);
  }
}

main(); 