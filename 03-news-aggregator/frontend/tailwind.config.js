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
        news: {
          bg: '#f8fafc',
          card: '#ffffff',
          ink: '#0f172a',
          muted: '#64748b',
          border: '#e2e8f0',
          accent: '#dc2626', // Newsroom Red
          navy: '#1e293b',
          blue: '#2563eb',
        },
      },
      fontFamily: {
        headline: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
