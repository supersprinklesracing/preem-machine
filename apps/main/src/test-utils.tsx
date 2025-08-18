import { AuthContextUser } from '@/auth/AuthContext';
import { AuthProvider } from '@/auth/AuthProvider';
import { MantineProvider } from '@mantine/core';
import { render, RenderOptions } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { theme } from './app/theme';

const AllTheProviders = function AllTheProviders({
  children,
  authUser,
}: {
  children: ReactNode;
  authUser: AuthContextUser | null;
}) {
  return (
    <MantineProvider theme={theme}>
      <AuthProvider authUser={authUser}>{children}</AuthProvider>
    </MantineProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    authUser?: AuthContextUser | null;
  }
) => {
  const { authUser, ...renderOptions } = options || {};
  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders {...props} authUser={authUser ?? null} />
    ),
    ...renderOptions,
  });
};

export * from '@testing-library/react';
export { customRender as render };
