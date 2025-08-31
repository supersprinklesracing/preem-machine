'use client';

import { racePath } from '@/datastore/paths';
import type { ClientCompat, Race } from '@/datastore/types';
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
import { UpdateRaceOptions } from './update-race-action';

type FormValues = Partial<Omit<Race, 'startDate' | 'endDate' | 'description'>> & {
  description: string;
  dateRange: [Date | null, Date | null];
};

export function EditRace({
  updateRaceAction,
  race,
}: {
  updateRaceAction: (
    options: UpdateRaceOptions,
  ) => Promise<{ ok: boolean; error?: string }>;
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
      const path = racePath({
        id: race.id,
        eventBrief: {
          id: race.eventBrief.id,
        },
      });
      const result = await updateRaceAction({
        path,
        race: {
          name: values.name,
          location: values.location,
          description: values.description,
          startDate: getISODateFromDate(startDate),
          endDate: getISODateFromDate(
            endDate ? endDate : startDate ? startDate : undefined,
          ),
        },
      });
      if (result.ok) {
        router.refresh();
      } else {
        setSubmissionError(result.error || 'An unknown error occurred.');
      }
    } catch (error) {
      console.error('Failed to save race data:', error);
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
        <Title order={1}>Edit Race</Title>
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
