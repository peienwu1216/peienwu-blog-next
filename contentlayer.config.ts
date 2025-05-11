// contentlayer.config.ts
import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypePrettyCode from 'rehype-pretty-code'

const rehypePrettyCodePlugin = rehypePrettyCode as unknown as any

export const Post = defineDocumentType(() => ({
  name: 'Post',
  // 保持這個 filePathPattern，如果你希望 .mdx 檔案仍在 content/posts/ 目錄下
  filePathPattern: `posts/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    sticky: { type: 'number' },
    tags: { type: 'list', of: { type: 'string' } },
    category: { type: 'string' },
  },
  computedFields: {
    url: {
      type: 'string',
      // 這裡的 resolve 函數確保 url 是 /your-slug 的格式
      // 它會移除 _raw.flattenedPath 中 'posts/' 這個前綴
      resolve: (post) => `/${post._raw.flattenedPath.replace(/^posts\/?/, '')}`,
    },
    slug: {
      type: 'string',
      // 同樣，slug 也是移除 'posts/' 前綴後的檔名部分
      resolve: (post) => post._raw.flattenedPath.replace(/^posts\/?/, ''),
    }
  }
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post],
  mdx: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      [rehypeKatex, { strict: false }],
      [
        rehypePrettyCodePlugin,
        {
          theme: 'one-dark-pro',
          keepBackground: false,
        },
      ],
    ],
  },
})