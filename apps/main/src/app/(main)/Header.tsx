'use client';

import {
  ActionIcon,
  Avatar,
  Burger,
  Group,
} from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import Link from 'next/link';
import { useAuth } from '../../auth/AuthProvider';

interface HeaderProps {
  opened?: boolean;
  toggle?: () => void;
}

export default function Header({ opened, toggle }: HeaderProps) {
  const auth = useAuth();

  return (
    <Group justify="space-between" h="100%">
      <Burger opened={opened!} onClick={toggle} hiddenFrom="sm" size="sm" />
      <Group>
        {
          /* eslint-disable-next-line no-constant-binary-expression */
          false && (
            <ActionIcon variant="outline" size="lg" radius="xl">
              <IconBell size={18} />
            </ActionIcon>
          )
        }
        {auth.user && (
          <Link href="/account">
            <Avatar
              src={auth.user.photoURL ?? 'https://placehold.co/40x40.png'}
              alt={auth.user.displayName ?? 'User'}
              radius="xl"
            />
          </Link>
        )}
      </Group>
    </Group>
  );
}
