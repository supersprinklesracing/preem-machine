'use client';

import { Avatar, Card, Group, Stack, Text, Title } from '@mantine/core';
import { IconMail } from '@tabler/icons-react';

interface UserProfileCardProps {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  name,
  email,
  avatarUrl,
}) => {
  return (
    <Card withBorder padding="lg" radius="md">
      <Stack align="center" ta="center">
        <Avatar src={avatarUrl} alt={name ?? ''} size={120} radius="50%" />
        <Title order={2}>{name}</Title>
        <Group gap="xs">
          <IconMail size={16} />
          <Text c="dimmed">{email}</Text>
        </Group>
      </Stack>
    </Card>
  );
};

export default UserProfileCard;
