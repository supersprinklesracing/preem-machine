'use client';

import {
  Card,
  MantineColorScheme,
  SegmentedControl,
  Stack,
  Title,
  useMantineColorScheme,
} from '@mantine/core';

export function PreferencesPanel() {
  const { setColorScheme, colorScheme } = useMantineColorScheme();

  return (
    <Card withBorder>
      <Stack p="md">
        <Title order={3}>Preferences</Title>
        <SegmentedControl
          value={colorScheme}
          onChange={(value) => setColorScheme(value as MantineColorScheme)}
          data={[
            { label: 'Default', value: 'auto' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
          ]}
        />
      </Stack>
    </Card>
  );
}
