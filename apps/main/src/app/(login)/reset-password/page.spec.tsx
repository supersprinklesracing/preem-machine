import { render, screen } from '@/test-utils';
import '@testing-library/jest-dom';
import ResetPasswordPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

jest.mock('@/firebase-client', () => ({
  getFirebaseAuth: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  sendPasswordResetEmail: jest.fn(),
}));

describe('Reset Password Page', () => {
  it('should render successfully', () => {
    render(<ResetPasswordPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Reset password' })
    ).toBeInTheDocument();
  });
});
