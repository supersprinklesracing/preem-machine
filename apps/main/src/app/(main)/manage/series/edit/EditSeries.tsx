'use client';

import { useActionForm } from '@/app/shared/hooks/useActionForm';
import SeriesCard from '@/components/cards/SeriesCard';
import { FormActionResult } from '@/components/forms/forms';
import type { ClientCompat, Series } from '@/datastore/types';
import {
  Button,
  Card,
  Container,
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
import { NewEventOptions } from '../../event/new/new-event-action';
import { NewEvent } from '../../event/new/NewEvent';
import { seriesSchema } from '../series-schema';
import { EditSeriesOptions } from './edit-series-action';

export function EditSeries({
  editSeriesAction,
  series,
  newEventAction,
}: {
  editSeriesAction: (options: EditSeriesOptions) => Promise<FormActionResult>;
  series: ClientCompat<Series>;
  newEventAction: (
    options: NewEventOptions,
  ) => Promise<FormActionResult<{ path: string }>>;
}) {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);

  const handleNewEventSuccess = () => {
    close();
    router.refresh();
  };

  const { form, handleSubmit, isLoading, submissionError } = useActionForm({
    schema: seriesSchema,
    initialValues: {
      name: series.name ?? '',
      location: series.location ?? '',
      website: series.website ?? '',
      description: series.description ?? '',
      startDate: series.startDate ? new Date(series.startDate) : null,
      endDate: series.endDate ? new Date(series.endDate) : null,
    },
    action: (values) => {
      if (!series.id || !series.organizationBrief?.id) {
        throw new Error('Missing ID');
      }
      const path = series.path;
      return editSeriesAction({
        path,
        edits: values,
      });
    },
    onSuccess: () => {
      router.refresh();
    },
  });

  const [debouncedValues] = useDebouncedValue(form.values, 100);

  const seriesPreview: ClientCompat<Series> = {
    ...series,
    name: debouncedValues.name,
    location: debouncedValues.location,
    website: debouncedValues.website,
    description: debouncedValues.description,
    startDate: debouncedValues.startDate?.toISOString(),
    endDate: debouncedValues.endDate?.toISOString(),
  };

  return (
    <Container fluid>
      <Stack>
        <Group justify="space-between">
          <Title order={1}>Edit Series</Title>
          <Button onClick={open}>Add Event</Button>
        </Group>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Card withBorder>
            <form onSubmit={form.onSubmit(handleSubmit)}>
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
                <TextInput label="Website" {...form.getInputProps('website')} />
                <Textarea
                  label="Description"
                  {...form.getInputProps('description')}
                />
                <DatePicker
                  type="range"
                  allowSingleDateInRange
                  value={[form.values.startDate, form.values.endDate]}
                  onChange={([start, end]) => {
                    form.setFieldValue(
                      'startDate',
                      start ? new Date(start) : null,
                    );
                    form.setFieldValue('endDate', end ? new Date(end) : null);
                  }}
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
          <SeriesCard series={seriesPreview} />
        </SimpleGrid>
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
