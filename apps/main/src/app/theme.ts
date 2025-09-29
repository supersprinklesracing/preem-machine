import { createTheme, MantineThemeOverride, rem } from '@mantine/core';

export const theme: MantineThemeOverride = createTheme({
  other: {
    appShell: {
      headerHeight: { base: rem(60), sm: rem(70) },
      navbarWidth: { base: rem(250), sm: rem(280) },
    },
  },
});
