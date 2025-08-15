import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterPage from './page';

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
  createUserWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
}));

describe('Register Page', () => {
  it('should render successfully', () => {
    render(
      <MantineProvider>
        <RegisterPage />
      </MantineProvider>
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Register' })
    ).toBeInTheDocument();
  });
});
