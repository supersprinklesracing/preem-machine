'use client';

import { useActionForm } from '@/app/shared/hooks/useActionForm';
import RaceCard from '@/components/cards/RaceCard';
import { FormActionResult } from '@/components/forms/forms';
import { Race } from '@/datastore/schema';
import {
  Button,
  Card,
  Container,
  Group,
  NumberInput,
  SimpleGrid,
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
    | 'description'
    | 'category'
    | 'gender'
    | 'courseDetails'
    | 'maxRacers'
    | 'ageCategory'
    | 'duration'
    | 'laps'
    | 'podiums'
    | 'sponsors'
    | 'startDate'
    | 'endDate'
    | 'path'
    | 'id'
    | 'eventBrief'
  >;
}) {
  const router = useRouter();

  const { form, handleSubmit, isLoading, submissionError } = useActionForm({
    schema: raceSchema,
    initialValues: {
      name: race.name ?? '',
      location: race.location ?? '',
      website: race.website ?? '',
      description: race.description ?? '',
      category: race.category ?? '',
      gender: race.gender ?? '',
      courseDetails: race.courseDetails ?? '',
      maxRacers: race.maxRacers ?? 0,
      ageCategory: race.ageCategory ?? '',
      duration: race.duration ?? '',
      laps: race.laps ?? 0,
      podiums: race.podiums ?? 0,
      sponsors: race.sponsors ?? [],
      startDate: race.startDate,
      endDate: race.endDate,
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
    <Container fluid>
      <Stack>
        <Title order={1}>Edit Race</Title>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
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
                <Textarea
                  label="Description"
                  {...form.getInputProps('description')}
                />
                <TextInput
                  label="Category"
                  {...form.getInputProps('category')}
                />
                <TextInput label="Gender" {...form.getInputProps('gender')} />
                <Textarea
                  label="Course Details"
                  {...form.getInputProps('courseDetails')}
                />
                <NumberInput
                  label="Max Racers"
                  {...form.getInputProps('maxRacers')}
                />
                <TextInput
                  label="Age Category"
                  {...form.getInputProps('ageCategory')}
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
          <RaceCard race={racePreview} preems={[]} />
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
