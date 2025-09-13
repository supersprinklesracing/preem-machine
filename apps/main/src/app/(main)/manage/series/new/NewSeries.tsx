'use client';

import { useActionForm } from '@/components/forms/useActionForm';
import SeriesCard from '@/components/cards/SeriesCard';
import { FormActionResult } from '@/components/forms/forms';
import { toUrlPath } from '@/datastore/paths';
import { Organization, Series } from '@/datastore/schema';
import {
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
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
import TimezoneSelect from 'react-timezone-select';
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
                  {...form.getInputProps('description')}
                  data-testid="description-input"
                />
                <DatePicker
                  type="range"
                  allowSingleDateInRange
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
                <TimezoneSelect
                  value={form.values.timezone || ''}
                  onChange={(tz) => {
                    if (typeof tz === 'string') {
                      form.setFieldValue('timezone', tz);
                    } else {
                      form.setFieldValue('timezone', tz.value);
                    }
                  }}
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
