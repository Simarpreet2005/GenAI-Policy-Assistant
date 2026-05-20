/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0b10',
        textMain: '#e2e8f0',
        textMuted: '#94a3b8',
        panel: 'rgba(15, 17, 26, 0.4)',
        panelBorder: 'rgba(255, 255, 255, 0.06)',
        primary: '#3b82f6', // bright blue
        primaryHover: '#2563eb',
        secondary: '#8b5cf6', // purple
        accent1: '#f472b6', // pink
        accent2: '#2dd4bf', // cyan
        surface: 'rgba(30, 33, 43, 0.6)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.3)',
        'glass-hover': '0 8px 32px 0 rgba(59, 130, 246, 0.15)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
