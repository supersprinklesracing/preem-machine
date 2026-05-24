/* eslint-disable */
import { fireEvent } from '@testing-library/react';
import React from 'react';
import { render, screen } from '@/test-utils';
import { ContributionModal } from './ContributionModal';

// Mock getStripeClient
jest.mock('@/stripe/client', () => ({
  getStripeClient: jest.fn().mockResolvedValue({}),
}));

// Mock useContribution
const mockHandleContribute = jest.fn();
jest.mock('@/stripe-datastore/use-contribution', () => ({
  useContribution: () => ({
    handleContribute: mockHandleContribute,
    isProcessing: false,
  }),
}));

// Mock Stripe React Components to avoid loading full Stripe elements iframe in tests
jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="stripe-elements">{children}</div>
  ),
  PaymentElement: () => <div data-testid="payment-element" />,
  useStripe: () => ({}),
  useElements: () => ({}),
}));

describe('ContributionModal', () => {
  const mockPreem = {
    id: 'preem-123',
    path: 'organizations/org1/series/series1/events/event1/races/race1/preems/preem-123',
    name: 'Hill Climb Preem',
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ContributionModal
        isOpen={false}
        onClose={mockOnClose}
        preem={mockPreem}
      />,
    );
    const content = container.querySelector(
      '[data-testid="contribution-modal"]',
    );
    expect(content).toBeNull();
  });

  it('renders modal content correctly when isOpen is true', () => {
    render(
      <ContributionModal
        isOpen={true}
        onClose={mockOnClose}
        preem={mockPreem}
      />,
    );

    // Modal Title
    expect(
      screen.getByText('Contribute to Hill Climb Preem'),
    ).toBeInTheDocument();

    // Amount input (defaults to 5)
    const amountInput = screen.getByTestId('amount-input') as HTMLInputElement;
    expect(amountInput.value).toBe('5');

    // Message input
    const messageInput = screen.getByTestId(
      'message-input',
    ) as HTMLInputElement;
    expect(messageInput.value).toBe('');

    // Anonymous checkbox
    const checkbox = screen.getByTestId(
      'anonymous-checkbox',
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    // Payment element and submit button
    expect(screen.getByTestId('payment-element')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toHaveTextContent(
      'Contribute $5',
    );
  });

  it('calls handleContribute when submitting form', () => {
    render(
      <ContributionModal
        isOpen={true}
        onClose={mockOnClose}
        preem={mockPreem}
      />,
    );

    const amountInput = screen.getByTestId('amount-input');
    const messageInput = screen.getByTestId('message-input');
    const checkbox = screen.getByTestId('anonymous-checkbox');
    const form = screen.getByTestId('contribution-form');

    // Modify amount, message, and checkbox
    fireEvent.change(amountInput, { target: { value: '25' } });
    fireEvent.change(messageInput, { target: { value: 'Go fast!' } });
    fireEvent.click(checkbox);

    // Submit form
    fireEvent.submit(form);

    expect(mockHandleContribute).toHaveBeenCalledWith({
      amount: 25,
      message: 'Go fast!',
      isAnonymous: true,
      preem: mockPreem,
      onSuccess: mockOnClose,
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <ContributionModal
        isOpen={true}
        onClose={mockOnClose}
        preem={mockPreem}
      />,
    );

    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
