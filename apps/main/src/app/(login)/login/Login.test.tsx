import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { Login } from './Login';
import * as React from 'react';

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

describe('Login component', () => {
  beforeEach(() => {
    // Mock useTransition to avoid issues in test environment
    const mockStartTransition = jest.fn((callback) => callback());
    jest
      .spyOn(React, 'useTransition')
      .mockImplementation(() => [false, mockStartTransition]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render without crashing', () => {
    const loginAction = jest.fn();
    render(<Login loginAction={loginAction} />);
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });

  it('should show redirecting message and disable button when using server action', async () => {
    const user = userEvent.setup();
    const loginAction = jest.fn();
    render(<Login loginAction={loginAction} />);

    // Enable server action
    await user.click(screen.getByLabelText('Login with Server Action'));

    // Fill out the form
    await user.type(
      screen.getByPlaceholderText('Email address'),
      'test@example.com',
    );
    await user.type(screen.getByPlaceholderText('Password'), 'password123');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    // Check for redirect message and that the action was called
    expect(await screen.findByText('Redirecting to')).toBeInTheDocument();
    expect(loginAction).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(submitButton).toBeDisabled();
  });
});
