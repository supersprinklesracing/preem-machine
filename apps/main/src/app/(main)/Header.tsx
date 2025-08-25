'use client';

import { ActionIcon, Avatar, Burger, Group } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import Link from 'next/link';
import { use } from 'react';
import { AuthContext } from '../../auth/AuthContext';

interface HeaderProps {
  opened?: boolean;
  toggle?: () => void;
}

export default function Header({ opened, toggle }: HeaderProps) {
  const auth = use(AuthContext);

  return (
    <Group justify="space-between" h="100%">
      <Burger
        opened={opened ?? false}
        onClick={toggle}
        hiddenFrom="sm"
        size="sm"
      />
      <Group>
        {
          /* eslint-disable-next-line no-constant-binary-expression */
          false && (
            <ActionIcon variant="outline" size="lg" radius="xl">
              <IconBell size={18} />
            </ActionIcon>
          )
        }
        {auth.authUser && (
          <Link href="/account">
            <Avatar
              src={auth.authUser.photoURL ?? 'https://placehold.co/40x40.png'}
              alt={auth.authUser.displayName ?? 'User'}
              radius="xl"
            />
          </Link>
        )}
      </Group>
    </Group>
  );
}
