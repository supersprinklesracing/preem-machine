'use client';

import { useToast } from '@/app/prototype/hooks/use-toast';
import type { User } from '@/datastore/types';
import {
  Box,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconSearch, IconUserCheck } from '@tabler/icons-react';
import React, { useState } from 'react';

interface AdminProps {
  users: User[];
}

const Admin: React.FC<AdminProps> = ({ users }) => {
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const handleImpersonate = (user: User) => {
    toast({
      title: 'Impersonation Started',
      description: `You are now viewing the app as ${user.name}.`,
    });
  };

  const filteredUsers = search
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const userList = filteredUsers.map((user) => (
    <Group
      justify="space-between"
      key={user.id}
      p="sm"
      style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
    >
      <div>
        <Text fw={500}>{user.name}</Text>
        <Text size="sm" c="dimmed">
          {user.email}
        </Text>
      </div>
      <Button
        size="xs"
        variant="outline"
        onClick={() => handleImpersonate(user)}
        leftSection={<IconUserCheck size={14} />}
      >
        Impersonate
      </Button>
    </Group>
  ));

  return (
    <Stack gap="xl" maw={800} mx="auto">
      <Title order={1} ff="Space Grotesk, var(--mantine-font-family)">
        Administrator Control Panel
      </Title>

      <Card withBorder radius="md" p="lg" bg="yellow.0">
        <Title order={3} ff="Space Grotesk, var(--mantine-font-family)">
          User Impersonation
        </Title>
        <Text c="dimmed" size="sm">
          Find a user to view the application as them. This is a powerful tool
          for debugging and support.
        </Text>
        <Group mt="md">
          <TextInput
            placeholder="Search by name or email..."
            leftSection={<IconSearch size={16} />}
            style={{ flex: 1 }}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
          <Button color="red">End Impersonation</Button>
        </Group>
        {search && (
          <Box
            mt="md"
            style={{
              border: '1px solid var(--mantine-color-gray-3)',
              borderRadius: 'var(--mantine-radius-md)',
              maxHeight: 300,
              overflowY: 'auto',
            }}
          >
            {userList.length > 0 ? (
              userList
            ) : (
              <Text p="md" ta="center" c="dimmed">
                No users found.
              </Text>
            )}
          </Box>
        )}
      </Card>

      <Card withBorder radius="md" p="lg">
        <Title order={3} ff="Space Grotesk, var(--mantine-font-family)">
          Direct Management
        </Title>
        <Text c="dimmed" size="sm">
          Access and manage all data directly.
        </Text>
        <SimpleGrid cols={{ base: 2, sm: 4 }} mt="md">
          <Button variant="light">Manage Users</Button>
          <Button variant="light">Manage Organizers</Button>
          <Button variant="light">Manage Races</Button>
          <Button variant="light">Manage Preems</Button>
        </SimpleGrid>
      </Card>
    </Stack>
  );
};

export default Admin;
