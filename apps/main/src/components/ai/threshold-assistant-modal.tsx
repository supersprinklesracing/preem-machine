'use client';

import { getThresholdSuggestion } from '@/actions/threshold-suggestion-action';
import { useToast } from '@/app/shared/use-toast';
import {
  Button,
  Card,
  Group,
  Loader,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import React, { useState } from 'react';

interface ThresholdAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  raceId: string;
}

type Suggestion = {
  suggestedThreshold: number;
  reasoning: string;
};

const ThresholdAssistantModal: React.FC<ThresholdAssistantModalProps> = ({
  isOpen,
  onClose,
  raceId,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    averageContributionAmount: 50,
    numberOfContributors: 15,
    preemFrequency: 'occasionally',
    historicalWeatherData: 'Clear and sunny, mild temperatures',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);

  const handleInputChange = (name: string, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await getThresholdSuggestion({
        ...formData,
        raceId,
        averageContributionAmount: Number(formData.averageContributionAmount),
        numberOfContributors: Number(formData.numberOfContributors),
      });
      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      } else if (result) {
        setSuggestion(result);
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSuggestion(null);
    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={resetForm}
      title={
        <Group>
          <IconSparkles size={24} color="var(--mantine-color-yellow-5)" />
          <Title order={3}>AI Threshold Assistant</Title>
        </Group>
      }
      centered
    >
      <Text c="dimmed" size="sm" mb="lg">
        Get an AI-powered suggestion for the preem&apos;s minimum threshold.
      </Text>

      {!suggestion ? (
        <Stack>
          <NumberInput
            label="Average Contribution ($)"
            name="averageContributionAmount"
            value={formData.averageContributionAmount}
            onChange={(value) =>
              handleInputChange('averageContributionAmount', value)
            }
          />
          <NumberInput
            label="Number of Contributors"
            name="numberOfContributors"
            value={formData.numberOfContributors}
            onChange={(value) =>
              handleInputChange('numberOfContributors', value)
            }
          />
          <Select
            label="Desired Preem Frequency"
            name="preemFrequency"
            value={formData.preemFrequency}
            onChange={(value) => handleInputChange('preemFrequency', value)}
            data={[
              { value: 'frequently', label: 'Frequently' },
              { value: 'occasionally', label: 'Occasionally' },
              { value: 'rarely', label: 'Rarely' },
            ]}
          />
        </Stack>
      ) : (
        <Card withBorder radius="md" my="lg" p="xl" bg="gray.0">
          <Stack align="center">
            <Title
              order={1}
              c="blue.6"
              ff="Space Grotesk, var(--mantine-font-family)"
            >
              ${suggestion.suggestedThreshold}
            </Title>
            <Text size="sm" c="dimmed" ta="center">
              {suggestion.reasoning}
            </Text>
          </Stack>
        </Card>
      )}

      <Group justify="flex-end" mt="xl">
        <Button variant="default" onClick={resetForm}>
          Close
        </Button>
        {!suggestion && (
          <Button
            onClick={handleSubmit}
            loading={isLoading}
            leftSection={
              isLoading ? <Loader size={16} /> : <IconSparkles size={16} />
            }
          >
            Get Suggestion
          </Button>
        )}
      </Group>
    </Modal>
  );
};

export default ThresholdAssistantModal;
