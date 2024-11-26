import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Use class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: colors.blue['500'], // Define your primary color statically
        secondary: colors.gray['700'], // Example secondary color
      },
      screens: {
        xs: '375px', // iPhone 11 Pro width
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
    variants: {
      extend: {
        display: ['responsive'],
        overflow: ['responsive'],
      },
    },
  },
  plugins: [],
};

export default config;
