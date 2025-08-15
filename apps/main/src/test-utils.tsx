import { MantineProvider } from '@mantine/core';
import { render, RenderOptions } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { theme } from './app/theme';

const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return <MantineProvider theme={theme}>{children}</MantineProvider>;
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
