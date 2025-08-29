import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FF6B35', // Orange CTA
          accent: '#0EA5E9', // Deep Blue secondary
          success: '#10B981',
          warning: '#F59E0B',
          text: {
            primary: '#1A1A1A',
            secondary: '#6B7280',
            muted: '#9CA3AF',
          },
          surface: {
            base: '#FFFFFF',
            alt: '#FAFAFA',
          },
        },
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
