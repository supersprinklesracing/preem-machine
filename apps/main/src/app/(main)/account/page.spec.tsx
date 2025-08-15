import { render, screen } from '@/test-utils';
import AccountPage, { generateMetadata } from './page';
import { getUserFromCookies } from '@/auth/user';
import { getFirestore } from '@/firebase-admin/firebase-admin';
import { incrementCounter } from '@/actions/user-counters';

// Mock child components
jest.mock('./Account', () => ({
  Account: () => <div data-testid="account-component" />,
}));
jest.mock('./debug-panel/DebugPanel', () => ({
  DebugPanel: ({ count }: { count: number }) => (
    <div data-testid="debug-panel-component">{count}</div>
  ),
}));

// Mock server-side dependencies
jest.mock('@/auth/user');
jest.mock('@/firebase-admin/firebase-admin');
jest.mock('@/actions/user-counters');

const mockGetUserFromCookies = getUserFromCookies as jest.Mock;
const mockGetFirestore = getFirestore as jest.Mock;
const mockIncrementCounter = incrementCounter as jest.Mock;

describe('AccountPage', () => {
  const mockUser = {
    uid: '123',
    email: 'test@example.com',
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

  it('renders the Account and DebugPanel components with the correct counter', async () => {
    mockDb.get.mockResolvedValue({
      data: () => ({ count: 42 }),
    });

    const Page = await AccountPage();
    render(Page);

    expect(screen.getByTestId('account-component')).toBeInTheDocument();
    expect(screen.getByTestId('debug-panel-component')).toBeInTheDocument();
    expect(screen.getByTestId('debug-panel-component')).toHaveTextContent('42');
  });

  it('handles the case where the user counter does not exist', async () => {
    mockDb.get.mockResolvedValue({
      data: () => undefined,
    });

    const Page = await AccountPage();
    render(Page);

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
