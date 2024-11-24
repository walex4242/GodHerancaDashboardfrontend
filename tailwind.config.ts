import type { Config } from 'tailwindcss';
import { createThemes } from 'tw-colors';
import colors from 'tailwindcss/colors';

// Define the base colors that will have dynamic theming
const baseColors = [
  'gray',
  'red',
  'yellow',
  'green',
  'blue',
  'indigo',
  'purple',
  'pink',
  'black',
  'white',
];

// Map light shades to dark shades and vice versa
const shadeMapping = {
  '50': '900',
  '100': '800',
  '200': '700',
  '300': '600',
  '400': '500',
  '500': '400',
  '600': '300',
  '700': '200',
  '800': '100',
  '900': '50',
};

// Infer types from the Tailwind colors object
type ColorsType = typeof colors;
type ColorKeys = keyof ColorsType; // Valid color names like 'gray', 'red', etc.
type ShadeKeys = keyof ColorsType[ColorKeys];

// Helper function to generate theme objects
const generateThemeObject = (
  colors: ColorsType,
  mapping: Record<string, string>,
  invert = false,
) => {
  const theme: Record<string, Record<string, string>> = {};

  baseColors.forEach((color) => {
    if (!(color in colors)) return; // Skip invalid colors

    const colorShades = colors[color as ColorKeys];

    // Check if the color is a single value or an object with shades
    if (typeof colorShades === 'string') {
      theme[color] = {
        DEFAULT: colorShades, // Use the single value directly
      };
    } else {
      theme[color] = {};
      Object.entries(mapping).forEach(([key, value]) => {
        const shadeKey = invert ? value : key;
        theme[color][key] = colorShades?.[shadeKey as ShadeKeys] ?? '';
      });
    }
  });

  return theme;
};

// Generate light and dark theme variants
const lightTheme = generateThemeObject(colors, shadeMapping);
const darkTheme = generateThemeObject(colors, shadeMapping, true);

// Define themes with additional overrides for primary colors
const themes = {
  light: {
    ...lightTheme,
    primary: colors.blue['500'], // Primary color for light mode
    white: '#ffffff', // Override white color
    black: '#000000', // Override black color
  },
  dark: {
    ...darkTheme,
    primary: colors.blue['300'], // Primary color for dark mode
    white: colors.gray['50'], // Use gray for white in dark mode
    black: colors.gray['800'], // Use dark gray for black in dark mode
  },
};

// Tailwind CSS configuration
const config: Config = {
  darkMode: 'class', // Enables class-based dark mode switching
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [createThemes(themes)], // Plugin to handle dynamic theming
};

export default config;
