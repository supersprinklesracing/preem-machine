import { AuthContextUser } from '@/auth/AuthContext';
import { User } from '@/datastore/types';
import '@/matchMedia.mock';
import { act, fireEvent, render, screen } from '@/test-utils';
import { CurrentUserProvider } from '../../../datastore/user/UserProvider';
import { AccountDetails } from './AccountDetails';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  // eslint-disable-next-line @eslint-react/hooks-extra/no-unnecessary-use-prefix
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

const mockAuthUser: AuthContextUser = {
  id: 'test-uid',
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/avatar.png',
  customClaims: { admin: false },
  emailVerified: true,
  idToken: 'test-token',
};

const mockCurrentUser: User = {
  id: 'test-uid',
  path: 'users/test-uid',
  name: 'Test User',
  affiliation: 'Test Affiliation',
  raceLicenseId: '12345',
  address: '123 Main St',
};

describe('AccountDetails component', () => {
  it('should render without crashing', () => {
    const editUserAction = jest.fn();
    render(
      <CurrentUserProvider currentUser={mockCurrentUser}>
        <AccountDetails editUserAction={editUserAction} />
      </CurrentUserProvider>,
      { authUser: mockAuthUser },
    );

    expect(
      screen.getByRole('heading', { name: 'Account' }),
    ).toBeInTheDocument();
  });

  it('should call editUserAction with the correct data on form submission', async () => {
    const editUserAction = jest.fn(() => Promise.resolve({ ok: true }));

    render(
      <CurrentUserProvider currentUser={mockCurrentUser}>
        <AccountDetails editUserAction={editUserAction} />
      </CurrentUserProvider>,
      { authUser: mockAuthUser },
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
    expect(editUserAction).toHaveBeenCalledWith({
      path: 'users/test-uid',
      edits: expect.objectContaining({
        name: 'New Name',
        affiliation: 'Test Affiliation',
      }),
    });
  });
});
