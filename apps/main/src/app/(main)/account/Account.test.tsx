import { render, screen } from '@/test-utils';
import React from 'react';
import { AuthContextUser } from '@/auth/AuthContext';
import { User } from '@/datastore/types';
import AccountPage from './Account';
import type { AccountDetailsProps } from './Account';

// Mock child components
jest.mock('./AccountDetails', () => ({
  __esModule: true,
  AccountDetails: jest.fn(() => <div>Mock AccountDetails</div>),
}));
jest.mock('./account-debug/AccountDebug', () => ({
  __esModule: true,
  AccountDebug: jest.fn(() => <div>Mock AccountDebug</div>),
}));

const mockProps: AccountDetailsProps = {
  debugProps: {
    user: { uid: 'test-user' } as AuthContextUser,
    dbUser: { id: 'test-db-user', path: 'users/test-db-user' } as User,
  },
  editAction: jest.fn(),
};

describe('AccountPage component', () => {
  it('should render the AccountDetails and AccountDebug components', async () => {
    const PageComponent = await AccountPage(mockProps);
    render(PageComponent);

    expect(screen.getByText('Mock AccountDetails')).toBeInTheDocument();
    expect(screen.getByText('Mock AccountDebug')).toBeInTheDocument();
  });
});
