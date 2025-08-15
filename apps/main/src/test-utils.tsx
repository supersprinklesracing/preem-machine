import { User } from '@/auth/AuthContext';
import { AuthProvider } from '@/auth/AuthProvider';
import { MantineProvider } from '@mantine/core';
import { render, RenderOptions } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { theme } from './app/theme';

const AllTheProviders = function AllTheProviders({
  children,
  user,
}: {
  children: ReactNode;
  user: User | null;
}) {
  return (
    <MantineProvider theme={theme}>
      <AuthProvider user={user}>{children}</AuthProvider>
    </MantineProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { user?: User | null }
) => {
  const { user, ...renderOptions } = options || {};
  return render(ui, {
    wrapper: (props) => <AllTheProviders {...props} user={user ?? null} />,
    ...renderOptions,
  });
};

export * from '@testing-library/react';
export { customRender as render };
