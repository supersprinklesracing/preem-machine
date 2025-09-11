'use client';

import { useActionForm } from '@/app/shared/hooks/useActionForm';
import EventCard from '@/components/cards/EventCard';
import { FormActionResult } from '@/components/forms/forms';
import { toUrlPath } from '@/datastore/paths';
import { Event, Series } from '@/datastore/schema';
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
