import { createMockDb } from '@/datastore/server/mock-db/mock-db-util';
import { getFirestore } from '@/firebase/server';
import * as userServer from '@/user/server/user';
import { MantineProvider } from '@mantine/core';
import { render, RenderOptions } from '@testing-library/react';
import type { Firestore } from 'firebase-admin/firestore';
import React, { ReactNode } from 'react';
import { theme } from './app/theme';
import { UserContextValue } from './user/client/UserContext';
import { UserProvider } from './user/client/UserProvider';
import { AuthUser } from './auth/user';
import { User } from './datastore/schema';

jest.mock('@/user/server/user');

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

export const MOCK_USER_CONTEXT = { authUser: MOCK_AUTH_USER, user: MOCK_USER };

export function setupUserContext() {
  const mockedGetUserContext = userServer.getUserContext as jest.Mock;
  const mockedVerifyUserContext = userServer.verifyUserContext as jest.Mock;
  const mockedValidUserContext = userServer.validUserContext as jest.Mock;

  beforeEach(() => {
    mockedGetUserContext.mockResolvedValue({ authUser: null, user: null });
    mockedVerifyUserContext.mockResolvedValue({ authUser: null, user: null });
    mockedValidUserContext.mockResolvedValue({ authUser: null, user: null });
  });

  return {
    mockedGetUserContext,
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
