import { render, screen } from '@/test-utils';
import React from 'react';
import AccountPage from './page';
import * as firestore from '@/firebase-admin/firebase-admin';
import * as auth from '@/auth/user';

// Mock dependencies
jest.mock('./Account', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock Account</div>),
}));
jest.mock('@/auth/user');
jest.mock('@/firebase-admin/firebase-admin');

describe('AccountPage component', () => {
  it('should fetch the user counter and render the Account component', async () => {
    // Mock the return values of the mocked functions
    (auth.verifyAuthUser as jest.Mock).mockResolvedValue({ uid: 'test-uid' });
    (firestore.getFirestore as jest.Mock).mockReturnValue({
      collection: () => ({
        doc: () => ({
          get: () =>
            Promise.resolve({
              exists: true,
              data: () => ({ count: 5 }),
            }),
        }),
      }),
    } as any);

    const PageComponent = await AccountPage();
    render(PageComponent);

    expect(screen.getByText('Mock Account')).toBeInTheDocument();
  });
});
