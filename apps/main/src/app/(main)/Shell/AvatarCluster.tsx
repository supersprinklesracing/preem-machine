'use client';

import { UserAvatarIcon } from '@/components/UserAvatar/UserAvatar';
import { ActionIcon, Group } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
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
        <UserAvatarIcon
          user={{
            id: auth.authUser.uid,
            path: `users/${auth.authUser.uid}`,
            name: auth.authUser.displayName ?? 'User',
            avatarUrl:
              auth.authUser.photoURL ?? 'https://placehold.co/40x40.png',
          }}
        />
      )}
    </Group>
  );
}
