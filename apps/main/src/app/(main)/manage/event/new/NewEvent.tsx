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
import { useTimezoneSelect } from 'react-timezone-select';

import { EventCard } from '@/components/cards/EventCard';
import { FormActionResult } from '@/components/forms/forms';
import { useActionForm } from '@/components/forms/useActionForm';
import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';
import { toUrlPath } from '@/datastore/paths';
import { Event, Series } from '@/datastore/schema';

import { eventSchema } from '../event-schema';
import { validateEventForm } from '../event-validation';
import { NewEventOptions } from './new-event-action';

export function NewEvent({
  series,
  newEventAction,
  path,
  onSuccess,
}: {
  series: Series;
  newEventAction: (
    options: NewEventOptions,
  ) => Promise<FormActionResult<{ path: string }>>;
  path: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const { options } = useTimezoneSelect({});

  const { form, handleSubmit, isLoading, submissionError } = useActionForm({
    schema: eventSchema,
    validate: (values) => validateEventForm(values, series),
    initialValues: {
      name: '',
      description: '',
      website: '',
      location: '',
      startDate: undefined,
      endDate: undefined,
      timezone:
        series.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    action: (values) => newEventAction({ path, values }),
    onSuccess: (result) => {
      if (onSuccess) {
        onSuccess();
      } else if (result.path) {
        router.push(`/manage/${toUrlPath(result.path)}/edit`);
      }
    },
  });

  const [debouncedValues] = useDebouncedValue(form.values, 100);

  const eventPreview: Event = {
    id: 'preview',
    path: 'organizations/org-1/series/series-1/events/preview',
    ...debouncedValues,
    seriesBrief: series,
  };

  return (
    <Stack>
      <Title order={1}>Create Event</Title>
      <MultiPanelLayout
        topLeft={
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
                  {...form.getInputProps('description')}
                  data-testid="description-input"
                />
                <TextInput
                  label="Website"
                  {...form.getInputProps('website')}
                  data-testid="website-input"
                />
                <TextInput
                  label="Location"
                  {...form.getInputProps('location')}
                  data-testid="location-input"
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
                    Create Event
                  </Button>
                </Group>
                {submissionError && <Text c="red">{submissionError}</Text>}
              </Stack>
            </form>
          </Card>
        }
        topRight={<EventCard event={eventPreview} />}
      />
    </Stack>
  );
}
