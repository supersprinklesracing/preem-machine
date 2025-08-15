import { render, screen } from '@/test-utils';
import AccountPage, { generateMetadata } from './page';
import { getUserFromCookies } from '@/auth/user';
import { getFirestore } from '@/firebase-admin/firebase-admin';
import { incrementCounter } from '@/actions/user-counters';

// Mock child components
jest.mock('./account-debug/AccountDebug', () => ({
  AccountDebug: ({ count }: { count: number }) => (
    <div data-testid="debug-panel-component">{count}</div>
  ),
}));

// Mock server-side dependencies
jest.mock('@/auth/user');
jest.mock('@/firebase-admin/firebase-admin');
jest.mock('@/actions/user-counters');

// Mock client-side dependencies for Account component
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));
jest.mock('@/firebase-client', () => ({
  getFirebaseAuth: jest.fn(() => ({})),
}));
jest.mock('firebase/auth', () => ({
  signOut: jest.fn(),
}));
jest.mock('@/auth', () => ({
  ...jest.requireActual('@/auth'),
  logout: jest.fn(),
  checkEmailVerification: jest.fn(),
}));

const mockGetUserFromCookies = getUserFromCookies as jest.Mock;
const mockGetFirestore = getFirestore as jest.Mock;
const mockIncrementCounter = incrementCounter as jest.Mock;

describe('AccountPage', () => {
  const mockUser = {
    uid: '123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'http://placehold.it/100x100',
    emailVerified: false,
    customClaims: { admin: false },
  };

  const mockDb = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
  };

  beforeEach(() => {
    mockGetUserFromCookies.mockResolvedValue(mockUser);
    mockGetFirestore.mockResolvedValue(mockDb as any);
    mockIncrementCounter.mockResolvedValue(1);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Account and AccountDebug components with the correct counter', async () => {
    mockDb.get.mockResolvedValue({
      data: () => ({ count: 42 }),
    });

    const Page = await AccountPage();
    render(Page, { user: mockUser as any });

    // Check for Account component content
    expect(
      screen.getByRole('heading', { name: 'Account' })
    ).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Not verified')).toBeInTheDocument();
    expect(screen.getByText('View My Public Profile')).toBeInTheDocument();
    expect(screen.getByText('Verify Email')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();

    // Check for AccountDebug component content
    expect(screen.getByTestId('debug-panel-component')).toBeInTheDocument();
    expect(screen.getByTestId('debug-panel-component')).toHaveTextContent('42');
  });

  it('shows "Email verified" badge when user email is verified', async () => {
    const verifiedUser = { ...mockUser, emailVerified: true };
    mockGetUserFromCookies.mockResolvedValue(verifiedUser);
    mockDb.get.mockResolvedValue({ data: () => ({ count: 0 }) });

    const Page = await AccountPage();
    render(Page, { user: verifiedUser as any });

    expect(screen.getByText('Email verified')).toBeInTheDocument();
    expect(screen.queryByText('Not verified')).not.toBeInTheDocument();
    expect(screen.queryByText('Verify Email')).not.toBeInTheDocument();
  });

  it('shows "Admin" button for admin users', async () => {
    const adminUser = {
      ...mockUser,
      customClaims: { ...mockUser.customClaims, admin: true },
    };
    mockGetUserFromCookies.mockResolvedValue(adminUser);
    mockDb.get.mockResolvedValue({ data: () => ({ count: 0 }) });

    const Page = await AccountPage();
    render(Page, { user: adminUser as any });

    expect(screen.getByRole('link', { name: 'Admin' })).toBeInTheDocument();
  });

  it('handles the case where the user counter does not exist', async () => {
    mockDb.get.mockResolvedValue({
      data: () => undefined,
    });

    const Page = await AccountPage();
    render(Page, { user: mockUser as any });

    expect(screen.getByTestId('debug-panel-component')).toHaveTextContent('0');
  });

  describe('generateMetadata', () => {
    it('returns metadata with the user email if the user is found', async () => {
      mockGetUserFromCookies.mockResolvedValue(mockUser);
      const metadata = await generateMetadata();
      expect(metadata.title).toContain(mockUser.email);
    });

    it('returns an empty object if the user is not found', async () => {
      mockGetUserFromCookies.mockResolvedValue(null);
      const metadata = await generateMetadata();
      expect(metadata).toEqual({});
    });
  });
});
