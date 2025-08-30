import { render, screen, fireEvent, act } from '@/test-utils';
import React from 'react';
import { AccountDetails } from './AccountDetails';
import { CurrentUserProvider } from '../../../datastore/user/UserProvider';
import '../../../matchMedia.mock';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
  unauthorized: jest.fn(),
}));

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
  signOut: jest.fn(() => Promise.resolve()),
}));

// Mock firebase-client
jest.mock('@/firebase-client', () => ({
  getFirebaseAuth: jest.fn(() => ({})),
  checkEmailVerification: jest.fn(),
  logout: jest.fn(),
}));

const mockAuthUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/avatar.png',
  customClaims: { admin: false },
  emailVerified: true,
};

const mockCurrentUser = {
  id: 'test-uid',
  name: 'Test User',
  affiliation: 'Test Affiliation',
  raceLicenseId: '12345',
  address: '123 Main St',
};

describe('AccountDetails component', () => {
  it('should render without crashing', () => {
    const updateUserAction = jest.fn();
    render(
      <CurrentUserProvider currentUser={mockCurrentUser as any}>
        <AccountDetails updateUserAction={updateUserAction} />
      </CurrentUserProvider>,
      { authUser: mockAuthUser as any },
    );

    expect(
      screen.getByRole('heading', { name: 'Account' }),
    ).toBeInTheDocument();
  });

  it('should call updateUserAction with the correct data on form submission', async () => {
    const updateUserAction = jest.fn(() => Promise.resolve({ ok: true }));

    render(
      <CurrentUserProvider currentUser={mockCurrentUser as any}>
        <AccountDetails updateUserAction={updateUserAction} />
      </CurrentUserProvider>,
      { authUser: mockAuthUser as any },
    );

    // Change the name in the form
    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });

    // Wait for the debounced value to update
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Wait for the action to be called
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Assert that the action was called with the correct data
    expect(updateUserAction).toHaveBeenCalledWith({
      path: 'users/test-uid',
      user: expect.objectContaining({
        name: 'New Name',
        affiliation: 'Test Affiliation',
      }),
    });
  });
});
