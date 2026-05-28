'use client';

import {
  Button,
  Checkbox,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { Elements, PaymentElement } from '@stripe/react-stripe-js';
import { IconCurrencyDollar } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';

import { getStripeClient } from '@/stripe/client';
import { useContribution } from '@/stripe-datastore/use-contribution';

export interface PreemInfo {
  id: string;
  path: string;
  name: string;
}

export interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preem: PreemInfo;
}

interface ContributionFormProps {
  preem: PreemInfo;
  onClose: () => void;
  amount: number | '';
  setAmount: (value: number | '') => void;
  isAnonymous: boolean;
  setIsAnonymous: (value: boolean) => void;
  message: string;
  setMessage: (value: string) => void;
}

const ContributionForm = ({
  preem,
  onClose,
  amount,
  setAmount,
  isAnonymous,
  setIsAnonymous,
  message,
  setMessage,
}: ContributionFormProps) => {
  const { handleContribute, isProcessing } = useContribution();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (typeof amount !== 'number') return;

    handleContribute({
      amount,
      message,
      isAnonymous,
      preem,
      onSuccess: onClose,
    });
  };

  return (
    <form onSubmit={handleSubmit} data-testid="contribution-form">
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Your support fuels the excitement of the race!
        </Text>
        <NumberInput
          label="Amount"
          placeholder="50"
          value={amount}
          onChange={(value) => setAmount(value === '' ? '' : Number(value))}
          leftSection={<IconCurrencyDollar size={16} />}
          min={1}
          required
          data-testid="amount-input"
        />
        <TextInput
          label="Message (Optional)"
          placeholder="Go get 'em!"
          value={message}
          onChange={(e) => setMessage(e.currentTarget.value)}
          data-testid="message-input"
        />
        <Checkbox
          label="Contribute anonymously"
          checked={isAnonymous}
          onChange={(event) => setIsAnonymous(event.currentTarget.checked)}
          data-testid="anonymous-checkbox"
        />
        <PaymentElement id="payment-element" />
        <Group justify="flex-end" mt="md">
          <Button
            variant="default"
            onClick={onClose}
            data-testid="cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isProcessing}
            data-testid="submit-button"
          >
            {isProcessing ? 'Processing...' : `Contribute $${amount}`}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export function ContributionModal({
  isOpen,
  onClose,
  preem,
}: ContributionModalProps) {
  const [amount, setAmount] = useState<number | ''>(5);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');

  // Memoize options to keep a stable reference for React Stripe Elements.
  // This prevents unmounting and duplicate loads when elements re-render.
  const options = useMemo(
    () => ({
      mode: 'payment' as const,
      amount: (typeof amount === 'number' ? amount : 0) * 100,
      currency: 'usd',
      appearance: {
        theme: 'stripe' as const,
      },
    }),
    [amount],
  );

  const stripePromise = getStripeClient();

  if (!isOpen) return null;

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={`Contribute to ${preem.name}`}
      centered
      data-testid="contribution-modal"
    >
      <Elements stripe={stripePromise} options={options}>
        <ContributionForm
          preem={preem}
          onClose={onClose}
          amount={amount}
          setAmount={setAmount}
          isAnonymous={isAnonymous}
          setIsAnonymous={setIsAnonymous}
          message={message}
          setMessage={setMessage}
        />
      </Elements>
    </Modal>
  );
}
