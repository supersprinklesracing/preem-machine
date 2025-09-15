'use client';

import PreemCard from '../../../(view)/preem/PreemCard';
import { FormActionResult } from '@/components/forms/forms';
import { useActionForm } from '@/components/forms/useActionForm';
import MultiPanelLayout from '@/components/layout/MultiPanelLayout';
import { DocPath, toUrlPath } from '@/datastore/paths';
import { Preem, Race } from '@/datastore/schema';
import {
  Button,
  Card,
  Container,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useDebouncedValue } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import { preemSchema } from '../preem-schema';
import { validatePreemForm } from '../preem-validation';
import { NewPreemOptions } from './new-preem-action';

export function NewPreem({
  race,
  newPreemAction,
  path,
}: {
  race: Race;
  newPreemAction: (
    options: NewPreemOptions,
  ) => Promise<FormActionResult<{ path?: string }>>;
  path: DocPath;
}) {
  const router = useRouter();

  const { form, handleSubmit, isLoading, submissionError } = useActionForm({
    schema: preemSchema,
    validate: (values) => validatePreemForm(values, race),
    initialValues: {
      name: '',
      description: '',
      type: 'Pooled',
      status: 'Open',
      prizePool: 0,
      timeLimit: undefined,
      minimumThreshold: 0,
    },
    action: (values) => newPreemAction({ path, values }),
    onSuccess: (result) => {
      if (result.path) {
        router.push(`/manage/${toUrlPath(result.path)}`);
      }
    },
  });

  const [debouncedValues] = useDebouncedValue(form.values, 100);

  const preemPreview: Preem = {
    id: 'preview',
    path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preview',
    ...debouncedValues,
    raceBrief: race,
  };

  return (
    <Container>
      <Stack>
        <Title order={1}>Create Preem</Title>
        <MultiPanelLayout
          leftPanel={
            <Card withBorder>
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                  <TextInput
                    label="Preem Name"
                    required
                    {...form.getInputProps('name')}
                    data-testid="name-input"
                  />
                  <Textarea
                    label="Description"
                    {...form.getInputProps('description')}
                    data-testid="description-input"
                  />
                  <Select
                    label="Type"
                    data={['Pooled', 'One-Shot']}
                    {...form.getInputProps('type')}
                  />
                  <Select
                    label="Status"
                    data={['Open', 'Minimum Met', 'Awarded']}
                    {...form.getInputProps('status')}
                  />
                  <NumberInput
                    label="Prize Pool"
                    {...form.getInputProps('prizePool')}
                  />
                  <DateTimePicker
                    label="Time Limit"
                    value={form.values.timeLimit}
                    onChange={(value) =>
                      form.setFieldValue(
                        'timeLimit',
                        value ? new Date(value) : undefined,
                      )
                    }
                  />
                  <NumberInput
                    label="Minimum Threshold"
                    {...form.getInputProps('minimumThreshold')}
                  />

                  <Group justify="right">
                    <Button
                      type="submit"
                      loading={isLoading}
                      disabled={!form.isValid() || !form.isDirty()}
                    >
                      Create Preem
                    </Button>
                  </Group>
                  {submissionError && <Text c="red">{submissionError}</Text>}
                </Stack>
              </form>
            </Card>
          }
          rightPanel={
            <PreemCard preem={preemPreview} />
          }
        />
      </Stack>
    </Container>
  );
}
