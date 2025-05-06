import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/**/*.{js,ts,jsx,tsx,mdx}',
      './content/**/*.{md,mdx}',
    ],
    theme: { extend: {} },
    plugins: [require('@tailwindcss/typography')],
  }