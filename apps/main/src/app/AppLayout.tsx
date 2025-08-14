'use client';

import {
  ActionIcon,
  AppShell,
  Avatar,
  Burger,
  Group,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBell, IconSearch } from '@tabler/icons-react';
import Sidebar from './layout/Sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Title order={3} ff="Space Grotesk, var(--mantine-font-family)">
              Preem Machine
            </Title>
          </Group>
          <Group>
            <ActionIcon variant="outline" size="lg" radius="xl">
              <IconSearch size={18} />
            </ActionIcon>
            <ActionIcon variant="outline" size="lg" radius="xl">
              <IconBell size={18} />
            </ActionIcon>
            <Avatar
              src="https://placehold.co/40x40.png"
              alt="User"
              radius="xl"
            />
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Sidebar />
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
