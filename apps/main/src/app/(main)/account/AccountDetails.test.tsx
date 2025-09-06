import '@/matchMedia.mock';
import { act, fireEvent, render, screen, waitFor } from '@/test-utils';
import { CurrentUserProvider } from '../../../datastore/user/UserProvider';
import { AccountDetails } from './AccountDetails';

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
  path: 'users/test-uid',
  name: 'Test User',
  affiliation: 'Test Affiliation',
  raceLicenseId: '12345',
  address: '123 Main St',
};

describe('AccountDetails component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render without crashing', () => {
    const editUserAction = jest.fn();
    render(
      <CurrentUserProvider currentUser={mockCurrentUser as any}>
        <AccountDetails editUserAction={editUserAction} />
      </CurrentUserProvider>,
      { authUser: mockAuthUser as any },
    );

    expect(
      screen.getByRole('heading', { name: 'Account' }),
    ).toBeInTheDocument();
  });

  it('should call editUserAction with the correct data on form submission', async () => {
    const editUserAction = jest.fn(() => Promise.resolve({ ok: true }));

    render(
      <CurrentUserProvider currentUser={mockCurrentUser as any}>
        <AccountDetails editUserAction={editUserAction} />
      </CurrentUserProvider>,
      { authUser: mockAuthUser as any },
    );

    // Change the name in the form
    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });

    // Wait for the debounced value to update
    act(() => {
      jest.advanceTimersByTime(600);
    });

    // Wait for the save button to be enabled
    await waitFor(() => {
      expect(screen.getByText('Save Changes')).not.toBeDisabled();
    });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Wait for the action to be called
    await waitFor(() => {
      expect(editUserAction).toHaveBeenCalled();
    });
  });
});
