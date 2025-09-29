'use client';

import {
  Button,
  Card,
  Group,
  Modal,
  Select,
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
import { useTimezoneSelect } from 'react-timezone-select';

import { EventCard } from '@/components/cards/EventCard';
import { FormActionResult } from '@/components/forms/forms';
import { useActionForm } from '@/components/forms/useActionForm';
import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';
import { getSubCollectionPath, seriesPath } from '@/datastore/paths';
import { Event } from '@/datastore/schema';

import { newRaceAction } from '../../race/new/new-race-action';
import { NewRace } from '../../race/new/NewRace';
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
    | 'timezone'
  >;
}) {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const { options } = useTimezoneSelect({});

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
      timezone:
        event.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
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
    timezone: debouncedValues.timezone,
  };

  return (
    <Stack>
      <Title order={1}>Edit Event</Title>
      <MultiPanelLayout
        topLeft={
          <Card withBorder>
            <Stack>
              <Card withBorder p="sm">
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
              <Card withBorder p="sm">
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
                  <Select
                    searchable
                    label="Timezone"
                    {...form.getInputProps('timezone')}
                    data={options}
                  />
                </Stack>
              </Card>
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
        }
        topRight={<EventCard event={eventPreview} />}
      />
      <Modal opened={opened} onClose={close} title={ADD_RACE_MODAL_TITLE}>
        <NewRace event={event} newRaceAction={newRaceAction} path={racesPath} />
      </Modal>
    </Stack>
  );
}
