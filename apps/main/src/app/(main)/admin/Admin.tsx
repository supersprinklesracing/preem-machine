'use client';

import { User, Organization } from '@/datastore/schema';
import {
  Table,
  Button,
  Container,
  Title,
  Anchor,
  Box,
  Stack,
} from '@mantine/core';
import { useState } from 'react';
import { AssignOrgModal } from './AssignOrgModal';
import { makeAdmin } from './make-admin-action';
import Link from 'next/link';
import { AdminUserCard } from './AdminUserCard';

interface AdminProps {
  users: User[];
  organizations: Organization[];
}

export function Admin({ users, organizations }: AdminProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleMakeAdmin = async (userId: string) => {
    await makeAdmin(userId);
  };

  return (
    <Container py="xl">
      <Title order={1} mb="xl">
        Admin - User Management
      </Title>

      {/* Desktop view */}
      <Box visibleFrom="sm">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>
                  <Anchor component={Link} href={`/user/${user.id}`}>
                    {user.id}
                  </Anchor>
                </Table.Td>
                <Table.Td>{user.name}</Table.Td>
                <Table.Td>{user.email}</Table.Td>
                <Table.Td>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedUser(user)}
                    data-testid="assign-org-button"
                  >
                    Assign Org
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleMakeAdmin(user.id)}
                    ml="sm"
                  >
                    Make Admin
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>

      {/* Mobile view */}
      <Box hiddenFrom="sm">
        <Stack>
          {users.map((user) => (
            <AdminUserCard
              key={user.id}
              user={user}
              onEdit={() => setSelectedUser(user)}
              onMakeAdmin={() => handleMakeAdmin(user.id)}
            />
          ))}
        </Stack>
      </Box>

      {selectedUser && (
        <AssignOrgModal
          user={selectedUser}
          organizations={organizations}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </Container>
  );
}
