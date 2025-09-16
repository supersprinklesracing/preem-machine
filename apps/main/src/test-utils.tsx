import { createMockDb } from '@/datastore/server/mock-db/mock-db-util';
import { getFirestore } from '@/firebase/server';
import { MantineProvider } from '@mantine/core';
import { render, RenderOptions } from '@testing-library/react';
import type { Firestore } from 'firebase-admin/firestore';
import React, { ReactNode } from 'react';
import { theme } from './app/theme';
import { UserContextValue } from './user/client/UserContext';
import { UserProvider } from './user/client/UserProvider';

const AllTheProviders = function AllTheProviders({
  children,
  userContext,
}: {
  children: ReactNode;
  userContext: UserContextValue;
}) {
  return (
    <MantineProvider theme={theme}>
      <UserProvider userContext={userContext}>{children}</UserProvider>
    </MantineProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options: Omit<RenderOptions, 'wrapper'> & {
    userContext: UserContextValue;
  } = { userContext: { authUser: null, user: null } },
) => {
  const { userContext, ...renderOptions } = options;
  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders {...props} userContext={userContext} />
    ),
    ...renderOptions,
  });
};

export const setupMockDb = () => {
  // 'use server';

  let firestore: Firestore;
  beforeAll(async () => {
    firestore = await getFirestore();
    (firestore as any).database = createMockDb(firestore);
  });
};

export * from '@testing-library/react';
export { customRender as render };
