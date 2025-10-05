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
import { RichTextEditor } from '@/components/forms/RichTextEditor';
import { useActionForm } from '@/components/forms/useActionForm';
import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';
import { Race } from '@/datastore/schema';

import { raceSchema } from '../race-schema';
import { EditRaceOptions } from './edit-race-action';

export function EditRace({
  editRaceAction,
  race,
}: {
  editRaceAction: (options: EditRaceOptions) => Promise<FormActionResult>;
  race: Pick<
    Race,
    | 'name'
    | 'location'
    | 'website'
    | 'courseLink'
    | 'description'
    | 'category'
    | 'gender'
    | 'courseDetails'
    | 'maxRacers'
    | 'duration'
    | 'laps'
    | 'podiums'
    | 'sponsors'
    | 'startDate'
    | 'endDate'
    | 'path'
    | 'id'
    | 'eventBrief'
    | 'timezone'
  >;
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
      if (race.eventBrief.startDate && values.startDate) {
        if (values.startDate < race.eventBrief.startDate) {
          return {
            startDate: 'Race start date cannot be before event start date',
          };
        }
      }
      if (race.eventBrief.endDate && values.endDate) {
        if (values.endDate > race.eventBrief.endDate) {
          return {
            endDate: 'Race end date cannot be after event end date',
          };
        }
      }
      return {};
    },
    initialValues: {
      name: race.name ?? '',
      location: race.location ?? '',
      website: race.website ?? '',
      courseLink: race.courseLink ?? '',
      description: race.description ?? '',
      category: race.category ?? '',
      gender: race.gender ?? '',
      courseDetails: race.courseDetails ?? '',
      maxRacers: race.maxRacers ?? 0,
      duration: race.duration ?? '',
      laps: race.laps ?? 0,
      podiums: race.podiums ?? 0,
      sponsors: race.sponsors ?? [],
      startDate: race.startDate,
      endDate: race.endDate,
      timezone:
        race.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    action: (values) => editRaceAction({ path: race.path, edits: values }),
    onSuccess: () => {
      router.refresh();
    },
  });

  const [debouncedValues] = useDebouncedValue(form.values, 100);

  const racePreview: Race = {
    ...race,
    ...debouncedValues,
  };

  return (
    <Stack>
      <Title order={1}>Edit Race</Title>
      <MultiPanelLayout
        topLeft={
          <Card withBorder>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack>
                <TextInput
                  label="Race Name"
                  required
                  {...form.getInputProps('name')}
                />
                <TextInput
                  label="Location"
                  {...form.getInputProps('location')}
                />
                <TextInput label="Website" {...form.getInputProps('website')} />
                <TextInput
                  label="Course Link"
                  {...form.getInputProps('courseLink')}
                />
                <RichTextEditor
                  label="Description"
                  {...form.getInputProps('description')}
                  data-testid="description-input"
                />
                <TextInput
                  label="Category"
                  {...form.getInputProps('category')}
                />
                <TextInput label="Gender" {...form.getInputProps('gender')} />
                <RichTextEditor
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
                    Save Changes
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
