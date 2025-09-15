import { AuthContextUser } from './auth/user';
import { AuthProvider } from '@/auth/client/AuthProvider';
import { createMockDb } from '@/datastore/server/mock-db/mock-db-util';
import { DatabaseCollections } from '@/datastore/server/mock-db/mock-db-processor';
import { getFirestore } from '@/firebase/server';
import { MantineProvider } from '@mantine/core';
import { render, RenderOptions } from '@testing-library/react';
import type { Firestore } from 'firebase-admin/firestore';
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
  },
) => {
  const { authUser, ...renderOptions } = options || {};
  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders {...props} authUser={authUser ?? null} />
    ),
    ...renderOptions,
  });
};

interface MockFirestore extends Firestore {
  database: DatabaseCollections;
}

export const setupMockDb = () => {
  // 'use server';

  let firestore: MockFirestore;
  beforeAll(async () => {
    firestore = (await getFirestore()) as MockFirestore;
    firestore.database = createMockDb(firestore);
  });
};

export * from '@testing-library/react';
export { customRender as render };
