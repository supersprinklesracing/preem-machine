'use client';

import {
  Button,
  Card,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useDebouncedValue } from '@mantine/hooks';
import isEqual from 'fast-deep-equal';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTimezoneSelect } from 'react-timezone-select';

import { SeriesCard } from '@/components/cards/SeriesCard';
import { FormActionResult } from '@/components/forms/forms';
import { useActionForm } from '@/components/forms/useActionForm';
import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';
import { toUrlPath } from '@/datastore/paths';
import { Organization, Series } from '@/datastore/schema';

import { seriesSchema } from '../series-schema';
import { NewSeriesOptions } from './new-series-action';

export function NewSeries({
  organization,
  newSeriesAction,
  path,
}: {
  organization: Organization;
  newSeriesAction: (
    options: NewSeriesOptions,
  ) => Promise<FormActionResult<{ path?: string }>>;
  path: string;
}) {
  const router = useRouter();
  const { options } = useTimezoneSelect({});

  const { form, handleSubmit, isLoading, submissionError } = useActionForm({
    schema: seriesSchema,
    initialValues: {
      name: '',
      location: '',
      website: '',
      description: '',
      startDate: undefined,
      endDate: undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    action: (values) => newSeriesAction({ path, values }),
    onSuccess: (result) => {
      if (result.path) {
        router.push(`/manage/${toUrlPath(result.path)}/edit`);
      }
    },
  });

  const [debouncedValues] = useDebouncedValue(form.values, 100);

  const seriesPreview: Series = {
    id: 'preview',
    path: 'organizations/org-1/series/preview',
    ...debouncedValues,
    organizationBrief: {
      id: organization.id,
      path: organization.path,
      name: organization.name,
    },
  };

  return (
    <Stack>
      <Title order={1}>Create Series</Title>
      <MultiPanelLayout
        topLeft={
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
                  {...form.getInputProps('description')}
                  data-testid="description-input"
                />
                <DatePicker
                  type="range"
                  allowSingleDateInRange
                  required
                  value={[
                    form.values.startDate ?? null,
                    form.values.endDate ?? null,
                  ]}
                  onChange={([start, end]) => {
                    form.setFieldValue(
                      'startDate',
                      start ? new Date(start) : undefined,
                    );
                    form.setFieldValue(
                      'endDate',
                      end ? new Date(end) : undefined,
                    );
                  }}
                  data-testid="date-picker"
                />
                <Select
                  searchable
                  label="Timezone"
                  {...form.getInputProps('timezone')}
                  data={options}
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
        }
        topRight={<SeriesCard series={seriesPreview} />}
      />
    </Stack>
  );
}
