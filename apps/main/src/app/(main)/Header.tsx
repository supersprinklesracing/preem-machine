'use server';

import { getAuthUserFromCookies } from '@/auth/user';
import { ActionIcon, Avatar, Group } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import Link from 'next/link';
import 'server-only';

export default async function Header() {
  const authUser = await getAuthUserFromCookies();

  return (
    <Group>
      {
        /* eslint-disable-next-line no-constant-binary-expression */
        false && (
          <ActionIcon variant="outline" size="lg" radius="xl">
            <IconBell size={18} />
          </ActionIcon>
        )
      }
      {authUser && (
        <Link href="/account">
          <Avatar
            src={authUser.photoURL ?? 'https://placehold.co/40x40.png'}
            alt={authUser.displayName ?? 'User'}
            radius="xl"
          />
        </Link>
      )}
    </Group>
  );
}
