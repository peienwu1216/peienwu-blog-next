// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer/source-files";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
var Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    date: { type: "date", required: true },
    sticky: { type: "number", required: false },
    tags: { type: "list", of: { type: "string" }, required: false },
    categories: { type: "list", of: { type: "string" }, required: false }
    // 不要加 mathjax: true，除非你真的需要它是欄位
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "content/pages",
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
//# sourceMappingURL=compiled-contentlayer-config-REF2HLH6.mjs.map
