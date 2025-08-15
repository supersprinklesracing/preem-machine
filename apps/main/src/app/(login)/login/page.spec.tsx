import { render, screen } from '@/test-utils';
import '@testing-library/jest-dom';
import LoginPage from './page';

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
  getRedirectResult: jest.fn(),
  isSignInWithEmailLink: jest.fn(),
  sendSignInLinkToEmail: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signInWithEmailLink: jest.fn(),
  getGoogleProvider: jest.fn(),
}));

describe('Login Page', () => {
  it('should render successfully', () => {
    render(<LoginPage />);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
