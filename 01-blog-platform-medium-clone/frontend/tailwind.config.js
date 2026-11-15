/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        editorial: {
          bg: '#fafafa',
          surface: '#ffffff',
          text: '#242424',
          muted: '#6b6b6b',
          accent: '#1a8917',
          border: '#f2f2f2',
        },
      },
      maxWidth: {
        reading: '680px',
      },
    },
  },
  plugins: [],
};
