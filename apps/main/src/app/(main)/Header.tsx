'use server';

import 'server-only';
import { getUserFromCookies } from '@/auth/user';
import { ActionIcon, Avatar, Group } from '@mantine/core';
import { IconBell, IconSearch } from '@tabler/icons-react';
import Link from 'next/link';

export default async function Header() {
  const user = await getUserFromCookies();

  return (
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
            alt={user.displayName ?? 'User'}
            radius="xl"
          />
        </Link>
      )}
    </Group>
  );
}
