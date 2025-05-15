// contentlayer.config.ts
import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import remarkGfm from 'remark-gfm' // GitHub Flavored Markdown (表格、刪除線等)
import remarkMath from 'remark-math' // 讓 remark 理解 LaTeX 數學語法
import rehypeKatex from 'rehype-katex' // 將 remarkMath 產生的數學 AST 渲染成 KaTeX HTML
import rehypePrettyCode from 'rehype-pretty-code' // 程式碼高亮


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
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (post) => `/${post._raw.flattenedPath.replace(/^posts\/?/, '')}`,
    },
    slug: {
      type: 'string',
      resolve: (post) => post._raw.flattenedPath.replace(/^posts\/?/, ''),
    }
  }
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post],
  mdx: {
    remarkPlugins: [remarkGfm, remarkMath], // remark 插件順序通常 GFM 在前
    rehypePlugins: [
      // rehypeKatex 應該在 rehypePrettyCode 之前或之後都可以，
      // 通常數學公式和程式碼塊是獨立處理的。
      // 把它放在前面，先處理數學公式。
      [rehypeKatex, { strict: false }], // strict: false 可以容忍一些輕微的 KaTeX 錯誤
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