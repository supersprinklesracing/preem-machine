import { render, screen, setupUserContext } from '@/test-utils';

import AdminLayout from './layout';

describe('AdminLayout', () => {
  const { mockedVerifyUserContext } = setupUserContext();

  it('should redirect unauthenticated users', async () => {
    mockedVerifyUserContext.mockImplementation(() => {
      throw new Error('unauthorized');
    });

    await expect(AdminLayout({ children: <div>Test</div> })).rejects.toThrow(
      'unauthorized',
    );
  });

  it('should render children for authenticated users', async () => {
    mockedVerifyUserContext.mockResolvedValue({
      authUser: { uid: 'test-uid' },
      user: { id: 'test-uid' },
    });

    const PageComponent = await AdminLayout({
      children: <div>Test Children</div>,
    });
    render(PageComponent);

    expect(screen.getByText('Test Children')).toBeInTheDocument();
  });
});
