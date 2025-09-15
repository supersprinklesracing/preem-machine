'use client';

import { FormActionResult } from '@/components/forms/forms';
import { useActionForm } from '@/components/forms/useActionForm';
import { toUrlPath } from '@/datastore/paths';
import { Preem } from '@/datastore/schema';
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
import { useRouter } from 'next/navigation';
import { preemSchema } from '../preem-schema';
import { validatePreemForm } from '../preem-validation';
import { EditPreemOptions } from './edit-preem-action';

export function EditPreem({
  editPreemAction,
  preem,
}: {
  editPreemAction: (options: EditPreemOptions) => Promise<FormActionResult>;
  preem: Preem;
}) {
  const router = useRouter();

  const { form, handleSubmit, isLoading, submissionError } = useActionForm({
    schema: preemSchema,
    validate: (values) => validatePreemForm(values, preem.raceBrief),
    initialValues: {
      name: preem.name ?? '',
      description: preem.description ?? '',
      type: preem.type ?? 'Pooled',
      status: preem.status ?? 'Open',
      prizePool: preem.prizePool ?? 0,
      timeLimit: preem.timeLimit,
      minimumThreshold: preem.minimumThreshold ?? 0,
    },
    action: (values) => editPreemAction({ path: preem.path, edits: values }),
    onSuccess: () => {
      router.push(`/manage/${toUrlPath(preem.path)}`);
    },
  });

  // const [debouncedValues] = useDebouncedValue(form.values, 100);

  // const preemPreview: Preem = {
  //   ...preem,
  //   ...debouncedValues,
  // };

  return (
    <Container fluid>
      <Stack>
        <Title order={1}>Edit Preem</Title>
        <Title order={3}>{preem.name}</Title>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Card withBorder>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack>
                <TextInput
                  label="Preem Name"
                  required
                  {...form.getInputProps('name')}
                />
                <Textarea
                  label="Description"
                  {...form.getInputProps('description')}
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
                  error={form.errors.timeLimit}
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
                    Save Changes
                  </Button>
                </Group>
                {submissionError && <Text c="red">{submissionError}</Text>}
              </Stack>
            </form>
          </Card>
          {/* <PreemCard preem={preemPreview} /> */}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
