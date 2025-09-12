'use client';

import { useActionForm } from '@/components/forms/useActionForm';
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
import { validateEventForm } from '../event-validation';
import { EditEventOptions } from './edit-event-action';

const ADD_RACE_BUTTON_TEXT = 'Add Race';
const ADD_RACE_MODAL_TITLE = 'Add Race';

export function EditEvent({
  editEventAction,
  event,
}: {
  editEventAction: (options: EditEventOptions) => Promise<FormActionResult>;
  event: Pick<
    Event,
    | 'name'
    | 'location'
    | 'website'
    | 'description'
    | 'startDate'
    | 'endDate'
    | 'path'
    | 'id'
    | 'seriesBrief'
  >;
}) {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);

  const { form, handleSubmit, isLoading, submissionError } = useActionForm({
    schema: eventSchema,
    validate: (values) => validateEventForm(values, event.seriesBrief),
    initialValues: {
      name: event.name ?? '',
      location: event.location ?? '',
      website: event.website ?? '',
      description: event.description ?? '',
      startDate: event.startDate,
      endDate: event.endDate,
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
    startDate: debouncedValues.startDate,
    endDate: debouncedValues.endDate,
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
        <NewRace event={event} newRaceAction={newRaceAction} path={racesPath} />
      </Modal>
    </Container>
  );
}
