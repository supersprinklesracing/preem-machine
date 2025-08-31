'use client';

import {
  Button,
  Card,
  Container,
  Group,
  Stack,
  TextInput,
  Title,
  Textarea,
} from '@mantine/core';
import { DatePicker, DatePickerProps } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Series } from '@/datastore/types';
import dayjs from 'dayjs';

type FormValues = Partial<Omit<Series, 'startDate' | 'endDate'>> & {
  dateRange: [Date | null, Date | null];
  description?: string;
};

export function CreateSeries({
  createSeriesAction,
  path,
}: {
  createSeriesAction: (
    path: string,
    options: FormValues,
  ) => Promise<{ ok: boolean; error?: string; seriesId?: string }>;
  path: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      location: '',
      website: '',
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

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setSubmissionError(null);

    const [startDate, endDate] = values.dateRange.map((d) =>
      d ? new Date(d) : null,
    );

    const submissionValues = {
      ...values,
      startDate: startDate,
      endDate: endDate,
    };

    try {
      const result = await createSeriesAction(path, submissionValues);
      if (result.ok && result.seriesId) {
        router.push(`/manage/series/${result.seriesId}/edit`);
      } else {
        setSubmissionError(result.error || 'An unknown error occurred.');
      }
    } catch (error) {
      console.error('Failed to create series:', error);
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
    <Container size="sm">
      <Stack>
        <Title order={1}>Create Series</Title>
        <Card withBorder>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label="Series Name"
                required
                {...form.getInputProps('name')}
                data-testid="name-input"
              />
              <TextInput
                label="Location"
                {...form.getInputProps('location')}
                data-testid="location-input"
              />
              <TextInput
                label="Website"
                {...form.getInputProps('website')}
                data-testid="website-input"
              />
              <Textarea
                label="Description"
                required
                {...form.getInputProps('description')}
                data-testid="description-input"
              />
              <DatePicker
                type="range"
                {...form.getInputProps('dateRange')}
                data-testid="series-date-picker"
                defaultDate={new Date('2025-08-01')}
                getDayProps={getDayProps('Series date')}
              />
              <Group justify="right">
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={!form.isValid()}
                >
                  Create Series
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
