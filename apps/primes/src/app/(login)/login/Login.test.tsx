import { render, screen } from '@/test-utils';

import { Login } from './Login';

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('Login component', () => {
  it('should render without crashing', () => {
    render(<Login />);
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });
});
