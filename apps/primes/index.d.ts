import '@mantine/core';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.svg' {
  const content: any;
  export const ReactComponent: any;
  export default content;
}

declare module '@mantine/core' {
  export interface MantineThemeOther {
    appShell: {
      headerHeight: { base: string; sm: string };
      navbarWidth: { base: string; sm: string };
    };
  }
}
