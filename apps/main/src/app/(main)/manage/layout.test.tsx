import {
  render,
  screen,
  setupLoggedInUserContext,
  setupLoggedOutUserContext,
} from '@/test-utils';

import ManageLayout from './layout';

describe('ManageLayout', () => {
  describe('when user is not logged in', () => {
    const { mockedVerifyUserContext } = setupLoggedOutUserContext();

    it('should redirect unauthenticated users', async () => {
      mockedVerifyUserContext.mockImplementation(() => {
        throw new Error('unauthorized');
      });

      await expect(ManageLayout({ children: <div>Test</div> })).rejects.toThrow(
        'unauthorized',
      );
    });
  });

  describe('when user is logged in', () => {
    setupLoggedInUserContext();

    it('should render children for authenticated users', async () => {
      const PageComponent = await ManageLayout({
        children: <div>Test Children</div>,
      });
      render(PageComponent);

      expect(screen.getByText('Test Children')).toBeInTheDocument();
    });
  });
});
