'use client';

import { FormActionResult } from '@/components/forms/forms';
import {
  getSubCollectionPath,
  seriesPath,
} from '@/datastore/paths';
import type { ClientCompat, Event } from '@/datastore/types';
import { getISODateFromDate } from '@/firebase-client/dates';
import {
  Button,
  Card,
  Container,
  Grid,
  Group,
  Modal,
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
import { NewRace } from '../../race/new/NewRace';
import { newRaceAction } from '../../race/new/new-race-action';
import { EditEventOptions } from './edit-event-action';

interface FormValues {
  name?: string;
  location?: string;
  website?: string;
  description?: string;
  date?: Date | null;
}

export function EditEvent({
  editEventAction,
  event,
}: {
  editEventAction: (options: EditEventOptions) => Promise<FormActionResult>;
  event: ClientCompat<Event>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isAddRaceModalOpen, setIsAddRaceModalOpen] = useState(false);

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
      await editEventAction({
        path: event.path,
        edits: {
          name: values.name,
          location: values.location,
          website: values.website,
          description: values.description,
          startDate: getISODateFromDate(date),
          endDate: getISODateFromDate(date),
        },
      });
      router.refresh();
    } catch (error) {
      console.error('Failed to save event data:', error);
      setSubmissionError(
        error instanceof Error ? error.message : 'An unknown error occurred.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const racesPath = getSubCollectionPath(seriesPath(event.path), 'races');

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
                onClick={() => setIsAddRaceModalOpen(true)}
                variant="outline"
              >
                Add Race
              </Button>
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
      <Modal
        opened={isAddRaceModalOpen}
        onClose={() => setIsAddRaceModalOpen(false)}
        title="Add Race"
      >
        <NewRace newRaceAction={newRaceAction} path={racesPath} />
      </Modal>
    </Container>
  );
}
