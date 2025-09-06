import { render, screen } from '@/test-utils';
import React from 'react';
import AccountPage from './Account';
import type { AccountDetailsProps } from './Account';
import { act } from 'react';

// Mock child components
jest.mock('./AccountDetails', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock AccountDetails</div>),
}));
jest.mock('./account-debug/AccountDebug', () => ({
  __esModule: true,
  AccountDebug: jest.fn(() => <div>Mock AccountDebug</div>),
}));

const mockProps: AccountDetailsProps = {
  debugProps: {
    user: { uid: 'test-user' } as any,
    dbUser: { id: 'test-db-user' } as any,
  },
  editUserAction: jest.fn(),
};

describe('AccountPage component', () => {
  it('should render the AccountDetails and AccountDebug components', async () => {
    await act(async () => {
      render(<AccountPage {...mockProps} />);
    });

    expect(screen.getByText('Mock AccountDetails')).toBeInTheDocument();
    expect(screen.getByText('Mock AccountDebug')).toBeInTheDocument();
  });
});
