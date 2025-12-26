import { render, screen } from '@/test-utils';

import { Register } from './Register';

// Mock firebase/auth and firebase-client to prevent initialization errors
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
}));
jest.mock('@/firebase/client/firebase-client', () => ({
  getFirebaseAuth: jest.fn(),
}));
jest.mock('@/auth/client/auth', () => ({
  loginWithCredential: jest.fn(),
}));

describe('Register component', () => {
  it('should render email and password inputs with accessible labels', () => {
    render(<Register />);

    // These assertions will fail until we add the labels
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument();
  });
});
