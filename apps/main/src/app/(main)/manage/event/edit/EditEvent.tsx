'use client';

import { useActionForm } from '@/app/shared/hooks/useActionForm';
import EventCard from '@/components/cards/EventCard';
import { FormActionResult } from '@/components/forms/forms';
import { getSubCollectionPath, seriesPath } from '@/datastore/paths';
import { Event } from '@/datastore/schema';
import {
  Button,
  Card,
  Container,
  Grid,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import isEqual from 'fast-deep-equal';
import { useRouter } from 'next/navigation';
import { NewRace } from '../../race/new/NewRace';
import { newRaceAction } from '../../race/new/new-race-action';
import { eventSchema } from '../event-schema';
import { EditEventOptions } from './edit-event-action';

const ADD_RACE_BUTTON_TEXT = 'Add Race';
const ADD_RACE_MODAL_TITLE = 'Add Race';

export function EditEvent({
  editEventAction,
  event,
}: {
  editEventAction: (options: EditEventOptions) => Promise<FormActionResult>;
  event: Event;
}) {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);

  const { form, handleSubmit, isLoading, submissionError } = useActionForm({
    schema: eventSchema,
    initialValues: {
      name: event.name ?? '',
      location: event.location ?? '',
      website: event.website ?? '',
      description: event.description ?? '',
      startDate: event.startDate ? new Date(event.startDate) : null,
      endDate: event.endDate ? new Date(event.endDate) : null,
    },
    action: (values) => editEventAction({ path: event.path, edits: values }),
    onSuccess: () => {
      router.refresh();
    },
  });

  const [debouncedValues] = useDebouncedValue(form.values, 100);

  const racesPath = getSubCollectionPath(seriesPath(event.path), 'races');

  const eventPreview: Event = {
    ...event,
    name: debouncedValues.name,
    location: debouncedValues.location,
    website: debouncedValues.website,
    description: debouncedValues.description,
    startDate: debouncedValues.startDate
      ? new Date(debouncedValues.startDate).toISOString()
      : undefined,
    endDate: debouncedValues.endDate
      ? new Date(debouncedValues.endDate).toISOString()
      : undefined,
  };

  return (
    <Container fluid>
      <Stack>
        <Title order={1}>Edit Event</Title>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
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
                        type="range"
                        allowSingleDateInRange
                        value={[form.values.startDate, form.values.endDate]}
                        onChange={([start, end]) => {
                          form.setFieldValue(
                            'startDate',
                            start ? new Date(start) : null,
                          );
                          form.setFieldValue(
                            'endDate',
                            end ? new Date(end) : null,
                          );
                        }}
                        data-testid="date-picker"
                      />
                    </Stack>
                  </Card>
                </Grid.Col>
              </Grid>
              <Group justify="right">
                <Button onClick={open} variant="outline">
                  {ADD_RACE_BUTTON_TEXT}
                </Button>
                <Button
                  onClick={() => handleSubmit(form.values)}
                  loading={isLoading}
                  disabled={
                    !form.isValid() || !isEqual(form.values, debouncedValues)
                  }
                >
                  Save Changes
                </Button>
              </Group>
              {submissionError && <Text c="red">{submissionError}</Text>}
            </Stack>
          </Card>
          <EventCard event={eventPreview} />
        </SimpleGrid>
      </Stack>
      <Modal opened={opened} onClose={close} title={ADD_RACE_MODAL_TITLE}>
        <NewRace newRaceAction={newRaceAction} path={racesPath} />
      </Modal>
    </Container>
  );
}
