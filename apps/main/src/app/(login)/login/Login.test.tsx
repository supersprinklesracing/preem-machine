import { render, screen } from '@/test-utils';
import { Login } from './Login';

// Mock firebase/auth and firebase-client to prevent initialization errors
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  getRedirectResult: jest.fn(),
  isSignInWithEmailLink: jest.fn(),
  sendSignInLinkToEmail: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signInWithEmailLink: jest.fn(),
}));
jest.mock('@/firebase/client', () => ({
  getFirebaseAuth: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    refresh: jest.fn(),
  })),
  // eslint-disable-next-line @eslint-react/hooks-extra/no-unnecessary-use-prefix
  useSearchParams: function () {
    return {
      get: jest.fn(),
    };
  },
}));

describe('Login component', () => {
  it('should render without crashing', () => {
    const loginAction = jest.fn();
    render(<Login loginAction={loginAction} />);
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });
});
