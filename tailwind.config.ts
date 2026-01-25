import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#3ab7b9',
        'brand-dark': '#15474e',
        'accent-teal': '#aee5e0',
        'neutral-bg': '#353535',
        'text-light': '#ebebeb',
        'text-muted': '#f0f0f0',
      },
      fontFamily: {
        primary: ['var(--font-league-gothic)', 'var(--font-roboto)', 'sans-serif'],
        secondary: ['var(--font-roboto)', 'sans-serif'],
        accent: ['var(--font-gothic-a1)', 'sans-serif'],
      },
      borderRadius: {
        none: '0',
      },
    },
  },
  important: '#app-root',
  plugins: [],
}

export default config

