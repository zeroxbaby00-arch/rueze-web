module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}', // ✅ scan EVERYTHING inside src
  ],
  theme: {
    extend: {
      colors: {
        'soft-pink': '#F8E8EE',
        beige: '#F5F5DC',
        'light-grey': '#F2F2F2',
      },
    },
  },
  plugins: [],
}
