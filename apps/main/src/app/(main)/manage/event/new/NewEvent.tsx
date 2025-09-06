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
import type { ClientCompat, Event, Series } from '@/datastore/types';
import dayjs from 'dayjs';

type FormValues = Partial<Omit<Event, 'startDate' | 'endDate'>> & {
  startDate?: Date | null;
  endDate?: Date | null;
  description?: string;
};

import { FormActionResult } from '@/components/forms/forms';

export function NewEvent({
  newEventAction,
  path,
  series,
}: {
  newEventAction: (
    path: string,
    options: FormValues,
  ) => Promise<FormActionResult<{ path?: string }>>;
  path: string;
  series: ClientCompat<Series>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      description: '',
      startDate: null,
      endDate: null,
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
      startDate: (value) => {
        if (!value) {
          return 'Start date is required';
        }
        if (
          series.startDate &&
          dayjs(value).isBefore(dayjs(series.startDate))
        ) {
          return `Start date must be on or after series start date (${dayjs(
            series.startDate,
          ).format('YYYY-MM-DD')})`;
        }
        return null;
      },
      endDate: (value, values) => {
        if (!value) {
          return 'End date is required';
        }
        if (series.endDate && dayjs(value).isAfter(dayjs(series.endDate))) {
          return `End date must be on or before series end date (${dayjs(
            series.endDate,
          ).format('YYYY-MM-DD')})`;
        }
        if (
          values.startDate &&
          dayjs(value).isBefore(dayjs(values.startDate))
        ) {
          return 'End date must be after start date';
        }
        return null;
      },
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setSubmissionError(null);

    const submissionValues = {
      ...values,
      startDate: values.startDate ? new Date(values.startDate) : null,
      endDate: values.endDate ? new Date(values.endDate) : null,
    };

    try {
      const result = await newEventAction(path, submissionValues);
      if (result.path) {
        router.push(`/manage/${toUrlPath(result.path)}/edit`);
      }
    } catch (error) {
      console.error('Failed to create event:', error);
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
        <Title order={1}>Create Event</Title>
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
                {...form.getInputProps('startDate')}
                data-testid="startDate"
                getDayProps={getDayProps('Start date')}
              />
              <DatePicker
                {...form.getInputProps('endDate')}
                data-testid="endDate"
                getDayProps={getDayProps('End date')}
              />
              <Group justify="right">
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={!form.isValid()}
                >
                  Create Event
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
