'use client';

import { toUrlPath } from '@/datastore/paths';
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

import { FormActionResult } from '@/components/forms/forms';

export function NewSeries({
  newSeriesAction,
  path,
}: {
  newSeriesAction: (
    path: string,
    options: FormValues,
  ) => Promise<FormActionResult<{ path?: string }>>;
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
      const result = await newSeriesAction(path, submissionValues);
      if (result.path) {
        router.push(`/manage/${toUrlPath(result.path)}/edit`);
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
                data-testid="name-input"
                {...form.getInputProps('name')}
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
                allowSingleDateInRange={true}
                getDayProps={getDayProps('Series date')}
                {...form.getInputProps('dateRange')}
                data-testid="series-date-picker"
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
