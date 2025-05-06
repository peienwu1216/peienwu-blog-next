import typography from '@tailwindcss/typography'

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{mdx,md}"
  ],
  theme: {
    extend: {},
  },
  plugins: [typography],
}
