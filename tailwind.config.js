/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          dark: '#121212',
          active: '#1A7F64',
          text: '#9CA3AF',
          label: '#6B7280',
        },
      },
      spacing: {
        '68': '272px',
      },
    },
  },
  plugins: [],
}
