'use client';

import { useContribution } from '@/stripe-datastore/use-contribution';
import { getStripeClient } from '@/stripe/client';
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
import React, { useState } from 'react';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preem: { id: string; path: string; name: string };
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
}: {
  preem: { id: string; path: string; name: string };
  onClose: () => void;
  amount: number | '';
  setAmount: (value: number | '') => void;
  isAnonymous: boolean;
  setIsAnonymous: (value: boolean) => void;
  message: string;
  setMessage: (value: string) => void;
}) => {
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
    <form onSubmit={handleSubmit}>
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
        />
        <TextInput
          label="Message (Optional)"
          placeholder="Go get 'em!"
          value={message}
          onChange={(e) => setMessage(e.currentTarget.value)}
        />
        <Checkbox
          label="Contribute anonymously"
          checked={isAnonymous}
          onChange={(event) => setIsAnonymous(event.currentTarget.checked)}
        />
        <PaymentElement id="payment-element" />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? 'Processing...' : `Contribute $${amount}`}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

const ContributionModal: React.FC<ContributionModalProps> = ({
  isOpen,
  onClose,
  preem,
}) => {
  const [amount, setAmount] = useState<number | ''>(5);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');

  const options = {
    mode: 'payment' as const,
    amount: (typeof amount === 'number' ? amount : 0) * 100,
    currency: 'usd',
    appearance: {
      theme: 'stripe' as const,
    },
  };

  const stripePromise = getStripeClient();
  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={`Contribute to ${preem.name}`}
      centered
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
};

export default ContributionModal;
