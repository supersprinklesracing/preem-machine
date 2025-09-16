'use client';

import { UserAvatarIcon } from '@/components/UserAvatar/UserAvatar';
import { useUserContext } from '@/user/client/UserContext';
import { ActionIcon, Group } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';

export default function AvatarCluster() {
  const { user } = useUserContext();

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
      {user && (
        <UserAvatarIcon
          user={{
            id: user.id,
            path: user.path,
            name: user.name,
            avatarUrl: user.avatarUrl ?? 'https://placehold.co/40x40.png',
          }}
        />
      )}
    </Group>
  );
}
