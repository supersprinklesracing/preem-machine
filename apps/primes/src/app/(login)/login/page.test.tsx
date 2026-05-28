import { render, screen } from '@/test-utils';

import LoginPage from './page';

describe('LoginPage', () => {
  it('should render the Login component', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });
});
