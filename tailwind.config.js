// tailwind.config.js
// const typography = require('@tailwindcss/typography'); // 如果你想在設定檔頂層使用它，可以這樣引入，但通常不需要
const defaultTheme = require('tailwindcss/defaultTheme'); // 引入預設主題以擴展

/** @type {import('tailwindcss').Config} */
module.exports = {
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
          sans: ['var(--font-noto-sans-tc)', ...defaultTheme.fontFamily.sans],
          // 讓 Tailwind 的 font-mono 工具類使用我們設定的 JetBrains Mono CSS 變數
          mono: ['var(--font-jetbrains-mono)', ...defaultTheme.fontFamily.mono],
        },
      },
    },
    plugins: [require('@tailwindcss/typography')],
  }