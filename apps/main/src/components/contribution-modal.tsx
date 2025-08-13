'use client';

import { useToast } from '@/app/prototype/hooks/use-toast';
import type { Preem } from '@/datastore/types';
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
import { IconCurrencyDollar } from '@tabler/icons-react';
import React from 'react';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preem: Preem;
}

const ContributionModal: React.FC<ContributionModalProps> = ({
  isOpen,
  onClose,
  preem,
}) => {
  const { toast } = useToast();
  const [amount, setAmount] = React.useState<number | ''>('');
  const [isAnonymous, setIsAnonymous] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const handleContribute = () => {
    if (!amount || Number(amount) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid contribution amount.',
      });
      return;
    }

    toast({
      title: 'Contribution Successful!',
      description: `You've contributed ${amount} to "${preem.name}".`,
    });
    onClose();
    setAmount('');
    setIsAnonymous(false);
    setMessage('');
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={`Contribute to ${preem.name}`}
      centered
    >
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
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleContribute}>Confirm Contribution</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ContributionModal;
