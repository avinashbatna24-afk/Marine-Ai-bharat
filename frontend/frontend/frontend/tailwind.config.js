/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        marine: {
          navy: '#06283D',
          'navy-dark': '#001F3F',
          'navy-sidebar': '#04111D',
          blue: '#1363DF',
          'blue-dark': '#003366',
          cyan: '#00B4D8',
          'cyan-glow': '#00CED1',
          teal: '#2A9D8F',
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          border: '#E2E8F0',
          'text-primary': '#0F172A',
          'text-secondary': '#475569',
          'text-muted': '#64748B',
        },
        status: {
          safe: '#22C55E',
          'safe-bg': '#F0FDF4',
          'safe-border': '#DCFCE7',
          warning: '#F59E0B',
          'warning-bg': '#FEF3C7',
          'warning-border': '#FDE68A',
          danger: '#EF4444',
          'danger-bg': '#FEE2E2',
          'danger-border': '#FCA5A5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'marine': '8px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(6, 40, 61, 0.15)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
