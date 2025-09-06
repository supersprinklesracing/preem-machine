'use client';

import RaceCard from '@/components/cards/RaceCard';
import { FormActionResult } from '@/components/forms/forms';
import type { ClientCompat, Race } from '@/datastore/types';
import { getISODateFromDate } from '@/firebase-client/dates';
import {
  Button,
  Card,
  Container,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import isEqual from 'fast-deep-equal';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { EditRaceOptions } from './edit-race-action';

type FormValues = Partial<
  Omit<Race, 'startDate' | 'endDate' | 'description'>
> & {
  description: string;
  dateRange: [Date | null, Date | null];
};

export function EditRace({
  editRaceAction,
  race,
}: {
  editRaceAction: (options: EditRaceOptions) => Promise<FormActionResult>;
  race: ClientCompat<Race>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    initialValues: {
      name: race.name,
      location: race.location ?? '',
      description: race.description ?? '',
      dateRange: [
        race.startDate ? new Date(race.startDate) : null,
        race.endDate ? new Date(race.endDate) : null,
      ],
    },
    validate: {
      name: (value) =>
        !value || value.trim().length < 2
          ? 'Name must have at least 2 letters'
          : null,
    },
  });

  const [debouncedValues] = useDebouncedValue(form.values, 500);

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setSubmissionError(null);

    const [startDate, endDate] = values.dateRange.map((d) =>
      d ? new Date(d) : null,
    );

    try {
      if (!race.id || !race.eventBrief?.id) {
        throw new Error('Missing ID');
      }
      const path = race.path;
      await editRaceAction({
        path,
        edits: {
          name: values.name,
          location: values.location,
          description: values.description,
          startDate: getISODateFromDate(startDate),
          endDate: getISODateFromDate(
            endDate ? endDate : startDate ? startDate : undefined,
          ),
        },
      });
      router.refresh();
    } catch (error) {
      console.error('Failed to save race data:', error);
      setSubmissionError(
        error instanceof Error ? error.message : 'An unknown error occurred.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const racePreview: ClientCompat<Race> = {
    ...race,
    name: debouncedValues.name,
    location: debouncedValues.location,
    description: debouncedValues.description,
    startDate: debouncedValues.dateRange[0]?.toISOString(),
    endDate: debouncedValues.dateRange[1]?.toISOString(),
  };

  return (
    <Container fluid>
      <Stack>
        <Title order={1}>Edit Race</Title>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Card withBorder>
            <Stack>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card withBorder p="sm" h="100%">
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
                      <Title order={5}>Race Dates</Title>
                      <DatePicker
                        type="range"
                        {...form.getInputProps('dateRange')}
                        defaultDate={
                          race.startDate ? new Date(race.startDate) : undefined
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
          <RaceCard race={racePreview} preems={[]} />
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
