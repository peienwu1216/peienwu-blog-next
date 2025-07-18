// tailwind.config.js
// const typography = require('@tailwindcss/typography'); // 如果你想在設定檔頂層使用它，可以這樣引入，但通常不需要
const defaultTheme = require('tailwindcss/defaultTheme'); // 引入預設主題以擴展

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // 啟用 class-based dark mode
    content: [
      './src/**/*.{js,ts,jsx,tsx,mdx}',
      './content/**/*.{md,mdx}',
    ],
    theme: {
      extend: {
        fontFamily: {
          // 讓 Tailwind 的 font-sans 工具類使用我們在 layout.tsx 中設定的 CSS 變數
          // Noto Sans TC 已經透過 layout.tsx 中的 className 設為 body 預設字體，
          // 所以這裡的 sans 設定主要是為了保持 Tailwind font-sans 的一致性，
          // 或者如果你想在特定元素上明確使用 font-sans。
          sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
          // 讓 Tailwind 的 font-mono 工具類使用我們設定的 JetBrains Mono CSS 變數
          mono: ['var(--font-fira-code)', ...defaultTheme.fontFamily.mono],
        },
        // 客製化 typography 插件的樣式
        typography: ({ theme }) => ({
          DEFAULT: {
            css: {
              'h1, h2': {
                fontWeight: '600',
                borderBottomWidth: '1px',
                borderBottomColor: theme('colors.slate.200'),
                paddingBottom: theme('spacing.3'),
              },
              blockquote: {
                fontStyle: 'normal',
                borderLeftWidth: '4px',
                borderLeftColor: theme('colors.green.500'),
                backgroundColor: theme('colors.slate.100'),
                paddingLeft: theme('spacing.4'),
                paddingRight: theme('spacing.4'),
                paddingTop: theme('spacing.3'),
                paddingBottom: theme('spacing.3'),
                borderRadius: theme('borderRadius.lg'),
              },
              /*
               * Custom styling for code blocks (``` ... ``` in Markdown)
               * We want a consistently dark backdrop that is still comfortable
               * to read in light mode while maintaining a subtle difference
               * in dark mode. We therefore use slate.900 for light mode and
               * slate.800 for dark mode coupled with light foreground text.
               */
              pre: {
                backgroundColor: theme('colors.slate.900'),
                color: theme('colors.slate.100'),
                borderRadius: theme('borderRadius.lg'),
                paddingTop: theme('spacing.4'),
                paddingBottom: theme('spacing.4'),
                paddingLeft: theme('spacing.5'),
                paddingRight: theme('spacing.5'),
                lineHeight: theme('lineHeight.relaxed'),
                overflowX: 'auto',
              },
              'pre code': {
                backgroundColor: 'inherit',
                color: 'inherit',
                padding: '0',
                borderRadius: '0',
              },
              /* Optional : keep inline code readable without huge contrast */
              code: {
                color: theme('colors.pink.600'),
                backgroundColor: theme('colors.slate.100'),
                paddingLeft: theme('spacing.1'),
                paddingRight: theme('spacing.1'),
                borderRadius: theme('borderRadius.sm'),
              },
              'blockquote p:first-of-type::before, blockquote p:last-of-type::after': {
                content: 'none',
              },
            },
          },
          // 確保 prose-invert 在暗黑模式下也能套用我們的自訂義
          invert: {
            css: {
              'h1, h2': {
                borderBottomColor: theme('colors.slate.700'),
              },
              blockquote: {
                borderLeftColor: theme('colors.green.400'),
                backgroundColor: theme('colors.slate.800'),
              },
              /* Dark mode (prose-invert) overrides */
              pre: {
                backgroundColor: theme('colors.slate.800'),
                color: theme('colors.slate.100'),
                borderRadius: theme('borderRadius.lg'),
                paddingTop: theme('spacing.4'),
                paddingBottom: theme('spacing.4'),
                paddingLeft: theme('spacing.5'),
                paddingRight: theme('spacing.5'),
                overflowX: 'auto',
              },
              'pre code': {
                backgroundColor: 'inherit',
                color: 'inherit',
              },
              code: {
                color: theme('colors.pink.400'),
                backgroundColor: theme('colors.slate.700'),
              },
              'blockquote p:first-of-type::before, blockquote p:last-of-type::after': {
                content: 'none',
              },
            },
          },
        }),
      },
    },
    plugins: [
      require('@tailwindcss/typography')
    ],
  }