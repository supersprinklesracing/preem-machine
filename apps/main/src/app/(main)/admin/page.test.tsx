import {
  render,
  screen,
  setupAdminUserContext,
  setupMockDb,
  withAdminUserContext,
} from '@/test-utils';

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

setupMockDb();

describe('AdminPage component', () => {
  const { mockedVerifyUserContext } = setupAdminUserContext();

  it('should fetch admin data and render the Admin component', async () => {
    const PageComponent = await AdminPage();
    render(PageComponent, { ...withAdminUserContext() });

    expect(screen.getByText('Mock Admin')).toBeInTheDocument();

    // Assert that Admin was called with the users from the mock DB
    const adminCalls = (Admin as jest.Mock).mock.calls;
    expect(adminCalls[0][0].users.length).toBe(7); // The mock DB has 7 users
    expect(mockedVerifyUserContext).toHaveBeenCalled();
  });
});
