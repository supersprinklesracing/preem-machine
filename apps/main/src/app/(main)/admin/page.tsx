import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getUsers } from '@/datastore/firestore';
import { Stack } from '@mantine/core';
import Admin from './Admin';

export default async function AdminPage() {
  const users = await getUsers();
  return (
    <Stack>
      <Breadcrumbs brief={null} />
      <Admin users={users} />
    </Stack>
  );
}
