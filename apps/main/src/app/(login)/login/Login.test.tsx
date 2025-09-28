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
    const mockStartTransition = jest.fn((callback) => callback());
    const useTransitionSpy = jest.spyOn(React, 'useTransition');

    // Initial render: isPending is false
    useTransitionSpy.mockReturnValue([false, mockStartTransition]);
    const { rerender } = render(<Login loginAction={loginAction} />);

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
    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    // After click, the loginAction is called via startTransition
    expect(mockStartTransition).toHaveBeenCalled();
    expect(loginAction).toHaveBeenCalledWith('test@example.com', 'password123');

    // Rerender with isPending as true to simulate the transition
    useTransitionSpy.mockReturnValue([true, mockStartTransition]);
    rerender(<Login loginAction={loginAction} />);

    // Check that the redirect message is shown and the form is gone
    expect(
      await screen.findByTestId('redirect-message'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
  });
});
