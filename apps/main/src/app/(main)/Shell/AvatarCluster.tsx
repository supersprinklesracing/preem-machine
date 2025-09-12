'use client';

import { ActionIcon, Avatar, Group } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import Link from 'next/link';
import { use } from 'react';
import { AuthContext } from '../../../auth/client/AuthContext';

export default function AvatarCluster() {
  const auth = use(AuthContext);

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
  );
}
