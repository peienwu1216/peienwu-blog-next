// next.config.js
const { withContentlayer } = require('next-contentlayer')
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    // 直接傳物件 → TypeScript OK
    remarkPlugins: [require('remark-math')],
    rehypePlugins: [require('rehype-katex')],
  },
})

module.exports = withContentlayer(
  withMDX({
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  }),
)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... 其他你的 Next.js 設定 ...

  async redirects() {
    return [
      {
        source: '/sprot10', // 來源路徑
        destination: '/sprout10', // 目標路徑
        permanent: true, // true 代表 301 永久重定向, false 代表 302 暫時重定向
      },
      // 你可以加入更多重定向規則
    ];
  },
};

module.exports = nextConfig;
