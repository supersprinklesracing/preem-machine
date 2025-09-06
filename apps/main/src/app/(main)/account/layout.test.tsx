import * as auth from '@/auth/user';
import { render, screen } from '@/test-utils';
import AccountLayout from './layout';

jest.mock('@/auth/user');

describe('AccountLayout', () => {
  it('should redirect unauthenticated users', async () => {
    (auth.verifyAuthUser as jest.Mock).mockImplementation(() => {
      throw new Error('unauthorized');
    });

    await expect(
      AccountLayout({ children: <div>Test</div> }),
    ).rejects.toThrow('unauthorized');
  });

  it('should render children for authenticated users', async () => {
    (auth.verifyAuthUser as jest.Mock).mockResolvedValue({ uid: 'test-uid' });

    const PageComponent = await AccountLayout({
      children: <div>Test Children</div>,
    });
    render(PageComponent);

    expect(screen.getByText('Test Children')).toBeInTheDocument();
  });
});
