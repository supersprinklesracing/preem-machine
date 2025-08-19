'use client';

import type { ClientCompat, Event } from '@/datastore/types';
import {
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { UpdateEventOptions } from './update-event-action';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface
interface FormValues extends Partial<Event> {}

export function EditEvent({
  updateEventAction,
  event,
}: {
  updateEventAction: (
    options: UpdateEventOptions
  ) => Promise<{ ok: boolean; error?: string }>;
  event: ClientCompat<Event>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [submissionError, setSubmissionError] = React.useState<string | null>(
    null
  );

  const form = useForm<FormValues>({
    initialValues: {
      name: event.name,
      location: event.location,
      website: event.website,
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
      const result = await updateEventAction({ event: values });
      if (result.ok) {
        router.refresh();
        router.push(`/manage/event/${event.id}`);
      } else {
        setSubmissionError(result.error || 'An unknown error occurred.');
      }
    } catch (error) {
      console.error('Failed to save event data:', error);
      setSubmissionError(
        error instanceof Error ? error.message : 'An unknown error occurred.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack>
      <Title order={1}>Edit Event</Title>
      <Card withBorder>
        <Stack>
          <TextInput
            label="Event Name"
            required
            {...form.getInputProps('name')}
          />
          <TextInput label="Location" {...form.getInputProps('location')} />
          <TextInput label="Website" {...form.getInputProps('website')} />
          <Group justify="right">
            <Button
              onClick={() => handleSubmit(form.values)}
              loading={isLoading}
              disabled={!form.isValid()}
            >
              Save Changes
            </Button>
          </Group>
          {submissionError && <Text c="red">{submissionError}</Text>}
        </Stack>
      </Card>
    </Stack>
  );
}
