import '@/matchMedia.mock';
import { render, screen, setupMockDb } from '@/test-utils';
import Admin from './Admin';
import AdminPage from './page';

// Mock dependencies
jest.mock('./Admin', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock Admin</div>),
}));

setupMockDb();

describe('AdminPage component', () => {
  it('should fetch admin data and render the Admin component', async () => {
    const PageComponent = await AdminPage();
    render(PageComponent);

    expect(screen.getByText('Mock Admin')).toBeInTheDocument();

    // Assert that Admin was called with the users from the mock DB
    const adminCalls = (Admin as jest.Mock).mock.calls;
    expect(adminCalls[0][0].users.length).toBe(6); // The mock DB has 7 users
  });
});
