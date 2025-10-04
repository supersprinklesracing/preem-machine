import { MantineProvider } from '@mantine/core';
import { render, RenderOptions } from '@testing-library/react';
import type { Firestore } from 'firebase-admin/firestore';
import React, { ReactNode } from 'react';

import { createMockDb } from '@/datastore/server/mock-db/mock-db-util';
import { getFirestore } from '@/firebase/server/firebase-admin';
import * as userServer from '@/user/server/user';

import { theme } from './app/theme';
import { AuthUser } from './auth/user';
import { User } from './datastore/schema';
import { UserContextValue } from './user/client/UserContext';
import { UserProvider } from './user/client/UserProvider';

jest.mock('@/user/server/user');

export const PHONE_WIDTH = 390;

export const MOCK_AUTH_USER: AuthUser = {
  uid: 'test-user-id',
  displayName: 'Test User',
  email: 'test-user@example.com',
  phoneNumber: null,
  photoURL: 'https://placehold.co/100x100.png',
  providerId: 'password',
  emailVerified: false,
  token: 'mockValue',
  customClaims: {},
};

export const MOCK_USER: User = {
  id: 'test-user-id',
  path: `users/test-user-id`,
  name: 'Test User',
  email: 'test-user@example.com',
  avatarUrl: 'https://placehold.co/100x100.png',
  organizationRefs: [
    {
      id: 'org-super-sprinkles',
      path: 'organizations/org-super-sprinkles',
    },
  ],
};

export const MOCK_ADMIN_AUTH_USER: AuthUser = {
  uid: 'test-admin',
  displayName: 'Test Admin',
  email: 'test-admin@example.com',
  phoneNumber: null,
  photoURL: 'https://placehold.co/100x100.png',
  providerId: 'password',
  emailVerified: false,
  token: 'mockValue',
  customClaims: { roles: ['admin'] },
};

export const MOCK_ADMIN_USER: User = {
  id: 'test-admin',
  path: `users/test-admin`,
  name: 'Test Admin',
  email: 'test-admin@example.com',
  avatarUrl: 'https://placehold.co/100x100.png',
  organizationRefs: [
    {
      id: 'org-super-sprinkles',
      path: 'organizations/org-super-sprinkles',
    },
  ],
};

export const MOCK_USER_CONTEXT = { authUser: MOCK_AUTH_USER, user: MOCK_USER };

export function setupUserContext() {
  const mockedGetUserContext = userServer.getUserContext as jest.Mock;
  const mockedVerifyUser = userServer.verifyUser as jest.Mock;
  const mockedVerifyUserContext = userServer.verifyUserContext as jest.Mock;
  const mockedValidUserContext = userServer.validUserContext as jest.Mock;

  beforeEach(() => {
    mockedGetUserContext.mockResolvedValue({ authUser: null, user: null });
    mockedVerifyUser.mockResolvedValue({ authUser: null, user: null });
    mockedVerifyUserContext.mockResolvedValue({ authUser: null, user: null });
    mockedValidUserContext.mockResolvedValue({ authUser: null, user: null });
  });

  return {
    mockedGetUserContext,
    mockedVerifyUser,
    mockedVerifyUserContext,
    mockedValidUserContext,
  };
}

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

interface MockFirestore extends Firestore {
  database: ReturnType<typeof createMockDb>;
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
