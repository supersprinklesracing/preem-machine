import * as auth from '@/auth/server/auth';
import { render, screen } from '@/test-utils';
import ManageLayout from './layout';

jest.mock('@/auth/server/auth');
jest.mock('@/auth/client/auth');

describe('ManageLayout', () => {
  it('should redirect unauthenticated users', async () => {
    (auth.verifyAuthUser as jest.Mock).mockImplementation(() => {
      throw new Error('unauthorized');
    });

    await expect(ManageLayout({ children: <div>Test</div> })).rejects.toThrow(
      'unauthorized',
    );
  });

  it('should render children for authenticated users', async () => {
    (auth.verifyAuthUser as jest.Mock).mockResolvedValue({ uid: 'test-uid' });

    const PageComponent = await ManageLayout({
      children: <div>Test Children</div>,
    });
    render(PageComponent);

    expect(screen.getByText('Test Children')).toBeInTheDocument();
  });
});
