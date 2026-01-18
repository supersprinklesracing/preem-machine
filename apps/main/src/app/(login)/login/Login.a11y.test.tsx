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
jest.mock('@/firebase/client/firebase-client', () => ({
  getFirebaseAuth: jest.fn(),
}));

describe('Login component accessibility', () => {
  it('should have accessible labels for inputs', () => {
    const loginAction = jest.fn();
    render(<Login loginAction={loginAction} />);

    // These checks will fail if the inputs do not have accessible labels
    // We expect them to fail initially because the inputs only have placeholders
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });
});
