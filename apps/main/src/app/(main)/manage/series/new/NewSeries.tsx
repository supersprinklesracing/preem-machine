'use client';

import SeriesCard from '@/components/cards/SeriesCard';
import { FormActionResult } from '@/components/forms/forms';
import { toUrlPath } from '@/datastore/paths';
import type { ClientCompat, Series } from '@/datastore/types';
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

type FormValues = Partial<Omit<Series, 'startDate' | 'endDate'>> & {
  dateRange: [Date | null, Date | null];
  description?: string;
};

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
      const result = await newSeriesAction(path, submissionValues);
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

  const getDayProps =
    (prefix: string): DatePickerProps['getDayProps'] =>
    (date) => {
      return {
        'aria-label': `${prefix} ${format(date, 'd MMMM yyyy')}`,
      };
    };

  const seriesPreview: ClientCompat<Series> = {
    id: 'preview',
    path: 'organizations/org-1/series/preview',
    name: debouncedValues.name || 'Your Series Name',
    location: debouncedValues.location,
    website: debouncedValues.website,
    description: debouncedValues.description,
    startDate: debouncedValues.dateRange[0]
      ? new Date(debouncedValues.dateRange[0]).toISOString()
      : undefined,
    endDate: debouncedValues.dateRange[1]
      ? new Date(debouncedValues.dateRange[1]).toISOString()
      : undefined,
    organizationBrief: {
      id: 'preview',
      path: 'organizations/org-1',
      name: 'Organization Name',
    },
  };

  return (
    <Container>
      <Stack>
        <Title order={1}>Create Series</Title>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
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
                    disabled={
                      !form.isValid() || !isEqual(form.values, debouncedValues)
                    }
                  >
                    Create Series
                  </Button>
                </Group>
                {submissionError && <Text c="red">{submissionError}</Text>}
              </Stack>
            </form>
          </Card>
          <SeriesCard series={seriesPreview} />
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
