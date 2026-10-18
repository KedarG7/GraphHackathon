/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#080B10',
        'bg-secondary': '#0D1219',
        'panel-bg': '#111923',
        'surface-elevated': '#17212C',
        'text-primary': '#E8EEF5',
        'text-secondary': '#94A3B5',
        'text-muted': '#64748B',
        'green-intel': '#6EE7A8',
        'amber-tactical': '#F2B84B',
        'red-alert': '#FF6577',
        'cyan-analytical': '#5DD6F5',
        'border-default': '#263342',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
