import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import remarkGfm   from 'remark-gfm'          // ✅ 新增
import remarkMath  from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypePrettyCode from 'rehype-pretty-code' // ✅（選用）

const rehypePrettyCodePlugin = rehypePrettyCode as unknown as any

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `posts/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title:   { type: 'string', required: true },
    date:    { type: 'date',   required: true },
    sticky:  { type: 'number' },
    tags:    { type: 'list', of: { type: 'string' } },
    category:{ type: 'string' },
  },
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post],
  mdx: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      [rehypeKatex, { strict: false }],
      [rehypePrettyCodePlugin, {                  // ✅ OK
        theme: 'one-dark-pro',
        keepBackground: false,
      }],
    ],
  },
})
