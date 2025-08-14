'use client';

import { useAuth } from '@/auth/AuthContext';
import {
  ActionIcon,
  AppShell,
  Avatar,
  Burger,
  Group,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import { IconBell, IconSearch } from '@tabler/icons-react';
import Link from 'next/link';
import SidebarWrapper from './SidebarWrapper';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const { user } = useAuth();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <Notifications />
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Title order={3} ff="Space Grotesk, var(--mantine-font-family)">
                Preem Machine
              </Title>
            </Link>
          </Group>
          <Group>
            <ActionIcon variant="outline" size="lg" radius="xl">
              <IconSearch size={18} />
            </ActionIcon>
            <ActionIcon variant="outline" size="lg" radius="xl">
              <IconBell size={18} />
            </ActionIcon>
            {user && (
              <Link href="/account">
                <Avatar
                  src={user.photoURL ?? 'https://placehold.co/40x40.png'}
                  alt="User"
                  radius="xl"
                />
              </Link>
            )}
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <SidebarWrapper />
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
