import * as firestore from '@/datastore/server/query/query';
import { render, screen, setupUserContext } from '@/test-utils';
import Layout from './layout';
import MainAppShell from './Shell/MainAppShell';

// Mock dependencies
jest.mock('./Shell/MainAppShell', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => <div>Mock MainAppShell{children}</div>),
}));
jest.mock('@/datastore/server/query/query');

describe('Layout component', () => {
  const { mockedGetUserContext } = setupUserContext();

  beforeEach(() => {
    (firestore.getEventsForUser as jest.Mock).mockClear();
  });

  it('should fetch data and render the MainAppShell for an authenticated user', async () => {
    // Mock the return values of the data fetching functions
    mockedGetUserContext.mockResolvedValue({
      authUser: { uid: 'test-uid' },
      user: { id: 'test-uid' },
    });
    (firestore.getEventsForUser as jest.Mock).mockResolvedValue([]);

    const PageComponent = await Layout({
      children: <div>Test Children</div>,
    });
    render(PageComponent);

    expect(screen.getByText('Mock MainAppShell')).toBeInTheDocument();
    expect(screen.getByText('Test Children')).toBeInTheDocument();
    expect(MainAppShell).toHaveBeenCalled();
  });

  it('should render the MainAppShell for an unauthenticated user', async () => {
    // Mock the return values of the data fetching functions
    mockedGetUserContext.mockResolvedValue({
      authUser: null,
      user: null,
    });
    (firestore.getEventsForUser as jest.Mock).mockResolvedValue([]);

    const PageComponent = await Layout({
      children: <div>Test Children</div>,
    });
    render(PageComponent);

    expect(screen.getByText('Mock MainAppShell')).toBeInTheDocument();
    expect(screen.getByText('Test Children')).toBeInTheDocument();
    expect(MainAppShell).toHaveBeenCalled();
    expect(firestore.getEventsForUser).not.toHaveBeenCalled();
  });
});
