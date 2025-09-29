import {
  MOCK_ADMIN_AUTH_USER,
  render,
  screen,
  setupMockDb,
} from '@/test-utils';
import * as userServer from '@/user/server/user';

import { Admin } from './Admin';
import AdminPage from './page';

// Mock dependencies
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));
jest.mock('./Admin', () => ({
  __esModule: true,
  Admin: jest.fn(() => <div>Mock Admin</div>),
}));
jest.mock('@/user/server/user');

setupMockDb();

describe('AdminPage component', () => {
  it('should fetch admin data and render the Admin component', async () => {
    (userServer.verifyUserContext as jest.Mock).mockResolvedValue({
      authUser: MOCK_ADMIN_AUTH_USER,
    });

    const PageComponent = await AdminPage();
    render(PageComponent);

    expect(screen.getByText('Mock Admin')).toBeInTheDocument();

    // Assert that Admin was called with the users from the mock DB
    const adminCalls = (Admin as jest.Mock).mock.calls;
    expect(adminCalls[0][0].users.length).toBe(7); // The mock DB has 7 users
  });
});
