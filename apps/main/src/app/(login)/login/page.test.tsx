/* eslint-disable @eslint-react/hooks-extra/no-unnecessary-use-prefix */

import { render, screen } from '@/test-utils';
import LoginPage from './page';

jest.mock('./login-action');

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
}));

describe('LoginPage', () => {
  it('should render the Login component', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });
});
