import {
  render,
  screen,
  setupLoggedInUserContext,
  setupLoggedOutUserContext,
} from '@/test-utils';

import Layout from './layout';

describe('ManageLayout', () => {
  describe('when user is logged out', () => {
    const { mockedRequireLoggedInUserContext } = setupLoggedOutUserContext();

    it('should redirect unauthenticated users', async () => {
      mockedRequireLoggedInUserContext.mockImplementation(() => {
        throw new Error('unauthorized');
      });

      await expect(Layout({ children: <div>Test</div> })).rejects.toThrow(
        'unauthorized',
      );
    });
  });

  describe('when user is logged in', () => {
    setupLoggedInUserContext();

    it('should render children for authenticated users', async () => {
      const PageComponent = await Layout({
        children: <div>Test Children</div>,
      });
      render(PageComponent);

      expect(screen.getByText('Test Children')).toBeInTheDocument();
    });
  });
});
