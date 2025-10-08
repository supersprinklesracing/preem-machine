'use client';

import {
  Button,
  Card,
  Group,
  NumberInput,
  Select,
  Stack,
  TagsInput,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useDebouncedValue } from '@mantine/hooks';
import isEqual from 'fast-deep-equal';
import { useRouter } from 'next/navigation';
import { useTimezoneSelect } from 'react-timezone-select';

import { RaceCard } from '@/components/cards/RaceCard';
import { FormActionResult } from '@/components/forms/forms';
import { useActionForm } from '@/components/forms/useActionForm';
import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';
import { toUrlPath } from '@/datastore/paths';
import { Event, Race } from '@/datastore/schema';

import { raceSchema } from '../race-schema';
import { NewRaceOptions } from './new-race-action';

export function NewRace({
  event,
  newRaceAction,
  path,
}: {
  event: Event;
  newRaceAction: (
    options: NewRaceOptions,
  ) => Promise<FormActionResult<{ path?: string }>>;
  path: string;
}) {
  const router = useRouter();
  const { options } = useTimezoneSelect({});

  const { form, handleSubmit, isLoading, submissionError } = useActionForm({
    schema: raceSchema,
    validate: (values) => {
      if (values.startDate && values.endDate) {
        if (values.endDate < values.startDate) {
          return {
            endDate: 'End date must be after start date',
          };
        }
      }
      if (event.startDate && values.startDate) {
        if (values.startDate < event.startDate) {
          return {
            startDate: 'Race start date cannot be before event start date',
          };
        }
      }
      if (event.endDate && values.endDate) {
        if (values.endDate > event.endDate) {
          return {
            endDate: 'Race end date cannot be after event end date',
          };
        }
      }
      return {};
    },
    initialValues: {
      name: '',
      location: '',
      website: '',
      description: '',
      category: '',
      gender: '',
      courseDetails: '',
      maxRacers: 0,
      duration: '',
      laps: 0,
      podiums: 0,
      sponsors: [],
      startDate: undefined,
      endDate: undefined,
      timezone:
        event.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    action: (values) => newRaceAction({ path, values }),
    onSuccess: (result) => {
      if (result.path) {
        router.push(`/manage/${toUrlPath(result.path)}/edit`);
      }
    },
  });

  const [debouncedValues] = useDebouncedValue(form.values, 100);

  const racePreview: Race = {
    id: 'preview',
    path: 'organizations/org-1/series/series-1/events/event-1/races/preview',
    ...debouncedValues,
    eventBrief: event,
  };

  return (
    <Stack>
      <Title order={1}>Create Race</Title>
      <MultiPanelLayout
        topLeft={
          <Card withBorder>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack>
                <TextInput
                  label="Race Name"
                  required
                  {...form.getInputProps('name')}
                  data-testid="name-input"
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
                <TextInput
                  label="Category"
                  {...form.getInputProps('category')}
                />
                <TextInput label="Gender" {...form.getInputProps('gender')} />
                <Textarea
                  label="Course Details"
                  {...form.getInputProps('courseDetails')}
                  data-testid="course-details-input"
                />
                <NumberInput
                  label="Max Racers"
                  {...form.getInputProps('maxRacers')}
                />
                <TextInput
                  label="Duration"
                  {...form.getInputProps('duration')}
                />
                <NumberInput label="Laps" {...form.getInputProps('laps')} />
                <NumberInput
                  label="Podiums"
                  {...form.getInputProps('podiums')}
                />
                <TagsInput
                  label="Sponsors"
                  {...form.getInputProps('sponsors')}
                />
                <div data-testid="start-date-wrapper">
                  <DateTimePicker
                    label="Start Date"
                    value={form.values.startDate}
                    onChange={(value) =>
                      form.setFieldValue(
                        'startDate',
                        value ? new Date(value) : undefined,
                      )
                    }
                    data-testid="start-date-picker"
                  />
                </div>
                <div data-testid="end-date-wrapper">
                  <DateTimePicker
                    label="End Date"
                    value={form.values.endDate}
                    onChange={(value) =>
                      form.setFieldValue(
                        'endDate',
                        value ? new Date(value) : undefined,
                      )
                    }
                    data-testid="end-date-picker"
                  />
                </div>
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
                    Create Race
                  </Button>
                </Group>
                {submissionError && <Text c="red">{submissionError}</Text>}
              </Stack>
            </form>
          </Card>
        }
        topRight={<RaceCard race={racePreview} preems={[]} />}
      />
    </Stack>
  );
}
