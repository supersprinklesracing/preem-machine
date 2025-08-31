'use client';

import {
  Button,
  Card,
  Container,
  Group,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Race } from '@/datastore/types';
import dayjs from 'dayjs';
import { DatePickerProps } from '@mantine/dates';

type FormValues = Partial<Omit<Race, 'date'>> & {
  date?: Date | null;
  location?: string;
};

export function CreateRace({
  createRaceAction,
  path,
}: {
  createRaceAction: (
    path: string,
    options: FormValues,
  ) => Promise<{ ok: boolean; error?: string; raceId?: string }>;
  path: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      location: '',
      date: null,
    },
    validate: {
      name: (value) =>
        !value || value.trim().length < 2
          ? 'Name must have at least 2 letters'
          : null,
      location: (value) =>
        !value || value.trim().length < 2
          ? 'Location must have at least 2 letters'
          : null,
      date: (value) => (value ? null : 'Date is required'),
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setSubmissionError(null);

    const submissionValues = {
      ...values,
      date: values.date ? new Date(values.date) : null,
    };

    try {
      const result = await createRaceAction(path, submissionValues);
      if (result.ok && result.raceId) {
        router.push(`/manage/race/${result.raceId}/edit`);
      } else {
        setSubmissionError(result.error || 'An unknown error occurred.');
      }
    } catch (error) {
      console.error('Failed to create race:', error);
      setSubmissionError(
        error instanceof Error ? error.message : 'An unknown error occurred.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getDayProps =
    (prefix: string): DatePickerProps['getDayProps'] =>
    (date) => {
      return {
        'aria-label': `${prefix} ${dayjs(date).format('D MMMM YYYY')}`,
      };
    };

  return (
    <Container size="xs">
      <Stack>
        <Title order={1}>Create Race</Title>
        <Card withBorder>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label="Race Name"
                required
                {...form.getInputProps('name')}
                data-testid="name-input"
              />
              <TextInput
                label="Location"
                required
                {...form.getInputProps('location')}
                data-testid="location-input"
              />
              <DatePicker
                {...form.getInputProps('date')}
                defaultDate={new Date('2025-08-01')}
                getDayProps={getDayProps('Race date')}
              />
              <Group justify="right">
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={!form.isValid()}
                >
                  Create Race
                </Button>
              </Group>
              {submissionError && <p>{submissionError}</p>}
            </Stack>
          </form>
        </Card>
      </Stack>
    </Container>
  );
}
