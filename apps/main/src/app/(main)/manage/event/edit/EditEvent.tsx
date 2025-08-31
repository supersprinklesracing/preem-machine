'use client';

import { eventPath } from '@/datastore/paths';
import type { ClientCompat, Event } from '@/datastore/types';
import { getISODateFromDate } from '@/firebase-client/dates';
import {
  Button,
  Card,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UpdateEventOptions } from './update-event-action';

interface FormValues {
  name?: string;
  location?: string;
  website?: string;
  description?: string;
  date?: Date | null;
}

export function EditEvent({
  updateEventAction,
  event,
}: {
  updateEventAction: (
    options: UpdateEventOptions,
  ) => Promise<{ ok: boolean; error?: string }>;
  event: ClientCompat<Event>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    initialValues: {
      name: event.name,
      location: event.location,
      website: event.website,
      description: event.description,
      date: event.startDate ? new Date(event.startDate) : null,
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

    const date = values.date ? new Date(values.date) : null;

    try {
      if (
        !event.id ||
        !event.seriesBrief?.id ||
        !event.seriesBrief?.organizationBrief?.id
      ) {
        throw new Error('Missing ID');
      }
      const path = eventPath({
        id: event.id,
        seriesBrief: {
          id: event.seriesBrief.id,
          organizationBrief: {
            id: event.seriesBrief.organizationBrief.id,
          },
        },
      });
      const result = await updateEventAction({
        path,
        event: {
          name: values.name,
          location: values.location,
          website: values.website,
          description: values.description,
          startDate: getISODateFromDate(date),
          endDate: getISODateFromDate(date),
        },
      });
      if (result.ok) {
        router.refresh();
      } else {
        setSubmissionError(result.error || 'An unknown error occurred.');
      }
    } catch (error) {
      console.error('Failed to save event data:', error);
      setSubmissionError(
        error instanceof Error ? error.message : 'An unknown error occurred.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="sm">
      <Stack>
        <Title order={1}>Edit Event</Title>
        <Card withBorder>
          <Stack>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card withBorder p="sm" h="100%">
                  <Stack>
                    <TextInput
                      label="Event Name"
                      required
                      {...form.getInputProps('name')}
                    />
                    <TextInput
                      label="Location"
                      {...form.getInputProps('location')}
                    />
                    <TextInput
                      label="Website"
                      {...form.getInputProps('website')}
                    />
                    <Textarea
                      label="Description"
                      {...form.getInputProps('description')}
                    />
                  </Stack>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card withBorder p="sm" h="100%">
                  <Stack>
                    <Title order={5}>Event Date</Title>
                    <DatePicker
                      {...form.getInputProps('date')}
                      defaultDate={
                        event.startDate ? new Date(event.startDate) : undefined
                      }
                    />
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>
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
    </Container>
  );
}
