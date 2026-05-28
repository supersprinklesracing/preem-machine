import { createTheme, MantineThemeOverride, rem } from '@mantine/core';

export const theme: MantineThemeOverride = createTheme({
  primaryColor: 'giroOrange',
  primaryShade: 6,
  fontFamily: '"Inter", sans-serif',
  fontFamilyMonospace: '"JetBrains Mono", monospace',
  headings: {
    fontFamily: '"Morally Serif Regular", "Playfair Display", Georgia, serif',
    sizes: {
      h1: { fontSize: rem(48), lineHeight: '1.2', fontWeight: 'bold' },
      h2: { fontSize: rem(36), lineHeight: '1.3', fontWeight: 'bold' },
      h3: { fontSize: rem(28), lineHeight: '1.4', fontWeight: '600' },
      h4: { fontSize: rem(22), lineHeight: '1.5', fontWeight: '600' },
    },
  },
  defaultRadius: 'md',
  colors: {
    // Exact Giro SF Vibrant Orange matching girosf.com
    giroOrange: [
      '#fff0e6',
      '#ffe0cc',
      '#ffc299',
      '#ffa366',
      '#ff8533',
      '#ff6600',
      '#f96335',
      '#e64d19',
      '#cc3300',
      '#b32400',
    ],
    // Giro SF Yellow
    giroYellow: [
      '#fffbeb',
      '#fff6d6',
      '#ffe8ad',
      '#ffda85',
      '#ffcc5c',
      '#eea60b',
      '#cc8c00',
      '#a37000',
      '#7a5400',
      '#523800',
    ],
    // Giro SF Purple
    giroPurple: [
      '#faf8fc',
      '#f2ecf7',
      '#e2daed',
      '#d1c7e3',
      '#c1b3d9',
      '#b4a2ce',
      '#9683b3',
      '#7a6696',
      '#5d4a7a',
      '#42315c',
    ],
    dark: [
      '#d6d6d6',
      '#c2c2c2',
      '#a8a8a8',
      '#8f8f8f',
      '#757575',
      '#5c5c5c',
      '#464646',
      '#303030',
      '#111111',
      '#000000',
    ],
  },
  other: {
    appShell: {
      headerHeight: { base: rem(70), sm: rem(80) },
      navbarWidth: { base: rem(250), sm: rem(280) },
    },
    elevated: {
      card: {
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        background: '#ffffff',
      },
      hoverCard: {
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.1)',
      },
      darkCard: {
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        background: '#1a1a1a',
      },
    },
    gradients: {
      primary: 'linear-gradient(135deg, #f96335 0%, #eea60b 100%)',
      secondary: 'linear-gradient(135deg, #b4a2ce 0%, #e2daed 100%)',
      accent: 'linear-gradient(135deg, #eea60b 0%, #d96125 100%)',
    },
  },
});
