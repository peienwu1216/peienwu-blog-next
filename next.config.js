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

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  reactStrictMode: true,
  swcMinify: true,
  images: {
    // 允許來自這些 hostname 的外部圖片
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/sprot10-1',
        destination: '/sprout10-1',
        permanent: true,
      },
      
    ]
  },
}

module.exports = withContentlayer(nextConfig)
