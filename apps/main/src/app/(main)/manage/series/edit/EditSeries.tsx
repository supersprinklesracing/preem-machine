'use client';

import type { ClientCompat, Series } from '@/datastore/types';
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
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { NewEvent } from '../../event/new/NewEvent';
import { newEventAction } from '../../event/new/new-event-action';
import { EditSeriesOptions } from './edit-series-action';
import { FormActionResult } from '@/components/forms/forms';

type FormValues = Partial<Omit<Series, 'startDate' | 'endDate'>> & {
  dateRange: [Date | null, Date | null];
};

export function EditSeries({
  editSeriesAction,
  series,
  newEventAction,
}: {
  editSeriesAction: (options: EditSeriesOptions) => Promise<FormActionResult>;
  series: ClientCompat<Series>;
  newEventAction: (
    path: string,
    options: any,
  ) => Promise<FormActionResult<{ path?: string }>>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const handleNewEventSuccess = () => {
    close();
    router.refresh();
  };

  const form = useForm<FormValues>({
    initialValues: {
      name: series.name,
      location: series.location ?? '',
      website: series.website ?? '',
      description: series.description ?? '',
      dateRange: [
        series.startDate ? new Date(series.startDate) : null,
        series.endDate ? new Date(series.endDate) : null,
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
      if (!series.id || !series.organizationBrief?.id) {
        throw new Error('Missing ID');
      }
      const path = series.path;
      await editSeriesAction({
        path,
        edits: {
          name: values.name,
          location: values.location,
          website: values.website,
          description: values.description,
          startDate: getISODateFromDate(startDate),
          endDate: getISODateFromDate(
            endDate ? endDate : startDate ? startDate : undefined,
          ),
        },
      });
      router.refresh();
    } catch (error) {
      console.error('Failed to save series data:', error);
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
        <Group justify="space-between">
          <Title order={1}>Edit Series</Title>
          <Button onClick={open}>Add Event</Button>
        </Group>
        <Card withBorder>
          <Stack>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card withBorder p="sm" h="100%">
                  <Stack>
                    <TextInput
                      label="Series Name"
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
                    <Title order={5}>Series Dates</Title>
                    <DatePicker
                      type="range"
                      {...form.getInputProps('dateRange')}
                      defaultDate={
                        series.startDate
                          ? new Date(series.startDate)
                          : undefined
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
      <Modal opened={opened} onClose={close} title="Add New Event" size="lg">
        <NewEvent
          newEventAction={newEventAction}
          path={series.path}
          onSuccess={handleNewEventSuccess}
        />
      </Modal>
    </Container>
  );
}
