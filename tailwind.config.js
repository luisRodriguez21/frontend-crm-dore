/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  'hsl(45,100%,96%)',
          100: 'hsl(45,96%,89%)',
          200: 'hsl(43,96%,76%)',
          300: 'hsl(41,96%,63%)',
          400: 'hsl(38,95%,52%)',
          500: 'hsl(36,94%,44%)',
          600: 'hsl(32,93%,37%)',
          700: 'hsl(26,90%,30%)',
          800: 'hsl(22,85%,25%)',
          900: 'hsl(18,80%,20%)',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'gold-shimmer': 'linear-gradient(135deg, hsl(38,95%,52%) 0%, hsl(45,96%,76%) 50%, hsl(36,94%,44%) 100%)',
        'warm-gradient': 'radial-gradient(ellipse at 30% 40%, hsl(40,40%,97%) 0%, hsl(38,25%,96%) 70%)',
      },
      boxShadow: {
        'gold-glow':  '0 0 16px hsla(38,95%,52%,0.22), 0 4px 20px hsla(20,15%,15%,0.10)',
        'card':       '0 1px 3px hsla(20,15%,15%,0.06), 0 4px 16px hsla(20,15%,15%,0.04)',
        'card-hover': '0 2px 8px hsla(20,15%,15%,0.08), 0 8px 32px hsla(20,15%,15%,0.06)',
      },
      animation: {
        'fade-in':     'fadeIn 0.4s ease forwards',
        'slide-up':    'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'shimmer':     'shimmer 2s linear infinite',
        'pulse-gold':  'pulseGold 2s ease-in-out infinite',
        'ticker':      'ticker 20s linear infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseGold: { '0%,100%': { boxShadow: '0 0 12px hsla(38,95%,52%,0.3)' }, '50%': { boxShadow: '0 0 28px hsla(38,95%,52%,0.6)' } },
        ticker:    { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
    },
  },
  plugins: [],
}
