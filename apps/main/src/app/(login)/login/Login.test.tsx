import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Login } from './Login';

// Mock firebase/auth and firebase-client to prevent initialization errors
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  getRedirectResult: jest.fn(),
  isSignInWithEmailLink: jest.fn(),
  sendSignInLinkToEmail: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signInWithEmailLink: jest.fn(),
  GoogleAuthProvider: class {
    addScope = jest.fn();
    setCustomParameters = jest.fn();
  },
}));
jest.mock('@/firebase/client/firebase-client', () => ({
  getFirebaseAuth: jest.fn(),
}));
jest.mock('@/auth/client/auth', () => ({
  loginWithCredential: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/'),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

const mockedSignIn = signInWithEmailAndPassword as jest.Mock;

describe('Login component', () => {
  it('should render without crashing', () => {
    const loginAction = jest.fn();
    render(<Login loginAction={loginAction} />);
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });

  it(
    'should display an error message for invalid credentials',
    async () => {
      const loginAction = jest.fn();
      mockedSignIn.mockRejectedValue({
        code: 'auth/invalid-credential',
      });

      render(<Login loginAction={loginAction} />);

      await userEvent.type(
        screen.getByPlaceholderText('Email address'),
        'test@example.com',
      );
      await userEvent.type(
        screen.getByPlaceholderText('Password'),
        'wrongpassword',
      );
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

      jest.runAllTimers();

      expect(
        await screen.findByText(
          'Invalid credentials. Please check your email and password and try again.',
        ),
      ).toBeInTheDocument();
    },
    10000,
  );
});
