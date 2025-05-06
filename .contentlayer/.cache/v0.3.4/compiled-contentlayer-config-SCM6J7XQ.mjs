// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer/source-files";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
var Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `posts/**/*.{md,mdx}`,
  // ← 同時吃 md / mdx
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    date: { type: "date", required: true },
    tags: { type: "list", of: { type: "string" } },
    categories: { type: "list", of: { type: "string" } },
    mathjax: { type: "boolean", required: false }
    // 不用也無妨
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "src/content",
  documentTypes: [Post],
  mdx: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex]
  }
});
export {
  Post,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-SCM6J7XQ.mjs.map
