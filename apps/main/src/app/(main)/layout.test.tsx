import * as auth from '@/auth/user';
import * as firestore from '@/datastore/firestore';
import '@/matchMedia.mock';
import { render, screen } from '@/test-utils';
import Layout from './layout';
import MainAppShell from './Shell/MainAppShell';

// Mock dependencies
jest.mock('./Shell/MainAppShell', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => <div>Mock MainAppShell{children}</div>),
}));
jest.mock('@/datastore/firestore');
jest.mock('@/auth/user');

describe('Layout component', () => {
  it('should fetch data and render the MainAppShell', async () => {
    // Mock the return values of the data fetching functions
    (auth.verifyAuthUser as jest.Mock).mockResolvedValue({ uid: 'test-uid' });
    (firestore.getEventsForUser as jest.Mock).mockResolvedValue([]);

    const PageComponent = await Layout({
      children: <div>Test Children</div>,
      currentUser: null,
    });
    render(PageComponent);

    expect(screen.getByText('Mock MainAppShell')).toBeInTheDocument();
    expect(screen.getByText('Test Children')).toBeInTheDocument();
    expect(MainAppShell).toHaveBeenCalled();
  });
});
