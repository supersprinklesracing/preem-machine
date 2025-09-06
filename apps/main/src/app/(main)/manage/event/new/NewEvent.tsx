'use client';

import EventCard from '@/components/cards/EventCard';
import { FormActionResult } from '@/components/forms/forms';
import { toUrlPath } from '@/datastore/paths';
import type { ClientCompat, Event } from '@/datastore/types';
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
  Textarea,
} from '@mantine/core';
import { DatePicker, DatePickerProps } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import isEqual from 'fast-deep-equal';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type FormValues = Partial<Omit<Event, 'startDate' | 'endDate'>> & {
  dateRange: [Date | null, Date | null];
  description?: string;
};

export function NewEvent({
  newEventAction,
  path,
  onSuccess,
}: {
  newEventAction: (
    path: string,
    options: FormValues,
  ) => Promise<FormActionResult<{ path?: string }>>;
  path: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      description: '',
      dateRange: [null, null],
    },
    validate: {
      name: (value) =>
        !value || value.trim().length < 2
          ? 'Name must have at least 2 letters'
          : null,
      description: (value) =>
        !value || value.trim().length < 10
          ? 'Description must have at least 10 letters'
          : null,
      dateRange: (value) =>
        value[0] && value[1] ? null : 'Date range is required',
    },
  });

  const [debouncedValues] = useDebouncedValue(form.values, 500);

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setSubmissionError(null);

    const [startDate, endDate] = values.dateRange.map((d) =>
      d ? new Date(d) : null,
    );

    const submissionValues = {
      ...values,
      startDate,
      endDate,
    };

    try {
      const result = await newEventAction(path, submissionValues);
      if (onSuccess) {
        onSuccess();
      } else if (result.path) {
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

  const getDayProps =
    (prefix: string): DatePickerProps['getDayProps'] =>
    (date) => {
      return {
        'aria-label': `${prefix} ${format(date, 'd MMMM yyyy')}`,
      };
    };

  const eventPreview: ClientCompat<Event> = {
    id: 'preview',
    path: 'organizations/org-1/series/series-1/events/preview',
    name: debouncedValues.name || 'Your Event Name',
    description: debouncedValues.description,
    startDate: debouncedValues.dateRange[0]
      ? new Date(debouncedValues.dateRange[0]).toISOString()
      : undefined,
    endDate: debouncedValues.dateRange[1]
      ? new Date(debouncedValues.dateRange[1]).toISOString()
      : undefined,
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
  };

  return (
    <Container>
      <Stack>
        <Title order={1}>Create Event</Title>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Card withBorder>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack>
                <TextInput
                  label="Event Name"
                  required
                  {...form.getInputProps('name')}
                  data-testid="name-input"
                />
                <Textarea
                  label="Description"
                  required
                  {...form.getInputProps('description')}
                  data-testid="description-input"
                />
                <DatePicker
                  type="range"
                  allowSingleDateInRange={true}
                  getDayProps={getDayProps('Start date')}
                  {...form.getInputProps('dateRange')}
                  data-testid="date-picker"
                />
                <Group justify="right">
                  <Button
                    type="submit"
                    loading={isLoading}
                    disabled={
                      !form.isValid() || !isEqual(form.values, debouncedValues)
                    }
                  >
                    Create Event
                  </Button>
                </Group>
                {submissionError && <Text c="red">{submissionError}</Text>}
              </Stack>
            </form>
          </Card>
          <EventCard event={eventPreview} />
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
