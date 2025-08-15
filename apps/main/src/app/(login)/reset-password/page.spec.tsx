import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
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

jest.mock('@/auth/firebase', () => ({
  getFirebaseAuth: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  sendPasswordResetEmail: jest.fn(),
}));

describe('Reset Password Page', () => {
  it('should render successfully', () => {
    render(
      <MantineProvider>
        <ResetPasswordPage />
      </MantineProvider>
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Reset password' })
    ).toBeInTheDocument();
  });
});
