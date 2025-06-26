// contentlayer.config.ts
import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import remarkGfm from 'remark-gfm' // GitHub Flavored Markdown (表格、刪除線等)
import remarkMath from 'remark-math' // 讓 remark 理解 LaTeX 數學語法
import rehypeKatex from 'rehype-katex' // 將 remarkMath 產生的數學 AST 渲染成 KaTeX HTML
import rehypePrettyCode from 'rehype-pretty-code' // 程式碼高亮
import rehypeSlug from 'rehype-slug' // 增加標題 id
import rehypeExternalLinks from 'rehype-external-links' // 外部連結處理
import removeMd from 'remove-markdown'

// 處理 TypeScript 型別問題，rehype-pretty-code 的預設匯出可能與 rehype 插件型別不完全匹配
const rehypePrettyCodePlugin = rehypePrettyCode as unknown as any // 這樣處理通常是OK的

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `posts/**/*.mdx`, // 你的文章在 content/posts/ 目錄下
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    sticky: { type: 'number' }, // 置頂權重，不錯！
    tags: { type: 'list', of: { type: 'string' } },
    category: { type: 'string' },
    image: { type: 'string' }, // 文章代表圖
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (post) => `/${post._raw.flattenedPath.replace(/^posts\/?/, '')}`,
    },
    slug: {
      type: 'string',
      resolve: (post) => post._raw.flattenedPath.replace(/^posts\/?/, ''),
    },
    plainText: {
      type: 'string',
      resolve: (post) => {
        let raw = (post as any).body?.raw || ''
        // 1. 去除 MDX 的 JSX 註解 {/* ... */}
        raw = raw.replace(/{\/\*[\s\S]*?\*\/}/g, '')
        // 2. 去除 LaTeX 公式字串 ($...$ 和 $$...$$)
        raw = raw.replace(/\$\$[\s\S]*?\$\$|\$[\s\S]*?\$/g, '')
        // 3. 去除程式碼區塊 (```...```) 和行內程式碼 (`...`)
        raw = raw.replace(/```[\s\S]*?```|`[^`]*?`/g, '')
        // 4. 最後用 remove-markdown 去除其餘 Markdown 語法
        return removeMd(raw).replace(/\s+/g, ' ').trim()
      },
    },
    codeText: {
      type: 'string',
      resolve: (post) => {
          const raw = (post as any).body?.raw || '';
          const codeRegex = /```[\s\S]*?```|`[^`]*?`/g;
          const codeMatches = raw.match(codeRegex) || [];
          return codeMatches
            .map((snippet: string) => {
              // Remove leading & trailing backticks
              let cleaned = snippet.replace(/```/g, '').replace(/`/g, '')
              // For fenced blocks, a language hint may appear on the first line (e.g., "cpp", "js")
              // We strip that first line if it is only an identifier without spaces or symbols
              cleaned = cleaned.replace(/^\s*[-a-zA-Z0-9#+.]*\s*\n/, '')
              return cleaned
            })
            .join(' ');
      }
    },
    mathText: {
      type: 'string',
      resolve: (post) => {
          const raw = (post as any).body?.raw || '';
          const mathRegex = /\$\$[\s\S]*?\$\$|\$[\s\S]*?\$/g;
          const mathMatches = raw.match(mathRegex) || [];
          return mathMatches
            .map((s: string) => s.replace(/\$\$/g, '').replace(/\$/g, ''))
            .join(' ');
      }
    }
  },
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post],
  mdx: {
    remarkPlugins: [remarkGfm, remarkMath], // remark 插件順序通常 GFM 在前
    rehypePlugins: [
      rehypeSlug,
      [rehypeKatex, { strict: false }], // strict: false 可以容忍一些輕微的 KaTeX 錯誤
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }], // 外部連結在新分頁開啟
      [
        rehypePrettyCodePlugin,
        {
          theme: 'one-dark-pro', // 或你的主題設定
          keepBackground: false,
          showLineNumbers: true,
          defaultShowLineNumbers: true,
          grid: true,
        },
      ],
      // 其他 rehype 插件，例如處理 slug 和自動連結標題的，通常建議放在 pretty-code 之後
      // import rehypeSlug from 'rehype-slug'
      // import rehypeAutolinkHeadings from 'rehype-autolink-headings'
      // rehypeSlug,
      // [rehypeAutolinkHeadings, { properties: { className: ['anchor'] } }],
    ],
  },
})