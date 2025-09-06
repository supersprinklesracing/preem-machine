'use client';

import RaceCard from '@/components/cards/RaceCard';
import { FormActionResult } from '@/components/forms/forms';
import { CollectionPath, toUrlPath } from '@/datastore/paths';
import type { ClientCompat, Race } from '@/datastore/types';
import {
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import isEqual from 'fast-deep-equal';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type FormValues = Partial<Omit<Race, 'date'>> & {
  date?: Date | null;
  location?: string;
};

export function NewRace({
  newRaceAction,
  path,
}: {
  newRaceAction: (
    path: CollectionPath,
    options: FormValues,
  ) => Promise<FormActionResult<{ path?: string }>>;
  path: CollectionPath;
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

  const [debouncedValues] = useDebouncedValue(form.values, 500);

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setSubmissionError(null);

    const submissionValues = {
      ...values,
      date: values.date ? new Date(values.date) : null,
    };

    try {
      const result = await newRaceAction(path, submissionValues);
      if (result.path) {
        router.push(`/manage/${toUrlPath(result.path)}/edit`);
      }
    } catch (error) {
      setSubmissionError(
        error instanceof Error ? error.message : 'An unknown error occurred.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const racePreview: ClientCompat<Race> = {
    id: 'preview',
    path: 'organizations/org-1/series/series-1/events/event-1/races/preview',
    name: debouncedValues.name || 'Your Race Name',
    location: debouncedValues.location,
    startDate: debouncedValues.date?.toISOString(),
    endDate: debouncedValues.date?.toISOString(),
    eventBrief: {
      id: 'preview',
      path: 'organizations/org-1/series/series-1/events/preview',
      name: 'Event Name',
      seriesBrief: {
        id: 'preview',
        path: 'organizations/org-1/series/series-1',
        name: 'Series Name',
        organizationBrief: {
          id: 'preview',
          path: 'organizations/org-1',
          name: 'Organization Name',
        },
      },
    },
  };

  return (
    <Container>
      <Stack>
        <Title order={1}>Create Race</Title>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
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
                <DateTimePicker
                  label="Date and Time"
                  required
                  {...form.getInputProps('date')}
                  data-testid="date-time-picker"
                />
                <Group justify="right">
                  <Button
                    type="submit"
                    loading={isLoading}
                    disabled={
                      !form.isValid() || !isEqual(form.values, debouncedValues)
                    }
                  >
                    Create Race
                  </Button>
                </Group>
                {submissionError && <Text c="red">{submissionError}</Text>}
              </Stack>
            </form>
          </Card>
          <RaceCard race={racePreview} preems={[]} />
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
