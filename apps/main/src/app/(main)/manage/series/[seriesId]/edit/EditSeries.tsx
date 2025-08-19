'use client';

import { Button, Card, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { UpdateSeriesOptions } from './update-series-action';
import type { ClientCompat, Series } from '@/datastore/types';

type FormValues = Partial<Series>;

export function EditSeries({
  updateSeriesAction,
  series,
}: {
  updateSeriesAction: (
    options: UpdateSeriesOptions
  ) => Promise<{ ok: boolean; error?: string }>;
  series: ClientCompat<Series>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [submissionError, setSubmissionError] = React.useState<string | null>(
    null
  );

  const form = useForm<FormValues>({
    initialValues: {
      name: series.name,
      region: series.region,
      website: series.website,
    },
    validate: {
      name: (value) =>
        !value || value.trim().length < 2
          ? 'Name must have at least 2 letters'
          : null,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setSubmissionError(null);

    try {
      const result = await updateSeriesAction({ series: values });
      if (result.ok) {
        router.refresh();
        router.push(`/manage/${series.organizationBrief?.id}`);
      } else {
        setSubmissionError(result.error || 'An unknown error occurred.');
      }
    } catch (error) {
      console.error('Failed to save series data:', error);
      setSubmissionError(
        error instanceof Error ? error.message : 'An unknown error occurred.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack>
      <Title order={1}>Edit Series</Title>
      <Card withBorder>
        <Stack>
          <TextInput
            label="Series Name"
            required
            {...form.getInputProps('name')}
          />
          <TextInput label="Region" {...form.getInputProps('region')} />
          <TextInput label="Website" {...form.getInputProps('website')} />
          <Button
            onClick={() => handleSubmit(form.values)}
            loading={isLoading}
            disabled={!form.isValid()}
          >
            Save Changes
          </Button>
          {submissionError && <Text c="red">{submissionError}</Text>}
        </Stack>
      </Card>
    </Stack>
  );
}
