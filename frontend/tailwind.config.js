/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme-sensitive: resolved via CSS custom properties
        background:  'var(--color-bg)',
        textMain:    'var(--color-text-main)',
        textMuted:   'var(--color-text-muted)',
        panel:       'var(--color-panel)',
        panelBorder: 'var(--color-panel-border)',
        surface:     'var(--color-surface)',
        // Static accent palette – same across themes
        primary:      '#3b82f6',
        primaryHover: '#2563eb',
        secondary:    '#8b5cf6',
        accent1:      '#f472b6',
        accent2:      '#2dd4bf',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass':       '0 8px 32px 0 rgba(0,0,0,0.45)',
        'glass-sm':    '0 4px 16px 0 rgba(0,0,0,0.28)',
        'glass-hover': '0 8px 32px 0 rgba(59,130,246,0.15)',
        'inner-light': 'inset 0 1px 0 0 rgba(255,255,255,0.06)',
      },
    },
  },
  plugins: [],
}
