import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `posts/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    sticky: { type: 'number', required: false },
    tags: { type: 'list', of: { type: 'string' }, required: false },
    category: { type: 'string', required: false },
  },
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post],
  mdx: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, { strict: false }]],
  },
})
