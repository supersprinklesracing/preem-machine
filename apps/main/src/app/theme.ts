import { createTheme, MantineThemeOverride, rem } from '@mantine/core';

export const theme: MantineThemeOverride = createTheme({
  primaryColor: 'indigo',
  primaryShade: { light: 6, dark: 8 },
  fontFamily: 'Outfit, Inter, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, Courier New, monospace',
  headings: {
    fontFamily: 'Outfit, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: rem(36), lineHeight: '1.2' },
      h2: { fontSize: rem(28), lineHeight: '1.3' },
      h3: { fontSize: rem(22), lineHeight: '1.4' },
    },
  },
  defaultRadius: 'md',
  colors: {
    // Premium dark-mode optimized deep indigo/violet colors
    indigo: [
      '#eef2ff',
      '#e0e7ff',
      '#c7d2fe',
      '#a5b4fc',
      '#818cf8',
      '#6366f1',
      '#4f46e5',
      '#4338ca',
      '#3730a3',
      '#312e81',
    ],
    // Clean, rich slate grays for glassmorphism
    dark: [
      '#c1c2c5',
      '#a6a7ab',
      '#909296',
      '#5c5f66',
      '#373a40',
      '#2c2e33',
      '#25262b',
      '#1a1b1e',
      '#141517',
      '#101113',
    ],
  },
  other: {
    appShell: {
      headerHeight: { base: rem(60), sm: rem(70) },
      navbarWidth: { base: rem(250), sm: rem(280) },
    },
    // Custom premium styling variables
    glass: {
      background: 'rgba(26, 27, 30, 0.7)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      secondary: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
      accent: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
    },
  },
});
